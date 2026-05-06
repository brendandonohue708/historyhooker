# HistoryHooker — Backend Setup

This folder contains everything needed to switch the app from local seed
data to live, auto-generated topics. The app already runs without it —
the seed data covers a few weeks of play. Come here when you want fresh
content arriving on its own every 3 days.

There are three external services to set up. None of them require a
credit card to get started, but the Anthropic API charges per token —
budget a few dollars per month for generation.

```
Supabase  →  database + edge function host        (free tier)
Anthropic →  Claude API for topic generation      (pay-per-use, ~$1–3 / run)
YouTube   →  Data API v3 for video verification   (free, generous quota)
```

Total time the first time: about 30 minutes.

---

## 1. Create a Supabase project (5 min)

1. Sign up at <https://supabase.com> (free tier is fine).
2. Create a new project. Pick any name; pick a region close to you.
3. Wait ~2 min for it to provision.
4. Open **Project Settings → API**. Note these three values:
   - Project URL (looks like `https://xyz.supabase.co`)
   - `anon` key
   - `service_role` key — **keep this secret. Never put it in app code.**

## 2. Run the migrations (5 min)

In the Supabase dashboard go to **SQL Editor** and run, in order:

1. Paste the contents of `supabase/migrations/0001_init.sql` and click Run.
2. Paste `supabase/migrations/0002_rls.sql` and Run.
3. Open `supabase/migrations/0003_cron.sql`, replace `REPLACE_WITH_PROJECT_REF`
   and `REPLACE_WITH_SERVICE_ROLE_KEY` with the values from step 1, then Run.

Verify in **Table Editor** that you have three tables:
`topics`, `collection_sets`, `generation_runs`.

## 3. Get your API keys (5 min)

**Anthropic** — sign up at <https://console.anthropic.com>, click
**API Keys**, create a new key. Copy it. (Format: `sk-ant-api03-...`)

**YouTube Data API v3** — go to <https://console.cloud.google.com>:
1. Create a new project (any name)
2. **APIs & Services → Library**, search "YouTube Data API v3", click
   **Enable**
3. **APIs & Services → Credentials**, click **+ Create Credentials → API key**,
   copy the value

## 4. Deploy the edge function (10 min)

Easiest path: use the Supabase web dashboard.

1. In the dashboard go to **Edge Functions** (lightning-bolt icon in the
   left sidebar) → **+ Deploy a new function**.
2. Name it exactly `generate-topics`.
3. Paste the contents of every file in
   `supabase/functions/generate-topics/` into the editor, creating each
   one as a new file with the same filename:
   - `index.ts`
   - `claude.ts`
   - `youtube.ts`
   - `validate.ts`
   - `prompts.ts`
4. Click **Deploy function**.

Then add the secrets the function needs. Still in **Edge Functions**,
click your `generate-topics` function → **Secrets**, and add:

| Name                          | Value                                      |
|-------------------------------|--------------------------------------------|
| `ANTHROPIC_API_KEY`           | your Anthropic key from step 3             |
| `YOUTUBE_API_KEY`             | your YouTube key from step 3               |
| `SUPABASE_URL`                | already auto-provided                       |
| `SUPABASE_SERVICE_ROLE_KEY`   | already auto-provided                       |

## 5. Trigger a test run (2 min)

In **Edge Functions → generate-topics**, click **Invoke**. Use this
body to start with a small batch:

```json
{ "source": "manual", "count": 3 }
```

Wait 60–180 seconds. Check the response — you should see
`{ "status": "succeeded", "generated": 3, "failed": 0 }` (or some
mix). Then in **Table Editor → topics**, filter by
`status = 'live'` and you should see 3 new rows.

If `generated` is 0 and `errors` lists `stage1` problems, your
Anthropic key is the most likely culprit. If you see `stage2`
problems, look at the error detail — typical first-run issues are AI
tells in the expansion text or correct-answer-in-clue.

## 6. Wire the app to read live topics

Create a `.env` file at the project root (next to `package.json`),
which is already in `.gitignore` — secrets never get committed:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_FROM_STEP_1
```

Restart the Expo dev server. The app will start syncing on launch and
on pull-to-refresh.

## 7. Cron will take over

Once `0003_cron.sql` is applied, generation will run automatically every
3 days at 13:00 UTC. You can change the cadence by editing the cron line
(the first argument is a standard 5-field crontab schedule).

You can monitor runs in **Table Editor → generation_runs**: each row
records what was attempted, how many succeeded/failed, and a JSON blob
of error details for debugging.

## Cost expectations

A single 10-topic generation run uses roughly:

- 1 Claude call for stage 1 (small)
- 10 Claude calls with web search for stage 2 (each one runs a few
  searches and writes ~1.5k tokens of output)
- 0–20 YouTube API calls (free, well under quota)

At Sonnet pricing this is approximately **$1–3 per run**. At twice a
week that's about $5–10 / month. Track usage at
<https://console.anthropic.com/settings/billing>.

## Rolling back

To pause generation without breaking the app:

```sql
select cron.unschedule('historyhooker-generate-every-3d');
```

The app will keep serving whatever live topics are already in the
table, plus its built-in seed data when offline.
