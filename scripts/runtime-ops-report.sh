#!/bin/bash
# شيخة — Runtime Operations Report
# يجمع حالة التشغيل في طبقة تقارير موحّدة

set -euo pipefail

BASE_DIR="${BASE_DIR:-$(pwd)}"
LOG_ROOT="${LOG_ROOT:-$BASE_DIR/logs}"
PM2_NAME="${PM2_NAME:-sheikha-main-portal}"
PORT="${PORT:-8080}"
TS="$(date -u +%Y%m%dT%H%M%SZ)"

RUNTIME_DIR="$LOG_ROOT/runtime"
ERROR_DIR="$LOG_ROOT/errors"
HEALTH_DIR="$LOG_ROOT/health"
SECURITY_DIR="$LOG_ROOT/security"
REPORT_FILE="$RUNTIME_DIR/runtime-report-$TS.json"

mkdir -p "$RUNTIME_DIR" "$ERROR_DIR" "$HEALTH_DIR" "$SECURITY_DIR"

# Snapshots
pm2 status > "$RUNTIME_DIR/pm2-status-$TS.txt" || true
pm2 logs "$PM2_NAME" --lines 80 --nostream > "$RUNTIME_DIR/pm2-app-$TS.log" 2>&1 || true

# Error snapshots
if [ -f "$HOME/.pm2/logs/$PM2_NAME-error.log" ]; then
    tail -n 200 "$HOME/.pm2/logs/$PM2_NAME-error.log" > "$ERROR_DIR/$PM2_NAME-error-$TS.log" || true
fi
if [ -f "$HOME/.pm2/logs/$PM2_NAME-out.log" ]; then
    tail -n 200 "$HOME/.pm2/logs/$PM2_NAME-out.log" > "$RUNTIME_DIR/$PM2_NAME-out-$TS.log" || true
fi

LIVE_JSON=$(curl -sS --max-time 10 "http://127.0.0.1:$PORT/api/live" || echo '{}')
SERVER_HEALTH_JSON=$(curl -sS --max-time 10 "http://127.0.0.1:$PORT/api/server/health" || echo '{}')
ACCOUNTS_SUMMARY_JSON=$(curl -sS --max-time 10 "http://127.0.0.1:$PORT/api/accounts/summary" || echo '{}')

printf '%s\n' "$LIVE_JSON" > "$HEALTH_DIR/live-$TS.json"
printf '%s\n' "$SERVER_HEALTH_JSON" > "$HEALTH_DIR/server-health-$TS.json"
printf '%s\n' "$ACCOUNTS_SUMMARY_JSON" > "$HEALTH_DIR/accounts-summary-$TS.json"

# Security signals (non-secret)
printf 'timestamp=%s\n' "$TS" > "$SECURITY_DIR/security-signals-$TS.txt"
printf 'branch=%s\n' "$(git branch --show-current 2>/dev/null || echo unknown)" >> "$SECURITY_DIR/security-signals-$TS.txt"
printf 'head=%s\n' "$(git rev-parse --short HEAD 2>/dev/null || echo unknown)" >> "$SECURITY_DIR/security-signals-$TS.txt"
printf 'dirty=%s\n' "$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')" >> "$SECURITY_DIR/security-signals-$TS.txt"

LIVE_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://127.0.0.1:$PORT/api/live" || echo "000")
SERVER_HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://127.0.0.1:$PORT/api/server/health" || echo "000")
ACCOUNTS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "http://127.0.0.1:$PORT/api/accounts/summary" || echo "000")

printf '%s\n' \
  '{' \
  "  \"timestamp\": \"$TS\"," \
  "  \"app\": \"$PM2_NAME\"," \
  "  \"branch\": \"$(git branch --show-current 2>/dev/null || echo unknown)\"," \
  "  \"commit\": \"$(git rev-parse --short HEAD 2>/dev/null || echo unknown)\"," \
  '  "checks": {' \
  "    \"live\": \"$LIVE_CODE\"," \
  "    \"serverHealth\": \"$SERVER_HEALTH_CODE\"," \
  "    \"accountsSummary\": \"$ACCOUNTS_CODE\"" \
  '  },' \
  "  \"paths\": {\"runtime\": \"$RUNTIME_DIR\", \"errors\": \"$ERROR_DIR\", \"health\": \"$HEALTH_DIR\", \"security\": \"$SECURITY_DIR\"}" \
  '}' > "$REPORT_FILE"

echo "Runtime report generated: $REPORT_FILE"
