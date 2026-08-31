-- ===========================================================================
-- Classes, moderation and the daily limit
--
-- All three are enforced here rather than in the interface. A client-side word
-- filter is a suggestion; a trigger is a rule. Same for the daily cap: a student
-- who opens the network tab should hit exactly the same wall.
-- ===========================================================================

-- --- Invite codes ----------------------------------------------------------
-- Six characters, no vowels and no 0/O/1/I/L: codes get read aloud across a
-- classroom, and the pairs that get misheard are worth losing.

create function generate_invite_code() returns text
language plpgsql as $$
declare
  alphabet constant text := '23456789BCDFGHJKMNPQRSTVWXYZ';
  code text;
begin
  loop
    code := '';
    for _ in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from classes c where c.invite_code = code);
  end loop;
  return code;
end;
$$;

-- Creating a class also joins it: a class with no members is a dead code.
create function create_class(name text, campus campus, cohort text)
returns classes
language plpgsql security definer set search_path = public as $$
declare
  created classes;
begin
  if auth.uid() is null then
    raise exception 'Sign in first' using errcode = 'insufficient_privilege';
  end if;
  if length(trim(name)) < 2 then
    raise exception 'Give the class a name' using errcode = 'check_violation';
  end if;

  insert into classes (name, campus, cohort, invite_code, created_by)
  values (trim(name), campus, cohort, generate_invite_code(), auth.uid())
  returning * into created;

  insert into class_members (class_id, profile_id)
  values (created.id, auth.uid());

  return created;
end;
$$;

-- Counting members is a read across other people's memberships, which the
-- policies rightly forbid; SECURITY DEFINER exposes the count and nothing else.
create function class_member_count(target_class uuid) returns integer
language sql security definer stable set search_path = public as $$
  select count(*)::int from class_members where class_id = target_class;
$$;

-- --- Moderation ------------------------------------------------------------
-- A table rather than a constant, so the list can be corrected without a
-- migration when it inevitably catches something innocent.

create table blocked_terms (
  term        text primary key,
  language    text,
  created_at  timestamptz not null default now()
);

alter table blocked_terms enable row level security;
-- No policy: only the SECURITY DEFINER trigger reads it.

insert into blocked_terms (term, language) values
  -- English
  ('fuck', 'en'), ('shit', 'en'), ('bitch', 'en'), ('bastard', 'en'),
  ('idiot', 'en'), ('moron', 'en'), ('retard', 'en'), ('stupid bitch', 'en'),
  ('kill yourself', 'en'), ('kys', 'en'), ('loser', 'en'), ('dumbass', 'en'),
  -- French
  ('connard', 'fr'), ('connasse', 'fr'), ('salope', 'fr'), ('enculé', 'fr'),
  ('encule', 'fr'), ('pute', 'fr'), ('ta gueule', 'fr'), ('ferme ta gueule', 'fr'),
  ('débile', 'fr'), ('debile', 'fr'), ('attardé', 'fr'), ('attarde', 'fr'),
  ('tue toi', 'fr'), ('crève', 'fr'), ('creve', 'fr'), ('bouffon', 'fr'),
  -- Italian
  ('stronzo', 'it'), ('coglione', 'it'), ('puttana', 'it'), ('idiota', 'it'),
  ('ritardato', 'it'),
  -- Spanish
  ('gilipollas', 'es'), ('cabrón', 'es'), ('cabron', 'es'), ('puta', 'es'),
  ('imbécil', 'es'), ('imbecil', 'es'), ('retrasado', 'es');

/**
 * Matching is on unaccented lowercase text with word boundaries, so "classe"
 * does not trip on "asse" and "Débile" is caught as "debile".
 */
create function contains_blocked_term(body text) returns boolean
language plpgsql stable set search_path = public as $$
declare
  haystack text := lower(translate(
    body,
    'àáâãäåçèéêëìíîïñòóôõöùúûüýÿ',
    'aaaaaaceeeeiiiinooooouuuuyy'
  ));
  hit text;
begin
  for hit in
    select lower(translate(t.term,
      'àáâãäåçèéêëìíîïñòóôõöùúûüýÿ',
      'aaaaaaceeeeiiiinooooouuuuyy'))
    from blocked_terms t
  loop
    if haystack ~ ('(^|[^[:alnum:]])' || hit || '($|[^[:alnum:]])') then
      return true;
    end if;
  end loop;
  return false;
end;
$$;

create function moderate_channel_message() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if contains_blocked_term(new.content) then
    raise exception 'blocked_by_moderation' using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

create trigger moderate_before_insert
  before insert on channel_messages
  for each row execute function moderate_channel_message();

-- --- Daily limit -----------------------------------------------------------
-- The cap discourages scanning a whole problem set in one sitting. It counts
-- new problems, not work on existing ones: coming back to something you already
-- started is exactly the behaviour worth encouraging.

create function problems_today() returns integer
language sql security definer stable set search_path = public as $$
  select count(*)::int
  from problems
  where owner_id = auth.uid()
    and created_at >= date_trunc('day', now() at time zone 'utc');
$$;

create function daily_problem_limit() returns integer
language sql immutable as $$ select 12; $$;

create policy "within the daily limit" on problems
  for insert with check (
    owner_id = auth.uid() and problems_today() < daily_problem_limit()
  );

-- The blanket "own problems" policy from 0001 covers INSERT too, and a row
-- passing any permissive policy is allowed — so the limit would never bite.
-- Narrow the original to the other three commands.
drop policy "own problems" on problems;

create policy "read own problems" on problems
  for select using (owner_id = auth.uid());
create policy "update own problems" on problems
  for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "delete own problems" on problems
  for delete using (owner_id = auth.uid());
