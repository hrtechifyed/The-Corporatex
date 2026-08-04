-- The Corporate Ex application schema. Apply with `supabase db push`.
create extension if not exists pgcrypto;
create type public.profile_role as enum ('contributor','moderator');
create type public.account_status as enum ('active','disabled');
create type public.experience_status as enum ('draft','awaiting_ai_analysis','awaiting_user_approval','pending_moderation','changes_requested','published','rejected','withdrawn');
create type public.moderation_action as enum ('edit','publish','reject','request_changes','unpublish');

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 hrt_id text not null unique check (hrt_id ~ '^HRT-[A-HJ-NP-Z2-9]{9}$'),
 private_email text not null,
 role profile_role not null default 'contributor', account_status account_status not null default 'active',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.companies (id uuid primary key default gen_random_uuid(),normalized_name text not null unique,display_name text not null,slug text not null unique,created_at timestamptz not null default now());
create table public.experiences (
 id uuid primary key default gen_random_uuid(),profile_id uuid not null references profiles(id) on delete cascade,company_id uuid references companies(id),
 original_text text check (char_length(original_text)<=30000),approved_headline text,approved_summary text,language text not null default 'en',broad_function text,broad_region text,approximate_tenure text,work_arrangement text,main_reason text,would_join_again text,
 story_path text check (story_path in ('guided','directors-cut','both')),status experience_status not null default 'draft',public_slug text unique,ai_analysis jsonb,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),published_at timestamptz,
 check ((status <> 'published') or (public_slug is not null and published_at is not null and approved_headline is not null))
);
create table public.guided_answers (id uuid primary key default gen_random_uuid(),experience_id uuid not null references experiences(id) on delete cascade,question_key text not null,answer text not null check(char_length(answer)<=12000),sort_order int not null default 0,unique(experience_id,question_key));
create table public.experience_highlights (id uuid primary key default gen_random_uuid(),experience_id uuid not null references experiences(id) on delete cascade,category text not null,content text not null,contributor_approved boolean not null default false,sort_order int not null default 0);
create table public.experience_labels (id uuid primary key default gen_random_uuid(),experience_id uuid not null references experiences(id) on delete cascade,label text not null check(char_length(label)<=40),unique(experience_id,label));
create table public.moderation_actions (id uuid primary key default gen_random_uuid(),experience_id uuid not null references experiences(id) on delete cascade,moderator_id uuid not null references profiles(id),action moderation_action not null,private_reason text,created_at timestamptz not null default now());
create table public.reports (id uuid primary key default gen_random_uuid(),experience_id uuid not null references experiences(id) on delete cascade,reason text not null,details text,status text not null default 'open' check(status in('open','reviewing','resolved','dismissed')),created_at timestamptz not null default now());
create index experiences_profile_idx on experiences(profile_id);create index experiences_company_status_idx on experiences(company_id,status);create index experiences_public_idx on experiences(status,published_at desc);create index guided_experience_idx on guided_answers(experience_id,sort_order);create index highlights_experience_idx on experience_highlights(experience_id,sort_order);create index reports_status_idx on reports(status,created_at);

create function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now();return new;end $$;
create trigger profiles_touch before update on profiles for each row execute function touch_updated_at();create trigger experiences_touch before update on experiences for each row execute function touch_updated_at();
create function public.is_moderator() returns boolean language sql stable security definer set search_path=public as $$select exists(select 1 from profiles where id=auth.uid() and role='moderator' and account_status='active')$$;
create function public.random_hrt_id() returns text language plpgsql volatile set search_path=public as $$declare chars text:='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; bytes bytea:=gen_random_bytes(9); result text:='HRT-';begin for i in 0..8 loop result:=result||substr(chars,1+(get_byte(bytes,i)%length(chars)),1);end loop;return result;end$$;
create function public.create_profile_for_user() returns trigger language plpgsql security definer set search_path=public as $$declare candidate text;begin for attempt in 1..10 loop candidate:=random_hrt_id();begin insert into profiles(id,hrt_id,private_email) values(new.id,candidate,coalesce(new.email,''));return new;exception when unique_violation then null;end;end loop;raise exception 'Could not allocate anonymous identity';end$$;
create trigger auth_user_profile after insert on auth.users for each row execute function create_profile_for_user();
create function public.guard_experience_transition() returns trigger language plpgsql security definer set search_path=public as $$begin if old.status=new.status then return new;end if;if is_moderator() then if not ((old.status='pending_moderation' and new.status in('published','rejected','changes_requested')) or (old.status='published' and new.status='withdrawn')) then raise exception 'Invalid moderator transition';end if;elsif not ((old.status='draft' and new.status in('awaiting_ai_analysis','withdrawn')) or (old.status='awaiting_ai_analysis' and new.status in('awaiting_user_approval','draft','withdrawn')) or (old.status='awaiting_user_approval' and new.status in('awaiting_ai_analysis','pending_moderation','withdrawn')) or (old.status='changes_requested' and new.status in('awaiting_ai_analysis','pending_moderation','withdrawn')) or (old.status='pending_moderation' and new.status='withdrawn') or (old.status='published' and new.status='withdrawn')) then raise exception 'Invalid contributor transition';end if;return new;end$$;
create trigger guard_status before update of status on experiences for each row execute function guard_experience_transition();

alter table profiles enable row level security;alter table companies enable row level security;alter table experiences enable row level security;alter table guided_answers enable row level security;alter table experience_highlights enable row level security;alter table experience_labels enable row level security;alter table moderation_actions enable row level security;alter table reports enable row level security;
create policy profile_self on profiles for select to public using(id=auth.uid() or is_moderator() or exists(select 1 from experiences e where e.profile_id=profiles.id and e.status='published'));
create policy profile_self_update on profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy companies_public_read on companies for select using(exists(select 1 from experiences e where e.company_id=companies.id and (e.status='published' or e.profile_id=auth.uid())) or is_moderator());
create policy companies_auth_insert on companies for insert to authenticated with check(true);
create policy experiences_owner_moderator on experiences for select using(profile_id=auth.uid() or is_moderator());
create policy experiences_owner_insert on experiences for insert to authenticated with check(profile_id=auth.uid() and status='draft');
create policy experiences_owner_update on experiences for update to authenticated using(profile_id=auth.uid() or is_moderator()) with check(profile_id=auth.uid() or is_moderator());
create policy child_answers_owner on guided_answers for all to authenticated using(exists(select 1 from experiences e where e.id=experience_id and (e.profile_id=auth.uid() or is_moderator()))) with check(exists(select 1 from experiences e where e.id=experience_id and e.profile_id=auth.uid()));
create policy highlights_public_owner on experience_highlights for select using(exists(select 1 from experiences e where e.id=experience_id and (e.status='published' or e.profile_id=auth.uid() or is_moderator())));
create policy highlights_owner_write on experience_highlights for all to authenticated using(exists(select 1 from experiences e where e.id=experience_id and (e.profile_id=auth.uid() or is_moderator()))) with check(exists(select 1 from experiences e where e.id=experience_id and (e.profile_id=auth.uid() or is_moderator())));
create policy labels_public_owner on experience_labels for select using(exists(select 1 from experiences e where e.id=experience_id and (e.status='published' or e.profile_id=auth.uid() or is_moderator())));
create policy labels_owner_write on experience_labels for all to authenticated using(exists(select 1 from experiences e where e.id=experience_id and (e.profile_id=auth.uid() or is_moderator()))) with check(exists(select 1 from experiences e where e.id=experience_id and (e.profile_id=auth.uid() or is_moderator())));
create policy moderation_moderators_only on moderation_actions for all to authenticated using(is_moderator()) with check(is_moderator());
create policy reports_public_insert on reports for insert with check(exists(select 1 from experiences e where e.id=experience_id and e.status='published'));
create policy reports_moderator_read on reports for select to authenticated using(is_moderator());
revoke all on profiles from anon,authenticated;grant select(id,hrt_id,role,account_status,created_at,updated_at) on profiles to anon,authenticated;grant update(account_status) on profiles to authenticated;
grant select on companies,experience_highlights,experience_labels to anon,authenticated;grant select on experiences to authenticated;grant insert on companies,experiences to authenticated;grant insert on reports to anon,authenticated;grant update on experiences to authenticated;grant select,insert,update,delete on guided_answers,experience_highlights,experience_labels to authenticated;grant select,insert on moderation_actions to authenticated;

-- Deliberately excludes original_text and ai_analysis. Public clients query this view, never private records.
create view public.published_experiences with (security_invoker=false) as
select e.id,e.approved_headline,e.approved_summary,e.language,e.broad_function,e.broad_region,e.approximate_tenure,e.work_arrangement,e.main_reason,e.would_join_again,e.public_slug,e.published_at,c.display_name as company_display_name,c.slug as company_slug,p.hrt_id
from experiences e join companies c on c.id=e.company_id join profiles p on p.id=e.profile_id where e.status='published';
grant select on public.published_experiences to anon,authenticated;
