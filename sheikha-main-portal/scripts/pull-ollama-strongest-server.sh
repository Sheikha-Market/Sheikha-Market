#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   bash scripts/pull-ollama-strongest-server.sh            # auto profile
#   bash scripts/pull-ollama-strongest-server.sh general    # strongest general
#   bash scripts/pull-ollama-strongest-server.sh coder      # strongest code

PROFILE="${1:-auto}"
LOG_DIR="${HOME}/ollama-logs"
mkdir -p "${LOG_DIR}"
LOG_FILE="${LOG_DIR}/pull-strongest-$(date +%F-%H%M%S).log"
exec > >(tee -a "${LOG_FILE}") 2>&1

TOTAL_RAM_GB=$(awk '/MemTotal/ {printf "%d", $2/1024/1024}' /proc/meminfo)

echo "RAM detected: ${TOTAL_RAM_GB}GB"

auto_pick() {
    if [ "${TOTAL_RAM_GB}" -ge 110 ]; then
        echo "qwen2.5:72b"
    elif [ "${TOTAL_RAM_GB}" -ge 64 ]; then
        echo "qwen2.5-coder:32b"
    elif [ "${TOTAL_RAM_GB}" -ge 48 ]; then
        echo "qwen2.5-coder:14b"
    else
        echo "qwen2.5-coder:7b"
    fi
}

if [ "${PROFILE}" = "general" ]; then
    MODEL="qwen2.5:72b"
elif [ "${PROFILE}" = "coder" ]; then
    if [ "${TOTAL_RAM_GB}" -ge 64 ]; then
        MODEL="qwen2.5-coder:32b"
    elif [ "${TOTAL_RAM_GB}" -ge 48 ]; then
        MODEL="qwen2.5-coder:14b"
    else
        MODEL="qwen2.5-coder:7b"
    fi
else
    MODEL="$(auto_pick)"
fi

echo "Selected model: ${MODEL}"

if ! pgrep -f "ollama serve" >/dev/null 2>&1; then
    echo "Starting ollama serve in background..."
    nohup ollama serve > "${LOG_DIR}/ollama-serve.log" 2>&1 &
    sleep 2
fi

if ! curl -s http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
    echo "❌ Ollama server not reachable on 127.0.0.1:11434"
    exit 1
fi

echo "Pulling model with no-sleep lock..."
if command -v systemd-inhibit >/dev/null 2>&1; then
    systemd-inhibit --what=sleep --why="Ollama strongest model pull" bash -lc "ollama pull '${MODEL}'"
else
    ollama pull "${MODEL}"
fi

echo "✅ Pull complete. Installed models:"
ollama list || true

echo "Log file: ${LOG_FILE}"
