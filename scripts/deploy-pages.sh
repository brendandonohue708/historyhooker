#!/usr/bin/env bash
# Build the web bundle and publish it to the gh-pages branch.
# Run from repo root: bash scripts/deploy-pages.sh
#
# gh-pages is a generated artifact branch; we rewrite its tip every deploy
# (force push). Source history lives on the working branch.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Building web bundle"
rm -rf dist
CI=1 npx expo export --platform web --output-dir dist --clear

echo "==> Adding SPA fallback + .nojekyll"
cp dist/index.html dist/404.html
touch dist/.nojekyll

echo "==> Publishing to gh-pages branch (orphan, force-pushed)"
WORKTREE="$(mktemp -d)"

# Always create gh-pages as a fresh orphan in the worktree.
# We force-push so source-branch history never pollutes gh-pages.
git worktree remove --force "$WORKTREE" 2>/dev/null || true
git worktree add --detach "$WORKTREE"

cd "$WORKTREE"
TMP_BRANCH="gh-pages-tmp-$$"
git checkout --orphan "$TMP_BRANCH"
git rm -rf . >/dev/null 2>&1 || true
find . -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

cp -R "$ROOT/dist/." .
git add -A
git -c commit.gpgsign=false commit -m "Deploy web build $(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Force-push the orphan as gh-pages (replaces remote tip)
git push --force origin HEAD:gh-pages

cd "$ROOT"
git worktree remove --force "$WORKTREE"

echo "==> Done. URL: https://brendandonohue708.github.io/historyhooker/"
