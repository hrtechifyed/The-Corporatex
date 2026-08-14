create table if not exists public.story_deletion_email_jobs (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  deleted_experience_id uuid not null unique,
  status text not null default 'pending' check (status in ('pending','processing','failed')),
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  created_at timestamptz not null default now()
);

alter table public.story_deletion_email_jobs enable row level security;
revoke all on public.story_deletion_email_jobs from public, anon, authenticated;
create index if not exists story_deletion_email_jobs_status_created_idx
  on public.story_deletion_email_jobs(status, created_at);

create or replace function public.delete_owned_story_and_queue_receipt(p_experience_id uuid)
returns table(deletion_job_id uuid, deleted_experience_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid := auth.uid();
  v_job_id uuid;
  v_email text;
begin
  if v_profile_id is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  select p.private_email
    into v_email
  from public.experiences e
  join public.profiles p on p.id = e.profile_id
  where e.id = p_experience_id
    and e.profile_id = v_profile_id
  for update of e;

  if not found then
    raise exception 'Story not found or not owned by this account' using errcode = '42501';
  end if;

  if coalesce(btrim(v_email), '') = '' then
    raise exception 'Contributor email unavailable' using errcode = '22023';
  end if;

  insert into public.story_deletion_email_jobs(profile_id, deleted_experience_id)
  values (v_profile_id, p_experience_id)
  returning id into v_job_id;

  delete from public.experiences
  where id = p_experience_id
    and profile_id = v_profile_id;

  return query select v_job_id, p_experience_id;
end;
$$;

revoke all on function public.delete_owned_story_and_queue_receipt(uuid) from public, anon;
grant execute on function public.delete_owned_story_and_queue_receipt(uuid) to authenticated;
