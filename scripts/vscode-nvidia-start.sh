#!/usr/bin/env bash
set -euo pipefail

PORT=8080
READY_ENDPOINT="/api/training-center/stats"

kill_port_if_busy() {
    if command -v lsof >/dev/null 2>&1; then
        lsof -ti :"$PORT" | xargs -r kill -9 || true
        return 0
    fi

    if command -v fuser >/dev/null 2>&1; then
        fuser -k "${PORT}/tcp" >/dev/null 2>&1 || true
        return 0
    fi

    if command -v ss >/dev/null 2>&1; then
        local pids
        pids="$(ss -ltnp "( sport = :${PORT} )" 2>/dev/null | awk -F'pid=' 'NR>1{split($2,a,","); if(a[1]!="") print a[1]}' | sort -u)"
        if [ -n "${pids}" ]; then
            # shellcheck disable=SC2086
            kill -9 ${pids} >/dev/null 2>&1 || true
        fi
        return 0
    fi

    return 0
}

is_port_ready() {
    if command -v ss >/dev/null 2>&1; then
        ss -ltn | awk -v p=":${PORT}" '$4 ~ p"$" {found=1} END {exit !found}'
        return $?
    fi

    curl -sS -m 2 "http://127.0.0.1:${PORT}/api/sheikha/status" >/dev/null 2>&1
    return $?
}

is_api_ready() {
    local body
    body="$(curl -sS -m 3 "http://127.0.0.1:${PORT}${READY_ENDPOINT}" || true)"
    echo "$body" | grep -q '"success":true'
}

source "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true
nvm use 25.6.1 >/dev/null 2>&1 || true

kill_port_if_busy
if command -v setsid >/dev/null 2>&1; then
    setsid env AI_MODE=nvidia NVIDIA_NIM_PRIORITY=true NVIDIA_CUDA_ENABLED=true npm start </dev/null >/tmp/sheikha-vscode.log 2>&1 &
    echo $! >/tmp/sheikha-vscode.pid
else
    nohup env AI_MODE=nvidia NVIDIA_NIM_PRIORITY=true NVIDIA_CUDA_ENABLED=true npm start </dev/null >/tmp/sheikha-vscode.log 2>&1 &
    echo $! >/tmp/sheikha-vscode.pid
fi

for i in {1..45}; do
    if is_port_ready && is_api_ready; then
        echo "OK: sheikha started on ${PORT} (NVIDIA-first, API-ready: ${READY_ENDPOINT})"
        exit 0
    fi
    sleep 1
done

echo "ERROR: sheikha failed to start after wait"
if [ -f /tmp/sheikha-vscode.pid ]; then
    kill -9 "$(cat /tmp/sheikha-vscode.pid)" >/dev/null 2>&1 || true
fi
tail -n 60 /tmp/sheikha-vscode.log || true
exit 1
