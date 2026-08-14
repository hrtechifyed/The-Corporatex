-- Allow internal story-status triggers to enqueue fixed notification jobs while keeping the queue private from normal clients.

create or replace function public.enqueue_story_notifications()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  if new.status='pending_moderation' and old.status is distinct from 'pending_moderation' then
    if old.status='changes_requested' then
      insert into public.story_notification_jobs(experience_id,kind)
      values (new.id,'resubmission_admin'),(new.id,'resubmission_contributor');
    else
      insert into public.story_notification_jobs(experience_id,kind)
      values (new.id,'submission_admin'),(new.id,'submission_contributor');
    end if;
  elsif new.status='changes_requested' and old.status is distinct from 'changes_requested' then
    insert into public.story_notification_jobs(experience_id,kind)
    values (new.id,'changes_requested_contributor');
  elsif new.status='rejected' and old.status is distinct from 'rejected' then
    insert into public.story_notification_jobs(experience_id,kind)
    values (new.id,'rejected_contributor');
  elsif new.status='published' and old.status is distinct from 'published' then
    insert into public.story_notification_jobs(experience_id,kind)
    values (new.id,'published_contributor');
  end if;
  return new;
end;
$$;

revoke all on function public.enqueue_story_notifications() from public;
revoke all on function public.enqueue_story_notifications() from anon;
revoke all on function public.enqueue_story_notifications() from authenticated;
