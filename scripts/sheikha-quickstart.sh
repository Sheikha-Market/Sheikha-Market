#!/usr/bin/env bash

# بسم الله الرحمن الرحيم
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  🚀 SHEIKHA Distributed Platform — QUICK START                              ║
# ║                                                                              ║
# ║  مرة واحدة تشغيل يحول النظام من:                                           ║
# ║    ❌ Single Server → ✅ Enterprise Distributed Platform                    ║
# ╚══════════════════════════════════════════════════════════════════════════════╝

set -e

# الألوان
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

clear

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║         🌍 SHEIKHA DISTRIBUTED INFRASTRUCTURE SETUP               ║"
echo "║                                                                    ║"
echo "║  من مجرد سيرفر → إلى منصة عالمية موزعة                            ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# ─── خطوة 1: فحص المتطلبات ────────────────────────────────────────────────────
echo -e "${BLUE}📋 الخطوة 1: فحص المتطلبات${NC}"
echo ""

if [[ $EUID -ne 0 ]]; then
   echo -e "${YELLOW}⚠ هذا السكربت يتطلب صلاحيات root${NC}"
   echo "الرجاء تشغيله عبر: sudo bash"
   exit 1
fi

echo "✓ Running as root"

# ─── خطوة 2: اختيار المكونات ──────────────────────────────────────────────────
echo ""
echo -e "${BLUE}🎯 الخطوة 2: اختر المكونات المطلوبة${NC}"
echo ""
echo "الخيارات:"
echo "  1) HAProxy فقط"
echo "  2) Auto Scaling فقط"
echo "  3) DNS Failover فقط"
echo "  4) كل شيء (الموصى به)"
echo "  5) اختبار بدون تنفيذ (Dry Run)"
echo ""

read -p "اختر رقم الخيار (افتراضي: 4): " choice
choice=${choice:-4}

case $choice in
    1)
        echo "→ تثبيت HAProxy فقط"
        CMD_ARGS="--haproxy-only"
        ;;
    2)
        echo "→ تثبيت Auto Scaling فقط"
        CMD_ARGS="--autoscale-only"
        ;;
    3)
        echo "→ تثبيت DNS Failover فقط"
        CMD_ARGS="--dns-only"
        ;;
    4)
        echo "→ تثبيت كل المكونات"
        CMD_ARGS="--all"
        ;;
    5)
        echo "→ اختبار بدون تنفيذ"
        CMD_ARGS="--all --dry-run"
        ;;
    *)
        echo "خيار غير صحيح، استخدام الافتراضي (كل شيء)"
        CMD_ARGS="--all"
        ;;
esac

# ─── خطوة 3: السيرفر الثاني (اختياري) ───────────────────────────────────────────
echo ""
echo -e "${BLUE}🖥️  الخطوة 3: السيرفر الثاني (اختياري)${NC}"
echo ""
read -p "هل تريد تفعيل السيرفر الثاني؟ (y/n): " use_secondary
if [[ "$use_secondary" =~ ^[Yy]$ ]]; then
    read -p "أدخل IP السيرفر الثاني (مثال: 192.168.1.100): " secondary_ip
    if [[ -n "$secondary_ip" ]]; then
        CMD_ARGS="$CMD_ARGS --secondary-ip $secondary_ip"
        echo "✓ سيتم استخدام السيرفر الثاني: $secondary_ip"
    fi
else
    echo "✓ السيرفر الثاني معطل"
fi

# ─── خطوة 4: التأكيد ───────────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}📝 تأكيد المعاملات:${NC}"
echo ""
echo "الخيارات المختارة:"
echo "  $CMD_ARGS"
echo ""

if [[ "$CMD_ARGS" != *"--dry-run"* ]]; then
    read -p "تابع بالتثبيت؟ (y/n): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "تم الإلغاء"
        exit 0
    fi
fi

# ─── خطوة 5: التشغيل ───────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}🚀 الخطوة 4: تشغيل التثبيت${NC}"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SETUP_SCRIPT="$SCRIPT_DIR/sheikha-distribute-setup.sh"

if [[ ! -f "$SETUP_SCRIPT" ]]; then
    echo -e "${YELLOW}✗ لم يتم العثور على setup script${NC}"
    echo "البحث عن:"
    find / -name "sheikha-distribute-setup.sh" 2>/dev/null || true
    exit 1
fi

# نفّذ السكربت
bash "$SETUP_SCRIPT" $CMD_ARGS

# ─── خطوة 6: اختبار ────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}✅ الخطوة 5: الاختبار${NC}"
echo ""

# اختبر HAProxy
if systemctl is-active --quiet haproxy; then
    echo "✓ HAProxy: RUNNING"
    echo "  Stats Dashboard: http://localhost:8404/stats"
else
    echo "⚠ HAProxy: STOPPED"
fi

# اختبر Health Check
if systemctl is-active --quiet sheikha-haproxy-health.timer; then
    echo "✓ HAProxy Health Monitor: ACTIVE"
else
    echo "⚠ HAProxy Health Monitor: INACTIVE"
fi

# اختبر Auto Scaling
if systemctl is-active --quiet sheikha-autoscale.service; then
    echo "✓ Auto Scaling: ACTIVE"
else
    echo "⚠ Auto Scaling: INACTIVE"
fi

# اختبر DNS Failover
if systemctl is-active --quiet sheikha-dns-failover.service; then
    echo "✓ DNS Failover: ACTIVE"
else
    echo "⚠ DNS Failover: INACTIVE"
fi

# ─── خطوة 7: المعلومات المهمة ─────────────────────────────────────────────────
echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ التثبيت اكتمل بنجاح!${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}📌 معلومات مهمة:${NC}"
echo ""
echo "1. 📊 لوحة المراقبة:"
echo "   curl http://localhost:8404/stats"
echo ""
echo "2. 📝 السجلات:"
echo "   journalctl -u sheikha-haproxy-health -f"
echo "   journalctl -u sheikha-autoscale -f"
echo "   journalctl -u sheikha-dns-failover -f"
echo ""
echo "3. 🔧 الملفات المهمة:"
echo "   Config: /etc/haproxy/haproxy.cfg"
echo "   Scripts: $(dirname $SETUP_SCRIPT)"
echo "   Logs: $(dirname $SETUP_SCRIPT)/../logs"
echo ""
echo "4. 🌍 DNS Setup (Cloudflare):"
echo "   export CLOUDFLARE_API_KEY='your_key'"
echo "   export CLOUDFLARE_ZONE_ID='your_zone_id'"
echo ""
echo "5. 🧪 اختبر النظام:"
echo "   # Health Check"
echo "   curl http://localhost/api/health"
echo ""
echo "   # Load Test"
echo "   ab -n 1000 -c 100 http://localhost/api/health"
echo ""

echo -e "${YELLOW}📚 للمزيد من المعلومات:${NC}"
echo "  cat DISTRIBUTED-INFRASTRUCTURE.md"
echo "  cat DISTRIBUTED-ASSESSMENT.md"
echo ""

echo -e "${GREEN}🎉 أهلاً وسهلاً في عالم المنصات الموزعة!${NC}"
echo ""
