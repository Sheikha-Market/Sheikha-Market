#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUNTIME_BASE="${SHEIKHA_RUNTIME_BASE:-$ROOT_DIR/runtime}"
REPORTS_DIR="$RUNTIME_BASE/reports"
mkdir -p "$REPORTS_DIR"

STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT_FILE="$REPORTS_DIR/sheikha-unified-system-$STAMP.txt"

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

start_unified() {
    log "============================================================"
    log "SHEIKHA UNIFIED SYSTEM ACTIVATION"
    log "============================================================"
    log "timestamp=$STAMP"
    log "language_base=ar"
    log "report=$REPORT_FILE"

    run_step 'Global production stable activation' npm run -s ops:global:production:best || true
    run_step 'UTF-8 background server start' npm run -s ops:utf8:bg:start || true
    run_step 'Unicode stack background start' npm run -s ops:unicode:bg:start || true
    run_step 'Neural mesh background start' npm run -s ops:sheikha:neural:start || true
    run_step 'Governance UTF-8 compliance check' node scripts/sheikha-governance-check.js || true
    run_step 'Architecture Mermaid generation' node scripts/generate-sheikha-architecture-mermaid.js || true
    run_step 'Unicode smart architecture map check' test -f config/sheikha-unicode-smart-architecture.json || true
    run_step 'Unified API health check' curl -sS -m 15 http://127.0.0.1:8080/api/health || true

    log ""
    log "============================================================"
    log "SHEIKHA UNIFIED SYSTEM ACTIVE"
    log "report=$REPORT_FILE"
    log "============================================================"
    echo "$REPORT_FILE"
}

stop_unified() {
    log "============================================================"
    log "SHEIKHA UNIFIED SYSTEM STOP"
    log "============================================================"
    run_step 'Stop neural mesh background' npm run -s ops:sheikha:neural:stop || true
    run_step 'Stop Unicode stack background' npm run -s ops:unicode:bg:stop || true
    run_step 'Stop UTF-8 background server' npm run -s ops:utf8:bg:stop || true
    log "[OK] Unified background services stop sequence completed"
    echo "$REPORT_FILE"
}

status_unified() {
    log "============================================================"
    log "SHEIKHA UNIFIED SYSTEM STATUS"
    log "============================================================"
    run_step 'UTF-8 background status' npm run -s ops:utf8:bg:status || true
    run_step 'Unicode stack background status' npm run -s ops:unicode:bg:status || true
    run_step 'Neural mesh background status' npm run -s ops:sheikha:neural:status || true
    run_step 'Governance UTF-8 compliance check' node scripts/sheikha-governance-check.js || true
    run_step 'Architecture Mermaid generation' node scripts/generate-sheikha-architecture-mermaid.js || true
    run_step 'Unified API health check' curl -sS -m 15 http://127.0.0.1:8080/api/health || true
    run_step 'Architecture map exists' test -f config/sheikha-unicode-smart-architecture.json || true
    log "[OK] Unified status report generated"
    echo "$REPORT_FILE"
}

cd "$ROOT_DIR"

cmd="${1:-status}"
case "$cmd" in
    start)
        start_unified
        ;;
    stop)
        stop_unified
        ;;
    status)
        status_unified
        ;;
    *)
        echo "Usage: $0 {start|stop|status}"
        exit 2
        ;;
esac
