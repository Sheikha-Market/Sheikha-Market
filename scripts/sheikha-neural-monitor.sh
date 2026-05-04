#!/usr/bin/env bash
set -euo pipefail

LOG_FILE="/var/log/sheikha-neural.log"
HEALTH_URL="${SHEIKHA_NEURAL_HEALTH_URL:-http://127.0.0.1:8080/api/health}"
SLEEP_SECONDS="${SHEIKHA_NEURAL_MONITOR_INTERVAL:-60}"

mkdir -p "$(dirname "$LOG_FILE")"
touch "$LOG_FILE"

while true; do
    timestamp="$(date -Is)"
    health_code="$(curl -s -o /dev/null -w "%{http_code}" --max-time 8 "$HEALTH_URL" || echo '000')"

    if command -v pm2 >/dev/null 2>&1; then
        pm2_status="$(pm2 jlist 2>/dev/null | node -e "try{const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); const api=d.find(p=>p.name==='sheikha-api'); console.log(api?.pm2_env?.status || 'not_found');}catch(e){console.log('unknown');}")"
    else
        pm2_status="unavailable"
    fi

    echo "${timestamp} neural_monitor health_code=${health_code} pm2_status=${pm2_status}" >> "$LOG_FILE"
    sleep "$SLEEP_SECONDS"
done
