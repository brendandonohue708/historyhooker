#!/usr/bin/env bash
# Build the web bundle and publish it to the gh-pages branch.
# Run from repo root: bash scripts/deploy-pages.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Building web bundle"
rm -rf dist
CI=1 npx expo export --platform web --output-dir dist --clear

echo "==> Adding SPA fallback + .nojekyll"
cp dist/index.html dist/404.html
touch dist/.nojekyll

echo "==> Publishing to gh-pages branch"
WORKTREE="$(mktemp -d)"
git worktree add -B gh-pages "$WORKTREE" || git worktree add "$WORKTREE" gh-pages

# Wipe worktree contents (keeping .git linkage)
find "$WORKTREE" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

# Copy dist contents (including dotfiles)
cp -R dist/. "$WORKTREE/"

cd "$WORKTREE"
git add -A
if git diff --cached --quiet; then
  echo "==> No changes to publish"
else
  git -c commit.gpgsign=false commit -m "Deploy web build $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  git push -u origin gh-pages
fi

cd "$ROOT"
git worktree remove --force "$WORKTREE"

echo "==> Done"
