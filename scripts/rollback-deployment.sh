#!/bin/bash
# شيخة — Rollback Script
# استرجاع نسخة قديمة في حالة فشل النشر

set -e

# 🎨 الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ⚙️ الإعدادات
BACKUP_DIR="${BACKUP_DIR:-/opt/sheikha/backups}"
DEPLOY_PATH="/opt/sheikha/current"
PM2_NAME="sheikha-main-portal"
GIT_BRANCH="${GIT_BRANCH:-main}"

echo -e "${RED}⚠️ شيخة — Rollback Script${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1️⃣ تحديد آخر backup
echo -e "${YELLOW}✓ البحث عن آخر backup...${NC}"
LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/sheikha_backup_*.tar.gz 2>/dev/null | head -1)

if [ -z "$LATEST_BACKUP" ]; then
    echo -e "${RED}❌ لا توجد نسخ احتياطية!${NC}"
    exit 1
fi

echo -e "${YELLOW}آخر backup: $LATEST_BACKUP${NC}"
read -p "تأكد من الاسترجاع من هذه النسخة؟ (yes/no): " confirm
[ "$confirm" != "yes" ] && exit 0

# 2️⃣ إيقاف الخادم
echo -e "${YELLOW}✓ إيقاف الخادم...${NC}"
pm2 stop "$PM2_NAME" 2>/dev/null || true
sleep 2

# 3️⃣ إعادة تعيين الملفات
echo -e "${YELLOW}✓ استرجاع الملفات من backup...${NC}"
cd "$DEPLOY_PATH"
git reset --hard HEAD
tar -xzf "$LATEST_BACKUP" -C . 2>/dev/null || true

# 4️⃣ إعادة تشغيل الخادم
echo -e "${YELLOW}✓ إعادة تشغيل الخادم...${NC}"
pm2 restart "$PM2_NAME"
sleep 5

# 5️⃣ التحقق من الصحة
echo -e "${YELLOW}✓ فحص الصحة...${NC}"
if curl -fsS --max-time 10 http://localhost:8080/api/health >/dev/null; then
    echo -e "${GREEN}✅ Rollback نجح! الخادم يعمل${NC}"
else
    echo -e "${RED}❌ الخادم لا يستجيب بعد الاسترجاع${NC}"
    pm2 logs "$PM2_NAME" --lines 30 --nostream
    exit 1
fi

# 6️⃣ عرض الحالة
echo ""
echo -e "${GREEN}✅ Rollback اكتمل بنجاح!${NC}"
echo -e "${BLUE}📝 استُرجع من: $LATEST_BACKUP${NC}"
git log --oneline -1
pm2 status | grep "$PM2_NAME"
