#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FULL_SETUP_SCRIPT="${ROOT_DIR}/scripts/ollama-full-setup.sh"
NIGHT_PULL_SCRIPT="${ROOT_DIR}/scripts/ollama-night-pull.sh"

if [ ! -x "${FULL_SETUP_SCRIPT}" ]; then
    echo "❌ سكربت التثبيت الأساسي غير موجود أو غير قابل للتنفيذ: ${FULL_SETUP_SCRIPT}"
    exit 1
fi

TOTAL_RAM_GB=$(awk '/MemTotal/ {printf "%d", $2/1024/1024}' /proc/meminfo)

if [ "${TOTAL_RAM_GB}" -ge 96 ]; then
    BEST_MODEL="qwen2.5-coder:32b"
elif [ "${TOTAL_RAM_GB}" -ge 48 ]; then
    BEST_MODEL="qwen2.5-coder:14b"
elif [ "${TOTAL_RAM_GB}" -ge 24 ]; then
    BEST_MODEL="qwen2.5-coder:7b"
else
    BEST_MODEL="qwen2.5-coder:3b"
fi

echo "=== Sheikha Ollama + VS Code Activation ==="
echo "RAM detected: ${TOTAL_RAM_GB}GB"
echo "Best model selected: ${BEST_MODEL}"

"${FULL_SETUP_SCRIPT}" "${BEST_MODEL}"

if [ ! -x "${NIGHT_PULL_SCRIPT}" ]; then
    chmod +x "${NIGHT_PULL_SCRIPT}" || true
fi

echo ""
echo "✅ التفعيل اكتمل. الأوامر الجاهزة:"
echo "1) فحص الخدمة: systemctl status ollama --no-pager"
echo "2) تشغيل سحب ليلي: ${NIGHT_PULL_SCRIPT} ${BEST_MODEL}"
echo "3) تشغيل ليلي بالخلفية: nohup ${NIGHT_PULL_SCRIPT} ${BEST_MODEL} > ~/ollama-logs/nohup-night.log 2>&1 & disown"
