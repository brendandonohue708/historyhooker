-- HistoryHooker schema bootstrap.
-- Tables: collection_sets, topics, generation_runs.

create extension if not exists "pgcrypto";

-- Collection sets (created manually; the pipeline references but does not
-- create them).
create table if not exists public.collection_sets (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  description text,
  topic_ids uuid[] default '{}',
  reward_swag_id text,
  cover_image text,
  created_at timestamptz not null default now()
);

-- Topics (auto-generated every ~3 days by the edge function).
create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  category text not null check (
    category in (
      'history', 'science', 'space', 'mythology',
      'tech', 'biology', 'philosophy'
    )
  ),
  accent_color text,
  title text not null,
  clue_type text not null check (clue_type in ('image', 'text', 'audio')),
  clue_value text not null,
  clue_transcript text,
  questions jsonb not null,
  expansion_paragraphs text[] not null,
  youtube_video_id text,
  youtube_channel_name text,
  youtube_verified boolean default false,
  tags text[] default '{}',
  set_id uuid references public.collection_sets(id) on delete set null,
  status text not null default 'draft' check (
    status in ('draft', 'live', 'rejected')
  ),
  generated_at timestamptz not null default now(),
  sources jsonb,
  created_at timestamptz not null default now()
);

create index if not exists topics_status_created_idx
  on public.topics (status, created_at desc);
create index if not exists topics_category_idx on public.topics (category);
create index if not exists topics_set_id_idx on public.topics (set_id);

-- Records of every generation pipeline invocation, for debugging and
-- the admin safety-net dashboard.
create table if not exists public.generation_runs (
  id uuid primary key default gen_random_uuid(),
  triggered_at timestamptz not null default now(),
  topics_requested integer,
  topics_generated integer,
  topics_failed integer,
  errors jsonb,
  status text default 'in_progress' check (
    status in ('in_progress', 'succeeded', 'failed', 'partial')
  )
);

create index if not exists generation_runs_triggered_idx
  on public.generation_runs (triggered_at desc);
