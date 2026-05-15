#!/bin/bash
# شيخة — Backup Script
# ينسخ قاعدة البيانات والإعدادات قبل النشر

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
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
BACKUP_FILE="$BACKUP_DIR/sheikha_backup_${TIMESTAMP}.tar.gz"

echo -e "${BLUE}💾 شيخة — Backup Script${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1️⃣ إنشاء مجلد backup
mkdir -p "$BACKUP_DIR"
echo -e "${YELLOW}✓ مجلد backup جاهز: $BACKUP_DIR${NC}"

# 2️⃣ النسخ الاحتياطية المهمة
echo -e "${YELLOW}✓ نسخ ملفات حرجة...${NC}"

BACKUP_PATHS=(
    "data/"
    ".env"
    "config/database.js"
    "config/config.js"
    "package.json"
    "server.js"
)

# 3️⃣ إنشاء archive
cd "$DEPLOY_PATH"
tar -czf "$BACKUP_FILE" \
    $(for path in "${BACKUP_PATHS[@]}"; do
        if [ -e "$path" ]; then
            echo "$path"
        fi
    done) 2>/dev/null || true

if [ -f "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✅ Backup created: $BACKUP_FILE ($SIZE)${NC}"
else
    echo -e "${RED}❌ فشل إنشاء backup${NC}"
    exit 1
fi

# 4️⃣ تنظيف النسخ القديمة
echo -e "${YELLOW}✓ تنظيف النسخ القديمة (أقدم من $RETENTION_DAYS يام)...${NC}"
find "$BACKUP_DIR" -name "sheikha_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# 5️⃣ عرض النسخ الحالية
echo -e "${YELLOW}✓ النسخ الاحتياطية الحالية:${NC}"
ls -lh "$BACKUP_DIR"/sheikha_backup_*.tar.gz 2>/dev/null | tail -5

echo ""
echo -e "${GREEN}✅ Backup اكتمل بنجاح!${NC}"
echo -e "${BLUE}📝 الملف: $BACKUP_FILE${NC}"
echo -e "${BLUE}📊 الحجم: $SIZE${NC}"
