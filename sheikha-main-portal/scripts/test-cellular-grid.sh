#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  SHEIKHA CELLULAR GRID NETWORK — اختبار الشبكة العصبية للمنافذ              ║
# ║                                                                              ║
# ║  يتحقق من أن الخادم يستمع على 0.0.0.0 للمنفذين 8080 و8081،                ║
# ║  ويُعيد HTTP 200 من كلا العنوانين: 127.0.0.1 و 0.0.0.0                    ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# الاستخدام: bash scripts/test-cellular-grid.sh [--wait]
#   --wait : ينتظر حتى 30 ثانية ريثما يرتفع الخادم قبل الاختبار
#
# ملاحظة بشأن اختبارات 0.0.0.0:
#   عندما يُقيّد الخادم على 0.0.0.0 (كل الواجهات)، يُسمح لنواة Linux
#   بتوجيه اتصال العميل على 0.0.0.0 إلى الحلقة الرجعية تلقائياً.
#   إذا كان هذا السلوك غير متاح على النظام الحالي، يُتخطّى الاختبار
#   تلقائياً ويُرسَل تحذير بدلاً من تسجيل فشل.

set -euo pipefail

# ── ألوان ──────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ── ثوابت ─────────────────────────────────────────────────────────────────────
TIMEOUT=5          # ثوانٍ لكل طلب cURL
MAX_WAIT=30        # أقصى انتظار لارتفاع الخادم (ثانية)
WAIT_MODE=0
PASS=0
FAIL=0
SKIP=0

# Arithmetic helpers that never return a failing exit code
inc_pass() { PASS=$((PASS + 1)); }
inc_fail() { FAIL=$((FAIL + 1)); }
inc_skip() { SKIP=$((SKIP + 1)); }

# ── فحص: هل 0.0.0.0 قابل للوصول كعنوان وجهة على هذا النظام؟ ─────────────────
# على Linux: نواة الكرنل تُرسل 0.0.0.0 إلى الحلقة الرجعية (127.0.0.1).
# على macOS / Windows WSL2: قد لا يعمل هذا.
ZERO_ZERO_REACHABLE=0
if python3 -c "
import socket, threading, time
srv = socket.socket(); srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
srv.bind(('0.0.0.0', 19877)); srv.listen(1)
def a():
    try: conn,_=srv.accept(); conn.sendall(b'OK'); conn.close()
    except: pass
threading.Thread(target=a, daemon=True).start()
time.sleep(0.05)
s = socket.socket(); s.settimeout(1)
try: s.connect(('0.0.0.0', 19877)); s.recv(4); print('yes')
except: print('no')
finally: s.close(); srv.close()
" 2>/dev/null | grep -q "yes"; then
    ZERO_ZERO_REACHABLE=1
fi

# ── معالجة المعاملات ──────────────────────────────────────────────────────────
for arg in "$@"; do
    [[ "$arg" == "--wait" ]] && WAIT_MODE=1
done

# ── دوال مساعدة ───────────────────────────────────────────────────────────────
pass()  { echo -e "${GREEN}✅ PASS${NC}  $*"; inc_pass; }
fail()  { echo -e "${RED}❌ FAIL${NC}  $*"; inc_fail; }
skip()  { echo -e "${YELLOW}⏭  SKIP${NC}  $*"; inc_skip; }
info()  { echo -e "${BLUE}ℹ  ${NC}$*"; }
warn()  { echo -e "${YELLOW}⚠  ${NC}$*"; }
sep()   { echo -e "${BLUE}────────────────────────────────────────${NC}"; }

# ── انتظار ارتفاع خادم على عنوان معين ──────────────────────────────────────
wait_for_server() {
    local addr="$1" port="$2" elapsed=0
    while ! curl -s --connect-timeout 1 "http://${addr}:${port}/" > /dev/null 2>&1; do
        if (( elapsed >= MAX_WAIT )); then
            warn "الخادم لم يستجب على ${addr}:${port} خلال ${MAX_WAIT}ث"
            return 1
        fi
        sleep 2; elapsed=$((elapsed + 2))
        info "انتظار ${addr}:${port}… (${elapsed}/${MAX_WAIT}ث)"
    done
    info "الخادم جاهز على ${addr}:${port}"
}

# ── اختبار عنوان + منفذ ───────────────────────────────────────────────────────
test_endpoint() {
    local addr="$1" port="$2" path="${3:-/api/health}"
    local url="http://${addr}:${port}${path}"

    # تخطّى اختبارات 0.0.0.0 إذا كان غير قابل للوصول على هذا النظام
    if [[ "$addr" == "0.0.0.0" && "$ZERO_ZERO_REACHABLE" -eq 0 ]]; then
        skip "${addr}:${port}${path}  (0.0.0.0 غير قابل للوصول كعنوان وجهة على هذا النظام)"
        return
    fi

    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" \
        --connect-timeout "${TIMEOUT}" --max-time "${TIMEOUT}" \
        "$url" 2>/dev/null) || http_code="000"

    if [[ "$http_code" == "200" ]]; then
        pass "${addr}:${port}${path} → ${http_code}"
    else
        fail "${addr}:${port}${path} → ${http_code}  (توقعنا 200)"
    fi
}

# ═══════════════════════════════════════════════════════════════════════════════
# البداية
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🧠 شيخة — اختبار شبكة الخلايا العصبية الجذرية             ║${NC}"
echo -e "${BLUE}║   Sheikha Radical Neural Cellular Grid — Port Test Suite     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [[ "$ZERO_ZERO_REACHABLE" -eq 1 ]]; then
    info "اكتشاف النظام: 0.0.0.0 قابل للوصول كعنوان وجهة (Linux kernel routing)"
else
    warn "اكتشاف النظام: 0.0.0.0 كعنوان وجهة غير مدعوم — ستُتخطّى اختباراته"
fi
echo ""

# ── انتظار الخادم إن طُلب ────────────────────────────────────────────────────
if (( WAIT_MODE )); then
    info "وضع الانتظار: ننتظر ارتفاع الخادمين قبل الاختبار..."
    wait_for_server "127.0.0.1" "8080" || true
    wait_for_server "127.0.0.1" "8081" || true
    echo ""
fi

# ═══════════════════════════════════════════════════════════════════════════════
# اختبار المنفذ 8080 — الخادم الرئيسي
# ═══════════════════════════════════════════════════════════════════════════════
sep
echo -e "${YELLOW}🔵 المنفذ 8080 — الخادم الرئيسي (MAIN CELL)${NC}"
sep
test_endpoint "127.0.0.1" "8080" "/api/health"
test_endpoint "0.0.0.0"   "8080" "/api/health"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# اختبار المنفذ 8081 — بوابة الأسواق (MARKETPLACE CELL)
# ═══════════════════════════════════════════════════════════════════════════════
sep
echo -e "${YELLOW}🟢 المنفذ 8081 — بوابة الأسواق الجامع (MARKETPLACE CELL)${NC}"
sep
test_endpoint "127.0.0.1" "8081" "/api/health"
test_endpoint "0.0.0.0"   "8081" "/api/health"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# ملخص
# ═══════════════════════════════════════════════════════════════════════════════
sep
TOTAL=$(( PASS + FAIL + SKIP ))
echo -e "${BLUE}📊 النتائج النهائية / Final Results${NC}"
echo -e "   اختبارات ناجحة / Passed  : ${GREEN}${PASS}${NC} / ${TOTAL}"
echo -e "   اختبارات فاشلة / Failed  : ${RED}${FAIL}${NC} / ${TOTAL}"
[[ "$SKIP" -gt 0 ]] && echo -e "   اختبارات متخطّاة / Skipped: ${YELLOW}${SKIP}${NC} / ${TOTAL}"
sep
echo ""

if (( FAIL == 0 )); then
    echo -e "${GREEN}🏆 جميع الاختبارات نجحت — الشبكة العصبية الجذرية تعمل بالكامل${NC}"
    echo -e "${GREEN}   All tests passed — Radical Neural Grid fully operational${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}⚠️  ${FAIL} اختبار(ات) فشلت — تحقق من تشغيل الخادم:${NC}"
    echo -e "   npm start"
    echo ""
    exit 1
fi
