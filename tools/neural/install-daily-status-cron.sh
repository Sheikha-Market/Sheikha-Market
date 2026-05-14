#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${SHEIKHA_PROJECT_DIR:-/opt/sheikha/current}"
REPORT_SCRIPT="$PROJECT_DIR/tools/neural/generate-final-status-report.sh"
CRON_TAG="# sheikha-daily-final-status"
SCHEDULE="${SHEIKHA_DAILY_STATUS_SCHEDULE:-5 0 * * *}"
CRON_LINE="$SCHEDULE cd $PROJECT_DIR && bash $REPORT_SCRIPT >> $PROJECT_DIR/logs/daily-final-status-cron.log 2>&1 $CRON_TAG"

mkdir -p "$PROJECT_DIR/logs"
chmod +x "$REPORT_SCRIPT"

current_cron="$(crontab -l 2>/dev/null || true)"
clean_cron="$(printf '%s\n' "$current_cron" | grep -v "$CRON_TAG" || true)"
new_cron="$(printf '%s\n%s\n' "$clean_cron" "$CRON_LINE" | sed '/^$/N;/^\n$/D')"

printf '%s\n' "$new_cron" | crontab -

echo "Installed daily status cron entry:"
crontab -l | grep "$CRON_TAG"
