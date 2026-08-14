create extension if not exists pg_net with schema extensions;

create table if not exists public.story_notification_jobs (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences(id) on delete cascade,
  kind text not null check (kind in ('submission_admin','submission_contributor','published_contributor')),
  status text not null default 'pending' check (status in ('pending','processing','sent','failed')),
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (experience_id, kind)
);

alter table public.story_notification_jobs enable row level security;
create index if not exists story_notification_jobs_pending_idx on public.story_notification_jobs(status, created_at);

create or replace function public.enqueue_story_notifications()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.status = 'pending_moderation' and old.status is distinct from 'pending_moderation' then
    insert into public.story_notification_jobs(experience_id, kind)
    values (new.id, 'submission_admin'), (new.id, 'submission_contributor')
    on conflict (experience_id, kind) do nothing;
  end if;

  if new.status = 'published' and old.status is distinct from 'published' then
    insert into public.story_notification_jobs(experience_id, kind)
    values (new.id, 'published_contributor')
    on conflict (experience_id, kind) do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists experience_story_notification_queue on public.experiences;
create trigger experience_story_notification_queue
after update of status on public.experiences
for each row execute function public.enqueue_story_notifications();
