#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# ══════════════════════════════════════════════════════════════════
# activate-sheikha-full-power.sh — تفعيل القوة الكاملة (AI + CUDA + GPU)
# ══════════════════════════════════════════════════════════════════
# المسؤولية: تشغيل كل طبقات الذكاء الصناعي (CUDA / Nsight / API verify)
# التعارضات: لا يُدير PM2 مباشرةً — يُفوّض دائماً إلى sheikha.sh
# الفرق عن ultimate-stable: يشمل GPU/CUDA/Python؛ لا يتضمن health-check loop
# ══════════════════════════════════════════════════════════════════
set -euo pipefail

# ── حارس التشغيل المباشر ──────────────────────────────────────────────
# هذا السكربت محكوم ببروتوكول الحاكم الأعلى.
# التشغيل المباشر مسموح من الحاكم فقط (SHEIKHA_GOVERNOR=1).
if [[ -z "${SHEIKHA_GOVERNOR:-}" ]]; then
	echo -e "\033[1;33m⚠️  تحذير: هذا السكربت محكوم ببروتوكول شيخة.\033[0m"
	echo "   الطريق الصحيح: bash scripts/activate-sheikha.sh --mode power --apply"
	echo "   أو npm        : npm run ops:activate:full-power"
	echo "   جارٍ التنفيذ المباشر (تحذير فقط — لن يُوقَف)..."
fi

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="$ROOT_DIR/scripts"
cd "$ROOT_DIR"

# ── ألوان ──────────────────────────────────────────────────────────
GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'
RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'

log()  { echo -e "${CYAN}[full-power]${RESET} $*"; }
ok()   { echo -e "${GREEN}✅${RESET} $*"; }
warn() { echo -e "${YELLOW}⚠️ ${RESET} $*"; }
err()  { echo -e "${RED}❌${RESET} $*"; }

echo -e "${BOLD}بسم الله — تفعيل القوة الكاملة${RESET}"

# ── [0] Node toolchain ─────────────────────────────────────────────
source "$HOME/.nvm/nvm.sh" >/dev/null 2>&1 || true
nvm use 25.6.1 >/dev/null 2>&1 || true
unset npm_config_devdir NPM_CONFIG_DEVDIR npm_config_tmp NPM_CONFIG_TMP || true

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

export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

# ── [1/5] VS Code doctor ───────────────────────────────────────────
log "[1/5] VS Code doctor"
npm run dev:vscode:doctor || true

# ── [2/5] CUDA verify (bash layer) ────────────────────────────────
log "[2/5] CUDA verify (bash layer)"
bash "$SCRIPT_DIR/vscode-cuda-verify.sh" || true

# ── [3/5] CUDA verify (Python layer) ──────────────────────────────
log "[3/5] CUDA verify (Python layer)"
pick_python() {
	local candidates=(
		"${SHEIKHA_CUDA_PYTHON:-}"
		"${SHEIKHA_VENV_PYTHON:-}"
		"/home/sheikha/codex/venv/bin/python3"
		"/home/sheikha/codex/venv/bin/python"
		"python3"
		"python"
	)
	for c in "${candidates[@]}"; do
		[ -z "$c" ] && continue
		if command -v "$c" >/dev/null 2>&1; then echo "$(command -v "$c")"; return; fi
		[ -x "$c" ] && echo "$c" && return
	done
}
PY_BIN="$(pick_python)"
VERIFY_SCRIPT="$SCRIPT_DIR/cuda-verify.py"

if [ -n "$PY_BIN" ] && [ -x "$PY_BIN" ] && [ -f "$VERIFY_SCRIPT" ]; then
	if ! "$PY_BIN" -c "import torch, numpy" >/dev/null 2>&1; then
		log "تثبيت torch/numpy للمفسّر المختار..."
		"$PY_BIN" -m pip install -q --upgrade pip >/dev/null 2>&1 || true
		"$PY_BIN" -m pip install -q numpy >/dev/null 2>&1 || true
		"$PY_BIN" -m pip install -q torch --index-url https://download.pytorch.org/whl/cu121 >/dev/null 2>&1 || true
	fi
	"$PY_BIN" "$VERIFY_SCRIPT" || true
else
	warn "Python أو cuda-verify.py غير متوفر — تخطي"
fi

# ── [4/5] PM2 — مُفوَّض إلى sheikha.sh (مصدر الحقيقة الوحيد) ──────
log "[4/5] PM2 restart (عبر sheikha.sh)"
bash "$SCRIPT_DIR/sheikha.sh" restart

# حذف الاسم القديم إن وُجد
npx pm2 delete sheikha-main-portal >/dev/null 2>&1 || true

# تشغيل bg-guard إن لم يكن مشغلاً
if ! npx pm2 describe sheikha-bg-guard >/dev/null 2>&1; then
	npm run ops:bg-guard:pm2:start || true
fi
npx pm2 save >/dev/null 2>&1 || true

# ── [5/5] API verify + Nsight profiling ───────────────────────────
log "[5/5] API verify"
REPORT_DIR="$ROOT_DIR/reports/nvidia"
mkdir -p "$REPORT_DIR"
TS="$(date +%Y%m%d-%H%M%S)"

curl -sS -m 30 http://127.0.0.1:8080/api/cuda/verify          >/tmp/sheikha-full-power-cuda.json    2>/dev/null || true
curl -sS -m 30 http://127.0.0.1:8080/api/nvidia-cuda/capabilities >/tmp/sheikha-full-power-nvidia.json 2>/dev/null || true
curl -sS -m 10 http://127.0.0.1:8080/api/sheikha-pipeline/health >/tmp/sheikha-full-power-pipeline.json 2>/dev/null || true
echo "   cuda verify    → /tmp/sheikha-full-power-cuda.json"
echo "   nvidia caps    → /tmp/sheikha-full-power-nvidia.json"
echo "   pipeline health→ /tmp/sheikha-full-power-pipeline.json"
PIPELINE_STATUS="$(python3 -c "import json,sys; d=json.load(open('/tmp/sheikha-full-power-pipeline.json')); print('✅' if d.get('success') else '❌')" 2>/dev/null || echo '⚠️ ')"
echo "   pipeline: $PIPELINE_STATUS"

if [ -n "$PY_BIN" ] && [ -x "$PY_BIN" ] && [ -f "$VERIFY_SCRIPT" ]; then
	if command -v nsys >/dev/null 2>&1; then
		log "Nsight Systems quick profile"
		nsys profile --sample=none --trace=cuda,nvtx,osrt --force-overwrite=true \
			--output "$REPORT_DIR/nsys-full-power-$TS" \
			"$PY_BIN" "$VERIFY_SCRIPT" >/dev/null 2>&1 || true
		echo "   nsys report → $REPORT_DIR/nsys-full-power-$TS.qdrep"
	else
		warn "nsys غير مثبّت — تخطي Nsight Systems"
	fi

	if command -v ncu >/dev/null 2>&1; then
		log "Nsight Compute best-effort profile"
		NCU_SECTION_DIR="/usr/lib/x86_64-linux-gnu/nsight-compute/sections"
		[ -d "$NCU_SECTION_DIR" ] || \
			NCU_SECTION_DIR="/usr/lib/x86_64-linux-gnu/nsight-compute/target/linux-desktop-glibc_2_11_3-x64/sections"
		if [ -d "$NCU_SECTION_DIR" ]; then
			ncu --section-folder-recursive "$NCU_SECTION_DIR" --target-processes all \
				--set full --force-overwrite \
				--export "$REPORT_DIR/ncu-full-power-$TS" \
				"$PY_BIN" "$VERIFY_SCRIPT" >/dev/null 2>&1 || true
			echo "   ncu report → $REPORT_DIR/ncu-full-power-$TS.ncu-rep"
		else
			warn "ncu sections dir غير موجود — تخطي Nsight Compute"
		fi
	else
		warn "ncu غير مثبّت — تخطي Nsight Compute"
	fi
fi

bash "$SCRIPT_DIR/sheikha.sh" status
ok "تفعيل القوة الكاملة اكتمل ✨"
