#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# SHEIKHA UGIT-RP governed enterprise runtime manager.

set -Eeuo pipefail

unset npm_config_prefix
unset NPM_CONFIG_PREFIX

ROOT_DIR="${SHEIKHA_ROOT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
APP_NAME="${SHEIKHA_APP_NAME:-sheikha-main-portal}"
PORT_MAIN="${PORT:-8080}"
PORT_OLLAMA="${SHEIKHA_OLLAMA_PORT:-11434}"
OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:${PORT_OLLAMA}}"
SHEIKHA_CORE_MODEL="${SHEIKHA_CORE_MODEL:-Sheikha-Core}"
BASE_URL="${SHEIKHA_BASE_URL:-http://127.0.0.1:${PORT_MAIN}}"
MODE="${1:-run}"

cd "$ROOT_DIR"

section() {
  echo
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo " $1"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

need_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "ERROR: required command not found: $1" >&2
    exit 127
  fi
}

json_get() {
  local url="$1"
  if command -v jq >/dev/null 2>&1; then
    curl -fsS "$url" | jq
  else
    curl -fsS "$url"
    echo
  fi
}

json_post() {
  local url="$1"
  local body="$2"
  if command -v jq >/dev/null 2>&1; then
    curl -fsS -X POST "$url" -H "Content-Type: application/json" --data-binary "$body" | jq
  else
    curl -fsS -X POST "$url" -H "Content-Type: application/json" --data-binary "$body"
    echo
  fi
}

wait_http() {
  local url="$1"
  local attempts="${2:-30}"
  local delay="${3:-1}"
  local i

  for i in $(seq 1 "$attempts"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep "$delay"
  done

  return 1
}

run_static_checks() {
  section "SHEIKHA STATIC RUNTIME CHECKS"
  need_command node
  node --check server.js
  node -c core/ai-gateway/sheikha-ai-gateway.js
  node -c core/neural/sheikha-ai-neural-cell-network.js
  echo "OK: JavaScript runtime surfaces are syntactically valid."
}

ensure_ollama() {
  section "SHEIKHA LOCAL AI PROVIDER"
  need_command curl

  if curl -fsS "${OLLAMA_HOST}/api/tags" >/dev/null 2>&1; then
    echo "OK: Ollama is already active at ${OLLAMA_HOST}."
  else
    need_command ollama
    echo "Starting Ollama without killing existing services..."
    nohup ollama serve >/tmp/sheikha-ollama.log 2>&1 &
    if ! wait_http "${OLLAMA_HOST}/api/tags" 20 1; then
      echo "ERROR: Ollama did not become ready at ${OLLAMA_HOST}." >&2
      tail -80 /tmp/sheikha-ollama.log 2>/dev/null || true
      exit 11
    fi
  fi

  if ollama list | grep -qE "^${SHEIKHA_CORE_MODEL}(:|[[:space:]])"; then
    echo "OK: ${SHEIKHA_CORE_MODEL} is installed."
    return 0
  fi

  if [ -f "models/sheikha-core/Modelfile" ]; then
    echo "Creating ${SHEIKHA_CORE_MODEL} from models/sheikha-core/Modelfile..."
    ollama create "${SHEIKHA_CORE_MODEL}" -f models/sheikha-core/Modelfile
  else
    echo "ERROR: ${SHEIKHA_CORE_MODEL} is missing and models/sheikha-core/Modelfile was not found." >&2
    exit 12
  fi
}

ensure_main_port() {
  section "SHEIKHA PORT GOVERNANCE"

  if curl -fsS "${BASE_URL}/api/health" >/dev/null 2>&1; then
    echo "OK: existing runtime answers on ${BASE_URL}."
    return 0
  fi

  if ss -lntp 2>/dev/null | grep -q ":${PORT_MAIN} "; then
    echo "WARNING: port ${PORT_MAIN} is busy but Sheikha health is not ready."
    ss -lntp 2>/dev/null | grep ":${PORT_MAIN} " || true
    if [ "${SHEIKHA_FORCE_PORT_CLEAN:-0}" = "1" ]; then
      echo "SHEIKHA_FORCE_PORT_CLEAN=1 set; freeing port ${PORT_MAIN}."
      fuser -k "${PORT_MAIN}/tcp" 2>/dev/null || true
      sleep 2
    else
      echo "ERROR: set SHEIKHA_FORCE_PORT_CLEAN=1 only if you want this script to free the port." >&2
      exit 13
    fi
  else
    echo "OK: port ${PORT_MAIN} is free."
  fi
}

start_pm2_runtime() {
  section "SHEIKHA PM2 RUNTIME"
  need_command pm2

  export PORT="${PORT_MAIN}"
  export NODE_ENV="${NODE_ENV:-production}"
  export OLLAMA_HOST
  export SHEIKHA_CORE_MODEL
  export SHEIKHA_CORE_TIMEOUT_MS="${SHEIKHA_CORE_TIMEOUT_MS:-45000}"
  export AI_MODE="${AI_MODE:-local-first}"
  export AI_LLM_BASE_URL="${AI_LLM_BASE_URL:-${OLLAMA_HOST}}"
  export AI_LLM_MODEL="${AI_LLM_MODEL:-${SHEIKHA_CORE_MODEL}}"

  if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
    pm2 restart "$APP_NAME" --update-env
  else
    pm2 start server.js \
      --name "$APP_NAME" \
      --time \
      --update-env \
      --max-memory-restart 2G \
      --restart-delay 5000 \
      --node-args="--max-old-space-size=4096"
  fi

  if ! wait_http "${BASE_URL}/api/health" 40 1; then
    echo "ERROR: Sheikha runtime did not become healthy at ${BASE_URL}." >&2
    pm2 logs "$APP_NAME" --lines 80 --nostream || true
    exit 14
  fi

  pm2 save
}

runtime_health() {
  section "SHEIKHA ENTERPRISE HEALTH"

  echo
  echo "API HEALTH"
  json_get "${BASE_URL}/api/health" || true

  echo
  echo "RUNTIME ROOT"
  json_get "${BASE_URL}/api/runtime-root/health" || true

  echo
  echo "AI GATEWAY"
  json_get "${BASE_URL}/api/sheikha/ai-gateway/status" || true

  echo
  echo "ROOT NEURAL INTEGRATION"
  json_get "${BASE_URL}/api/sheikha/root-neural-integration/status" || true

  echo
  echo "SYSTEM STATUS"
  json_get "${BASE_URL}/api/sheikha/system/status" || true
}

runtime_ai_test() {
  section "SHEIKHA LOCAL AI VALIDATION"
  json_post "${BASE_URL}/api/sheikha/ai-gateway/ask" '{
    "prompt":"عرّف نفسك كنظام Sheikha-Core المحلي المحكوم.",
    "context":{
      "source":"sheikha-enterprise-runtime",
      "mode":"enterprise-validation"
    }
  }' || true
}

runtime_full_test() {
  section "SHEIKHA FULL ENTERPRISE TEST"

  echo
  echo "PM2 STATUS"
  pm2 status "$APP_NAME" || true

  echo
  echo "PORTS"
  ss -lntp 2>/dev/null | grep ":${PORT_MAIN} " || true
  ss -lntp 2>/dev/null | grep ":${PORT_OLLAMA} " || true

  runtime_health

  echo
  echo "OLLAMA TAGS"
  json_get "${OLLAMA_HOST}/api/tags" || true

  runtime_ai_test

  echo
  echo "MEMORY"
  free -h || true

  echo
  echo "CPU LOAD"
  uptime || true

  echo
  echo "DISK"
  df -h / || true

  echo
  echo "PM2 LOG ERRORS"
  pm2 logs "$APP_NAME" --lines 30 --nostream || true
}

case "$MODE" in
  run)
    section "SHEIKHA ENTERPRISE RUNTIME"
    run_static_checks
    ensure_ollama
    ensure_main_port
    start_pm2_runtime
    runtime_health
    runtime_ai_test
    section "SHEIKHA ENTERPRISE READY"
    ;;
  test)
    runtime_full_test
    section "SHEIKHA TEST COMPLETE"
    ;;
  health)
    runtime_health
    ;;
  ai-test)
    runtime_ai_test
    ;;
  *)
    echo "Usage: $0 {run|test|health|ai-test}" >&2
    exit 2
    ;;
esac
