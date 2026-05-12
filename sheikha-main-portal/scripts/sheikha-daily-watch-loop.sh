#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT_DIR}"

INTERVAL_SECONDS="${SHEIKHA_DAILY_WATCH_INTERVAL_SECONDS:-86400}"
mkdir -p logs

echo "[Sheikha Daily Loop] started at $(date -Iseconds), interval=${INTERVAL_SECONDS}s" | tee -a logs/daily-watch-loop.log

while true; do
    bash scripts/sheikha-daily-health-auth-adc.sh >> logs/daily-watch-loop.log 2>&1 || true
    sleep "${INTERVAL_SECONDS}"
done
