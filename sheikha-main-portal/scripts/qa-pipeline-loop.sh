#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

INTERVAL_SECONDS="${SHEIKHA_QA_INTERVAL_SECONDS:-1800}"

echo "[Sheikha QA Loop] started with interval=${INTERVAL_SECONDS}s"

while true; do
  date -Is
  if npm run -s qa:pipeline:run; then
    echo "[Sheikha QA Loop] cycle passed"
  else
    echo "[Sheikha QA Loop] cycle has failures"
  fi
  sleep "$INTERVAL_SECONDS"
done
