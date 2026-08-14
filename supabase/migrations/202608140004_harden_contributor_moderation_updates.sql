-- Keep contributor-facing moderation notes owner-scoped under normal RLS.

drop view if exists public.contributor_moderation_updates;

drop policy if exists moderation_contributor_updates on public.moderation_actions;
create policy moderation_contributor_updates
on public.moderation_actions
for select
to authenticated
using (
  public.is_moderator()
  or (
    contributor_message is not null
    and exists (
      select 1
      from public.experiences e
      where e.id = moderation_actions.experience_id
        and e.profile_id = auth.uid()
    )
  )
);

create view public.contributor_moderation_updates
with (security_invoker=true)
as
select m.id, m.experience_id, m.action, m.contributor_message, m.created_at
from public.moderation_actions m
join public.experiences e on e.id = m.experience_id
where e.profile_id = auth.uid()
  and m.contributor_message is not null;

grant select on public.contributor_moderation_updates to authenticated;
