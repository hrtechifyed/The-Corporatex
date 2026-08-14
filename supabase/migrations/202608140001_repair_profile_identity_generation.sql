create or replace function public.random_hrt_id()
returns text
language plpgsql
volatile
set search_path = public, extensions
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes bytea := extensions.gen_random_bytes(9);
  result text := 'HRT-';
begin
  for i in 0..8 loop
    result := result || substr(chars, 1 + (get_byte(bytes, i) % length(chars)), 1);
  end loop;
  return result;
end
$$;

do $$
declare
  r record;
  candidate text;
  attempt integer;
begin
  for r in
    select u.id, coalesce(u.email, '') as email
    from auth.users u
    left join public.profiles p on p.id = u.id
    where p.id is null
  loop
    for attempt in 1..10 loop
      candidate := public.random_hrt_id();
      begin
        insert into public.profiles(id, hrt_id, private_email)
        values (r.id, candidate, r.email);
        exit;
      exception when unique_violation then
        if attempt = 10 then
          raise;
        end if;
      end;
    end loop;
  end loop;
end
$$;
