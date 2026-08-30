-- ===========================================================================
-- Individual sign-up exceptions
--
-- The domain allowlist alone cannot cover the case that matters right now: the
-- project is being built before its author has a school address. Adding
-- `gmail.com` as a domain would open sign-up to anyone with a Gmail account, so
-- exceptions are granted per address instead.
--
-- TEMPORARY. Every row in allowed_emails must be removed before the app is
-- opened to students.
-- ===========================================================================

create table allowed_emails (
  email       text primary key,
  note        text,
  created_at  timestamptz not null default now()
);

alter table allowed_emails enable row level security;
-- No policy: only the SECURITY DEFINER signup trigger reads this table.

insert into allowed_emails (email, note)
values ('indyfrancois6@gmail.com', 'Author — remove once a school address exists');

-- Same trigger as 0001, now consulting both lists.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  address      text := lower(new.email);
  email_domain text := split_part(address, '@', 2);
begin
  if not exists (select 1 from allowed_email_domains d where d.domain = email_domain)
     and not exists (select 1 from allowed_emails e where e.email = address)
  then
    raise exception 'This address is not allowed to sign up'
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
