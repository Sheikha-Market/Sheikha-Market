#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# ══════════════════════════════════════════════════════════════════════
# sheikha-control — النظام الحاكم المركزي لمنظومة شيخة
# ══════════════════════════════════════════════════════════════════════
# الاستخدام:
#   sheikha-control stable   → تفعيل الوضع المستقر
#   sheikha-control power    → تفعيل القوة الكاملة (AI + CUDA)
#   sheikha-control auto     → يقرر تلقائياً بناءً على حمل CPU
#   sheikha-control status   → عرض حالة النظام الحالية
#   sheikha-control report   → إصدار تقرير إحصائي
#
# قاعدة: لا تشغيل إلا عبر هذا الحاكم.
# ══════════════════════════════════════════════════════════════════════
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCRIPT_DIR="$ROOT_DIR/scripts"
DATA_DIR="$ROOT_DIR/data"
REPORTS_DIR="$ROOT_DIR/reports/governance"
LOG_FILE="$DATA_DIR/governance-log.json"
METRICS_FILE="$DATA_DIR/governance-metrics.json"

cd "$ROOT_DIR"

# ── ألوان ──────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; CYAN='\033[0;36m'; YELLOW='\033[1;33m'
RED='\033[0;31m'; BOLD='\033[1m'; RESET='\033[0m'
log()    { echo -e "${CYAN}[sheikha-control]${RESET} $*"; }
ok()     { echo -e "${GREEN}✅${RESET} $*"; }
warn()   { echo -e "${YELLOW}⚠️ ${RESET}$*"; }
err()    { echo -e "${RED}❌${RESET} $*" >&2; }
header() { echo -e "${BOLD}$*${RESET}"; }

# ── تهيئة ملفات البيانات ───────────────────────────────────────────────
_init_data() {
	mkdir -p "$DATA_DIR" "$REPORTS_DIR"
	if [[ ! -f "$LOG_FILE" ]]; then
		echo '{"log":[]}' > "$LOG_FILE"
	fi
	if [[ ! -f "$METRICS_FILE" ]]; then
		echo '{"runs":0,"success":0,"failure":0,"modes":{"stable":0,"power":0,"auto":0}}' > "$METRICS_FILE"
	fi
}

# ── تسجيل حدث تشغيل ───────────────────────────────────────────────────
_log_event() {
	local mode="$1" result="$2" duration="${3:-0}"
	local ts; ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
	_init_data

	# Node.js لتحديث JSON بأمان
	node -e "
		const fs = require('fs');
		const lf = '$LOG_FILE', mf = '$METRICS_FILE';
		const log = JSON.parse(fs.readFileSync(lf, 'utf8'));
		const met = JSON.parse(fs.readFileSync(mf, 'utf8'));
		log.log.push({ts:'$ts', mode:'$mode', result:'$result', durationMs:$duration});
		if (log.log.length > 500) log.log = log.log.slice(-500);
		met.runs = (met.runs||0)+1;
		if ('$result'==='success') met.success=(met.success||0)+1;
		else met.failure=(met.failure||0)+1;
		met.modes = met.modes||{};
		met.modes['$mode'] = (met.modes['$mode']||0)+1;
		met.lastRun={ts:'$ts', mode:'$mode', result:'$result'};
		fs.writeFileSync(lf, JSON.stringify(log, null, 2));
		fs.writeFileSync(mf, JSON.stringify(met, null, 2));
	" 2>/dev/null || true
}

# ── الأمر الأول ────────────────────────────────────────────────────────
CMD="${1:-help}"
shift || true

case "$CMD" in

  # ── stable / power / auto ─────────────────────────────────────────────
  stable|power|auto)
	header "بسم الله الرحمن الرحيم — النظام الحاكم لمنظومة شيخة"
	log "الأمر: $CMD"
	_init_data

	# تصدير علامة الحاكم (تسمح للسكربتات الفرعية بالتنفيذ)
	export SHEIKHA_GOVERNOR=1

	START_MS=$(node -e "console.log(Date.now())" 2>/dev/null || echo 0)

	case "$CMD" in
		power)
			log "تفعيل القوة الكاملة (AI + CUDA + GPU)..."
			bash "$SCRIPT_DIR/activate-sheikha-full-power.sh"
			;;
		stable)
			log "تفعيل الوضع المستقر (PM2 + health-check)..."
			bash "$SCRIPT_DIR/activate-sheikha-ultimate-stable.sh"
			;;
		auto)
			log "الوضع التلقائي — فحص حمل CPU..."
			CPU=$(awk '{print int($1)}' /proc/loadavg 2>/dev/null || \
				top -bn1 | grep -i "cpu\|Cpu" | head -1 \
				| awk '{for(i=1;i<=NF;i++) if($i~/^[0-9]/) {print int($i); exit}}' || echo 0)
			if [[ "${CPU:-0}" -gt 70 ]]; then
				warn "CPU=${CPU}% (> 70%) → التحويل إلى الوضع المستقر"
				export SHEIKHA_GOVERNOR=1
				bash "$SCRIPT_DIR/activate-sheikha-ultimate-stable.sh"
				CMD="stable"
			else
				log "CPU=${CPU}% (≤ 70%) → التحويل إلى القوة الكاملة"
				export SHEIKHA_GOVERNOR=1
				bash "$SCRIPT_DIR/activate-sheikha-full-power.sh"
				CMD="power"
			fi
			;;
	esac

	END_MS=$(node -e "console.log(Date.now())" 2>/dev/null || echo 0)
	DURATION=$(( END_MS - START_MS ))

	# Smoke test إجباري
	log "Smoke test إجباري..."
	_PORT="${PORT:-8080}"
	HTTP_CODE=$(curl -o /dev/null -s -w "%{http_code}" -m 15 \
		"http://127.0.0.1:${_PORT}/api/health" 2>/dev/null || echo "000")
	if [[ "$HTTP_CODE" == "200" ]]; then
		ok "Smoke test نجح (HTTP 200)"
		_log_event "$CMD" "success" "$DURATION"
	else
		warn "Smoke test: HTTP $HTTP_CODE"
		_log_event "$CMD" "smoke-warning" "$DURATION"
	fi

	ok "اكتمل التفعيل عبر النظام الحاكم (mode=$CMD)"
	;;

  # ── status ───────────────────────────────────────────────────────────
  status)
	header "═══ حالة منظومة شيخة ═══"
	_PORT="${PORT:-8080}"

	# حالة PM2
	if command -v pm2 &>/dev/null; then
		echo ""
		log "عمليات PM2:"
		pm2 list 2>/dev/null || warn "PM2 غير متاح"
	fi

	# حالة API
	echo ""
	log "فحص API..."
	for endpoint in /api/health /api/sheikha-pipeline/health /api/governance/health; do
		CODE=$(curl -o /dev/null -s -w "%{http_code}" -m 5 \
			"http://127.0.0.1:${_PORT}${endpoint}" 2>/dev/null || echo "000")
		if [[ "$CODE" == "200" ]]; then
			ok "  $endpoint → HTTP $CODE"
		else
			warn "  $endpoint → HTTP $CODE"
		fi
	done

	# آخر تشغيل
	if [[ -f "$METRICS_FILE" ]]; then
		echo ""
		log "آخر بيانات التشغيل:"
		node -e "
			const m = require('$METRICS_FILE');
			console.log('  إجمالي التشغيلات :', m.runs||0);
			console.log('  ناجح             :', m.success||0);
			console.log('  فاشل             :', m.failure||0);
			if (m.lastRun) console.log('  آخر تشغيل       :', JSON.stringify(m.lastRun));
		" 2>/dev/null || true
	fi
	;;

  # ── report ───────────────────────────────────────────────────────────
  report)
	header "═══ تقرير حوكمة منظومة شيخة ═══"
	_init_data
	TS="$(date +%Y%m%d-%H%M%S)"
	REPORT_PATH="$REPORTS_DIR/governance-report-${TS}.json"

	node -e "
		const fs = require('fs');
		const met = JSON.parse(fs.readFileSync('$METRICS_FILE', 'utf8'));
		const log = JSON.parse(fs.readFileSync('$LOG_FILE', 'utf8'));
		const recent = log.log.slice(-20);
		const report = {
			generatedAt: new Date().toISOString(),
			summary: met,
			recentRuns: recent,
			successRate: met.runs>0
				? ((met.success/met.runs)*100).toFixed(1)+'%'
				: 'N/A'
		};
		fs.writeFileSync('$REPORT_PATH', JSON.stringify(report, null, 2));
		console.log('  إجمالي التشغيلات :', met.runs||0);
		console.log('  نسبة النجاح      :', report.successRate);
		console.log('  التقرير المحفوظ  :', '$REPORT_PATH');
	" 2>/dev/null || warn "لم يتم توليد التقرير (Node.js مطلوب)"
	ok "اكتمل التقرير"
	;;

  # ── help ─────────────────────────────────────────────────────────────
  help|--help|-h|"")
	header "النظام الحاكم المركزي — sheikha-control"
	echo ""
	echo "  الاستخدام:"
	echo "    bash scripts/sheikha-control.sh stable   → تفعيل الوضع المستقر"
	echo "    bash scripts/sheikha-control.sh power    → تفعيل القوة الكاملة"
	echo "    bash scripts/sheikha-control.sh auto     → اختيار تلقائي (CPU-aware)"
	echo "    bash scripts/sheikha-control.sh status   → حالة النظام"
	echo "    bash scripts/sheikha-control.sh report   → تقرير إحصائي"
	echo ""
	echo "  أو عبر npm:"
	echo "    npm run ops:control          → auto"
	echo "    npm run ops:control:stable   → stable"
	echo "    npm run ops:control:power    → power"
	echo "    npm run ops:control:status   → status"
	echo "    npm run ops:control:report   → report"
	echo ""
	;;

  *)
	err "أمر غير معروف: $CMD"
	echo "استخدم: sheikha-control [stable|power|auto|status|report]"
	exit 1
	;;
esac
