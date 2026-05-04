#!/usr/bin/env bash
set -euo pipefail

# بسم الله الرحمن الرحيم
# فحص صحة الخدمات + إعادة تشغيل ذاتي + تنبيه Telegram

# ضروري عند التشغيل من systemd (بيئة محدودة)
export PM2_HOME='/root/.pm2'
export HOME='/root'
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/root/.nvm/versions/node/v25.6.1/bin"

APP_URL='http://127.0.0.1:8080/api/ai-core/status'
OLLAMA_URL='http://127.0.0.1:11434/api/tags'
COMMS_URL='http://127.0.0.1:8080/api/comms/providers'
PRIMARY_HEALTH_URL='http://127.0.0.1:8080/api/health'
FALLBACK_HEALTH_URL='http://127.0.0.1:8090/api/health'
NGINX_SITE_FILE='/etc/nginx/sites-available/default'
LOG_FILE='/var/log/sheikha-health.log'

# اختياري: ضع bot token و chat id لتفعيل تنبيه Telegram
TELEGRAM_BOT_TOKEN="${SHEIKHA_TG_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${SHEIKHA_TG_CHAT_ID:-}"

send_alert() {
    local msg="$1"
    logger -t sheikha-health-check "$msg"
    echo "$(date '+%F %T') $msg" >> "$LOG_FILE" 2>/dev/null || true
    if [[ -n "$TELEGRAM_BOT_TOKEN" && -n "$TELEGRAM_CHAT_ID" ]]; then
        curl -fsS --max-time 10 \
            "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
            -d "chat_id=${TELEGRAM_CHAT_ID}" \
            -d "text=🔴 شيخة — ${msg}" \
            -d "parse_mode=HTML" > /dev/null 2>&1 || true
    fi
}

PM2_APP_NAME='sheikha-api'
PM2_BIN="$(command -v pm2 2>/dev/null || echo /usr/local/bin/pm2)"

restart_if_down() {
    local svc="$1"
    # إذا كانت الخدمة هي sheikha-main نستخدم PM2 بدلاً من systemd
    if [[ "$svc" == 'sheikha-main' ]]; then
        local pm2_status
        pm2_status="$("$PM2_BIN" jlist 2>/dev/null | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4 || echo 'unknown')"
        if [[ "$pm2_status" != 'online' ]]; then
            send_alert "pm2_app_down=$PM2_APP_NAME pm2_status=$pm2_status action=pm2_restart"
            "$PM2_BIN" restart "$PM2_APP_NAME" || "$PM2_BIN" start "$PM2_APP_NAME" || true
            sleep 3
            pm2_status="$("$PM2_BIN" jlist 2>/dev/null | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4 || echo 'unknown')"
            if [[ "$pm2_status" != 'online' ]]; then
                send_alert "CRITICAL: $PM2_APP_NAME failed_to_restart pm2_status=$pm2_status"
            fi
        fi
        return 0
    fi
    # systemd services أخرى
    if ! systemctl is-active --quiet "$svc"; then
        send_alert "service_down=$svc action=restart"
        systemctl restart "$svc" || send_alert "CRITICAL: failed_to_restart $svc"
        sleep 3
    fi
}

restart_if_unhealthy() {
    local svc="$1"
    local url="$2"
    if ! curl -fsS --max-time 8 "$url" > /dev/null 2>&1; then
        send_alert "healthcheck_failed service=$svc url=$url action=restart"
        if [[ "$svc" == 'sheikha-main' ]]; then
            "$PM2_BIN" restart "$PM2_APP_NAME" || true
        else
            systemctl restart "$svc" || true
        fi
        sleep 3
    fi
}

switch_nginx_upstream() {
    local from_port="$1"
    local to_port="$2"

    if [[ ! -f "$NGINX_SITE_FILE" ]]; then
        send_alert "nginx_site_missing file=$NGINX_SITE_FILE"
        return 1
    fi

    if ! grep -q "127.0.0.1:${from_port}" "$NGINX_SITE_FILE"; then
        send_alert "nginx_upstream_noop from=$from_port to=$to_port"
        return 0
    fi

    sed -i "s/127.0.0.1:${from_port}/127.0.0.1:${to_port}/g" "$NGINX_SITE_FILE"

    if nginx -t >/dev/null 2>&1; then
        systemctl reload nginx
        send_alert "nginx_switched from=${from_port} to=${to_port}"
        return 0
    fi

    send_alert "CRITICAL: nginx_config_invalid after switch from=${from_port} to=${to_port}"
    return 1
}

perform_health_failover() {
    local code
    local code2

    code="$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$PRIMARY_HEALTH_URL" || echo '000')"
    if [[ "$code" == '200' ]]; then
        echo "$(date -Is) guardian ok http_code=200 primary" >> "$LOG_FILE" 2>/dev/null || true
        return 0
    fi

    echo "$(date -Is) primary failed, trying fallback code=$code" >> "$LOG_FILE" 2>/dev/null || true
    code2="$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$FALLBACK_HEALTH_URL" || echo '000')"

    if [[ "$code2" == '200' ]]; then
        echo "$(date -Is) fallback alive -> switching nginx" >> "$LOG_FILE" 2>/dev/null || true
        switch_nginx_upstream '8080' '8090' || true
        return 0
    fi

    send_alert "CRITICAL: both health endpoints failed primary=$code fallback=$code2"
    return 1
}

restart_if_down 'sheikha-main'
restart_if_down 'ollama'

restart_if_unhealthy 'sheikha-main' "$APP_URL"
restart_if_unhealthy 'ollama' "$OLLAMA_URL"
perform_health_failover || true

# فحص قنوات الاتصال الأساسية (اختياري): واتساب + بريد + SMS
if ! curl -fsS --max-time 8 "$COMMS_URL" | rg -q '"success"\s*:\s*true'; then
    send_alert "comms_providers_unreachable url=$COMMS_URL"
fi

logger -t sheikha-health-check 'healthcheck_ok'
