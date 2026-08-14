-- Expand location categories while keeping the experience->story_locations FK strict.
-- Worldwide cities are validated by the submit-story Edge Function and registered
-- in story_locations on first use; this table therefore stays small and canonical.

alter table public.story_locations drop constraint if exists story_locations_category_check;
alter table public.story_locations
  add constraint story_locations_category_check
  check (category in ('city','remote','other'));

insert into public.story_locations(display_name, category, priority, is_active)
values
  ('Remote','remote',1,true),
  ('Other','other',2,true)
on conflict (display_name) do update
set category=excluded.category,
    priority=excluded.priority,
    is_active=true;

-- Keep historical regional remote values available for existing rows, but stop
-- offering them in the new picker now that Remote is a single explicit choice.
update public.story_locations
set is_active=false
where category='remote'
  and display_name like 'Remote — %';
