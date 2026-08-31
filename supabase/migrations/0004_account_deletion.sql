-- ===========================================================================
-- Account deletion and data export
--
-- The privacy policy promises both. Until now neither existed, which made the
-- promise unkeepable without editing rows by hand.
-- ===========================================================================

/**
 * Deletes the caller's account outright.
 *
 * Everything hangs off auth.users through ON DELETE CASCADE — profiles, and
 * through profiles the problems, attempts, hint reveals, tutor messages,
 * consolidations, class memberships, channel messages and progress events. So
 * removing the one row removes the lot, and there is no list here to fall out of
 * date as tables are added.
 *
 * SECURITY DEFINER because auth.users is not writable by the anon or
 * authenticated roles. It can only ever delete auth.uid(): there is no argument
 * to point it at somebody else.
 */
create function delete_own_account() returns void
language plpgsql security definer set search_path = public, auth as $$
declare
  me uuid := auth.uid();
begin
  if me is null then
    raise exception 'Sign in first' using errcode = 'insufficient_privilege';
  end if;

  -- Messages are the one thing another student may be mid-conversation with.
  -- They go too: the policy says deletion removes them, so it removes them.
  delete from channel_messages where profile_id = me;

  delete from auth.users where id = me;
end;
$$;

revoke all on function delete_own_account() from public;
grant execute on function delete_own_account() to authenticated;

/**
 * Everything held about the caller, as one JSON document — the GDPR right of
 * access, without an email round trip.
 */
create function export_own_data() returns jsonb
language sql security definer stable set search_path = public, auth as $$
  select jsonb_build_object(
    'exported_at', now(),
    'account', (
      select jsonb_build_object('email', u.email, 'created_at', u.created_at)
      from auth.users u where u.id = auth.uid()
    ),
    'profile', (select to_jsonb(p) from profiles p where p.id = auth.uid()),
    'classes', coalesce((
      select jsonb_agg(jsonb_build_object('name', c.name, 'campus', c.campus,
                                          'cohort', c.cohort, 'joined_at', m.joined_at))
      from class_members m join classes c on c.id = m.class_id
      where m.profile_id = auth.uid()
    ), '[]'::jsonb),
    'problems', coalesce((
      select jsonb_agg(to_jsonb(p)) from problems p where p.owner_id = auth.uid()
    ), '[]'::jsonb),
    'attempts', coalesce((
      select jsonb_agg(to_jsonb(a)) from attempts a where a.profile_id = auth.uid()
    ), '[]'::jsonb),
    'hints_revealed', coalesce((
      select jsonb_agg(to_jsonb(h)) from hint_reveals h where h.profile_id = auth.uid()
    ), '[]'::jsonb),
    'tutor_messages', coalesce((
      select jsonb_agg(to_jsonb(m)) from tutor_messages m where m.profile_id = auth.uid()
    ), '[]'::jsonb),
    'consolidations', coalesce((
      select jsonb_agg(to_jsonb(c)) from consolidations c where c.profile_id = auth.uid()
    ), '[]'::jsonb),
    'class_messages', coalesce((
      select jsonb_agg(jsonb_build_object('content', m.content, 'created_at', m.created_at))
      from channel_messages m where m.profile_id = auth.uid()
    ), '[]'::jsonb),
    'progress', coalesce((
      select jsonb_agg(to_jsonb(e)) from progress_events e where e.profile_id = auth.uid()
    ), '[]'::jsonb)
  );
$$;

revoke all on function export_own_data() from public;
grant execute on function export_own_data() to authenticated;
