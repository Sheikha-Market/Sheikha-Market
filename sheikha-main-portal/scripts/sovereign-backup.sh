#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════
# 💾  سكربت النسخ الاحتياطي السيادي — سوق شيخة
#     «لا ضرر ولا ضرار» — نسخ احتياطية محلية بدون cloud
#     التشغيل:  bash scripts/sovereign-backup.sh
#     npm:      npm run sovereign:backup
# ══════════════════════════════════════════════════════════════════

set -euo pipefail

# ─── إعدادات ────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# مجلد النسخ الاحتياطية — خارج المشروع في المجلد الرئيسي للمستخدم
BACKUP_ROOT="${SHEIKHA_BACKUP_DIR:-$HOME/sheikha-backups}"

# عدد النسخ الاحتياطية التي يتم الاحتفاظ بها (افتراضي: 14 نسخة)
KEEP_BACKUPS="${SHEIKHA_BACKUP_KEEP:-14}"

# التاريخ والوقت
TIMESTAMP="$(date '+%Y-%m-%d_%H-%M-%S')"
BACKUP_NAME="sheikha-data_${TIMESTAMP}"
BACKUP_DIR="${BACKUP_ROOT}/${BACKUP_NAME}"

# ─── التحقق من وجود مجلد data/ ─────────────────────────────────
DATA_DIR="${PROJECT_DIR}/data"
if [ ! -d "$DATA_DIR" ]; then
    echo "⚠️  مجلد data/ غير موجود في: $DATA_DIR"
    echo "   لا توجد بيانات للنسخ الاحتياطي."
    exit 0
fi

# ─── إنشاء مجلد النسخ الاحتياطية ──────────────────────────────
mkdir -p "$BACKUP_ROOT"

echo "══════════════════════════════════════════════"
echo "💾  سوق شيخة — النسخ الاحتياطي السيادي"
echo "══════════════════════════════════════════════"
echo "📂  المصدر:      $DATA_DIR"
echo "📦  الوجهة:      $BACKUP_DIR"
echo "🕐  التوقيت:     $TIMESTAMP"
echo ""

# ─── نسخ ملفات data/ ────────────────────────────────────────────
cp -r "$DATA_DIR" "$BACKUP_DIR"

# حساب حجم النسخة
BACKUP_SIZE="$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)"
FILE_COUNT="$(find "$BACKUP_DIR" -type f | wc -l | tr -d ' ')"

echo "✅  تم النسخ الاحتياطي بنجاح"
echo "   📊  عدد الملفات: ${FILE_COUNT}"
echo "   💿  الحجم:       ${BACKUP_SIZE}"

# ─── إنشاء ملف معلومات النسخة ──────────────────────────────────
cat > "${BACKUP_DIR}/.backup-info.json" <<EOF
{
  "project": "Sheikha Market",
  "timestamp": "${TIMESTAMP}",
  "sourceDir": "${DATA_DIR}",
  "fileCount": ${FILE_COUNT},
  "size": "${BACKUP_SIZE}",
  "hostname": "$(hostname)",
  "nodeVersion": "$(node -v 2>/dev/null || echo 'N/A')",
  "principle": "لا ضرر ولا ضرار"
}
EOF

# ─── حذف النسخ القديمة (الاحتفاظ بـ KEEP_BACKUPS نسخة) ─────────
TOTAL_BACKUPS="$(find "$BACKUP_ROOT" -maxdepth 1 -type d -name 'sheikha-data_*' | wc -l | tr -d ' ')"

if [ "$TOTAL_BACKUPS" -gt "$KEEP_BACKUPS" ]; then
    echo ""
    echo "🧹  حذف النسخ القديمة (الاحتفاظ بـ ${KEEP_BACKUPS} نسخة)..."
    find "$BACKUP_ROOT" -maxdepth 1 -type d -name 'sheikha-data_*' \
        | sort \
        | head -n "$(( TOTAL_BACKUPS - KEEP_BACKUPS ))" \
        | while read -r old_backup; do
            echo "   🗑️   حذف: $(basename "$old_backup")"
            rm -rf "$old_backup"
        done
fi

# ─── ملخص النسخ الاحتياطية الموجودة ───────────────────────────
echo ""
echo "📋  النسخ الاحتياطية المحفوظة:"
find "$BACKUP_ROOT" -maxdepth 1 -type d -name 'sheikha-data_*' \
    | sort -r \
    | while read -r b; do
        SIZE="$(du -sh "$b" 2>/dev/null | cut -f1)"
        echo "   ✓  $(basename "$b")  (${SIZE})"
    done

echo ""
echo "══════════════════════════════════════════════"
echo "✅  النسخ الاحتياطي مكتمل"
echo "   مجلد النسخ: $BACKUP_ROOT"
echo "══════════════════════════════════════════════"
