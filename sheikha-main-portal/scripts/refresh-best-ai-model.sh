#!/usr/bin/env bash
set -euo pipefail

# Refresh best model strategy for Sheikha GPT
# Usage:
#   bash scripts/refresh-best-ai-model.sh
#   bash scripts/refresh-best-ai-model.sh ollama
#   bash scripts/refresh-best-ai-model.sh openai
#   bash scripts/refresh-best-ai-model.sh ollama qwen2.5-coder:3b
#
# Modes:
# - auto   : prefer GPT-5.2 if OPENAI_API_KEY exists, else Ollama
# - ollama : force Ollama provider
# - openai : force OpenAI provider (requires key)

MODE="${1:-auto}"
MODEL_OVERRIDE="${2:-}"
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"

cd "${ROOT_DIR}"
mkdir -p logs
touch "${ENV_FILE}"

set_env() {
    local key="$1"
    local value="$2"
    if rg -q "^${key}=" "${ENV_FILE}"; then
        sed -i "s|^${key}=.*|${key}=${value}|" "${ENV_FILE}"
    else
        echo "${key}=${value}" >> "${ENV_FILE}"
    fi
}

ram_gb=$(awk '/MemTotal/ {printf "%d", $2/1024/1024}' /proc/meminfo)

pick_ollama_model() {
    if [ "${ram_gb}" -ge 110 ]; then
        echo "qwen2.5:72b"
    elif [ "${ram_gb}" -ge 64 ]; then
        echo "qwen2.5-coder:32b"
    elif [ "${ram_gb}" -ge 48 ]; then
        echo "qwen2.5-coder:14b"
    else
        echo "qwen2.5-coder:7b"
    fi
}

OPENAI_KEY="$(sed -n 's/^OPENAI_API_KEY=//p' "${ENV_FILE}" | tail -n 1 | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")"
OPENAI_READY=0
if [ -n "${OPENAI_KEY}" ] && [ "${OPENAI_KEY}" != "YOUR_API_KEY_HERE" ]; then
    OPENAI_READY=1
fi

OLLAMA_MODEL="$(pick_ollama_model)"
if [ -n "${MODEL_OVERRIDE}" ]; then
    OLLAMA_MODEL="${MODEL_OVERRIDE}"
fi
OPENAI_MODEL="gpt-5.2"

if [ "${MODE}" = "openai" ] && [ "${OPENAI_READY}" -ne 1 ]; then
    echo "ERROR: openai mode requested but OPENAI_API_KEY is missing in .env"
    exit 1
fi

TARGET_MODE="ollama"
if [ "${MODE}" = "openai" ]; then
    TARGET_MODE="openai"
elif [ "${MODE}" = "auto" ] && [ "${OPENAI_READY}" -eq 1 ]; then
    TARGET_MODE="openai"
fi

set_env "AI_MODE" "${TARGET_MODE}"
set_env "OLLAMA_URL" "http://127.0.0.1:11434"
set_env "OLLAMA_MODEL" "${OLLAMA_MODEL}"
set_env "OLLAMA_TIMEOUT" "90000"

if [ "${TARGET_MODE}" = "openai" ]; then
    set_env "AI_LLM_MODEL" "${OPENAI_MODEL}"
    set_env "AI_LLM_BASE_URL" "https://api.openai.com/v1"
else
    set_env "AI_LLM_MODEL" "${OLLAMA_MODEL}"
    set_env "AI_LLM_BASE_URL" "http://127.0.0.1:11434/v1"
fi

echo "OK: RAM detected: ${ram_gb}GB"
echo "OK: OLLAMA_MODEL selected: ${OLLAMA_MODEL}"
echo "OK: TARGET AI_MODE: ${TARGET_MODE}"

pkill -f 'ollama serve' 2>/dev/null || true
nohup ollama serve > /tmp/ollama-serve.log 2>&1 &
echo $! > /tmp/sheikha-ollama-serve.pid
sleep 2

if ! curl -sf http://127.0.0.1:11434/api/tags >/dev/null 2>&1; then
    echo "ERROR: Ollama is not available on 127.0.0.1:11434"
    tail -n 40 /tmp/ollama-serve.log || true
    exit 1
fi

nohup bash -lc "ollama pull '${OLLAMA_MODEL}'" > logs/ollama-pull.log 2>&1 &
echo $! > /tmp/sheikha-ollama-pull.pid

pkill -f 'node server.js' 2>/dev/null || true
if command -v lsof >/dev/null 2>&1; then
    lsof -ti :8080 | xargs -r kill -9
elif command -v fuser >/dev/null 2>&1; then
    fuser -k 8080/tcp || true
fi
nohup env \
    AI_MODE="${TARGET_MODE}" \
    OLLAMA_URL="http://127.0.0.1:11434" \
    OLLAMA_MODEL="${OLLAMA_MODEL}" \
    OLLAMA_TIMEOUT="90000" \
    AI_LLM_MODEL="$([ "${TARGET_MODE}" = "openai" ] && echo "${OPENAI_MODEL}" || echo "${OLLAMA_MODEL}")" \
    AI_LLM_BASE_URL="$([ "${TARGET_MODE}" = "openai" ] && echo "https://api.openai.com/v1" || echo "http://127.0.0.1:11434/v1")" \
    node server.js > logs/server.log 2>&1 &
echo $! > /tmp/sheikha-server.pid
sleep 4

echo "\n===== FINAL STATUS ====="
curl -s http://127.0.0.1:8080/api/sheikha-gpt/status | head -c 1200
echo
echo "\nPIDs"
echo "- ollama serve: $(cat /tmp/sheikha-ollama-serve.pid 2>/dev/null || echo '-')"
echo "- model pull:   $(cat /tmp/sheikha-ollama-pull.pid 2>/dev/null || echo '-')"
echo "- sheikha api:  $(cat /tmp/sheikha-server.pid 2>/dev/null || echo '-')"
echo "\nLogs"
echo "- /tmp/ollama-serve.log"
echo "- ${ROOT_DIR}/logs/ollama-pull.log"
echo "- ${ROOT_DIR}/logs/server.log"
