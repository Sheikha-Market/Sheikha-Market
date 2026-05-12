#!/usr/bin/env bash
set -euo pipefail

# شيخة — تفعيل كامل آمن بدون تعارض
# يشغل الخدمات الأساسية والمراقبة بدون حذف عمليات PM2 الأخرى.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

log() {
    printf '%s\n' "$1"
}

ensure_pm2_process() {
    local name="$1"
    local cmd="$2"

    if pm2 describe "$name" >/dev/null 2>&1; then
        log "[PM2] restart $name"
        pm2 restart "$name" >/dev/null
    else
        log "[PM2] start $name"
        eval "$cmd" >/dev/null
    fi
}

ensure_http_server_8080() {
    if curl -fsS -m 5 http://127.0.0.1:8080/api/health >/dev/null 2>&1; then
        log "[OK] API on 8080 already healthy"
        return 0
    fi

    log "[INFO] API 8080 is not healthy, starting sheikha-api with PM2"
    if pm2 describe sheikha-api >/dev/null 2>&1; then
        pm2 restart sheikha-api >/dev/null
    else
        pm2 start ecosystem.config.js --only sheikha-api >/dev/null
    fi

    sleep 3
}

verify_http() {
    local url="$1"
    local label="$2"
    local code
    code="$(curl -s -o /dev/null -w '%{http_code}' "$url" || true)"
    printf '%s=%s\n' "$label" "$code"
}

log "=== SHEIKHA SAFE FULL ACTIVATION ==="

# 1) الخادم الأساسي
ensure_http_server_8080

# 2) proxy 8081
ensure_pm2_process "sheikha-proxy-8081" "pm2 start npm --name sheikha-proxy-8081 -- run start:proxy"

# 3) health monitor (cron_restart via PM2 config)
if npm run -s ops:monitor:start >/dev/null 2>&1; then
    log "[OK] sheikha-health-monitor activated"
else
    log "[WARN] sheikha-health-monitor activation skipped"
fi

# 4) gcloud watcher (optional, non-fatal)
if npm run -s ops:gcloud:alliance:auto:pm2:start >/dev/null 2>&1; then
    log "[OK] sheikha-gcloud-auto activated"
else
    log "[WARN] sheikha-gcloud-auto activation skipped"
fi

pm2 save >/dev/null || true

log "--- PORTS ---"
ss -tlnp | grep -E ':(8080|8081|8443|48480|48481) ' || true

log "--- ENDPOINTS ---"
verify_http "http://127.0.0.1:8080/" "root_8080"
verify_http "http://127.0.0.1:8081/" "root_8081"
verify_http "http://127.0.0.1:8080/api/health" "api_health"
verify_http "http://127.0.0.1:8080/api/sheikha/copilot/status" "copilot_status"

if curl -fsS -m 8 http://127.0.0.1:8080/ >/tmp/sheikha-8080.html 2>/dev/null && \
   curl -fsS -m 8 http://127.0.0.1:8081/ >/tmp/sheikha-8081.html 2>/dev/null; then
    if cmp -s /tmp/sheikha-8080.html /tmp/sheikha-8081.html; then
        log "content_match=YES"
    else
        log "content_match=NO"
    fi
fi

log "--- PM2 STATUS ---"
pm2 list --no-color

log "=== DONE: SAFE ACTIVATION COMPLETED ==="
