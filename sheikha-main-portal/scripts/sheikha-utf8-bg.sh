#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_DIR="${ROOT_DIR}/runtime"
LOG_DIR="${RUNTIME_DIR}/logs"
PID_FILE="${RUNTIME_DIR}/sheikha-utf8-server.pid"
LOG_FILE="${LOG_DIR}/sheikha-utf8-server.log"
SERVER_SCRIPT="${ROOT_DIR}/sheikha-vscode-extension/scripts/vs-background-server.js"
PM2_NAME="sheikha-utf8-server"
HOST="${SHEIKHA_UTF8_HOST:-127.0.0.1}"
PORT="${SHEIKHA_UTF8_PORT:-48483}"
USE_PM2="${SHEIKHA_UTF8_USE_PM2:-1}"

mkdir -p "${RUNTIME_DIR}" "${LOG_DIR}"

is_running_pid() {
    local pid="${1:-0}"
    [[ "${pid}" =~ ^[0-9]+$ ]] || return 1
    kill -0 "${pid}" 2>/dev/null
}

start_with_pm2() {
    pm2 delete "${PM2_NAME}" 2>/dev/null || true
    pm2 start "${SERVER_SCRIPT}" --name "${PM2_NAME}" -- --tier=utf-8 --host="${HOST}" --port="${PORT}"
    pm2 save >/dev/null 2>&1 || true
    echo "UTF-8 server started with PM2 on http://${HOST}:${PORT}"
}

start_with_nohup() {
    if [[ -f "${PID_FILE}" ]]; then
        local existing_pid
        existing_pid="$(cat "${PID_FILE}" 2>/dev/null || true)"
        if is_running_pid "${existing_pid}"; then
            echo "UTF-8 server already running with PID ${existing_pid}"
            return 0
        fi
    fi

    nohup node "${SERVER_SCRIPT}" --tier=utf-8 --host="${HOST}" --port="${PORT}" >>"${LOG_FILE}" 2>&1 &
    local new_pid=$!
    echo "${new_pid}" > "${PID_FILE}"
    echo "UTF-8 server started in background with PID ${new_pid} on http://${HOST}:${PORT}"
}

stop_pm2() {
    pm2 delete "${PM2_NAME}" 2>/dev/null || true
}

stop_nohup() {
    if [[ ! -f "${PID_FILE}" ]]; then
        echo "UTF-8 server is not running (no PID file)"
        return 0
    fi

    local pid
    pid="$(cat "${PID_FILE}" 2>/dev/null || true)"
    if is_running_pid "${pid}"; then
        kill "${pid}" 2>/dev/null || true
        sleep 1
        if is_running_pid "${pid}"; then
            kill -9 "${pid}" 2>/dev/null || true
        fi
        echo "UTF-8 server stopped (PID ${pid})"
    else
        echo "UTF-8 server PID file existed but process is not running"
    fi
    rm -f "${PID_FILE}"
}

status_pm2() {
    pm2 describe "${PM2_NAME}" >/dev/null 2>&1
}

status_nohup() {
    if [[ ! -f "${PID_FILE}" ]]; then
        return 1
    fi

    local pid
    pid="$(cat "${PID_FILE}" 2>/dev/null || true)"
    is_running_pid "${pid}"
}

cmd="${1:-status}"
case "${cmd}" in
    start)
        if [[ "${USE_PM2}" == "1" ]] && command -v pm2 >/dev/null 2>&1; then
            start_with_pm2
        else
            start_with_nohup
        fi
        ;;
    stop)
        if [[ "${USE_PM2}" == "1" ]] && command -v pm2 >/dev/null 2>&1; then
            stop_pm2
            echo "UTF-8 server stopped from PM2"
        else
            stop_nohup
        fi
        ;;
    status)
        if [[ "${USE_PM2}" == "1" ]] && command -v pm2 >/dev/null 2>&1; then
            if status_pm2; then
                echo "UTF-8 server is running in PM2"
                pm2 describe "${PM2_NAME}"
                exit 0
            fi
            echo "UTF-8 server is not running in PM2"
            exit 1
        fi

        if status_nohup; then
            echo "UTF-8 server is running with PID $(cat "${PID_FILE}")"
            exit 0
        fi
        echo "UTF-8 server is not running"
        exit 1
        ;;
    logs)
        if [[ "${USE_PM2}" == "1" ]] && command -v pm2 >/dev/null 2>&1; then
            pm2 logs "${PM2_NAME}" --lines 80 --nostream
            exit 0
        fi
        tail -n 80 "${LOG_FILE}" 2>/dev/null || echo "No UTF-8 server logs yet"
        ;;
    *)
        echo "Usage: $0 {start|stop|status|logs}"
        exit 2
        ;;
esac
