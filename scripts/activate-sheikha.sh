#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# ══════════════════════════════════════════════════════════════════════
# activate-sheikha.sh — الحاكم الأعلى لمنظومة شيخة
# ══════════════════════════════════════════════════════════════════════
# الاستخدام:
#   bash scripts/activate-sheikha.sh [--mode stable|power|auto] [--plan|--apply]
#
# الأوضاع:
#   stable  → تشغيل آمن + health-check (ultimate-stable)
#   power   → تشغيل كامل AI/CUDA (full-power)
#   auto    → يقرر تلقائياً بناءً على حمل CPU
#
# الأعلام:
#   --plan  → يعرض ما سيحدث دون تنفيذ
#   --apply → ينفّذ (الافتراضي)
#
# قاعدة: لا تشغيل إلا عبر هذا الحاكم.
# ══════════════════════════════════════════════════════════════════════
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="$ROOT_DIR/scripts"
cd "$ROOT_DIR"

# ── ألوان ──────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'
RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'
log()  { echo -e "${CYAN}[sheikha-control]${RESET} $*"; }
ok()   { echo -e "${GREEN}✅${RESET} $*"; }
warn() { echo -e "${YELLOW}⚠️ ${RESET} $*"; }
err()  { echo -e "${RED}❌${RESET} $*"; }

# ── قراءة المعاملات ────────────────────────────────────────────────────
MODE="auto"
ACTION="apply"

while [[ $# -gt 0 ]]; do
	case "$1" in
		--mode)
			[[ -n "${2:-}" ]] || { err "--mode يحتاج قيمة: stable|power|auto"; exit 1; }
			MODE="$2"; shift 2 ;;
		--plan)   ACTION="plan";  shift ;;
		--apply)  ACTION="apply"; shift ;;
		stable|power|auto) MODE="$1"; shift ;;
		*)
			err "خيار غير معروف: $1"
			echo "الاستخدام: $0 [--mode stable|power|auto] [--plan|--apply]"
			exit 1 ;;
	esac
done

# ── وضع plan: عرض فقط بدون تنفيذ ─────────────────────────────────────
if [[ "$ACTION" == "plan" ]]; then
	echo -e "${BOLD}==> [Sheikha] خطة التفعيل (بدون تنفيذ)${RESET}"
	echo "    الوضع المطلوب : $MODE"
	case "$MODE" in
		power)
			echo "    السكربت      : activate-sheikha-full-power.sh"
			echo "    الطبقات      : AI + CUDA + GPU + Nsight + API-verify"
			;;
		stable)
			echo "    السكربت      : activate-sheikha-ultimate-stable.sh"
			echo "    الطبقات      : PM2-restart + حارس الملكية + health-check loop"
			;;
		auto)
			CPU=$(top -bn1 2>/dev/null | grep -i "cpu\|Cpu" | head -1 \
				| awk '{for(i=1;i<=NF;i++) if($i~/^[0-9]/) {print int($i); exit}}' || echo 0)
			if [[ "${CPU:-0}" -gt 70 ]]; then
				echo "    CPU=${CPU}% (> 70%) → سيختار: stable"
			else
				echo "    CPU=${CPU}% (≤ 70%) → سيختار: power"
			fi
			;;
	esac
	echo "    لتنفيذ الخطة : $0 --mode $MODE --apply"
	exit 0
fi

# ── وضع apply: التنفيذ الفعلي ─────────────────────────────────────────
echo -e "${BOLD}بسم الله الرحمن الرحيم — الحاكم الأعلى لمنظومة شيخة${RESET}"
log "الوضع: $MODE | الإجراء: $ACTION"

# تصدير علامة الحاكم حتى تعرف السكربتات الفرعية أنها مُستدعاة بشكل صحيح
export SHEIKHA_GOVERNOR=1

# ── auto: قرار تلقائي بناءً على CPU ──────────────────────────────────
if [[ "$MODE" == "auto" ]]; then
	CPU=$(top -bn1 2>/dev/null | grep -i "cpu\|Cpu" | head -1 \
		| awk '{for(i=1;i<=NF;i++) if($i~/^[0-9]/) {print int($i); exit}}' || echo 0)
	if [[ "${CPU:-0}" -gt 70 ]]; then
		warn "CPU=${CPU}% (> 70%) → التحويل إلى الوضع المستقر"
		MODE="stable"
	else
		log "CPU=${CPU}% (≤ 70%) → التحويل إلى القوة الكاملة"
		MODE="power"
	fi
fi

# ── تفويض التشغيل للسكربت المختص ──────────────────────────────────────
case "$MODE" in
	power)
		log "تفعيل القوة الكاملة (AI + CUDA + GPU)"
		bash "$SCRIPT_DIR/activate-sheikha-full-power.sh"
		;;
	stable)
		log "تفعيل الوضع المستقر (PM2 + health-check)"
		bash "$SCRIPT_DIR/activate-sheikha-ultimate-stable.sh"
		;;
	*)
		err "وضع غير معروف: $MODE"
		echo "الأوضاع المتاحة: stable | power | auto"
		exit 1
		;;
esac

# ── smoke test إجباري بعد كل تفعيل ───────────────────────────────────
log "Smoke test إجباري..."
_PORT="${PORT:-8080}"
_SMOKE_URL="http://127.0.0.1:${_PORT}/api/health"
_HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" -m 15 "$_SMOKE_URL" 2>/dev/null || echo "000")

if [[ "$_HTTP_CODE" == "200" ]]; then
	ok "Smoke test نجح (HTTP 200)"
else
	warn "Smoke test: HTTP $_HTTP_CODE — يُنصح بمراجعة السجل"
fi

ok "التفعيل عبر الحاكم اكتمل (mode=$MODE)"
