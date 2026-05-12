#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER_SCRIPT="${ROOT_DIR}/sheikha-vscode-extension/scripts/vs-background-server.js"
HOST="${SHEIKHA_UNICODE_HOST:-127.0.0.1}"
BASE_PORT="${SHEIKHA_UNICODE_BASE_PORT:-48510}"
DEFAULT_LANGUAGE="${SHEIKHA_UNICODE_DEFAULT_LANGUAGE:-ar}"

if ! command -v pm2 >/dev/null 2>&1; then
    echo "pm2 is required for sheikha-unicode-stack-bg"
    exit 1
fi

TIERS=(
    sheikha-unicode-standard
    sheikha-variable-width-encoding
    sheikha-code-points
    sheikha-byte-sequence
    sheikha-ascii-compatibility
    sheikha-self-synchronization
    sheikha-multi-byte-characters
    sheikha-data-representation
    sheikha-encoding-systems
    sheikha-data-storage
    sheikha-utf-8-core
    sheikha-ascii-core
    sheikha-hardware
    sheikha-software
    sheikha-networking
    sheikha-protocol
)

tier_pm2_name() {
    local tier="$1"
    echo "${tier}-bg"
}

start_stack() {
    local port="$BASE_PORT"
    for tier in "${TIERS[@]}"; do
        local name
        name="$(tier_pm2_name "$tier")"
        pm2 delete "$name" 2>/dev/null || true
        pm2 start "$SERVER_SCRIPT" --name "$name" -- \
            --tier="$tier" \
            --host="$HOST" \
            --port="$port" \
            --default-language="$DEFAULT_LANGUAGE"
        port=$((port + 1))
    done

    pm2 save >/dev/null 2>&1 || true
    echo "Sheikha Unicode stack started on ${HOST}:${BASE_PORT}..$((port - 1))"
}

stop_stack() {
    for tier in "${TIERS[@]}"; do
        pm2 delete "$(tier_pm2_name "$tier")" 2>/dev/null || true
    done
    pm2 save >/dev/null 2>&1 || true
    echo "Sheikha Unicode stack stopped"
}

status_stack() {
    local found=0
    for tier in "${TIERS[@]}"; do
        local name
        name="$(tier_pm2_name "$tier")"
        if pm2 describe "$name" >/dev/null 2>&1; then
            found=1
            pm2 describe "$name"
        else
            echo "$name is not running"
        fi
    done

    if [[ "$found" -eq 0 ]]; then
        exit 1
    fi
}

logs_stack() {
    local names=()
    for tier in "${TIERS[@]}"; do
        names+=("$(tier_pm2_name "$tier")")
    done

    pm2 logs "${names[@]}" --lines 80 --nostream
}

cmd="${1:-status}"
case "$cmd" in
    start)
        start_stack
        ;;
    stop)
        stop_stack
        ;;
    status)
        status_stack
        ;;
    logs)
        logs_stack
        ;;
    *)
        echo "Usage: $0 {start|stop|status|logs}"
        exit 2
        ;;
esac
