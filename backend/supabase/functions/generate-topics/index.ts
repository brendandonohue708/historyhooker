// Main pipeline: 3-stage generation triggered by pg_cron every 3 days
// (or manually from the Supabase dashboard).
//
// Stage 1: ask Claude for N topic candidates avoiding existing titles.
// Stage 2: for each candidate, run Claude with web_search to research
//          and produce a draft topic JSON.
// Stage 3: verify the YouTube suggestion via the Data API v3, then
//          validate the topic and either insert as live or reject.
//
// Endpoint accepts JSON body { source: string, count?: number }.

import { createClient } from 'npm:@supabase/supabase-js@^2.45.0';
import { callClaude, extractJson } from './claude.ts';
import { verifyVideo } from './youtube.ts';
import { validate, type ValidationFailure } from './validate.ts';
import {
  STAGE_1_SYSTEM,
  stage1User,
  STAGE_2_SYSTEM,
  stage2User,
} from './prompts.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const DEFAULT_COUNT = 10;
const MAX_PER_TOPIC_RETRIES = 2;

// Per-category accent colors mirror the front-end theme.
const ACCENT: Record<string, string> = {
  history: '#E8A33F',
  science: '#3FB6E8',
  space: '#7C5CFF',
  mythology: '#B85CFF',
  tech: '#5CFFC4',
  biology: '#5CE85C',
  philosophy: '#E85C8E',
};

interface Stage1Item {
  title: string;
  category: string;
  angle: string;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  let body: { count?: number; source?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* no body — fine */
  }
  const targetCount = body.count ?? DEFAULT_COUNT;

  // Open run record for the dashboard.
  const { data: run, error: runErr } = await supabase
    .from('generation_runs')
    .insert({
      topics_requested: targetCount,
      topics_generated: 0,
      topics_failed: 0,
      status: 'in_progress',
      errors: [],
    })
    .select('id')
    .single();

  if (runErr || !run) {
    console.error('Failed to open generation_runs row', runErr);
    return new Response(
      JSON.stringify({ error: 'Failed to open generation run', details: runErr }),
      { status: 500 },
    );
  }
  const runId = run.id;

  const errors: Array<{ stage: string; topic?: string; rule?: string; detail?: string; message?: string }> = [];

  // ─── Stage 1: get candidate titles ─────────────────────────────────
  const { data: existing } = await supabase
    .from('topics')
    .select('title')
    .in('status', ['live', 'draft']);
  const existingTitles = (existing ?? []).map((r) => r.title as string);

  let candidates: Stage1Item[] = [];
  try {
    const raw = await callClaude({
      system: STAGE_1_SYSTEM,
      user: stage1User(existingTitles, targetCount + 4), // ask for buffer
      enableWebSearch: false,
      maxTokens: 2000,
    });
    const parsed = extractJson<Stage1Item[]>(raw);
    if (!Array.isArray(parsed)) throw new Error('Stage 1 output not an array');
    candidates = parsed.filter(
      (c) =>
        c &&
        typeof c.title === 'string' &&
        typeof c.category === 'string' &&
        typeof c.angle === 'string',
    );
  } catch (e) {
    errors.push({ stage: 'stage1', message: (e as Error).message });
    await supabase
      .from('generation_runs')
      .update({ status: 'failed', errors })
      .eq('id', runId);
    return new Response(
      JSON.stringify({ error: 'Stage 1 failed', errors }),
      { status: 500 },
    );
  }

  // ─── Stages 2 + 3 + validation: per topic ──────────────────────────
  let generated = 0;
  let failed = 0;

  for (const cand of candidates) {
    if (generated >= targetCount) break;
    if (existingTitles.some((t) => t.toLowerCase() === cand.title.toLowerCase())) {
      errors.push({ stage: 'stage2', topic: cand.title, rule: 'duplicate_title' });
      failed++;
      continue;
    }
    let attempt = 0;
    let inserted = false;
    while (attempt <= MAX_PER_TOPIC_RETRIES && !inserted) {
      attempt++;
      try {
        const raw = await callClaude({
          system: STAGE_2_SYSTEM,
          user: stage2User(cand.title, cand.category, cand.angle),
          enableWebSearch: true,
          maxTokens: 4500,
        });
        const draft = extractJson<{
          title: string;
          category: string;
          clue: { type: string; value: string; transcript?: string; imageSearchQuery?: string };
          questions: Array<{ text: string; choices: string[]; correctAnswer: string; difficulty: string; coinsReward: number }>;
          expansionParagraphs: string[];
          youtubeSuggestions?: Array<{ title: string; channel: string; searchQuery: string }>;
          tags?: string[];
          sources: Array<{ url: string; title: string }>;
        }>(raw);

        if (!draft) throw new Error('Stage 2 returned non-JSON');

        const failure: ValidationFailure | null = validate(draft);
        if (failure) {
          errors.push({ stage: 'validate', topic: cand.title, rule: failure.rule, detail: failure.detail });
          continue;
        }

        // Stage 3: YouTube verification (best-effort).
        let videoId: string | null = null;
        let channel = '';
        const suggestions = draft.youtubeSuggestions ?? [];
        for (const s of suggestions) {
          const verified = await verifyVideo(s.searchQuery, s.channel);
          if (verified) {
            videoId = verified.videoId;
            channel = verified.channelName;
            break;
          }
        }
        if (!channel && suggestions.length > 0) channel = suggestions[0].channel;

        const insertRow = {
          category: draft.category,
          accent_color: ACCENT[draft.category] ?? '#E8A33F',
          title: draft.title,
          clue_type: draft.clue.type,
          clue_value: draft.clue.value,
          clue_transcript: draft.clue.transcript ?? null,
          questions: draft.questions,
          expansion_paragraphs: draft.expansionParagraphs,
          youtube_video_id: videoId,
          youtube_channel_name: channel,
          youtube_verified: !!videoId,
          tags: draft.tags ?? [],
          status: 'live' as const,
          sources: draft.sources,
          generated_at: new Date().toISOString(),
        };

        const { error: insertErr } = await supabase
          .from('topics')
          .insert(insertRow);
        if (insertErr) {
          errors.push({ stage: 'insert', topic: cand.title, message: insertErr.message });
          continue;
        }

        existingTitles.push(draft.title);
        generated++;
        inserted = true;
      } catch (e) {
        errors.push({
          stage: 'stage2',
          topic: cand.title,
          message: (e as Error).message,
        });
      }
    }
    if (!inserted) failed++;
  }

  const status =
    generated >= targetCount
      ? 'succeeded'
      : generated > 0
        ? 'partial'
        : 'failed';

  await supabase
    .from('generation_runs')
    .update({
      status,
      topics_generated: generated,
      topics_failed: failed,
      errors,
    })
    .eq('id', runId);

  return new Response(
    JSON.stringify({ runId, status, generated, failed, errors }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    },
  );
});
