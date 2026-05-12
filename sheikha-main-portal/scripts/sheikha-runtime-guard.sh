#!/usr/bin/env bash
set -euo pipefail

WORKSPACE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_BASE="/var/sheikha/runtime"
FALLBACK_BASE="$WORKSPACE_ROOT/runtime"

if mkdir -p "$DEFAULT_BASE" 2>/dev/null; then
    BASE="$DEFAULT_BASE"
else
    BASE="$FALLBACK_BASE"
    mkdir -p "$BASE"
fi

LOG="$BASE/logs/runtime-guard.log"
mkdir -p "$BASE/logs" "$BASE/reports" "$BASE/tmp" "$BASE/backups"

echo "==== $(date '+%F %T') ====" >> "$LOG"

echo "[PM2]" >> "$LOG"
pm2 jlist > "$BASE/reports/pm2-status.json" 2>/dev/null || true

echo "[PORTS]" >> "$LOG"
ss -lntp | grep -E ':8080|:8081' >> "$LOG" 2>/dev/null || true

echo "[HEALTH]" >> "$LOG"
curl -fsS http://127.0.0.1:8080/ >/dev/null && echo "8080=OK" >> "$LOG" || echo "8080=FAIL" >> "$LOG"
curl -fsS http://127.0.0.1:8081/ >/dev/null && echo "8081=OK" >> "$LOG" || echo "8081=FAIL" >> "$LOG"
curl -fsS http://127.0.0.1:8080/api/health >/dev/null && echo "health=OK" >> "$LOG" || echo "health=FAIL" >> "$LOG"
curl -fsS http://127.0.0.1:8080/api/sheikha/copilot/status >/dev/null && echo "copilot=OK" >> "$LOG" || echo "copilot=FAIL" >> "$LOG"

echo "[DISK]" >> "$LOG"
df -h / "$BASE" >> "$LOG" 2>/dev/null || true

echo "[MEM]" >> "$LOG"
free -h >> "$LOG" 2>/dev/null || true

echo "[TOP FILES]" >> "$LOG"
du -ah "$BASE" 2>/dev/null | sort -hr | head -n 20 >> "$LOG" || true

find "$BASE/logs" -type f -size +20M -exec gzip -f {} \; 2>/dev/null || true
find "$BASE/logs" -type f -name '*.gz' -mtime +7 -delete 2>/dev/null || true

echo "base=$BASE"
