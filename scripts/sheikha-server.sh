#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# Sheikha local server control with AI Gateway checks.

set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MAIN="${SHEIKHA_MAIN_NAME:-sheikha-main-portal}"
BASE_URL="${SHEIKHA_BASE_URL:-http://127.0.0.1:8080}"
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
