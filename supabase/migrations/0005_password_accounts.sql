-- ===========================================================================
-- Password accounts
--
-- One email at sign-up, none afterwards. The link in that email leads to a page
-- where the student sets a password their browser can remember; every later
-- sign-in is local.
--
-- Whether a password exists is not readable from auth.users by the client, so
-- the profile records it. It is a flag about the account, not a credential.
-- ===========================================================================

alter table profiles
  add column password_set_at timestamptz;

comment on column profiles.password_set_at is
  'Set once the student chooses a password. Null means the account still signs in by emailed link, and the callback sends them to /set-password/.';

-- Existing accounts predate passwords and should be prompted for one.
-- (No backfill: null is exactly the state that triggers the prompt.)
