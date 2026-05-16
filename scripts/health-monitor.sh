#!/bin/bash
# شيخة — Health Monitoring Script
# مراقبة الخادم والتنبيه عند المشاكل

set -e

# 🎨 الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# ⚙️ الإعدادات
PM2_NAME="sheikha-main-portal"
PORT="${PORT:-8080}"
ALERT_EMAIL="${ALERT_EMAIL:-market@sheikha.top}"
HEALTH_CHECK_INTERVAL="${HEALTH_CHECK_INTERVAL:-60}"  # ثانية
MAX_MEMORY="${MAX_MEMORY:-1500}"  # MB
DISK_WARNING="${DISK_WARNING:-80}"  # %
DISK_CRITICAL="${DISK_CRITICAL:-90}"  # %

# 📊 متغيرات الحالة
ISSUES=0
WARNINGS=0

echo -e "${BLUE}🏥 شيخة — Health Monitoring${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1️⃣ فحص PM2 Process
echo -e "${YELLOW}✓ فحص PM2 Process...${NC}"
if pm2 status | grep -q "$PM2_NAME.*online"; then
    echo -e "${GREEN}✅ Process قيد التشغيل${NC}"
else
    echo -e "${RED}❌ Process توقف!${NC}"
    if pm2 restart "$PM2_NAME" >/dev/null 2>&1 && pm2 status | grep -q "$PM2_NAME.*online"; then
        echo -e "${YELLOW}⚠️ تم إصلاح الحالة تلقائيًا عبر إعادة التشغيل${NC}"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${RED}❌ فشل إصلاح العملية تلقائيًا${NC}"
        ISSUES=$((ISSUES + 1))
    fi
fi

# 2️⃣ فحص HTTP Health Check
echo -e "${YELLOW}✓ فحص HTTP Health Check...${NC}"
if curl -fsS --max-time 5 "http://localhost:$PORT/api/health" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ HTTP متجاوب${NC}"
else
    echo -e "${RED}❌ HTTP لا يستجيب!${NC}"
    ISSUES=$((ISSUES + 1))
fi

# 3️⃣ فحص الذاكرة
echo -e "${YELLOW}✓ فحص استهلاك الذاكرة...${NC}"
PM2_MEM=$(pm2 status | grep "$PM2_NAME" | awk '{gsub(/M/,"",$9); print int($9)}')
if [ "$PM2_MEM" -gt 0 ]; then
    if [ "$PM2_MEM" -gt "$MAX_MEMORY" ]; then
        echo -e "${RED}❌ استهلاك الذاكرة عالي: ${PM2_MEM}MB (الحد: ${MAX_MEMORY}MB)${NC}"
        ISSUES=$((ISSUES + 1))
    else
        echo -e "${GREEN}✅ الذاكرة طبيعية: ${PM2_MEM}MB${NC}"
    fi
fi

# 4️⃣ فحص مساحة القرص
echo -e "${YELLOW}✓ فحص مساحة القرص...${NC}"
DISK_USED=$(df / | awk 'NR==2 {gsub(/%/,"",$5); print int($5)}')
if [ "$DISK_USED" -ge "$DISK_CRITICAL" ]; then
    echo -e "${RED}❌ القرص ممتلئ: ${DISK_USED}% (الحد الحرج: ${DISK_CRITICAL}%)${NC}"
    ISSUES=$((ISSUES + 1))
elif [ "$DISK_USED" -ge "$DISK_WARNING" ]; then
    echo -e "${YELLOW}⚠️ تحذير: استهلاك القرص: ${DISK_USED}%${NC}"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✅ القرص بحالة جيدة: ${DISK_USED}%${NC}"
fi

# 5️⃣ فحص الذاكرة الكلية
echo -e "${YELLOW}✓ فحص الذاكرة الكلية...${NC}"
MEM_FREE=$(free -m | awk '/^Mem:/{print $7}')
echo -e "${BLUE}   الذاكرة المتاحة: ${MEM_FREE}MB${NC}"

# 6️⃣ فحص CPU Load
echo -e "${YELLOW}✓ فحص CPU Load...${NC}"
CPU_LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}')
echo -e "${BLUE}   CPU Load: ${CPU_LOAD}${NC}"

# 7️⃣ عرض آخر السجلات
echo -e "${YELLOW}✓ آخر 5 سطور من logs:${NC}"
pm2 logs "$PM2_NAME" --lines 5 --nostream 2>/dev/null | tail -5

# ✅ الملخص
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}📊 ملخص الفحص:${NC}"
echo -e "  🚨 المشاكل: ${RED}$ISSUES${NC}"
echo -e "  ⚠️ التحذيرات: ${YELLOW}$WARNINGS${NC}"

if [ "$ISSUES" -eq 0 ]; then
    echo -e "${GREEN}✅ الخادم بحالة جيدة!${NC}"
else
    echo -e "${RED}❌ هناك مشاكل تحتاج معالجة!${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}⏱️ الفحص التالي في: ${HEALTH_CHECK_INTERVAL} ثانية${NC}"
