#!/usr/bin/env bash
set -euo pipefail

# بسم الله الرحمن الرحيم
# حارس شيخة — يُعيد تشغيل PM2 عند الحاجة + يفحص صحة HTTP

# ضروري عند التشغيل من systemd (بيئة محدودة)
export PM2_HOME='/root/.pm2'
export HOME='/root'
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/root/.nvm/versions/node/v25.6.1/bin"

PM2_APP_NAME='sheikha-api'
PM2_BIN="$(command -v pm2 2>/dev/null || echo /usr/local/bin/pm2)"
PRIMARY_HEALTH_URL='http://127.0.0.1:8080/api/health'
GUARDIAN_LOG='/var/log/sheikha-guardian.log'

log() {
    echo "$(date '+%F %T') $*" >> "$GUARDIAN_LOG" 2>/dev/null || true
    logger -t sheikha-guardian "$*" || true
}

# ---------- فحص PM2 ----------
pm2_status="$("$PM2_BIN" jlist 2>/dev/null \
    | grep -o '"status":"[^"]*"' \
    | head -1 \
    | cut -d'"' -f4 \
    || echo 'unknown')"

if [[ "$pm2_status" != 'online' ]]; then
    log "pm2_app_down app=$PM2_APP_NAME status=$pm2_status action=restart"
    "$PM2_BIN" restart "$PM2_APP_NAME" 2>/dev/null \
        || "$PM2_BIN" start /opt/sheikha/current/server.js \
               --name "$PM2_APP_NAME" \
               --update-env 2>/dev/null \
        || true
    sleep 4
    pm2_status_after="$("$PM2_BIN" jlist 2>/dev/null \
        | grep -o '"status":"[^"]*"' \
        | head -1 \
        | cut -d'"' -f4 \
        || echo 'unknown')"
    if [[ "$pm2_status_after" != 'online' ]]; then
        log "CRITICAL: pm2 app=$PM2_APP_NAME still_down status=$pm2_status_after"
    else
        log "pm2_recovered app=$PM2_APP_NAME status=$pm2_status_after"
    fi
fi

# ---------- فحص HTTP ----------
http_code="$(curl -s -o /dev/null -w "%{http_code}" --max-time 6 "$PRIMARY_HEALTH_URL" || echo '000')"

if [[ "$http_code" == '200' ]]; then
    log "guardian_ok http_code=200 primary"
else
    log "guardian_warn http_code=$http_code primary_down"
fi

log "guardian_cycle_done"
