# RUN.md — How to use HistoryHooker (beginner-friendly)

This is the practical guide to working with this project from your iPhone.
It is written assuming this is the first app you've ever built.

---

## What you have

A complete dark-themed mystery-trivia app. It runs on a public URL on
your iPhone in Safari:

```
https://brendandonohue708.github.io/historyhooker/
```

Open that link any time. It always shows the latest version of the app.
It works without you having to do anything technical.

The code lives on GitHub at:

```
https://github.com/brendandonohue708/historyhooker
```

You can browse it from your phone. You won't normally need to.

---

## How the dev loop works

When you ask Claude (this conversation, or a future one) to change the
app, Claude does this:

1. Edits the code in its sandbox.
2. Runs the build script to compile the web version.
3. Pushes the new build to the `gh-pages` branch on GitHub.
4. GitHub Pages picks up the change and updates your URL within ~1–2
   minutes.
5. You refresh `https://brendandonohue708.github.io/historyhooker/` on
   your iPhone and see it.

You don't run anything yourself.

### Cache-busting refresh trick

Sometimes Safari hangs on to an old version of the page. If after 2
minutes you don't see what Claude said you should see, force a fresh
fetch with a query string:

```
https://brendandonohue708.github.io/historyhooker/?v=10
```

Bump the number each time. Any number works — it just convinces Safari
to ask GitHub Pages for a fresh copy.

---

## Per-session checklist

Each time you come back to keep building:

1. Open Claude Code (web).
2. Tell it what to change. Be specific. "Make the streak banner taller"
   is better than "make it look nicer".
3. When Claude says it pushed and deployed, wait 1–2 minutes and refresh
   the URL on your iPhone.
4. If it looks wrong, **tell Claude what you see**, ideally with a
   screenshot. Claude can't see the page; it has to trust your eyes.

---

## What your iPhone web preview can and can't do

The web preview shows you the **look, the layout, the animations, and
the user flow**. It is not native iOS. Specifically:

| Works on web | Doesn't work on web |
|--------------|---------------------|
| Dark theme, typography, accent colors | Real iPhone haptic vibrations |
| Tap interactions, swipe gestures | Native pull-to-refresh "bounce" feel |
| Animated reveal, confetti, transitions | Sound (audio clue playback works only if remote files load) |
| Scrolling, bottom sheets, modals | Press-and-hold force feedback |
| Saving your progress between visits | App Store install icon |

When you're ready for the real native experience (haptics, fully
smooth gestures, an icon on your home screen), see "Going native" below.

---

## Resetting your data

The app saves your username, coins, streak, and unlocked swag in
Safari's local storage. To wipe it and start fresh (e.g. to re-see
onboarding):

1. iPhone **Settings → Safari → Advanced → Website Data**
2. Find `brendandonohue708.github.io`
3. Swipe left to delete

Reload the URL. You'll see onboarding again.

---

## When something breaks

The most common issues:

**Page is blank white.** GitHub Pages sometimes takes 2–3 minutes to
publish. Wait, then add `?v=N` to the URL and reload. If still blank
after 5 minutes, tell Claude — there may be a build error.

**Page shows old content.** Same fix: `?v=N`.

**Tapped a button and nothing happened.** The web preview can have
small input lag. If consistent, screenshot and tell Claude.

**"You've seen everything" banner appears.** You played all 15 seed
topics. Reset your data (above) to play them again, or turn on backend
generation (see `backend/README.md`) to add new ones.

---

## Going native (later, when you have computer access)

The full spec was designed for native — real haptics, instant
animations, gesture physics that feel right. If you eventually borrow
or buy a computer:

1. Install Node.js from <https://nodejs.org> (the LTS version).
2. Install Expo Go on your iPhone (free, App Store).
3. From the computer, open Terminal and run:
   ```
   git clone https://github.com/brendandonohue708/historyhooker.git
   cd historyhooker
   npm install
   npx expo start --tunnel
   ```
   First run will install ngrok automatically. Wait for the QR code.
4. Open Expo Go on your iPhone and scan the QR code from the screen.

The app loads natively on your phone, with all native features
working. From then on you can keep building from the iPhone Claude
session, and just `git pull && npx expo start --tunnel` on the
computer when you want to try a fresh build natively.

---

## Switching to live AI-generated topics

The app currently uses 15 hand-written seed topics. To enable the
auto-generation pipeline (Claude API + YouTube + Supabase) so that
fresh topics appear every 3 days:

See **`backend/README.md`**. It's a step-by-step setup walking through
Supabase, Anthropic, and YouTube Data API. Total time ~30 min.
Estimated cost: $5–10 / month.

This is optional. The app is fully usable without it.
