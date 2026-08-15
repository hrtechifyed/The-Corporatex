alter table public.experiences
  add column if not exists role_title text,
  add column if not exists departure_month date;

comment on column public.experiences.role_title is
  'Contributor-provided role title at the employer. Public surfaces may continue to use broad_function for compatibility.';

comment on column public.experiences.departure_month is
  'Month the contributor left the employer, stored as the first day of the month.';

alter table public.experiences
  drop constraint if exists experiences_departure_month_first_day;

alter table public.experiences
  add constraint experiences_departure_month_first_day
  check (departure_month is null or extract(day from departure_month) = 1);
