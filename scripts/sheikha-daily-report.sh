#!/usr/bin/env bash
set -euo pipefail

# بسم الله الرحمن الرحيم — تقرير جاهزية يومي

TELEGRAM_BOT_TOKEN="${SHEIKHA_TG_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${SHEIKHA_TG_CHAT_ID:-}"

SCORE=0
TOTAL=10
REPORT=""

check() {
    local label="$1" cmd="$2"
    if eval "$cmd" > /dev/null 2>&1; then
        REPORT+="✅ ${label}\n"
        SCORE=$((SCORE + 1))
    else
        REPORT+="❌ ${label}\n"
    fi
}

check "sheikha-main active" "systemctl is-active --quiet sheikha-main"
check "ollama active" "systemctl is-active --quiet ollama"
check "health-check timer" "systemctl is-active --quiet sheikha-health-check.timer"
check "API responds" "curl -fsS --max-time 8 http://127.0.0.1:8080/api/ai-core/status"
check "Ollama responds" "curl -fsS --max-time 8 http://127.0.0.1:11434/api/tags"
check ".env secured (600)" "test \$(stat -c %a /home/sheikha/Projects/sheikha/sheikha-main-portal/.env) = '600'"
check "JWT_SECRET set" "grep -q '^JWT_SECRET=.\{20,\}' /home/sheikha/Projects/sheikha/sheikha-main-portal/.env"
check "Disk >10% free" "test \$(df / --output=pcent | tail -1 | tr -dc '0-9') -lt 90"
check "RAM >1GB free" "test \$(free -m | awk '/Mem:/{print \$7}') -gt 1024"
check "No zombie node" "test \$(pgrep -c -f 'node.*server.js') -le 1"

PCT=$((SCORE * 100 / TOTAL))

MSG="📊 <b>تقرير شيخة اليومي</b>
$(date '+%F %T')

$(echo -e "$REPORT")
النتيجة: <b>${SCORE}/${TOTAL} (${PCT}%)</b>"

logger -t sheikha-daily-report "score=${SCORE}/${TOTAL} pct=${PCT}%"

if [[ -n "$TELEGRAM_BOT_TOKEN" && -n "$TELEGRAM_CHAT_ID" ]]; then
    curl -fsS --max-time 10 \
        "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
        -d "chat_id=${TELEGRAM_CHAT_ID}" \
        -d "text=${MSG}" \
        -d "parse_mode=HTML" > /dev/null 2>&1 || true
fi

echo -e "$MSG"
