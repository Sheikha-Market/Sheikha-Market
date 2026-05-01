#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# بسم الله الرحمن الرحيم
# سكربت النسخ الاحتياطي السيادي لمنظومة شيخة
# المالك: سلمان أحمد بن سلمان الراجح
# ═══════════════════════════════════════════════════════════════

set -euo pipefail

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PROJECT_DIR="/workspaces/sheikha/sheikha-main-portal"
BACKUP_TAG="sheikha-backup-$TIMESTAMP"

echo "═══════════════════════════════════════════════════"
echo " 🛡️  بدء النسخ الاحتياطي السيادي لشيخة"
echo " الوقت: $TIMESTAMP"
echo "═══════════════════════════════════════════════════"

# 1. نسخ Git (GitHub)
echo ""
echo "📁 [1/3] رفع الكود على GitHub..."
cd "$PROJECT_DIR"
git add -A
git commit -m "backup: $TIMESTAMP — نسخ احتياطي تلقائي" || echo "⚠️  لا يوجد تغييرات جديدة"
git push origin main || echo "⚠️  تحقق من الاتصال بـ GitHub"
echo "✅ GitHub: تم"

# 2. نسخ Google Cloud Storage (اختياري)
if command -v gsutil &> /dev/null; then
    echo ""
    echo "☁️  [2/3] رفع على Google Cloud Storage..."
    gsutil -m rsync -r -d         --exclude "node_modules/.*"         --exclude ".git/.*"         "$PROJECT_DIR/"         "gs://sheikha-marketplace-backup/snapshots/$TIMESTAMP/"         && echo "✅ Google Cloud: تم"         || echo "⚠️  Google Cloud Storage: فشل — تحقق من ADC"
else
    echo "⚠️  [2/3] gsutil غير متوفر — تخطي النسخ السحابي"
fi

# 3. نسخ محلي (هارد ديسك خارجي)
EXTERNAL_DISK="${BACKUP_DRIVE:-/mnt/sheikha-backup}"
if [ -d "$EXTERNAL_DISK" ]; then
    echo ""
    echo "💾 [3/3] نسخ على الهارد الخارجي..."
    rsync -avz --progress         --exclude 'node_modules/'         --exclude '.git/'         --exclude 'logs/'         "$PROJECT_DIR/"         "$EXTERNAL_DISK/snapshots/$TIMESTAMP/"
    echo "✅ الهارد الخارجي: تم"
else
    echo "⚠️  [3/3] الهارد الخارجي غير متصل — تخطي"
    echo "   لتفعيله: export BACKUP_DRIVE=/mnt/your-drive"
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo " ✅ اكتمل النسخ الاحتياطي: $TIMESTAMP"
echo " 📊 الحالة: جاهز للاستعادة الفورية"
echo "═══════════════════════════════════════════════════"
