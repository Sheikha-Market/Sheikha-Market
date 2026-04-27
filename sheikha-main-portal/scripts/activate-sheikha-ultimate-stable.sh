#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# ══════════════════════════════════════════════════════════════════
# activate-sheikha-ultimate-stable.sh — تفعيل النسخة المستقرة النهائية
# ══════════════════════════════════════════════════════════════════
# المسؤولية: تشغيل آمن + حارس الملكية + Health-check loop
# التعارضات: لا يُدير PM2 مباشرةً — يُفوّض دائماً إلى sheikha.sh
# الفرق عن full-power: لا يشمل CUDA/GPU/Nsight؛ يُركّز على الاستقرار والصحة
# ══════════════════════════════════════════════════════════════════
set -euo pipefail

# ── حارس التشغيل المباشر ──────────────────────────────────────────────
# هذا السكربت محكوم ببروتوكول الحاكم الأعلى.
# التشغيل المباشر مسموح من الحاكم فقط (SHEIKHA_GOVERNOR=1).
if [[ -z "${SHEIKHA_GOVERNOR:-}" ]]; then
	echo -e "\033[1;33m⚠️  تحذير: هذا السكربت محكوم ببروتوكول شيخة.\033[0m"
	echo "   الطريق الصحيح: bash scripts/activate-sheikha.sh --mode stable --apply"
	echo "   أو npm        : npm run ops:activate:ultimate-stable"
	echo "   جارٍ التنفيذ المباشر (تحذير فقط — لن يُوقَف)..."
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="$ROOT_DIR/scripts"
cd "$ROOT_DIR"

# ── ألوان ──────────────────────────────────────────────────────────
GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'
RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'

log()  { echo -e "${CYAN}[ultimate-stable]${RESET} $*"; }
ok()   { echo -e "${GREEN}✅${RESET} $*"; }
warn() { echo -e "${YELLOW}⚠️ ${RESET} $*"; }
err()  { echo -e "${RED}❌${RESET} $*"; }

PORT="${PORT:-8080}"
HEALTH_URL="${HEALTH_URL:-http://127.0.0.1:${PORT}/api/sheikha/status}"
HEALTH_WAIT="${HEALTH_WAIT:-45}"

echo -e "${BOLD}بسم الله — التفعيل المستقر النهائي${RESET}"

# ── [0] Node toolchain ─────────────────────────────────────────────
source "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true
nvm use 25.6.1 >/dev/null 2>&1 || true

# ── [0] تحميل .env بشكل آمن (KEY=VALUE فقط) ───────────────────────
load_env_file() {
	local env_file="$1"
	[ -f "$env_file" ] || return 0
	while IFS= read -r line || [ -n "$line" ]; do
		[[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
		[[ "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]] || continue
		export "$line"
	done < "$env_file"
}
load_env_file "$ROOT_DIR/.env"

# ── تحرير المنفذ إن كان مشغولاً ────────────────────────────────────
kill_port_if_busy() {
	if command -v lsof >/dev/null 2>&1; then
		lsof -ti :"$PORT" | xargs -r kill -9 || true
		return
	fi
	if command -v fuser >/dev/null 2>&1; then
		fuser -k "${PORT}/tcp" >/dev/null 2>&1 || true
		return
	fi
	if command -v ss >/dev/null 2>&1; then
		local pids
		pids="$(ss -ltnp "( sport = :${PORT} )" 2>/dev/null \
			| awk -F'pid=' 'NR>1{split($2,a,","); if(a[1]!="") print a[1]}' | sort -u)"
		[ -n "$pids" ] && kill -9 $pids >/dev/null 2>&1 || true
	fi
}

# ── Health-check loop ──────────────────────────────────────────────
wait_for_health() {
	local i=0
	while [ "$i" -lt "$HEALTH_WAIT" ]; do
		if curl -sS -m 3 "$HEALTH_URL" >/dev/null 2>&1; then
			return 0
		fi
		sleep 1
		i=$((i + 1))
	done
	return 1
}

# ── [1/4] حارس الملكية (PM2) ───────────────────────────────────────
log "[1/4] تفعيل حارس الملكية (sheikha-ip-proof)"
npm run ops:ip:proof:pm2:start:strict >/dev/null 2>&1 || true

# ── [2/4] تحرير المنفذ ────────────────────────────────────────────
log "[2/4] تحرير المنفذ ${PORT}"
kill_port_if_busy

# ── [3/4] PM2 — مُفوَّض إلى sheikha.sh (مصدر الحقيقة الوحيد) ──────
log "[3/4] PM2 restart (عبر sheikha.sh)"
bash "$SCRIPT_DIR/sheikha.sh" restart

# ── [4/4] التحقق الصحي ────────────────────────────────────────────
log "[4/4] التحقق الصحي على ${HEALTH_URL}"
if wait_for_health; then
	ok "التفعيل المستقر النهائي ناجح"
	curl -sS -m 8 "$HEALTH_URL" | head -c 300 && echo
	bash "$SCRIPT_DIR/sheikha.sh" status
	exit 0
fi

err "فشل التحقق الصحي بعد ${HEALTH_WAIT}ث"
bash "$SCRIPT_DIR/sheikha.sh" logs 80 || true
exit 1
