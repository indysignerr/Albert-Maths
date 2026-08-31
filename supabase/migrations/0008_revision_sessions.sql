-- ===========================================================================
-- Revision sessions
--
-- A short drill before a test, built from the student's own past mistakes
-- rather than from a bulk upload of the teacher's exercise sheet. Nobody
-- photographs thirty exercises on a Sunday evening; the app already knows which
-- ones they got wrong.
--
-- Only the outcome is stored. The generated exercises are ephemeral — keeping
-- them would grow without limit and they are worth nothing once answered, since
-- the next session is generated fresh from whatever is still weak.
-- ===========================================================================

create table revision_sessions (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references profiles (id) on delete cascade,
  topics      text[] not null default '{}',
  total       smallint not null check (total > 0),
  correct     smallint not null check (correct >= 0),
  /* [{ "topic": "analysis", "correct": true }, ...] — enough to say which
     notions held and which did not, without storing the exercises. */
  results     jsonb not null default '[]'::jsonb,
  created_at  timestamptz not null default now(),

  constraint correct_within_total check (correct <= total)
);

create index revision_sessions_profile_idx
  on revision_sessions (profile_id, created_at desc);

alter table revision_sessions enable row level security;

create policy "own revision sessions" on revision_sessions
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());
