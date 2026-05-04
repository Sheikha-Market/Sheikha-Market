#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  SHEIKHA CELLULAR GRID NETWORK — اختبار الشبكة العصبية للمنافذ              ║
# ║                                                                              ║
# ║  يتحقق من:                                                                  ║
# ║  1) الخادم مربوط على 0.0.0.0 (كل الواجهات) للمنفذين 8080 و8081            ║
# ║  2) HTTP 200 على 127.0.0.1:8080  و  127.0.0.1:8081  (loopback)             ║
# ║  3) HTTP 200 على <IP الجهاز>:8080  و  <IP الجهاز>:8081  (شبكة حقيقية)     ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# الاستخدام: bash scripts/test-cellular-grid.sh [--wait]
#   --wait : ينتظر حتى 30 ثانية ريثما يرتفع الخادم قبل الاختبار
#
# ملاحظة: 0.0.0.0 هو عنوان ربط (bind address) وليس عنوان وصول.
# الاختبار الصحيح دائماً يكون عبر 127.0.0.1 أو IP الجهاز/السيرفر الفعلي.

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

# ── اكتشاف IP الجهاز الفعلي (أول IP غير-loopback) ──────────────────────────
_detect_machine_ip() {
    # جرّب ip أولاً (Linux)، ثم ifconfig (macOS/BSD)
    local ip=""
    ip=$(ip -4 addr show scope global 2>/dev/null \
         | awk '/inet /{print $2}' | cut -d/ -f1 | head -1) || true
    if [[ -z "$ip" ]]; then
        ip=$(ifconfig 2>/dev/null \
             | awk '/inet /{print $2}' | grep -v '127\.' | head -1) || true
    fi
    echo "${ip:-}"
}
MACHINE_IP=$(_detect_machine_ip)

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

# ── انتظار ارتفاع خادم على عنوان معين ────────────────────────────────────────
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

# ── اختبار HTTP على عنوان + منفذ ─────────────────────────────────────────────
test_http() {
    local label="$1" addr="$2" port="$3" path="${4:-/api/health}"
    local url="http://${addr}:${port}${path}"
    local http_code
    http_code=$(curl -s -o /dev/null -w "%{http_code}" \
        --connect-timeout "${TIMEOUT}" --max-time "${TIMEOUT}" \
        "$url" 2>/dev/null) || http_code="000"

    if [[ "$http_code" == "200" ]]; then
        pass "${label}  ${addr}:${port}${path} → ${http_code}"
    else
        fail "${label}  ${addr}:${port}${path} → ${http_code}  (توقعنا 200)"
    fi
}

# ── التحقق من عنوان الربط عبر ss / netstat ───────────────────────────────────
test_bind_address() {
    local port="$1" expected_bind="$2"
    local found=""

    if command -v ss > /dev/null 2>&1; then
        found=$(ss -tlnp 2>/dev/null | awk -v p=":${port}" '$4 ~ p {print $4}' | head -1)
    elif command -v netstat > /dev/null 2>&1; then
        found=$(netstat -tlnp 2>/dev/null | awk -v p=":${port}" '$4 ~ p {print $4}' | head -1)
    fi

    if [[ -z "$found" ]]; then
        skip "bind-check :${port}  (ss/netstat غير متاح أو المنفذ غير مفتوح)"
        return
    fi

    if echo "$found" | grep -q "^${expected_bind}:"; then
        pass "bind-check :${port}  مربوط على ${found}"
    else
        fail "bind-check :${port}  وجدنا '${found}' — توقعنا الربط على ${expected_bind}:${port}"
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
info "عنوان الجهاز المكتشف / Machine IP : ${MACHINE_IP:-«غير متاح»}"
info "0.0.0.0 = عنوان ربط فقط — الاختبار يجري على 127.0.0.1 وعلى IP الجهاز"
echo ""

# ── انتظار الخادم إن طُلب ────────────────────────────────────────────────────
if (( WAIT_MODE )); then
    info "وضع الانتظار: ننتظر ارتفاع الخادمين قبل الاختبار..."
    wait_for_server "127.0.0.1" "8080" || true
    wait_for_server "127.0.0.1" "8081" || true
    echo ""
fi

# ═══════════════════════════════════════════════════════════════════════════════
# ① التحقق من عنوان الربط — يجب أن يكون 0.0.0.0
# ═══════════════════════════════════════════════════════════════════════════════
sep
echo -e "${YELLOW}🔗 التحقق من عنوان الربط (يجب أن يكون 0.0.0.0)${NC}"
sep
test_bind_address "8080" "0.0.0.0"
test_bind_address "8081" "0.0.0.0"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# ② اختبار HTTP — Loopback (127.0.0.1)
# ═══════════════════════════════════════════════════════════════════════════════
sep
echo -e "${YELLOW}🔵 Loopback (127.0.0.1)${NC}"
sep
test_http "[loopback]" "127.0.0.1" "8080" "/api/health"
test_http "[loopback]" "127.0.0.1" "8081" "/api/health"
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# ③ اختبار HTTP — IP الجهاز الفعلي (الشبكة الحقيقية)
# ═══════════════════════════════════════════════════════════════════════════════
sep
echo -e "${YELLOW}🌐 IP الجهاز / Machine IP (${MACHINE_IP:-«غير متاح»})${NC}"
sep
if [[ -n "$MACHINE_IP" ]]; then
    test_http "[machine-ip]" "$MACHINE_IP" "8080" "/api/health"
    test_http "[machine-ip]" "$MACHINE_IP" "8081" "/api/health"
else
    skip "[machine-ip] :8080  (لم يُكتشف IP الجهاز)"
    skip "[machine-ip] :8081  (لم يُكتشف IP الجهاز)"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════════
# ملخص
# ═══════════════════════════════════════════════════════════════════════════════
sep
TOTAL=$(( PASS + FAIL + SKIP ))
echo -e "${BLUE}📊 النتائج النهائية / Final Results${NC}"
echo -e "   اختبارات ناجحة  / Passed  : ${GREEN}${PASS}${NC} / ${TOTAL}"
echo -e "   اختبارات فاشلة  / Failed  : ${RED}${FAIL}${NC} / ${TOTAL}"
[[ "$SKIP" -gt 0 ]] && \
echo -e "   اختبارات متخطّاة / Skipped : ${YELLOW}${SKIP}${NC} / ${TOTAL}"
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
