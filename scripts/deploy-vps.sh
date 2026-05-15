#!/bin/bash
# شيخة — Deploy Script الآمن
# يقوم بسحب أحدث الكود ونشره على VPS بأمان

set -e  # توقف عند أي خطأ

# 🎨 الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ⚙️ الإعدادات
VPS_IP="${VPS_IP:-31.97.190.74}"
VPS_USER="${VPS_USER:-root}"
VPS_KEY="${VPS_KEY:-$HOME/.ssh/sheikha_vps}"
DEPLOY_PATH="/opt/sheikha/current"
BRANCH="${BRANCH:-main}"

echo -e "${BLUE}🚀 شيخة — Deploy Script${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1️⃣ التحقق من الإعدادات
echo -e "${YELLOW}✓ التحقق من الإعدادات...${NC}"

if [ ! -f "$VPS_KEY" ]; then
    echo -e "${RED}❌ خطأ: مفتاح SSH غير موجود${NC}"
    echo "   المسار المتوقع: $VPS_KEY"
    echo "   الحل: تأكد من إعداد المفتاح على الـ VPS أولاً"
    exit 1
fi

# 2️⃣ اختبر الاتصال بـ VPS
echo -e "${YELLOW}✓ اختبار الاتصال بـ VPS...${NC}"
if ! ssh -i "$VPS_KEY" -o ConnectTimeout=5 "$VPS_USER@$VPS_IP" "echo 'OK'" &>/dev/null; then
    echo -e "${RED}❌ خطأ: لا يمكن الاتصال بـ VPS${NC}"
    echo "   العنوان: $VPS_IP"
    exit 1
fi
echo -e "${GREEN}✓ متصل بـ VPS${NC}"

# 3️⃣ اختبر GitHub access
echo -e "${YELLOW}✓ اختبار GitHub access...${NC}"
if ! ssh -i "$VPS_KEY" "$VPS_USER@$VPS_IP" "ssh -T git@github.com 2>&1" | grep -q "successfully authenticated"; then
    echo -e "${RED}❌ خطأ: GitHub access غير متاح${NC}"
    exit 1
fi
echo -e "${GREEN}✓ GitHub access يعمل${NC}"

# 4️⃣ سحب أحدث الكود
echo -e "${YELLOW}✓ سحب أحدث الكود من الفرع: $BRANCH${NC}"
ssh -i "$VPS_KEY" "$VPS_USER@$VPS_IP" << DEPLOY_SCRIPT
    set -e
    cd $DEPLOY_PATH
    
    # إظهار الحالة الحالية
    echo "الفرع الحالي: \$(git branch --show-current)"
    echo "آخر commit: \$(git log -1 --oneline)"
    
    # التأكد من فرع صحيح
    git checkout $BRANCH 2>/dev/null || true
    
    # سحب الكود
    git config pull.rebase true
    git pull origin $BRANCH
    
    echo ""
    echo "آخر التحديثات:"
    git log --oneline -3
    
    echo ""
    git status
DEPLOY_SCRIPT

# 5️⃣ التحقق من النجاح
echo ""
echo -e "${GREEN}✅ النشر نجح!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${BLUE}ملاحظات:${NC}"
echo "1. تحقق من حالة الخادم: ssh root@$VPS_IP"
echo "2. اعرض logs: ssh root@$VPS_IP 'tail -f /var/log/sheikha/*.log'"
echo "3. أعد تشغيل الخادم: ssh root@$VPS_IP 'npm restart' (إذا لزم)"

echo ""
echo -e "${BLUE}الخادم متاح على: http://$VPS_IP:8080${NC}"
