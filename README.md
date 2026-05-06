# HistoryHooker

A mystery-first history, science, and nerd-trivia learning app.
Dark, cinematic, discovery-driven — peeling back a layer at a time.

**Live preview:** <https://brendandonohue708.github.io/historyhooker/>

## What it is

Each topic begins with a clue — a blurred photo, a cryptic line, or a
snippet of audio. You guess. You answer three questions, easy to hard.
The full story unlocks at the end. You earn coins, unlock badges,
build a streak.

15 hand-written seed topics, no AI-written content. Pipelines exist
for auto-generation but the seed alone is good for weeks of play.

## Project structure

```
app/                React Native + Expo Router screens
  index.tsx         Feed
  play.tsx          Three-stage topic card (clue → question → expansion)
  profile.tsx       Stats + equipped cosmetics + collection progress
  shop.tsx          Swag shop with purchase + equip
  sets/             Collection sets (index + detail)
  leaderboard.tsx   Weekly + all-time
  onboarding.tsx    First-launch gesture intro + username
  +html.tsx         Custom HTML shell for web (forces dark theme on first paint)

src/
  components/       Reusable UI: ClueCanvas, QuestionCard, ExpansionSheet, ConfettiBurst, etc.
  data/
    types.ts        Canonical TypeScript shapes (Topic, Question, SwagItem, ...)
    seed/           15 hand-written topics, 24 swag items, 3 sets, mock leaderboard
  state/store.ts    Zustand root store with AsyncStorage persistence
  features/sync/    Optional Supabase live-topics fetcher
  theme/            Dark palette, per-category accents, typography, spacing
  lib/date.ts       Local-day rollover utilities for streaks

backend/            (Optional) Supabase + Claude API + YouTube pipeline
  supabase/migrations/
  supabase/functions/generate-topics/

scripts/deploy-pages.sh   Build for web and force-push to gh-pages
```

## Tech

- **Expo SDK 55** + React Native 0.83 + React 19.2
- **Expo Router** with static rendering for web
- **Zustand** + `@react-native-async-storage/async-storage` for persistent state
- **react-native-svg** for the category bar chart
- **expo-haptics** / **expo-audio** / **expo-web-browser** / **expo-blur** / **expo-linear-gradient**
- Built-in `Animated` + `PanResponder` for animations and gestures
  (chosen over Reanimated v4 to keep a clean web preview build)

The original spec called for `react-native-mmkv` and `@shopify/react-native-skia`.
Both require a custom dev client which is out of reach when developing
exclusively from a phone, so we substituted the equivalents above —
behavior matches the spec, the only practical difference is that
AsyncStorage is microseconds slower than MMKV, which doesn't matter at
this app's scale.

## Building from a phone

See **[RUN.md](./RUN.md)**. Short version: you don't run anything; the
GitHub Pages link is always live, and Claude redeploys it for you.

## Auto-generated topics (optional)

The app ships with seed content. To enable the full pipeline that
researches and writes new topics every 3 days using Claude with web
search, follow **[backend/README.md](./backend/README.md)**.

## License

Personal project. No license declared yet.
