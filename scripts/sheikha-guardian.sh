#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# sheikha-guardian.sh — الحارس الذكي للإنتاج
# يعمل كل دقيقة عبر sheikha-guardian.timer
# متوافق مع: PM2 (sheikha-api) + nginx + ssh
# السيرفر: /opt/sheikha/current | Node.js عبر NVM

set -euo pipefail

export PATH="/root/.nvm/versions/node/v25.6.1/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:${PATH:-}"
export PM2_HOME='/root/.pm2'
export HOME='/root'

LOG_FILE='/var/log/sheikha-guardian.log'
PRIMARY_HEALTH_URL='http://127.0.0.1:8080/api/health'
FALLBACK_HEALTH_URL='http://127.0.0.1:8090/api/health'
NGINX_SITE_FILE='/etc/nginx/sites-available/default'
PM2_APP='sheikha-api'

# اختياري: تنبيه Telegram
TELEGRAM_BOT_TOKEN="${SHEIKHA_TG_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${SHEIKHA_TG_CHAT_ID:-}"

# تأكد من وجود ملف اللوق
touch "$LOG_FILE" 2>/dev/null || LOG_FILE='/tmp/sheikha-guardian.log'

log_event() {
    local msg="$1"
    echo "$(date '+%F %T') $msg" >> "$LOG_FILE" 2>/dev/null || true
    logger -t sheikha-guardian "$msg" 2>/dev/null || true
    if [[ -n "$TELEGRAM_BOT_TOKEN" && -n "$TELEGRAM_CHAT_ID" ]]; then
        curl -fsS --max-time 10 \
            "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=🔴 شيخة-Guardian — ${msg}" \
            -d "parse_mode=HTML" > /dev/null 2>&1 || true
    fi
}

# فحص خدمات systemd (nginx, ssh فقط — الـ app عبر PM2)
guard_systemd_service() {
    local svc="$1"
    if ! systemctl is-active --quiet "$svc" 2>/dev/null; then
        log_event "service_down=$svc action=restart"
        systemctl restart "$svc" 2>/dev/null || true
        sleep 3
        if ! systemctl is-active --quiet "$svc" 2>/dev/null; then
            log_event "CRITICAL: $svc failed_to_restart"
        fi
    fi
}

# فحص تطبيق PM2 (sheikha-api) — لا يستخدم systemctl أبداً
guard_pm2_app() {
    local app="$1"

    if ! command -v pm2 &>/dev/null; then
        log_event "WARN: pm2 not found skipping app guard"
        return 0
    fi

    local status
    status=$(pm2 jlist 2>/dev/null \
        | node -e "
try {
    const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
    const proc = data.find(x => x.name === '${app}');
    console.log(proc ? proc.pm2_env.status : 'missing');
} catch(e) { console.log('error'); }
" 2>/dev/null || echo 'error')

    if [[ "$status" == 'online' ]]; then
        return 0
    fi

    log_event "pm2_app_down app=$app status=$status action=restart"
    pm2 restart "$app" 2>/dev/null || true
    sleep 3

    # تحقق ثانوي
    local status2
    status2=$(pm2 jlist 2>/dev/null \
        | node -e "
try {
    const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));
    const proc = data.find(x => x.name === '${app}');
    console.log(proc ? proc.pm2_env.status : 'missing');
} catch(e) { console.log('error'); }
" 2>/dev/null || echo 'error')

    if [[ "$status2" != 'online' ]]; then
        log_event "CRITICAL: pm2 app=$app still_down status=$status2"
    fi
}

# Failover nginx بين 8080 و 8090
guardian_failover() {
    local primary_code
    primary_code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$PRIMARY_HEALTH_URL" 2>/dev/null || echo '000')

    if [[ "$primary_code" == '200' ]]; then
        echo "$(date -Is) guardian_ok http_code=200 primary" >> "$LOG_FILE" 2>/dev/null || true
        return 0
    fi

    local fallback_code
    fallback_code=$(curl -s -o /dev/null -w '%{http_code}' --max-time 5 "$FALLBACK_HEALTH_URL" 2>/dev/null || echo '000')

    if [[ "$fallback_code" == '200' ]]; then
        log_event "primary_failed=$primary_code fallback_alive=$fallback_code switching_nginx 8080->8090"
        if [[ -f "$NGINX_SITE_FILE" ]] && grep -q '127.0.0.1:8080' "$NGINX_SITE_FILE"; then
            sed -i 's/127.0.0.1:8080/127.0.0.1:8090/g' "$NGINX_SITE_FILE"
            if nginx -t >/dev/null 2>&1; then
                systemctl reload nginx
                log_event "nginx_switched 8080->8090"
            else
                # تراجع إذا فشل اختبار nginx
                sed -i 's/127.0.0.1:8090/127.0.0.1:8080/g' "$NGINX_SITE_FILE"
                log_event "CRITICAL: nginx_config_invalid rollback"
            fi
        fi
        return 0
    fi

    log_event "CRITICAL: both_health_endpoints_failed primary=$primary_code fallback=$fallback_code"
}

# ── تنفيذ الحراسة ────────────────────────────────────────────────────────────
guard_systemd_service 'nginx'
guard_systemd_service 'ssh'
guard_pm2_app "$PM2_APP"
guardian_failover || true

echo "$(date -Is) guardian_cycle_done" >> "$LOG_FILE" 2>/dev/null || true
