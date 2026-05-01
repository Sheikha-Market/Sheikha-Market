#!/usr/bin/env bash
set -euo pipefail

# بسم الله الرحمن الرحيم
# فحص صحة الخدمات + إعادة تشغيل ذاتي + تنبيه Telegram

APP_URL='http://127.0.0.1:8080/api/ai-core/status'
OLLAMA_URL='http://127.0.0.1:11434/api/tags'
COMMS_URL='http://127.0.0.1:8080/api/comms/providers'
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

restart_if_down() {
    local svc="$1"
    if ! systemctl is-active --quiet "$svc"; then
        send_alert "service_down=$svc action=restart"
        systemctl restart "$svc"
        sleep 3
        if ! systemctl is-active --quiet "$svc"; then
            send_alert "CRITICAL: $svc failed_to_restart"
        fi
    fi
}

restart_if_unhealthy() {
    local svc="$1"
    local url="$2"
    if ! curl -fsS --max-time 8 "$url" > /dev/null 2>&1; then
        send_alert "healthcheck_failed service=$svc url=$url action=restart"
        systemctl restart "$svc"
        sleep 3
    fi
}

restart_if_down 'sheikha-main'
restart_if_down 'ollama'

restart_if_unhealthy 'sheikha-main' "$APP_URL"
restart_if_unhealthy 'ollama' "$OLLAMA_URL"

# فحص قنوات الاتصال الأساسية (اختياري): واتساب + بريد + SMS
if ! curl -fsS --max-time 8 "$COMMS_URL" | rg -q '"success"\s*:\s*true'; then
    send_alert "comms_providers_unreachable url=$COMMS_URL"
fi

logger -t sheikha-health-check 'healthcheck_ok'
