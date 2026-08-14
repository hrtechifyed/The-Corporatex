-- Atomic moderation and contributor-resubmission actions.

alter table public.experiences drop constraint if exists experiences_broad_region_story_location_fkey;
alter table public.experiences
  add constraint experiences_broad_region_story_location_fkey
  foreign key (broad_region) references public.story_locations(display_name);

create or replace function public.moderate_experience(
  p_experience_id uuid,
  p_action text,
  p_contributor_message text default null,
  p_internal_reason text default null,
  p_headline text default null,
  p_summary text default null
)
returns jsonb
language plpgsql
security invoker
set search_path=public
as $$
declare
  current_row public.experiences%rowtype;
  company_slug text;
  next_slug text;
  next_status public.experience_status;
begin
  if not public.is_moderator() then
    raise exception 'Moderator access required';
  end if;

  select * into current_row from public.experiences where id=p_experience_id for update;
  if not found then raise exception 'Story not found'; end if;
  if current_row.status <> 'pending_moderation' then
    raise exception 'Only stories awaiting moderation can be reviewed';
  end if;

  if p_action='publish' then
    next_status := 'published';
    select slug into company_slug from public.companies where id=current_row.company_id;
    next_slug := coalesce(current_row.public_slug, coalesce(company_slug,'story') || '-' || substr(replace(current_row.id::text,'-',''),1,12));
    insert into public.moderation_actions(experience_id,moderator_id,action,private_reason,contributor_message)
    values(current_row.id,auth.uid(),'publish',nullif(trim(p_internal_reason),''),null);
    update public.experiences set
      approved_headline=coalesce(nullif(trim(p_headline),''),approved_headline),
      approved_summary=coalesce(nullif(trim(p_summary),''),approved_summary),
      public_slug=next_slug,
      published_at=now(),
      status=next_status
    where id=current_row.id;
  elsif p_action='request_changes' then
    if char_length(trim(coalesce(p_contributor_message,''))) < 8 then
      raise exception 'Explain the requested change to the contributor';
    end if;
    next_status := 'changes_requested';
    insert into public.moderation_actions(experience_id,moderator_id,action,private_reason,contributor_message)
    values(current_row.id,auth.uid(),'request_changes',nullif(trim(p_internal_reason),''),trim(p_contributor_message));
    update public.experiences set status=next_status where id=current_row.id;
  elsif p_action='reject' then
    if char_length(trim(coalesce(p_contributor_message,''))) < 8 then
      raise exception 'Explain the moderation decision to the contributor';
    end if;
    next_status := 'rejected';
    insert into public.moderation_actions(experience_id,moderator_id,action,private_reason,contributor_message)
    values(current_row.id,auth.uid(),'reject',nullif(trim(p_internal_reason),''),trim(p_contributor_message));
    update public.experiences set status=next_status where id=current_row.id;
  else
    raise exception 'Unsupported moderation action';
  end if;

  return jsonb_build_object('id',current_row.id,'status',next_status,'public_slug',next_slug);
end;
$$;

revoke all on function public.moderate_experience(uuid,text,text,text,text,text) from public;
grant execute on function public.moderate_experience(uuid,text,text,text,text,text) to authenticated;

create or replace function public.resubmit_experience(
  p_experience_id uuid,
  p_answers jsonb,
  p_labels text[] default array[]::text[]
)
returns jsonb
language plpgsql
security invoker
set search_path=public
as $$
declare
  current_row public.experiences%rowtype;
  answer_count integer;
  first_answer text;
  combined_text text;
  summary_text text;
begin
  select * into current_row from public.experiences where id=p_experience_id for update;
  if not found or current_row.profile_id <> auth.uid() then raise exception 'Story not found'; end if;
  if current_row.status <> 'changes_requested' then raise exception 'This story is not awaiting contributor changes'; end if;
  if jsonb_typeof(p_answers) <> 'array' then raise exception 'Story Beats are required'; end if;

  select count(*), min(answer) filter (where rn=1), string_agg(answer,' ' order by rn)
    into answer_count, first_answer, combined_text
  from (
    select trim(coalesce(x.answer,'')) as answer,
           row_number() over(order by coalesce(x.sort_order,0),x.question_key) as rn
    from jsonb_to_recordset(p_answers) as x(question_key text, answer text, sort_order integer)
    where char_length(trim(coalesce(x.answer,''))) > 0
  ) q;

  if coalesce(answer_count,0)=0 then raise exception 'Answer at least one Story Beat before resubmitting'; end if;
  if exists (
    select 1 from jsonb_to_recordset(p_answers) as x(question_key text, answer text, sort_order integer)
    where char_length(coalesce(x.answer,'')) > 12000
  ) then raise exception 'A Story Beat is too long'; end if;

  delete from public.guided_answers where experience_id=current_row.id;
  insert into public.guided_answers(experience_id,question_key,answer,sort_order)
  select current_row.id, trim(x.question_key), trim(x.answer), coalesce(x.sort_order,0)
  from jsonb_to_recordset(p_answers) as x(question_key text, answer text, sort_order integer)
  where char_length(trim(coalesce(x.answer,''))) > 0;

  summary_text := left(coalesce(combined_text,''),1200);
  update public.experiences set
    original_text=left(coalesce(combined_text,''),30000),
    approved_headline=left(coalesce(nullif(first_answer,''),approved_headline,'Workplace experience'),150),
    approved_summary=summary_text,
    ai_analysis=null,
    status='pending_moderation'
  where id=current_row.id;

  delete from public.experience_labels where experience_id=current_row.id;
  if coalesce(array_length(p_labels,1),0) > 0 then
    insert into public.experience_labels(experience_id,label)
    select current_row.id,left(trim(label),40)
    from unnest(p_labels) label
    where char_length(trim(label))>0
    on conflict (experience_id,label) do nothing;
  end if;

  return jsonb_build_object('id',current_row.id,'status','pending_moderation');
end;
$$;

revoke all on function public.resubmit_experience(uuid,jsonb,text[]) from public;
grant execute on function public.resubmit_experience(uuid,jsonb,text[]) to authenticated;
