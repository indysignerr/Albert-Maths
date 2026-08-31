-- ===========================================================================
-- Sharing an exercise into a class channel
--
-- The statement is copied onto the message rather than read through problem_id.
-- problems is owner-only by policy, and loosening that so classmates could read
-- a shared row would expose the whole record — the attempts and the hints
-- unlocked alongside it. Copying shares exactly what was meant to be shared.
-- ===========================================================================

alter table channel_messages
  add column shared_statement text;

comment on column channel_messages.shared_statement is
  'LaTeX of an exercise the author is stuck on, copied at post time. problem_id stays a back-reference the author alone can follow.';
