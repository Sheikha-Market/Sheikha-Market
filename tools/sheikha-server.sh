#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# Sheikha local server control with AI Gateway checks.

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MAIN="${SHEIKHA_MAIN_NAME:-sheikha-main-portal}"
CMD="${1:-status}"

run_pm2() {
  if ! command -v pm2 >/dev/null 2>&1; then
    echo "ERROR: pm2 command not found. Use npm run dev for local development." >&2
    exit 127
  fi
  pm2 "$@"
}

json_get() {
  if command -v curl >/dev/null 2>&1; then
    curl -sS "$1"
  else
    echo "ERROR: curl command not found." >&2
    return 127
  fi
}

wait_for_endpoint() {
  local url="$1"
  local attempts="${2:-20}"
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

detect_base_url() {
  if [ -n "${SHEIKHA_BASE_URL:-}" ]; then
    echo "$SHEIKHA_BASE_URL"
    return 0
  fi

  for candidate in "http://127.0.0.1:8080" "http://127.0.0.1:8081" "http://localhost:8080" "http://localhost:8081"; do
    if curl -fsS "$candidate/api/health" >/dev/null 2>&1 || curl -fsS "$candidate/api/sheikha/ai-gateway/status" >/dev/null 2>&1; then
      echo "$candidate"
      return 0
    fi
  done

  echo "http://127.0.0.1:8080"
}

BASE_URL="$(detect_base_url)"

case "$CMD" in
  start)
    cd "$DIR"
    run_pm2 start ecosystem.config.js --only "$MAIN"
    run_pm2 save
    ;;

  restart)
    cd "$DIR"
    if run_pm2 describe "$MAIN" >/dev/null 2>&1; then
      run_pm2 restart "$MAIN" --update-env
    else
      run_pm2 start ecosystem.config.js --only "$MAIN"
    fi
    run_pm2 save
    BASE_URL="$(detect_base_url)"
    if wait_for_endpoint "$BASE_URL/api/health" 20 1; then
      echo "Sheikha server is ready: $BASE_URL"
    else
      echo "WARNING: server restarted but health endpoint is not ready yet: $BASE_URL/api/health" >&2
    fi
    ;;

  status)
    run_pm2 status "$MAIN"
    echo
    echo "Health:"
    json_get "$BASE_URL/api/health" || true
    echo
    echo
    echo "AI Gateway:"
    json_get "$BASE_URL/api/sheikha/ai-gateway/status" || true
    echo
    ;;

  gateway)
    if ! wait_for_endpoint "$BASE_URL/api/sheikha/ai-gateway/status" 10 1; then
      echo "ERROR: Sheikha AI Gateway is not reachable: $BASE_URL/api/sheikha/ai-gateway/status" >&2
      exit 7
    fi
    json_get "$BASE_URL/api/sheikha/ai-gateway/status"
    echo
    ;;

  ask)
    PROMPT="${2:-عرّف نفسك كنظام Sheikha محلي.}"
    curl -sS -X POST "$BASE_URL/api/sheikha/ai-gateway/ask" \
      -H "Content-Type: application/json" \
      --data-binary "{\"prompt\":\"$PROMPT\",\"context\":{\"source\":\"sheikha-server-script\",\"mode\":\"enterprise\"}}"
    echo
    ;;

  logs)
    LINES="${2:-120}"
    run_pm2 logs "$MAIN" --lines "$LINES"
    ;;

  *)
    echo "Usage: $0 {start|restart|status|gateway|ask|logs}"
    exit 2
    ;;
esac
