#!/usr/bin/env bash
set -euo pipefail

MODEL="${1:-qwen2.5:72b}"
LOG_DIR="${HOME}/ollama-logs"
LOG_FILE="${LOG_DIR}/night-pull-$(date +%F-%H%M%S).log"

mkdir -p "${LOG_DIR}"
exec > >(tee -a "${LOG_FILE}") 2>&1

echo "بدء تحميل ليلي للموديل: ${MODEL}"
systemctl is-active --quiet ollama || sudo systemctl restart ollama

ATTEMPT=1
until systemd-inhibit --what=sleep --why="Overnight Ollama pull" bash -lc "ollama pull '${MODEL}'"; do
    echo "فشل المحاولة ${ATTEMPT}، إعادة بعد 15 ثانية..."
    ATTEMPT=$((ATTEMPT+1))
    sleep 15
done

echo "اكتمل السحب بنجاح"
ollama list || true
echo "Log file: ${LOG_FILE}"
