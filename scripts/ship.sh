#!/usr/bin/env bash
# Commit all repo changes and push the current branch (no GitHub web UI).
# Vercel/GitHub integration then deploys automatically on push.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

npm run sync-api
(cd astro-site && npm ci && npm run build)

if git diff --quiet && git diff --cached --quiet; then
  echo "Nothing to commit (working tree clean)."
  exit 0
fi

MSG="${1:-chore: site update}"
git add -A
git commit -m "$MSG"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
git push origin "$BRANCH"
echo "Pushed $BRANCH — your host should deploy from this push."
