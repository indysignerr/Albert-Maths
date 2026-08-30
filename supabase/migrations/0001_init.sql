-- ===========================================================================
-- Albert Maths — initial schema
--
-- Read this file top to bottom: types, tables, helper functions, RLS, triggers.
-- Every table has RLS enabled and no policy is permissive by accident: the
-- default is "no access" and each policy below states exactly who gets in.
-- ===========================================================================

create extension if not exists "pgcrypto";

-- --- Enums -----------------------------------------------------------------

create type app_role   as enum ('student', 'teacher', 'admin');
create type campus     as enum ('paris', 'milan', 'madrid', 'geneva', 'marseille');
create type track      as enum ('english', 'french');
create type msg_author as enum ('student', 'tutor');

-- --- Who may sign up -------------------------------------------------------
-- Seeded with the school domain. Rows can be added for pilot testers without
-- touching the trigger that enforces it.

create table allowed_email_domains (
  domain      text primary key,
  note        text,
  created_at  timestamptz not null default now()
);

insert into allowed_email_domains (domain, note)
values ('albertschool.com', 'Albert School students and staff');

alter table allowed_email_domains enable row level security;
-- No policy: only the SECURITY DEFINER signup trigger reads this table.

-- --- Profiles --------------------------------------------------------------

create table profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  first_name    text not null default '',
  last_initial  text not null default '',
  role          app_role not null default 'student',
  campus        campus,
  cohort        text,                                  -- 'B1', 'B2', ...
  track         track,
  ui_locale     text not null default 'en',
  onboarded_at  timestamptz,
  created_at    timestamptz not null default now(),

  constraint last_initial_is_one_char
    check (char_length(last_initial) <= 1)
);

-- The name every other student sees: "Léa M."
create function display_name(p profiles) returns text
language sql stable as $$
  select trim(p.first_name || ' ' || nullif(p.last_initial, '') || case when p.last_initial <> '' then '.' else '' end);
$$;

alter table profiles enable row level security;

-- --- Classes and membership ------------------------------------------------

create table classes (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  campus       campus not null,
  cohort       text not null,
  subject      text not null default 'maths',
  invite_code  text not null unique,
  created_by   uuid references profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

create table class_members (
  class_id   uuid not null references classes (id) on delete cascade,
  profile_id uuid not null references profiles (id) on delete cascade,
  joined_at  timestamptz not null default now(),
  primary key (class_id, profile_id)
);

create index class_members_profile_idx on class_members (profile_id);

alter table classes enable row level security;
alter table class_members enable row level security;

-- Membership lookups sit inside policies on the very tables they read, which
-- would recurse. SECURITY DEFINER breaks the cycle.
create function is_class_member(target_class uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from class_members
    where class_id = target_class and profile_id = auth.uid()
  );
$$;

create function shares_a_class_with(other_profile uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1
    from class_members mine
    join class_members theirs on theirs.class_id = mine.class_id
    where mine.profile_id = auth.uid() and theirs.profile_id = other_profile
  );
$$;

-- --- Problems and the hint gate -------------------------------------------

create table problems (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references profiles (id) on delete cascade,
  subject          text not null default 'maths',
  topic            text,
  source_lang      text,                       -- detected from the photo
  statement_latex  text,                       -- transcription the student confirms
  statement_plain  text,
  created_at       timestamptz not null default now()
);

create index problems_owner_idx on problems (owner_id, created_at desc);

-- The student's own working. The full solution stays locked until at least one
-- attempt exists — enforced in `can_reveal_level` below, not in the UI.
create table attempts (
  id          uuid primary key default gen_random_uuid(),
  problem_id  uuid not null references problems (id) on delete cascade,
  profile_id  uuid not null references profiles (id) on delete cascade,
  body        text not null,
  error_step  text,                            -- where the tutor located the break
  is_correct  boolean,
  created_at  timestamptz not null default now()
);

create index attempts_problem_idx on attempts (problem_id, created_at);

-- One row per hint the student has unlocked. Levels 1-3 are hints, 4 is the
-- full solution.
create table hint_reveals (
  problem_id   uuid not null references problems (id) on delete cascade,
  profile_id   uuid not null references profiles (id) on delete cascade,
  level        smallint not null check (level between 1 and 4),
  revealed_at  timestamptz not null default now(),
  primary key (problem_id, profile_id, level)
);

create table tutor_messages (
  id          uuid primary key default gen_random_uuid(),
  problem_id  uuid not null references problems (id) on delete cascade,
  profile_id  uuid not null references profiles (id) on delete cascade,
  author      msg_author not null,
  content     text not null,
  created_at  timestamptz not null default now()
);

create index tutor_messages_problem_idx on tutor_messages (problem_id, created_at);

-- Follow-up exercise generated after a confirmed mistake.
create table consolidations (
  id                uuid primary key default gen_random_uuid(),
  problem_id        uuid not null references problems (id) on delete cascade,
  profile_id        uuid not null references profiles (id) on delete cascade,
  statement_latex   text not null,
  expected_answer   text,
  passed            boolean,
  answered_at       timestamptz,
  created_at        timestamptz not null default now()
);

alter table problems       enable row level security;
alter table attempts       enable row level security;
alter table hint_reveals   enable row level security;
alter table tutor_messages enable row level security;
alter table consolidations enable row level security;

-- The pedagogical rule, expressed once and enforced by the database:
--   levels 1-3  unlock in order, one at a time
--   level 4     additionally requires a submitted attempt
create function can_reveal_level(target_problem uuid, target_level smallint)
returns boolean
language sql security definer stable set search_path = public as $$
  select
    -- you own the problem
    exists (select 1 from problems p where p.id = target_problem and p.owner_id = auth.uid())
    -- every lower level is already open
    and (
      target_level = 1
      or (select count(*) from hint_reveals h
          where h.problem_id = target_problem
            and h.profile_id = auth.uid()
            and h.level < target_level) = target_level - 1
    )
    -- the solution costs an attempt
    and (
      target_level < 4
      or exists (select 1 from attempts a
                 where a.problem_id = target_problem and a.profile_id = auth.uid())
    );
$$;

-- --- Class chat ------------------------------------------------------------

create table channel_messages (
  id          uuid primary key default gen_random_uuid(),
  class_id    uuid not null references classes (id) on delete cascade,
  profile_id  uuid not null references profiles (id) on delete cascade,
  content     text not null check (char_length(content) between 1 and 4000),
  problem_id  uuid references problems (id) on delete set null,
  hidden_at   timestamptz,                     -- set by moderation, never deleted
  created_at  timestamptz not null default now()
);

create index channel_messages_class_idx on channel_messages (class_id, created_at desc);

alter table channel_messages enable row level security;

-- --- Progress (gamification counts understanding, not answers viewed) ------

create table progress_events (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles (id) on delete cascade,
  kind        text not null check (kind in ('error_understood', 'consolidation_passed')),
  problem_id  uuid references problems (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index progress_events_profile_idx on progress_events (profile_id, created_at desc);

alter table progress_events enable row level security;

-- ===========================================================================
-- Row level security
-- ===========================================================================

-- Profiles: yours is yours; classmates see you but cannot edit you.
create policy "read own profile" on profiles
  for select using (id = auth.uid());
create policy "read classmates" on profiles
  for select using (shares_a_class_with(id));
create policy "update own profile" on profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Classes: visible once you are in them. Joining goes through join_class().
create policy "read own classes" on classes
  for select using (is_class_member(id));
create policy "read own memberships" on class_members
  for select using (profile_id = auth.uid() or is_class_member(class_id));
create policy "leave a class" on class_members
  for delete using (profile_id = auth.uid());

-- Problems and everything hanging off them: strictly the owner.
create policy "own problems" on problems
  for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "own attempts" on attempts
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "read own reveals" on hint_reveals
  for select using (profile_id = auth.uid());
-- Insert is gated by the rule above: the client cannot unlock out of order.
create policy "reveal in order" on hint_reveals
  for insert with check (profile_id = auth.uid() and can_reveal_level(problem_id, level));

create policy "own tutor messages" on tutor_messages
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "own consolidations" on consolidations
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- Class chat: members read, members post as themselves, authors may retract.
create policy "read class messages" on channel_messages
  for select using (is_class_member(class_id) and hidden_at is null);
create policy "post to own classes" on channel_messages
  for insert with check (profile_id = auth.uid() and is_class_member(class_id));
create policy "delete own messages" on channel_messages
  for delete using (profile_id = auth.uid());

-- Progress: private.
create policy "own progress" on progress_events
  for select using (profile_id = auth.uid());
create policy "record own progress" on progress_events
  for insert with check (profile_id = auth.uid());

-- ===========================================================================
-- Signup
-- ===========================================================================

-- Reject anything outside the allowlist before an account exists, and create
-- the matching profile row in the same transaction.
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  email_domain text := lower(split_part(new.email, '@', 2));
begin
  if not exists (select 1 from allowed_email_domains d where d.domain = email_domain) then
    raise exception 'Sign-up is restricted to Albert School email addresses'
      using errcode = 'check_violation';
  end if;

  insert into profiles (id, first_name, last_initial)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(left(new.raw_user_meta_data ->> 'last_name', 1), '')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ===========================================================================
-- Joining a class by code
-- ===========================================================================

create function join_class(code text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  target uuid;
begin
  select id into target from classes where invite_code = upper(trim(code));
  if target is null then
    raise exception 'No class matches that code' using errcode = 'no_data_found';
  end if;

  insert into class_members (class_id, profile_id)
  values (target, auth.uid())
  on conflict do nothing;

  return target;
end;
$$;

-- Realtime for the class chat.
alter publication supabase_realtime add table channel_messages;
