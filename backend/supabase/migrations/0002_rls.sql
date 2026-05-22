-- Row level security: anon keys can only read live topics; everything
-- else requires the service-role key (used by the edge function and the
-- Supabase dashboard).

alter table public.topics enable row level security;
alter table public.collection_sets enable row level security;
alter table public.generation_runs enable row level security;

-- Public read of live topics
drop policy if exists "topics_public_read_live" on public.topics;
create policy "topics_public_read_live"
  on public.topics for select
  to anon, authenticated
  using (status = 'live');

-- Public read of all collection sets (their existence is not a secret)
drop policy if exists "sets_public_read_all" on public.collection_sets;
create policy "sets_public_read_all"
  on public.collection_sets for select
  to anon, authenticated
  using (true);

-- Generation runs: not visible to anon
drop policy if exists "runs_service_only_read" on public.generation_runs;
create policy "runs_service_only_read"
  on public.generation_runs for select
  to authenticated
  using (false); -- service role bypasses RLS automatically
