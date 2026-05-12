#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEFAULT_BASE='/var/sheikha/runtime'
FALLBACK_BASE="$ROOT_DIR/runtime"

if mkdir -p "$DEFAULT_BASE" 2>/dev/null; then
    RUNTIME_BASE="$DEFAULT_BASE"
else
    RUNTIME_BASE="$FALLBACK_BASE"
    mkdir -p "$RUNTIME_BASE"
fi

mkdir -p "$RUNTIME_BASE/reports" "$RUNTIME_BASE/logs" "$RUNTIME_BASE/tmp"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
REPORT_FILE="$RUNTIME_BASE/reports/ultimate-stable-activation-$TIMESTAMP.txt"

log() {
    printf '%s\n' "$1" | tee -a "$REPORT_FILE"
}

run_step() {
    local label="$1"
    shift

    log ""
    log "==> $label"
    if "$@" >> "$REPORT_FILE" 2>&1; then
        log "[OK] $label"
    else
        log "[WARN] $label"
        return 1
    fi
}

load_env_file() {
    local env_file="$1"
    [ -f "$env_file" ] || return 0

    while IFS= read -r line || [ -n "$line" ]; do
        [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
        [[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]] || continue
        export "$line"
    done < "$env_file"
}

kill_port_if_busy() {
    local port="$1"

    if command -v lsof >/dev/null 2>&1; then
        lsof -ti :"$port" | xargs -r kill -9 || true
        return
    fi

    if command -v fuser >/dev/null 2>&1; then
        fuser -k "${port}/tcp" >/dev/null 2>&1 || true
        return
    fi

    if command -v ss >/dev/null 2>&1; then
        local pids
        pids="$(ss -ltnp "( sport = :${port} )" 2>/dev/null | awk -F'pid=' 'NR>1{split($2,a,","); if(a[1]!="") print a[1]}' | sort -u)"
        [ -n "$pids" ] && kill -9 $pids >/dev/null 2>&1 || true
    fi
}

wait_for_url() {
    local url="$1"
    local attempts="${2:-45}"

    for _ in $(seq 1 "$attempts"); do
        if curl -sS -m 3 "$url" >/dev/null 2>&1; then
            return 0
        fi
        sleep 1
    done

    return 1
}

source "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true
nvm use 25.6.1 >/dev/null 2>&1 || true

cd "$ROOT_DIR"
load_env_file "$ROOT_DIR/.env"

GPU_PROFILE='stable-cpu'
if command -v nvidia-smi >/dev/null 2>&1 && nvidia-smi >/dev/null 2>&1; then
    GPU_PROFILE='stable-gpu'
fi

log '============================================================'
log 'SHEIKHA ULTIMATE STABLE ACTIVATION'
log '============================================================'
log "timestamp=$TIMESTAMP"
log "profile=$GPU_PROFILE"
log "root=$ROOT_DIR"
log "runtime=$RUNTIME_BASE"

run_step 'VS Code doctor' npm run -s dev:vscode:doctor || true
run_step 'Integration readiness' npm run -s ops:readiness || true
run_step 'Auth readiness' npm run -s ops:auth:readiness || true
run_step 'IP ownership proof strict' npm run -s ops:ip:proof:strict || true
run_step 'Health check dry run' npm run -s ops:health:check:dry || true

log ''
log '==> Port ownership cleanup (8080)'
kill_port_if_busy 8080
log '[OK] Port ownership cleanup (8080)'

run_step 'PM2 IP guard strict' npm run -s ops:ip:proof:pm2:start:strict || true
run_step 'PM2 background guard' npm run -s ops:bg-guard:pm2:start || true
run_step 'PM2 AI secrets guard' npm run -s ops:ai-guard:pm2:start || true
run_step 'PM2 health monitor' npm run -s ops:monitor:start || true
run_step 'PM2 server start' npm run -s ops:server:pm2:start || true
run_step 'Global full spectrum data refresh' npm run -s ops:architecture:global:full-spectrum:activate || true

log ''
log '==> Waiting for sheikha-api readiness'
if wait_for_url 'http://127.0.0.1:8080/api/health' 45; then
    log '[OK] sheikha-api readiness wait'
else
    log '[WARN] sheikha-api readiness wait'
fi

run_step 'Runtime guard snapshot' bash scripts/sheikha-runtime-guard.sh || true

log ''
log '==> Live endpoint verification'
if curl -sS -m 20 http://127.0.0.1:8080/api/health >> "$REPORT_FILE" 2>&1; then
    log '[OK] /api/health'
else
    log '[WARN] /api/health'
fi

if curl -sS -m 20 http://127.0.0.1:8080/api/sheikha/global/overview >> "$REPORT_FILE" 2>&1; then
    log '[OK] /api/sheikha/global/overview'
else
    log '[WARN] /api/sheikha/global/overview'
fi

if curl -sS -m 20 http://127.0.0.1:8080/api/sheikha/status >> "$REPORT_FILE" 2>&1; then
    log '[OK] /api/sheikha/status'
else
    log '[WARN] /api/sheikha/status'
fi

log ''
log '==> PM2 status snapshot'
pm2 describe sheikha-api sheikha-health-monitor sheikha-bg-guard sheikha-ip-proof sheikha-ai-guard >> "$REPORT_FILE" 2>&1 || true

log ''
log '============================================================'
log 'ULTIMATE STABLE ACTIVATION COMPLETE'
log "report=$REPORT_FILE"
log '============================================================'

printf '%s\n' "$REPORT_FILE"