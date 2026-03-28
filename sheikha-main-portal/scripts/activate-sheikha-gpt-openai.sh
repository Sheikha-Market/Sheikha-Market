#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"
KEY_FROM_ARG="${1:-}"
OPENAI_KEY="${OPENAI_API_KEY:-${KEY_FROM_ARG}}"

if [ -z "${OPENAI_KEY}" ] && [ -f "${ENV_FILE}" ]; then
    OPENAI_KEY="$(sed -n 's/^OPENAI_API_KEY=//p' "${ENV_FILE}" | tail -n 1 | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")"
fi

if [ -z "${OPENAI_KEY}" ]; then
    echo "❌ مفتاح OpenAI غير موجود."
    echo "شغّل هكذا:"
    echo "   OPENAI_API_KEY='YOUR_KEY' bash scripts/activate-sheikha-gpt-openai.sh"
    echo "أو:"
    echo "   bash scripts/activate-sheikha-gpt-openai.sh 'YOUR_KEY'"
    exit 1
fi

if [ ! -f "${ENV_FILE}" ]; then
    echo "❌ ملف .env غير موجود: ${ENV_FILE}"
    exit 1
fi

tmp_env="$(mktemp)"
awk -v key="${OPENAI_KEY}" '
BEGIN { found=0 }
{
    if ($0 ~ /^OPENAI_API_KEY=/) {
        print "OPENAI_API_KEY=" key;
        found=1;
    } else if ($0 ~ /^AI_MODE=/) {
        print "AI_MODE=openai";
    } else if ($0 ~ /^AI_LLM_MODEL=/) {
        print "AI_LLM_MODEL=gpt-5.2";
    } else if ($0 ~ /^AI_LLM_BASE_URL=/) {
        print "AI_LLM_BASE_URL=https://api.openai.com/v1";
    } else {
        print $0;
    }
}
END {
    if (!found) print "OPENAI_API_KEY=" key;
}' "${ENV_FILE}" > "${tmp_env}"
mv "${tmp_env}" "${ENV_FILE}"

pkill -f "node server.js" 2>/dev/null || true
sleep 1

cd "${ROOT_DIR}"
mkdir -p logs
nohup node server.js > logs/server.log 2>&1 &
echo $! > /tmp/sheikha-server.pid
sleep 3

echo "✅ تم تشغيل Sheikha GPT على OpenAI بالخلفية."
echo "PID: $(cat /tmp/sheikha-server.pid 2>/dev/null || echo '-')"
echo "التحقق:"
curl -s http://127.0.0.1:8080/api/sheikha-gpt/status | head -c 500
echo
