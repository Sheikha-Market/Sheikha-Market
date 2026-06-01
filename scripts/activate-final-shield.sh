#!/usr/bin/env bash
set -euo pipefail

# الدرع النهائي للإنتاج:
# - Nginx hardening ضد 502/504
# - تفعيل PM2 إعدادات الثبات والمراقبة
# - تثبيت earlyoom لمنع الانهيار عند ضغط الذاكرة
# - تثبيت sheikha-health-check timer (Neural Monitoring Mesh)
# - تثبيت neural-monitor كخدمة منفصلة

# ── PATH: يدعم NVM + مسارات النظام القياسية ─────────────────────────────
export PATH="/root/.nvm/versions/node/v25.6.1/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:${PATH:-}"

# ROOT_DIR يُكتشف تلقائيًّا بناءً على موقع السكربت
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

init_log_files() {
    local logs=(/var/log/sheikha-health.log /var/log/sheikha-neural.log /var/log/sheikha-guardian.log)
    for lf in "${logs[@]}"; do
        if [[ ! -f "$lf" ]]; then
            touch "$lf" 2>/dev/null && chmod 640 "$lf" 2>/dev/null || true
            log "📝 أُنشئ ملف اللوق: $lf"
        fi
    done
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

install_neural_monitor() {
    local src_script="$ROOT_DIR/scripts/neural-monitor.sh"
    local src_service="$ROOT_DIR/scripts/sheikha-neural-monitor.service"

    if [[ ! -f "$src_script" ]]; then
        log "⚠️ neural-monitor.sh غير موجود (skip)"
        return 0
    fi

    install -m 0755 "$src_script" /usr/local/bin/sheikha-neural-monitor.sh

    if [[ -f "$src_service" ]]; then
        install -m 0644 "$src_service" /etc/systemd/system/sheikha-neural-monitor.service
    else
        log "⚠️ sheikha-neural-monitor.service غير موجود في المستودع — توليد inline"
        cat > /etc/systemd/system/sheikha-neural-monitor.service <<'SERVICE'
[Unit]
Description=Sheikha Neural Monitoring Mesh — شبكة الخلايا العصبية الجذرية
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
ExecStart=/usr/local/bin/sheikha-neural-monitor.sh --interval=60
Restart=on-failure
RestartSec=30
StandardOutput=append:/var/log/sheikha-neural.log
StandardError=append:/var/log/sheikha-neural.log

[Install]
WantedBy=multi-user.target
SERVICE
    fi

    systemctl daemon-reload
    systemctl enable sheikha-neural-monitor 2>/dev/null || true
    systemctl start sheikha-neural-monitor 2>/dev/null || true
    log "✅ sheikha-neural-monitor service installed + started"
}

install_guardian_units() {
    local src_script="$ROOT_DIR/scripts/sheikha-guardian.sh"
    local src_service="$ROOT_DIR/scripts/sheikha-guardian.service"
    local src_timer="$ROOT_DIR/scripts/sheikha-guardian.timer"

    if [[ ! -f "$src_script" ]]; then
        log "⚠️ sheikha-guardian.sh غير موجود (skip)"
        return 0
    fi

    # أوقف الـ guardian القديم قبل التحديث لمنع استمرار حلقة sheikha-main
    systemctl stop sheikha-guardian.timer 2>/dev/null || true
    systemctl stop sheikha-guardian.service 2>/dev/null || true

    install -m 0755 "$src_script" /usr/local/bin/sheikha-guardian.sh

    if [[ -f "$src_service" ]]; then
        install -m 0644 "$src_service" /etc/systemd/system/sheikha-guardian.service
    fi

    if [[ -f "$src_timer" ]]; then
        install -m 0644 "$src_timer" /etc/systemd/system/sheikha-guardian.timer
    fi

    systemctl daemon-reload
    systemctl enable --now sheikha-guardian.timer 2>/dev/null || true
    log "✅ sheikha-guardian units updated + restarted (PM2-aware)"
}

main() {
    log "🚀 بدء تفعيل الدرع النهائي من: $ROOT_DIR"

    require_cmd sed
    require_cmd systemctl

    ensure_log_files
    apply_nginx_hardening
    apply_pm2_guard
    apply_earlyoom
    init_log_files
    install_health_guard_units
    install_guardian_units
    install_neural_monitor

    log "🎯 FINAL SHIELD ACTIVE"
    log "══════════════════════════════════════════"
    log "الأوامر المتاحة بعد التفعيل:"
    log "  tail -f /var/log/sheikha-health.log   ← سجل health-check"
    log "  tail -f /var/log/sheikha-neural.log   ← سجل Neural Monitor"
    log "  tail -f /var/log/sheikha-guardian.log ← سجل Guardian"
    log "  systemctl status sheikha-health-check.timer"
    log "  systemctl status sheikha-guardian.timer    ← حالة Guardian"
    log "  systemctl status sheikha-neural-monitor    ← حالة Neural Monitor"
    log "  pm2 monit                              ← مراقبة PM2 مباشرة"
    log "══════════════════════════════════════════"
}

main "$@"
