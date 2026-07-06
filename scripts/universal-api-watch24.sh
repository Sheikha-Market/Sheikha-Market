#!/usr/bin/env bash
set -u

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_DIR="$ROOT_DIR/data/monitoring"
LOG_FILE="$LOG_DIR/universal-api-watch24.jsonl"
TARGET_URL="${SHEIKHA_WATCH_URL:-http://127.0.0.1:9191/api/v2/health}"
INTERVAL_SECONDS="${SHEIKHA_WATCH_INTERVAL:-300}"
DURATION_SECONDS="${SHEIKHA_WATCH_DURATION:-86400}"

mkdir -p "$LOG_DIR"
END_TS=$(( $(date +%s) + DURATION_SECONDS ))

while [[ $(date +%s) -lt $END_TS ]]; do
    TS="$(date -Iseconds)"
    if curl -sSf "$TARGET_URL" >/dev/null 2>/tmp/sheikha-watch-err.log; then
        echo "{\"timestamp\":\"$TS\",\"status\":\"PASS\"}" >> "$LOG_FILE"
    else
        ERR="$(tr -d '\n' </tmp/sheikha-watch-err.log | sed "s/\"/'/g")"
        echo "{\"timestamp\":\"$TS\",\"status\":\"FAIL\",\"error\":\"$ERR\"}" >> "$LOG_FILE"
    fi
    sleep "$INTERVAL_SECONDS"
done

echo "{\"timestamp\":\"$(date -Iseconds)\",\"status\":\"DONE\"}" >> "$LOG_FILE"
