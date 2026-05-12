#!/usr/bin/env bash
set -euo pipefail

LEVEL="${1:-info}"
MESSAGE="${2:-Sheikha alert}"

ALERT_WEBHOOK_URL="${ALERT_WEBHOOK_URL:-${SHEIKHA_ALERT_WEBHOOK_URL:-}}"
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-${SHEIKHA_TG_BOT_TOKEN:-}}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-${SHEIKHA_TG_CHAT_ID:-}}"

send_webhook() {
    local payload
    payload=$(cat <<EOF
{"level":"${LEVEL}","source":"sheikha-central-alert","message":"${MESSAGE}","timestamp":"$(date -Iseconds)"}
EOF
)

    curl -fsS --max-time 12 -X POST "$ALERT_WEBHOOK_URL" \
        -H 'content-type: application/json' \
        -d "$payload" >/dev/null 2>&1 || true
}

send_telegram() {
    curl -fsS --max-time 12 \
        "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d "chat_id=${TELEGRAM_CHAT_ID}" \
        -d "text=[${LEVEL}] شيخة: ${MESSAGE}" >/dev/null 2>&1 || true
}

if [[ -n "$ALERT_WEBHOOK_URL" ]]; then
    send_webhook
fi

if [[ -n "$TELEGRAM_BOT_TOKEN" && -n "$TELEGRAM_CHAT_ID" ]]; then
    send_telegram
fi

echo "alert_dispatched level=${LEVEL}"
