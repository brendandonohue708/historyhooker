-- Schedule the generate-topics edge function to run every 3 days.
-- Requires pg_cron and pg_net, both available on Supabase by default.
--
-- Replace REPLACE_WITH_PROJECT_REF and REPLACE_WITH_SERVICE_ROLE_KEY
-- before running this migration. Service role key is sensitive and is
-- only stored inside the SQL function call; rotate it via Supabase
-- dashboard if it leaks.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.unschedule('historyhooker-generate-every-3d')
where exists (
  select 1 from cron.job where jobname = 'historyhooker-generate-every-3d'
);

select cron.schedule(
  'historyhooker-generate-every-3d',
  '0 13 */3 * *', -- every 3 days at 13:00 UTC
  $$
    select net.http_post(
      url := 'https://REPLACE_WITH_PROJECT_REF.functions.supabase.co/generate-topics',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer REPLACE_WITH_SERVICE_ROLE_KEY'
      ),
      body := jsonb_build_object('source', 'cron', 'count', 10)
    );
  $$
);
