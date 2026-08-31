-- ===========================================================================
-- Moderation, second pass
--
-- The word list from 0003 covered generic insults and nothing else, so slurs
-- aimed at religion, ethnicity or sexuality went straight through.
--
-- Two things are added here, because a word list alone cannot do this job:
--
--   1. Unambiguous slurs. Terms with no legitimate use in a maths channel.
--      Neutral words for a religion or an origin are deliberately NOT here — a
--      student must be able to say what they are without being filtered, and a
--      list that blocked those would itself be discriminatory.
--
--   2. Reporting. Most hate speech is built from ordinary words: "les X sont
--      tous des Y" contains nothing on any list. Members flag it, and two
--      independent reports hide the message pending a human look.
-- ===========================================================================

insert into blocked_terms (term, language) values
  -- Religion — English
  ('christfag', 'en'), ('kike', 'en'), ('raghead', 'en'), ('towelhead', 'en'),
  ('camel jockey', 'en'), ('christ killer', 'en'),
  -- Religion — French
  ('sale juif', 'fr'), ('sale arabe', 'fr'), ('sale musulman', 'fr'),
  ('sale chretien', 'fr'), ('sale catho', 'fr'), ('bougnoule', 'fr'),
  ('youpin', 'fr'), ('feuj de merde', 'fr'), ('mort aux juifs', 'fr'),
  ('mort aux arabes', 'fr'), ('sale mecreant', 'fr'),
  -- Ethnicity and origin
  ('negro', 'en'), ('nigger', 'en'), ('chink', 'en'), ('gook', 'en'),
  ('negre', 'fr'), ('bamboula', 'fr'), ('chinetoque', 'fr'), ('rebeu de merde', 'fr'),
  ('negro', 'es'), ('sudaca', 'es'), ('terrone', 'it'), ('negraccio', 'it'),
  -- Sexuality and gender
  ('faggot', 'en'), ('tranny', 'en'), ('dyke', 'en'),
  ('pedale', 'fr'), ('tapette', 'fr'), ('enculé de pd', 'fr'), ('sale pd', 'fr'),
  ('maricon', 'es'), ('frocio', 'it'),
  -- Incitement, in every language the school uses
  ('go kill yourself', 'en'), ('hang yourself', 'en'),
  ('va te pendre', 'fr'), ('suicide toi', 'fr'), ('ammazzati', 'it'), ('matate', 'es')
on conflict (term) do nothing;

-- --- Reporting -------------------------------------------------------------

create table message_reports (
  message_id  uuid not null references channel_messages (id) on delete cascade,
  profile_id  uuid not null references profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (message_id, profile_id)
);

alter table message_reports enable row level security;

create policy "read own reports" on message_reports
  for select using (profile_id = auth.uid());

/**
 * Records a report and hides the message once two different people have flagged
 * it. Two rather than one: a single reader must not be able to silence a
 * classmate, and two independent objections is a low enough bar that genuine
 * abuse disappears quickly.
 *
 * Hiding is reversible — the row keeps its content and only hidden_at changes —
 * so a wrongly hidden message can be restored.
 */
create function report_message(target_message uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  reports integer;
  target_class uuid;
begin
  select class_id into target_class
  from channel_messages where id = target_message;

  if target_class is null or not is_class_member(target_class) then
    raise exception 'Not your class' using errcode = 'insufficient_privilege';
  end if;

  insert into message_reports (message_id, profile_id)
  values (target_message, auth.uid())
  on conflict do nothing;

  select count(*) into reports
  from message_reports where message_id = target_message;

  if reports >= 2 then
    update channel_messages
    set hidden_at = now()
    where id = target_message and hidden_at is null;
  end if;
end;
$$;

revoke all on function report_message(uuid) from public;
grant execute on function report_message(uuid) to authenticated;
