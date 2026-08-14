do $$
declare
  existing_job bigint;
begin
  select jobid into existing_job from cron.job where jobname = 'process-story-deletions' limit 1;
  if existing_job is not null then
    perform cron.unschedule(existing_job);
  end if;
end;
$$;

select cron.schedule(
  'process-story-deletions',
  '* * * * *',
  $$
    select net.http_post(
      url := 'https://otgnnkaawwwwqxlzrfpx.supabase.co/functions/v1/process-story-deletions',
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body := '{"source":"cron"}'::jsonb
    );
  $$
);
