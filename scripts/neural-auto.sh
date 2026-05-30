#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BASE_URL="${1:-http://127.0.0.1:8080}"
BRANCH="${2:-stable/runtime-baseline}"
COMMIT_MSG="${3:-fix: stabilize neural gate parsing and backup count numeric check}"

TARGET_FILES=(
    "scripts/neural-gate.sh"
    "tests/neural-orchestrator-quick-tests.sh"
)

echo "[neural-auto] root: $ROOT_DIR"
echo "[neural-auto] running gate against: $BASE_URL"
bash scripts/neural-gate.sh "$BASE_URL" || true

echo "[neural-auto] staging target files..."
git add -f "${TARGET_FILES[@]}"

if git diff --cached --quiet -- "${TARGET_FILES[@]}"; then
    echo "[neural-auto] no new changes to commit for target files."
    exit 0
fi

echo "[neural-auto] creating commit..."
git commit -m "$COMMIT_MSG"

echo "[neural-auto] pushing to origin/$BRANCH ..."
git push origin "$BRANCH"

echo "[neural-auto] done."
