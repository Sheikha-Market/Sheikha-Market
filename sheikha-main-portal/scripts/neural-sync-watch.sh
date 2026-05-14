#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# ═══════════════════════════════════════════════════════════════════════════════
# 🧠👁️ SHEIKHA — neural-sync-watch.sh
#    مراقب حالة الشبكة العصبية — يعمل كل 15 دقيقة عبر cron
#    Watches /api/neural-sync/status and auto-restarts the app if unavailable
#
# «وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ» — الحديد: 4
#
# الاستخدام / Usage:
#   bash scripts/neural-sync-watch.sh
#
# إعداد cron (كل 15 دقيقة) / Cron setup (every 15 min):
#   */15 * * * * cd /opt/sheikha/current && \
#     bash scripts/neural-sync-watch.sh \
#     >> logs/neural-sync-cron.log 2>&1 # sheikha-neural-sync-watch
# ═══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

# ── إعدادات / Configuration ───────────────────────────────────────────────────
PROJECT_DIR="${SHEIKHA_PROJECT_DIR:-/opt/sheikha/current}"
LOG_DIR="$PROJECT_DIR/logs"
LOG_FILE="$LOG_DIR/neural-sync-watch.log"
REPORT_DIR="$PROJECT_DIR/reports/neural-sync"
STATUS_URL="${NEURAL_STATUS_URL:-http://127.0.0.1:8080/api/neural-sync/status}"
LOCK_FILE="/tmp/sheikha-neural-sync-watch.lock"
PM2_APP="${PM2_APP_NAME:-sheikha-main-portal}"
CURL_TIMEOUT=12
MAX_LOG_LINES=2000

# ── تأسيس المجلدات / Setup directories ──────────────────────────────────────
mkdir -p "$LOG_DIR" "$REPORT_DIR"
cd "$PROJECT_DIR"

# ── منع التشغيل المتزامن / Prevent concurrent runs ───────────────────────────
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
    exit 0
fi

# ── دوال المساعدة / Helpers ───────────────────────────────────────────────────
now()  { date '+%Y-%m-%d %H:%M:%S %z'; }
log()  { printf '[%s] %s\n' "$(now)" "$1" | tee -a "$LOG_FILE"; }

# تدوير السجل إذا تجاوز الحد / Rotate log if too large
if [[ -f "$LOG_FILE" ]]; then
    line_count=$(wc -l < "$LOG_FILE" || echo 0)
    if [[ $line_count -gt $MAX_LOG_LINES ]]; then
        tail -n $((MAX_LOG_LINES / 2)) "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
    fi
fi

# ── اسم ملف التقرير / Status report filename ─────────────────────────────────
status_file="$REPORT_DIR/status-$(date +%F-%H%M%S).json"

# ── فحص نقطة الحالة / Check status endpoint ──────────────────────────────────
if curl -fsS --max-time "$CURL_TIMEOUT" "$STATUS_URL" > "$status_file" 2>/dev/null; then
    log "neural status healthy"

    # قراءة حالة المزامنة وتسجيلها
    sync_status=$(python3 -c "
import json, sys
try:
    d = json.load(open('$status_file'))
    origin_ok = d.get('origin', {}).get('status') == 'ready'
    enterprise_ok = d.get('enterprise', {}).get('status') == 'ready'
    print('both-ready' if origin_ok and enterprise_ok else 'degraded')
except:
    print('parse-error')
" 2>/dev/null || echo "unknown")

    log "sync-status: ${sync_status}"

    # إذا كانت الحالة متدهورة، شغّل المزامنة تلقائياً
    if [[ "$sync_status" == "degraded" ]]; then
        log "degraded status detected -> running full sync"
        if [[ -x "$PROJECT_DIR/tools/neural/sync-neural-cells.sh" ]]; then
            bash "$PROJECT_DIR/tools/neural/sync-neural-cells.sh" full \
                >> "$LOG_FILE" 2>&1 || true
        fi
    fi
else
    log "status endpoint unavailable -> restart app"
    pm2 restart "$PM2_APP" --update-env >> "$LOG_FILE" 2>&1 || true
    pm2 save --force                   >> "$LOG_FILE" 2>&1 || true

    # انتظر ثم تحقق مرة ثانية
    sleep 15
    if curl -fsS --max-time "$CURL_TIMEOUT" "$STATUS_URL" > "$status_file" 2>/dev/null; then
        log "app recovered after restart"
    else
        log "app still unavailable after restart — manual intervention required"
    fi
fi

# ── تنظيف التقارير القديمة (الاحتفاظ بآخر 48 تقرير) / Cleanup old reports ────
find "$REPORT_DIR" -name "status-*.json" -type f \
    | sort -r | tail -n +49 | xargs rm -f 2>/dev/null || true
