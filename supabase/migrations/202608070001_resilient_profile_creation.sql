-- Keep Supabase Auth user creation independent from CorporateX profile provisioning.
-- If profile creation ever fails inside the auth trigger, the application can safely
-- provision the profile after email verification with the service-role client.

create or replace function public.create_profile_for_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  candidate text;
begin
  if exists (select 1 from public.profiles where id = new.id) then
    update public.profiles
      set private_email = coalesce(nullif(new.email, ''), private_email),
          updated_at = now()
      where id = new.id;
    return new;
  end if;

  if coalesce(new.email, '') = '' then
    return new;
  end if;

  for attempt in 1..20 loop
    candidate := public.random_hrt_id();
    begin
      insert into public.profiles(id, hrt_id, private_email)
      values(new.id, candidate, new.email);
      return new;
    exception when unique_violation then
      if exists (select 1 from public.profiles where id = new.id) then
        return new;
      end if;
    end;
  end loop;

  raise warning 'CorporateX profile allocation exhausted retries for auth user %', new.id;
  return new;
exception when others then
  -- Never abort creation of auth.users. requireProfile() has a service-role,
  -- idempotent fallback after the user has verified their email.
  raise warning 'CorporateX profile trigger deferred profile creation for auth user %: %', new.id, sqlerrm;
  return new;
end;
$$;
