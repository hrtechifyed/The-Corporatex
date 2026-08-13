create table if not exists public.saved_experiences (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, experience_id)
);

create table if not exists public.experience_follows (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  experience_id uuid not null references public.experiences(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, experience_id)
);

create table if not exists public.story_questions (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences(id) on delete cascade,
  asker_profile_id uuid not null references public.profiles(id) on delete cascade,
  question_text text not null check (char_length(trim(question_text)) between 10 and 1000),
  status text not null default 'pending_moderation' check (status in ('pending_moderation','published','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create table if not exists public.story_responses (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null unique references public.story_questions(id) on delete cascade,
  responder_profile_id uuid not null references public.profiles(id) on delete cascade,
  response_text text not null check (char_length(trim(response_text)) between 2 and 2000),
  status text not null default 'pending_moderation' check (status in ('pending_moderation','published','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists saved_experiences_experience_idx on public.saved_experiences(experience_id);
create index if not exists experience_follows_experience_idx on public.experience_follows(experience_id);
create index if not exists story_questions_experience_status_idx on public.story_questions(experience_id, status, created_at desc);
create index if not exists story_responses_question_status_idx on public.story_responses(question_id, status);

alter table public.saved_experiences enable row level security;
alter table public.experience_follows enable row level security;
alter table public.story_questions enable row level security;
alter table public.story_responses enable row level security;

create policy saved_experiences_owner_select on public.saved_experiences for select to authenticated using (profile_id = auth.uid());
create policy saved_experiences_owner_insert on public.saved_experiences for insert to authenticated with check (profile_id = auth.uid() and exists (select 1 from public.experiences e where e.id = experience_id and e.status = 'published'));
create policy saved_experiences_owner_delete on public.saved_experiences for delete to authenticated using (profile_id = auth.uid());
create policy experience_follows_owner_select on public.experience_follows for select to authenticated using (profile_id = auth.uid());
create policy experience_follows_owner_insert on public.experience_follows for insert to authenticated with check (profile_id = auth.uid() and exists (select 1 from public.experiences e where e.id = experience_id and e.status = 'published'));
create policy experience_follows_owner_delete on public.experience_follows for delete to authenticated using (profile_id = auth.uid());
create policy story_questions_public_read on public.story_questions for select to public using (status = 'published');
create policy story_questions_participant_read on public.story_questions for select to authenticated using (asker_profile_id = auth.uid() or exists (select 1 from public.experiences e where e.id = experience_id and e.profile_id = auth.uid()) or public.is_moderator());
create policy story_questions_authenticated_insert on public.story_questions for insert to authenticated with check (asker_profile_id = auth.uid() and status = 'pending_moderation' and exists (select 1 from public.experiences e where e.id = experience_id and e.status = 'published'));
create policy story_questions_moderator_update on public.story_questions for update to authenticated using (public.is_moderator()) with check (public.is_moderator());
create policy story_responses_public_read on public.story_responses for select to public using (status = 'published' and exists (select 1 from public.story_questions q where q.id = question_id and q.status = 'published'));
create policy story_responses_participant_read on public.story_responses for select to authenticated using (responder_profile_id = auth.uid() or exists (select 1 from public.story_questions q where q.id = question_id and q.asker_profile_id = auth.uid()) or public.is_moderator());
create policy story_responses_contributor_insert on public.story_responses for insert to authenticated with check (responder_profile_id = auth.uid() and status = 'pending_moderation' and exists (select 1 from public.story_questions q join public.experiences e on e.id = q.experience_id where q.id = question_id and q.status = 'published' and e.profile_id = auth.uid()));
create policy story_responses_moderator_update on public.story_responses for update to authenticated using (public.is_moderator()) with check (public.is_moderator());

grant select, insert, delete on public.saved_experiences to authenticated;
grant select, insert, delete on public.experience_follows to authenticated;
grant select on public.story_questions to anon, authenticated;
grant insert, update on public.story_questions to authenticated;
grant select on public.story_responses to anon, authenticated;
grant insert, update on public.story_responses to authenticated;

create or replace view public.published_story_qa with (security_invoker = true) as
select q.id as question_id,q.experience_id,q.question_text,q.published_at as question_published_at,r.id as response_id,r.response_text,r.published_at as response_published_at
from public.story_questions q left join public.story_responses r on r.question_id=q.id and r.status='published'
where q.status='published';
grant select on public.published_story_qa to anon, authenticated;
