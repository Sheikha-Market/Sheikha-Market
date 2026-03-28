#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

RUNTIME_BASE="${SHEIKHA_RUNTIME_BASE:-$ROOT_DIR/runtime}"
mkdir -p "$RUNTIME_BASE/reports"
STAMP="$(date +%Y%m%d_%H%M%S)"
REPORT_FILE="$RUNTIME_BASE/reports/global-production-best-$STAMP.txt"

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

notify() {
    local level="$1"
    local message="$2"
    bash scripts/sheikha-central-alert.sh "$level" "$message" >> "$REPORT_FILE" 2>&1 || true
}

log "============================================================"
log "SHEIKHA GLOBAL PRODUCTION BEST ACTIVATION"
log "============================================================"
log "timestamp=$STAMP"
log "report=$REPORT_FILE"

if ! run_step 'Ultimate stable core activation' npm run -s ops:activate:ultimate:stable; then
    notify 'critical' 'فشل التفعيل الأساسي المستقر'
fi

if ! run_step 'Safe local backup snapshot' bash scripts/sheikha-backup-local.sh; then
    notify 'high' 'فشل النسخ الاحتياطي المحلي الآمن'
fi

if ! run_step 'Alert channels self-test' npm run -s ops:ip:alert:test; then
    notify 'high' 'فشل اختبار قنوات التنبيه المركزية'
fi

if [[ "${EUID}" -eq 0 && -x "$(command -v nginx || true)" ]]; then
    if ! run_step 'Install split Nginx policies (public/admin/api)' bash scripts/install-sheikha-nginx-split.sh; then
        notify 'high' 'فشل تثبيت Nginx split policies'
    fi
else
    log ""
    log "==> Nginx split install"
    log "[WARN] Requires root on production host."
    log "[WARN] Run: sudo bash scripts/install-sheikha-nginx-split.sh"
fi

if run_step 'GPU readiness gate' bash scripts/sheikha-gpu-readiness.sh; then
    if ! run_step 'Activate isolated GPU layer' bash scripts/activate-sheikha-gpu-layer.sh; then
        notify 'medium' 'GPU readiness passed but layer activation failed'
    fi
else
    notify 'info' 'GPU غير جاهز حالياً وتم الإبقاء على مسار CPU المستقر'
fi

run_step 'Final API health check' curl -sS -m 15 http://127.0.0.1:8080/api/health

notify 'info' 'اكتمل تفعيل global production best مع الحفاظ على الاستقرار'

log ""
log "============================================================"
log "GLOBAL PRODUCTION BEST ACTIVATION COMPLETE"
log "report=$REPORT_FILE"
log "============================================================"

echo "$REPORT_FILE"
