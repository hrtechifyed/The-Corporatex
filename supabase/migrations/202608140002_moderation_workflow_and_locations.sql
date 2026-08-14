-- Production moderation lifecycle and validated story-location catalogue.

create table if not exists public.story_locations (
  display_name text primary key,
  search_name text generated always as (lower(display_name)) stored,
  category text not null default 'city' check (category in ('city','remote')),
  priority integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.story_locations enable row level security;
drop policy if exists story_locations_public_read on public.story_locations;
create policy story_locations_public_read on public.story_locations for select using (is_active);
grant select on public.story_locations to anon, authenticated;

insert into public.story_locations(display_name, category, priority) values
('Abu Dhabi, United Arab Emirates','city',10),('Accra, Ghana','city',30),('Addis Ababa, Ethiopia','city',30),('Adelaide, Australia','city',20),('Ahmedabad, India','city',20),('Alexandria, Egypt','city',30),('Algiers, Algeria','city',30),('Amman, Jordan','city',30),('Amsterdam, Netherlands','city',10),('Ankara, Türkiye','city',20),('Antwerp, Belgium','city',30),('Athens, Greece','city',20),('Atlanta, United States','city',20),('Auckland, New Zealand','city',20),
('Baku, Azerbaijan','city',30),('Baltimore, United States','city',30),('Bangkok, Thailand','city',10),('Barcelona, Spain','city',10),('Beijing, China','city',10),('Beirut, Lebanon','city',30),('Belfast, United Kingdom','city',30),('Bengaluru, India','city',5),('Berlin, Germany','city',10),('Birmingham, United Kingdom','city',20),('Bogotá, Colombia','city',20),('Boston, United States','city',10),('Brisbane, Australia','city',20),('Brussels, Belgium','city',10),('Bucharest, Romania','city',20),('Budapest, Hungary','city',20),('Buenos Aires, Argentina','city',10),
('Cairo, Egypt','city',10),('Calgary, Canada','city',20),('Cape Town, South Africa','city',10),('Casablanca, Morocco','city',20),('Chandigarh, India','city',30),('Chennai, India','city',10),('Chicago, United States','city',10),('Colombo, Sri Lanka','city',20),('Copenhagen, Denmark','city',10),
('Dallas, United States','city',10),('Dar es Salaam, Tanzania','city',30),('Delhi, India','city',10),('Denver, United States','city',20),('Dhaka, Bangladesh','city',20),('Doha, Qatar','city',10),('Dubai, United Arab Emirates','city',5),('Dublin, Ireland','city',10),('Durban, South Africa','city',30),
('Edinburgh, United Kingdom','city',20),('Edmonton, Canada','city',30),
('Frankfurt, Germany','city',10),('Fukuoka, Japan','city',30),
('Geneva, Switzerland','city',20),('Glasgow, United Kingdom','city',20),('Guadalajara, Mexico','city',30),('Guangzhou, China','city',20),('Gurugram, India','city',10),
('Hamburg, Germany','city',20),('Hanoi, Vietnam','city',20),('Harare, Zimbabwe','city',30),('Havana, Cuba','city',30),('Helsinki, Finland','city',20),('Ho Chi Minh City, Vietnam','city',10),('Hong Kong','city',10),('Honolulu, United States','city',30),('Houston, United States','city',10),('Hyderabad, India','city',10),
('Indore, India','city',30),('Istanbul, Türkiye','city',10),
('Jakarta, Indonesia','city',10),('Jaipur, India','city',20),('Johannesburg, South Africa','city',10),
('Kampala, Uganda','city',30),('Karachi, Pakistan','city',20),('Kathmandu, Nepal','city',20),('Kigali, Rwanda','city',30),('Kingston, Jamaica','city',30),('Kochi, India','city',20),('Kolkata, India','city',10),('Kuala Lumpur, Malaysia','city',10),('Kuwait City, Kuwait','city',20),('Kyiv, Ukraine','city',20),('Kyoto, Japan','city',30),
('Lagos, Nigeria','city',10),('Lahore, Pakistan','city',20),('Las Vegas, United States','city',30),('Leeds, United Kingdom','city',30),('Lima, Peru','city',20),('Lisbon, Portugal','city',10),('London, United Kingdom','city',5),('Los Angeles, United States','city',5),('Luxembourg City, Luxembourg','city',30),('Lyon, France','city',30),
('Madrid, Spain','city',10),('Manchester, United Kingdom','city',20),('Manila, Philippines','city',10),('Melbourne, Australia','city',10),('Mexico City, Mexico','city',10),('Miami, United States','city',20),('Milan, Italy','city',10),('Montreal, Canada','city',20),('Moscow, Russia','city',20),('Mumbai, India','city',5),('Munich, Germany','city',10),
('Nairobi, Kenya','city',10),('Nagpur, India','city',30),('New Delhi, India','city',5),('New York, United States','city',5),('Noida, India','city',10),
('Osaka, Japan','city',10),('Oslo, Norway','city',20),('Ottawa, Canada','city',30),
('Paris, France','city',5),('Perth, Australia','city',20),('Philadelphia, United States','city',20),('Phoenix, United States','city',20),('Pune, India','city',10),
('Quebec City, Canada','city',30),('Quito, Ecuador','city',30),
('Raleigh, United States','city',30),('Reykjavík, Iceland','city',30),('Riyadh, Saudi Arabia','city',10),('Rome, Italy','city',10),('Rotterdam, Netherlands','city',30),
('San Diego, United States','city',20),('San Francisco, United States','city',5),('San José, Costa Rica','city',30),('Santiago, Chile','city',20),('São Paulo, Brazil','city',10),('Seattle, United States','city',10),('Seoul, South Korea','city',5),('Shanghai, China','city',10),('Shenzhen, China','city',20),('Singapore','city',5),('Stockholm, Sweden','city',10),('Sydney, Australia','city',5),
('Taipei, Taiwan','city',10),('Tallinn, Estonia','city',30),('Tbilisi, Georgia','city',30),('Tel Aviv, Israel','city',20),('Tokyo, Japan','city',5),('Toronto, Canada','city',5),
('Vancouver, Canada','city',10),('Vienna, Austria','city',10),
('Warsaw, Poland','city',20),('Washington, DC, United States','city',10),('Wellington, New Zealand','city',30),
('Yangon, Myanmar','city',30),
('Zagreb, Croatia','city',30),('Zürich, Switzerland','city',10),
('Remote — Asia-Pacific','remote',15),('Remote — Europe','remote',15),('Remote — Middle East & Africa','remote',15),('Remote — North America','remote',15),('Remote — Latin America','remote',15),('Remote — Global','remote',10)
on conflict (display_name) do update set category=excluded.category, priority=excluded.priority, is_active=true;

alter table public.moderation_actions
  add column if not exists contributor_message text check (contributor_message is null or char_length(contributor_message) <= 3000);

create or replace view public.contributor_moderation_updates with (security_invoker=false) as
select m.id, m.experience_id, m.action, m.contributor_message, m.created_at
from public.moderation_actions m
join public.experiences e on e.id=m.experience_id
where e.profile_id=auth.uid() and m.contributor_message is not null;
revoke all on public.contributor_moderation_updates from public;
grant select on public.contributor_moderation_updates to authenticated;

alter table public.story_notification_jobs drop constraint if exists story_notification_jobs_experience_id_kind_key;
alter table public.story_notification_jobs drop constraint if exists story_notification_jobs_kind_check;
alter table public.story_notification_jobs add constraint story_notification_jobs_kind_check check (kind in (
  'submission_admin','submission_contributor','resubmission_admin','resubmission_contributor',
  'changes_requested_contributor','rejected_contributor','published_contributor'
));
create index if not exists story_notification_jobs_experience_kind_idx on public.story_notification_jobs(experience_id, kind, created_at desc);

create or replace function public.enqueue_story_notifications()
returns trigger
language plpgsql
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
    insert into public.story_notification_jobs(experience_id,kind) values (new.id,'changes_requested_contributor');
  elsif new.status='rejected' and old.status is distinct from 'rejected' then
    insert into public.story_notification_jobs(experience_id,kind) values (new.id,'rejected_contributor');
  elsif new.status='published' and old.status is distinct from 'published' then
    insert into public.story_notification_jobs(experience_id,kind) values (new.id,'published_contributor');
  end if;
  return new;
end;
$$;

-- HRTechify owns the moderation queue. The account remains a normal authenticated account,
-- but receives the moderator role used by RLS and the moderation Edge Function.
update public.profiles
set role='moderator', updated_at=now()
where lower(private_email)=lower('hrtechifyed@gmail.com');
