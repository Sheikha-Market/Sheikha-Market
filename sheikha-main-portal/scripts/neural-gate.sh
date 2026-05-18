#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# ══════════════════════════════════════════════════════════════════════════════
#  neural-gate.sh — بوابة الصحة العصبية الإلزامية
#  يتحقق من جاهزية جميع نقاط الشبكة العصبية الجذرية قبل أي نشر.
#  إذا فشل أي endpoint أساسي → يُغلق البوابة ويمنع النشر فوراً.
#
#  الاستخدام:
#    bash scripts/neural-gate.sh [BASE_URL] [MCP_URL] [IDE_URL]
#
#  أو عبر متغيرات البيئة:
#    SHEIKHA_BASE_URL=http://127.0.0.1:8080
#    SHEIKHA_MCP_URL=http://127.0.0.1:3001
#    SHEIKHA_IDE_URL=http://127.0.0.1:3002
#    SHEIKHA_GATE_TIMEOUT=10
#
#  خروج 0 = البوابة مفتوحة (النشر مسموح)
#  خروج 1 = البوابة مغلقة  (النشر محظور)
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

BASE="${1:-${SHEIKHA_BASE_URL:-http://127.0.0.1:8080}}"
MCP="${2:-${SHEIKHA_MCP_URL:-http://127.0.0.1:3001}}"
IDE="${3:-${SHEIKHA_IDE_URL:-http://127.0.0.1:3002}}"
TIMEOUT="${SHEIKHA_GATE_TIMEOUT:-10}"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; RESET='\033[0m'

PASS=0; FAIL=0
FAILED_ENDPOINTS=()

# ─── دالة الفحص ──────────────────────────────────────────────────────────────
gate_check() {
  local label="$1"
  local url="$2"
  local required="${3:-required}"           # required | optional
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url" 2>/dev/null || echo "000")
  if [[ "$code" == "200" ]]; then
    printf "  ${GREEN}✅ PASS${RESET}  [%-3s]  %-40s %s\n" "$code" "$label" "$url"
    PASS=$((PASS + 1))
  else
    if [[ "$required" == "optional" ]]; then
      printf "  ${YELLOW}⚠️  SKIP${RESET}  [%-3s]  %-40s %s  (اختياري)\n" "$code" "$label" "$url"
    else
      printf "  ${RED}❌ FAIL${RESET}  [%-3s]  %-40s %s\n" "$code" "$label" "$url"
      FAIL=$((FAIL + 1))
      FAILED_ENDPOINTS+=("$label → $url  [HTTP $code]")
    fi
  fi
}

# ─── رأس التقرير ─────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}║       SHEIKHA NEURAL GATE — بوابة الجذر العصبي الإلزامية        ║${RESET}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${RESET}"
echo -e "  BASE    : ${BASE}"
echo -e "  MCP/SDK : ${MCP}"
echo -e "  IDE     : ${IDE}"
echo -e "  وقت     : $(date '+%Y-%m-%d %H:%M:%S %Z')"
echo ""

# ── المجموعة ١: الصحة الأساسية ───────────────────────────────────────────────
echo -e "${CYAN}── ١) الصحة الأساسية ─────────────────────────────────────────────${RESET}"
gate_check "api/health"            "$BASE/api/health"
gate_check "api/network/live"      "$BASE/api/network/live"
gate_check "api/network/ready"     "$BASE/api/network/ready"

# ── المجموعة ٢: الشبكة العصبية الجذرية ──────────────────────────────────────
echo ""
echo -e "${CYAN}── ٢) الشبكة العصبية الجذرية ────────────────────────────────────${RESET}"
gate_check "api/neural-root/health"    "$BASE/api/neural-root/health"
gate_check "api/shl-neural/health"     "$BASE/api/shl-neural/health"
gate_check "api/master-ncn/health"     "$BASE/api/master-ncn/health"

# ── المجموعة ٣: السحابة والذكاء ──────────────────────────────────────────────
echo ""
echo -e "${CYAN}── ٣) السحابة والذكاء ───────────────────────────────────────────${RESET}"
gate_check "api/cloud/health"           "$BASE/api/cloud/health"
gate_check "api/cloud-neural"           "$BASE/api/cloud-neural"

# ── المجموعة ٤: MCP SDK / IDE ────────────────────────────────────────────────
echo ""
echo -e "${CYAN}── ٤) MCP SDK / IDE ──────────────────────────────────────────────${RESET}"
gate_check "sdk/health"                 "$MCP/sdk/health"
gate_check "ide/health"                 "$IDE/ide/health"

# ── المجموعة ٥: الحوكمة والتشغيل ────────────────────────────────────────────
echo ""
echo -e "${CYAN}── ٥) الحوكمة والتشغيل ──────────────────────────────────────────${RESET}"
gate_check "api/governance/health"          "$BASE/api/governance/health"
gate_check "api/sheikha-pipeline/health"    "$BASE/api/sheikha-pipeline/health"

# ── المجموعة ٦: الأمان والامتثال الشرعي (اختياري — تحذير فقط) ──────────────
echo ""
echo -e "${CYAN}── ٦) الأمان والامتثال الشرعي (اختياري) ────────────────────────${RESET}"
gate_check "api/protocol-events/health"   "$BASE/api/protocol-events/health"   "optional"
gate_check "api/realtime/health"          "$BASE/api/realtime/health"           "optional"
gate_check "api/memory/health"            "$BASE/api/memory/health"             "optional"

# ─── النتيجة النهائية ─────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}══════════════════════════════════════════════════════════════════${RESET}"
echo -e "  نجح : ${GREEN}${PASS}${RESET}  |  فشل : ${RED}${FAIL}${RESET}"
echo ""

if [[ "$FAIL" -eq 0 ]]; then
  echo -e "  ${GREEN}✅ البوابة مفتوحة — Gate PASSED — النشر مسموح${RESET}"
  echo ""
  exit 0
else
  echo -e "  ${RED}🚫 البوابة مغلقة — Gate BLOCKED — النشر محظور${RESET}"
  echo ""
  echo -e "  ${YELLOW}Endpoints الفاشلة (${FAIL}):${RESET}"
  for ep in "${FAILED_ENDPOINTS[@]}"; do
    echo -e "    ${RED}•${RESET} $ep"
  done
  echo ""
  echo -e "  ${YELLOW}الإجراء: أصلح هذه النقاط، تأكد من تشغيل الخادم، ثم أعد تشغيل البوابة.${RESET}"
  echo ""
  exit 1
fi
