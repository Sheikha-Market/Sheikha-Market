#!/bin/bash
# بِسْمِ اللَّهِ — نظام حماية الهارديسك — شيخة
# حد الخطر: 85% | حد الطوارئ: 92%
WORKSPACE="/workspaces/sheikha/sheikha-main-portal"
LOG_DIR="$WORKSPACE/logs"
BACKUP_DIR="$WORKSPACE/runtime/backups"
TMP_DIR="/tmp"
WARN_PCT=85; CRIT_PCT=92

get_usage(){ df "$1" 2>/dev/null | awk 'NR==2{gsub(/%/,"",$5); print $5}'; }
safe_log(){ echo "[$(date '+%Y-%m-%d %H:%M')] $1" >> "$LOG_DIR/disk-guardian.log" 2>/dev/null; }

check_and_clean(){
    USAGE=$(get_usage "/workspaces")
    safe_log "فحص القرص: ${USAGE}% مستخدم"
    echo "📊 القرص: ${USAGE}% مستخدم"

    if [ "$USAGE" -ge "$CRIT_PCT" ]; then
        safe_log "🚨 طوارئ! ${USAGE}% — تنظيف فوري"
        # حذف build archives القديمة
        find "$TMP_DIR" -name "build_archive_*.tar.gz" -delete 2>/dev/null && safe_log "✅ حذف ACR build archives"
        # تقليص السجلات الكبيرة (> 100MB)
        find "$LOG_DIR" -name "*.log" -size +100M 2>/dev/null | while read f; do
            tail -1000 "$f" > "${f}.tmp" && mv "${f}.tmp" "$f" && safe_log "✅ تقليص: $f"
        done
        # حذف npm cache قديم
        npm cache clean --force 2>/dev/null && safe_log "✅ تنظيف npm cache"
    elif [ "$USAGE" -ge "$WARN_PCT" ]; then
        safe_log "⚠️ تحذير! ${USAGE}% — تنظيف استباقي"
        find "$TMP_DIR" -name "build_archive_*.tar.gz" -mtime +1 -delete 2>/dev/null
        find "$LOG_DIR" -name "*.log" -size +50M 2>/dev/null | while read f; do
            tail -2000 "$f" > "${f}.tmp" && mv "${f}.tmp" "$f"
        done
    fi

    # ضغط النسخ الاحتياطية القديمة (> 7 أيام)
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 2>/dev/null | while read f; do
        NEW="${f%.tar.gz}.xz.gz"
        gzip -9 "$f" 2>/dev/null && safe_log "✅ ضغط: $f"
    done

    # تقرير المساحة
    safe_log "المساحة المتاحة: $(df -h /workspaces | awk 'NR==2{print $4}') | تم تشغيل: disk-guardian"
    echo "✅ تم الفحص — المتاح: $(df -h /workspaces | awk 'NR==2{print $4}')"
}

case "${1:-check}" in
    check) check_and_clean ;;
    status) USAGE=$(get_usage "/workspaces"); echo "📊 ${USAGE}% | المتاح: $(df -h /workspaces | awk 'NR==2{print $4}')" ;;
    *) echo "الاستخدام: $0 [check|status]" ;;
esac
