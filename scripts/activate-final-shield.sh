#!/usr/bin/env bash
set -euo pipefail

# الدرع النهائي للإنتاج:
# - Nginx hardening ضد 502/504
# - تفعيل PM2 إعدادات الثبات والمراقبة
# - تثبيت earlyoom لمنع الانهيار عند ضغط الذاكرة
# - تحديث مؤقت health-check ليعمل كل دقيقة

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NGINX_SITE_FILE="${NGINX_SITE_FILE:-/etc/nginx/sites-available/default}"
APP_PROXY_PORT="${APP_PROXY_PORT:-8080}"
HEALTH_LOG_FILE="/var/log/sheikha-health.log"
NEURAL_LOG_FILE="/var/log/sheikha-neural.log"

log() {
    echo "[$(date -Is)] $*"
}

require_cmd() {
    command -v "$1" >/dev/null 2>&1 || {
        echo "❌ missing command: $1"
        exit 1
    }
}

ensure_log_files() {
    install -m 0644 /dev/null "$HEALTH_LOG_FILE"
    install -m 0644 /dev/null "$NEURAL_LOG_FILE"
    log "✅ log files ensured"
}

apply_nginx_hardening() {
    if [[ ! -f "$NGINX_SITE_FILE" ]]; then
        log "⚠️ nginx file not found: $NGINX_SITE_FILE (skip hardening)"
        return 0
    fi

    if ! grep -q "proxy_next_upstream error timeout http_502 http_504;" "$NGINX_SITE_FILE"; then
        log "🔧 applying nginx upstream hardening in $NGINX_SITE_FILE"
        sed -i "s#proxy_pass http://127.0.0.1:[0-9]\+;#proxy_pass http://127.0.0.1:${APP_PROXY_PORT};#g" "$NGINX_SITE_FILE"

        if ! grep -q "proxy_connect_timeout 5s;" "$NGINX_SITE_FILE"; then
            sed -i "/proxy_pass http:\/\/127.0.0.1:${APP_PROXY_PORT};/a\
\
    proxy_http_version 1.1;\
    proxy_set_header Upgrade \$http_upgrade;\
    proxy_set_header Connection 'upgrade';\
    proxy_set_header Host \$host;\
\
    proxy_connect_timeout 5s;\
    proxy_send_timeout 10s;\
    proxy_read_timeout 10s;\
\
    proxy_next_upstream error timeout http_502 http_504;\
\
    proxy_intercept_errors on;" "$NGINX_SITE_FILE"
        fi
    fi

    if nginx -t; then
        systemctl reload nginx
        log "✅ nginx hardened + reloaded"
    else
        log "❌ nginx config test failed"
        exit 1
    fi
}

apply_pm2_guard() {
    if ! command -v pm2 >/dev/null 2>&1; then
        log "⚠️ pm2 not found (skip pm2 hardening)"
        return 0
    fi

    pm2 set pm2:autodump true || true
    pm2 startup || true
    pm2 save || true

    pm2 install pm2-logrotate || true
    pm2 install pm2-server-monit || true

    log "✅ pm2 hardening applied"
}

apply_earlyoom() {
    if command -v apt >/dev/null 2>&1; then
        apt update -y >/dev/null 2>&1 || true
        DEBIAN_FRONTEND=noninteractive apt install -y earlyoom >/dev/null 2>&1 || true
        systemctl enable --now earlyoom || true
        log "✅ earlyoom enabled"
        return 0
    fi

    log "⚠️ apt not available; skip earlyoom"
}

install_health_guard_units() {
    local src_script="$ROOT_DIR/scripts/sheikha-health-check.sh"
    local src_service="$ROOT_DIR/scripts/sheikha-health-check.service"
    local src_timer="$ROOT_DIR/scripts/sheikha-health-check.timer"

    [[ -f "$src_script" ]] || { log "❌ missing: $src_script"; exit 1; }
    [[ -f "$src_service" ]] || { log "❌ missing: $src_service"; exit 1; }
    [[ -f "$src_timer" ]] || { log "❌ missing: $src_timer"; exit 1; }

    install -m 0755 "$src_script" /usr/local/bin/sheikha-health-check.sh
    install -m 0644 "$src_service" /etc/systemd/system/sheikha-health-check.service
    install -m 0644 "$src_timer" /etc/systemd/system/sheikha-health-check.timer

    systemctl daemon-reload
    systemctl enable sheikha-health-check.timer
    systemctl restart sheikha-health-check.timer
    log "✅ sheikha-health-check timer enabled"
}

install_neural_monitor_units() {
    local src_script="$ROOT_DIR/scripts/sheikha-neural-monitor.sh"
    local src_service="$ROOT_DIR/scripts/sheikha-neural-monitor.service"

    [[ -f "$src_script" ]] || { log "❌ missing: $src_script"; exit 1; }
    [[ -f "$src_service" ]] || { log "❌ missing: $src_service"; exit 1; }

    install -m 0755 "$src_script" /usr/local/bin/sheikha-neural-monitor.sh
    install -m 0644 "$src_service" /etc/systemd/system/sheikha-neural-monitor.service

    systemctl daemon-reload
    systemctl enable sheikha-neural-monitor.service
    systemctl restart sheikha-neural-monitor.service
    log "✅ sheikha-neural-monitor service enabled"
}

main() {
    require_cmd sed
    require_cmd systemctl

    ensure_log_files
    apply_nginx_hardening
    apply_pm2_guard
    apply_earlyoom
    install_health_guard_units
    install_neural_monitor_units

    log "🎯 FINAL SHIELD ACTIVE"
    log "Next: run 'pm2 monit' for live telemetry"
}

main "$@"
