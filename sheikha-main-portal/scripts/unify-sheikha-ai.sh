#!/usr/bin/env bash
set -euo pipefail

# One-command unified activation for:
# - Sheikha Ollama (background)
# - Sheikha GPT backend (background)
# - Optional OpenAI enablement if OPENAI_API_KEY exists in .env

PREFER_OPENAI="${1:-auto}"   # auto | ollama | openai

discover_project_dir() {
    if [ -f "./package.json" ]; then
        echo "$PWD"
        return 0
    fi

    local by_name
    by_name="$(find "$HOME" -maxdepth 6 -type d -name "sheikha-main-portal" 2>/dev/null | head -n 1 || true)"
    if [ -n "${by_name}" ]; then
        echo "${by_name}"
        return 0
    fi

    local by_pkg
    by_pkg="$(find "$HOME" -maxdepth 6 -type f -name package.json 2>/dev/null \
        | while IFS= read -r f; do
            if rg -q '"name"\s*:\s*"sheikha-enterprise-al-portal"|"name"\s*:\s*"sheikha-main-portal"' "$f" 2>/dev/null; then
                dirname "$f"
                break
            fi
          done)"
    if [ -n "${by_pkg}" ]; then
        echo "${by_pkg}"
        return 0
    fi

    return 1
}

choose_ollama_model() {
    local ram
    ram=$(awk '/MemTotal/ {printf "%d", $2/1024/1024}' /proc/meminfo)
    if [ "$ram" -ge 110 ]; then
        echo "qwen2.5:72b"
    elif [ "$ram" -ge 64 ]; then
        echo "qwen2.5-coder:32b"
    elif [ "$ram" -ge 48 ]; then
        echo "qwen2.5-coder:14b"
    else
        echo "qwen2.5-coder:7b"
    fi
}

PROJECT_DIR="$(discover_project_dir || true)"
if [ -z "${PROJECT_DIR}" ]; then
    echo "❌ تعذر اكتشاف مسار مشروع شيخة داخل HOME."
    exit 1
fi

echo "✅ PROJECT_DIR=${PROJECT_DIR}"
cd "${PROJECT_DIR}"

mkdir -p logs

OLLAMA_MODEL="$(choose_ollama_model)"
echo "✅ Selected Ollama model: ${OLLAMA_MODEL}"

touch .env
if grep -q '^OLLAMA_URL=' .env; then
    sed -i 's|^OLLAMA_URL=.*|OLLAMA_URL=http://127.0.0.1:11434|' .env
else
    echo 'OLLAMA_URL=http://127.0.0.1:11434' >> .env
fi
if grep -q '^OLLAMA_MODEL=' .env; then
    sed -i "s/^OLLAMA_MODEL=.*/OLLAMA_MODEL=${OLLAMA_MODEL}/" .env
else
    echo "OLLAMA_MODEL=${OLLAMA_MODEL}" >> .env
fi

OPENAI_KEY_PRESENT=0
if rg -q '^OPENAI_API_KEY=.+$' .env; then
    OPENAI_KEY_PRESENT=1
fi

if [ "${PREFER_OPENAI}" = "openai" ] && [ "${OPENAI_KEY_PRESENT}" -eq 1 ]; then
    if grep -q '^AI_MODE=' .env; then
        sed -i 's/^AI_MODE=.*/AI_MODE=openai/' .env
    else
        echo 'AI_MODE=openai' >> .env
    fi
    if grep -q '^AI_LLM_MODEL=' .env; then
        sed -i 's/^AI_LLM_MODEL=.*/AI_LLM_MODEL=gpt-5.2/' .env
    else
        echo 'AI_LLM_MODEL=gpt-5.2' >> .env
    fi
    if grep -q '^AI_LLM_BASE_URL=' .env; then
        sed -i 's|^AI_LLM_BASE_URL=.*|AI_LLM_BASE_URL=https://api.openai.com/v1|' .env
    else
        echo 'AI_LLM_BASE_URL=https://api.openai.com/v1' >> .env
    fi
    echo "✅ AI_MODE=openai"
elif [ "${PREFER_OPENAI}" = "auto" ] && [ "${OPENAI_KEY_PRESENT}" -eq 1 ]; then
    if grep -q '^AI_MODE=' .env; then
        sed -i 's/^AI_MODE=.*/AI_MODE=openai/' .env
    else
        echo 'AI_MODE=openai' >> .env
    fi
    echo "✅ AI_MODE=openai (auto with OPENAI_API_KEY)"
else
    if grep -q '^AI_MODE=' .env; then
        sed -i 's/^AI_MODE=.*/AI_MODE=ollama/' .env
    else
        echo 'AI_MODE=ollama' >> .env
    fi
    echo "✅ AI_MODE=ollama"
fi

echo "▶ تشغيل Ollama بالخلفية..."
pkill -f 'ollama serve' 2>/dev/null || true
nohup ollama serve > /tmp/ollama-serve.log 2>&1 &
echo $! > /tmp/ollama-serve.pid
sleep 3

if curl -sf http://127.0.0.1:11434/api/tags >/dev/null; then
    echo "✅ Ollama is reachable"
else
    echo "❌ Ollama unreachable on 127.0.0.1:11434"
    tail -n 60 /tmp/ollama-serve.log || true
    exit 1
fi

echo "▶ تحميل النموذج بالخلفية (قد يستغرق وقتاً)..."
nohup bash -lc "ollama pull '${OLLAMA_MODEL}'" > logs/ollama-pull.log 2>&1 &
echo $! > /tmp/sheikha-ollama-pull.pid

echo "▶ إعادة تشغيل خادم شيخة بالخلفية..."
pkill -f 'node server.js' 2>/dev/null || true
nohup env \
    AI_MODE=ollama \
    OLLAMA_URL=http://127.0.0.1:11434 \
    OLLAMA_MODEL="${OLLAMA_MODEL}" \
    AI_LLM_MODEL="${OLLAMA_MODEL}" \
    AI_LLM_BASE_URL=http://127.0.0.1:11434/v1 \
    node server.js > logs/server.log 2>&1 &
echo $! > /tmp/sheikha-server.pid
sleep 4

echo "\n===== STATUS ====="
echo "health:" && curl -s http://127.0.0.1:8080/api/health || true
echo
echo "sheikha-gpt-status:" && curl -s http://127.0.0.1:8080/api/sheikha-gpt/status || true
echo
echo "ollama tags:" && curl -s http://127.0.0.1:11434/api/tags | head -c 600 || true
echo
echo "\nPIDs:"
echo "ollama serve PID: $(cat /tmp/ollama-serve.pid 2>/dev/null || echo '-')"
echo "model pull PID:  $(cat /tmp/sheikha-ollama-pull.pid 2>/dev/null || echo '-')"
echo "sheikha srv PID: $(cat /tmp/sheikha-server.pid 2>/dev/null || echo '-')"

echo "\nLogs:"
echo "- /tmp/ollama-serve.log"
echo "- ${PROJECT_DIR}/logs/ollama-pull.log"
echo "- ${PROJECT_DIR}/logs/server.log"
