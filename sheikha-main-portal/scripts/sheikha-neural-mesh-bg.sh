#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_SCRIPT="${ROOT_DIR}/sheikha-vscode-extension/scripts/vs-background-server.js"
PM2_PREFIX="sheikha-neural"
HOST="${SHEIKHA_NEURAL_HOST:-127.0.0.1}"
BASE_PORT="${SHEIKHA_NEURAL_BASE_PORT:-48530}"

if ! command -v pm2 >/dev/null 2>&1; then
    echo "pm2 is required for neural mesh management."
    exit 1
fi

declare -a SERVICES=(
    "sheikha-neural-interpreters"
    "sheikha-neural-engines"
    "sheikha-neural-translators"
    "sheikha-neural-accelerator"
    "sheikha-arabic-foundation"
)

start_all() {
    local index=0
    for tier in "${SERVICES[@]}"; do
        local name="${PM2_PREFIX}-${tier}"
        local port=$((BASE_PORT + index))

        pm2 delete "${name}" >/dev/null 2>&1 || true
        pm2 start "${SERVER_SCRIPT}" --name "${name}" -- --tier="${tier}" --host="${HOST}" --port="${port}" --default-language=ar

        echo "Started ${name} at http://${HOST}:${port}"
        index=$((index + 1))
    done

    pm2 save >/dev/null 2>&1 || true
}

stop_all() {
    for tier in "${SERVICES[@]}"; do
        local name="${PM2_PREFIX}-${tier}"
        pm2 delete "${name}" >/dev/null 2>&1 || true
        echo "Stopped ${name}"
    done

    pm2 save >/dev/null 2>&1 || true
}

status_all() {
    local failed=0
    for tier in "${SERVICES[@]}"; do
        local name="${PM2_PREFIX}-${tier}"
        if pm2 describe "${name}" >/dev/null 2>&1; then
            echo "[OK] ${name}"
        else
            echo "[WARN] ${name} is not running"
            failed=1
        fi
    done

    exit "${failed}"
}

logs_all() {
    pm2 logs "${PM2_PREFIX}-sheikha-neural-interpreters" \
        "${PM2_PREFIX}-sheikha-neural-engines" \
        "${PM2_PREFIX}-sheikha-neural-translators" \
        "${PM2_PREFIX}-sheikha-neural-accelerator" \
        "${PM2_PREFIX}-sheikha-arabic-foundation" --lines 80 --nostream
}

cmd="${1:-status}"
case "${cmd}" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        stop_all
        start_all
        ;;
    status)
        status_all
        ;;
    logs)
        logs_all
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        exit 2
        ;;
esac
