// App-side sync: when env vars for Supabase are present, fetch new live
// topics created since lastSyncedAt and merge into the local store.
// When env vars are absent (current default), this is a no-op so the
// app keeps running on seeded fixtures.

import type { Topic } from '@/data/types';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

interface RemoteTopicRow {
  id: string;
  category: string;
  accent_color: string;
  title: string;
  clue_type: 'image' | 'text' | 'audio';
  clue_value: string;
  clue_transcript: string | null;
  questions: Topic['questions'];
  expansion_paragraphs: string[];
  youtube_video_id: string | null;
  youtube_channel_name: string | null;
  tags: string[] | null;
  set_id: string | null;
  status: 'draft' | 'live' | 'rejected';
  sources: Topic['sources'];
  generated_at: string;
}

export async function syncTopics(
  lastSyncedAt: string | null,
): Promise<{ topics: Topic[]; syncedAt: string } | null> {
  if (!url || !anonKey) return null; // not configured — silent no-op

  const since = lastSyncedAt ?? new Date(0).toISOString();
  const endpoint =
    `${url}/rest/v1/topics?select=*` +
    `&status=eq.live` +
    `&created_at=gte.${encodeURIComponent(since)}` +
    `&order=created_at.desc`;

  const res = await fetch(endpoint, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });
  if (!res.ok) {
    console.warn('syncTopics: upstream failed', res.status);
    return null;
  }
  const rows = (await res.json()) as RemoteTopicRow[];
  const topics: Topic[] = rows.map((r) => ({
    id: r.id,
    category: r.category as Topic['category'],
    accentColor: r.accent_color,
    title: r.title,
    clue: {
      type: r.clue_type,
      value: r.clue_value,
      transcript: r.clue_transcript ?? undefined,
    },
    questions: r.questions,
    expansionParagraphs: r.expansion_paragraphs,
    youtubeVideoId: r.youtube_video_id,
    youtubeChannelName: r.youtube_channel_name ?? '',
    tags: r.tags ?? [],
    setId: r.set_id ?? undefined,
    status: r.status,
    sources: r.sources ?? [],
    generatedAt: r.generated_at,
  }));
  return { topics, syncedAt: new Date().toISOString() };
}
