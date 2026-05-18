#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# ══════════════════════════════════════════════════════════════════════════════
#  vps-deploy.sh — نشر منظومة شيخة على VPS
#
#  المسارات الثابتة:
#    المحلي : ~/Projects/sheikha/sheikha-main-portal
#    VPS    : /opt/sheikha/current/sheikha-main-portal
#
#  الاستخدام (من الجهاز المحلي):
#    bash scripts/vps-deploy.sh [--dry-run]
#
#  متطلبات:
#    - SSH key مُضاف للمستخدم $VPS_USER@$VPS_HOST
#    - متغيرات بيئة (اختيارية، لها قيم افتراضية):
#        VPS_HOST          : عنوان الخادم   (default: srv949321.hstgr.cloud)
#        VPS_USER          : مستخدم SSH     (default: sheikhaops)
#        VPS_ROOT          : مجلد النشر     (default: /opt/sheikha/current)
#        DEPLOY_BRANCH     : فرع النشر      (default: main)
#        SHEIKHA_BASE_URL  : رابط الخادم    (default: http://127.0.0.1:8080)
#        SHEIKHA_MCP_URL   : رابط MCP/SDK   (default: http://127.0.0.1:3001)
#        SHEIKHA_IDE_URL   : رابط IDE       (default: http://127.0.0.1:3002)
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

DRY_RUN="${1:-}"

VPS_HOST="${VPS_HOST:-srv949321.hstgr.cloud}"
VPS_USER="${VPS_USER:-sheikhaops}"
VPS_ROOT="${VPS_ROOT:-/opt/sheikha/current}"
VPS_PORTAL="${VPS_ROOT}/sheikha-main-portal"
COMPOSE_DIR="${VPS_PORTAL}/infra/docker/compose/prod"
BRANCH="${DEPLOY_BRANCH:-main}"
READY_TIMEOUT="${SHEIKHA_READY_TIMEOUT:-60}"
GATE_TIMEOUT="${SHEIKHA_GATE_TIMEOUT:-15}"
BASE_URL="${SHEIKHA_BASE_URL:-http://127.0.0.1:8080}"
MCP_URL="${SHEIKHA_MCP_URL:-http://127.0.0.1:3001}"
IDE_URL="${SHEIKHA_IDE_URL:-http://127.0.0.1:3002}"

# ─── ألوان ────────────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; RESET='\033[0m'

log()  { echo -e "${CYAN}[VPS-DEPLOY]${RESET} $*"; }
ok()   { echo -e "${GREEN}[VPS-DEPLOY] ✅${RESET} $*"; }
warn() { echo -e "${YELLOW}[VPS-DEPLOY] ⚠️ ${RESET} $*"; }
err()  { echo -e "${RED}[VPS-DEPLOY] ❌${RESET} $*"; exit 1; }
step() { echo -e "\n${CYAN}══ $* ══${RESET}"; }

is_dry()  { [[ "$DRY_RUN" == "--dry-run" ]]; }

# تشغيل أمر عبر SSH أو طباعته في وضع DRY-RUN
ssh_run() {
  if is_dry; then
    echo "  [DRY-RUN SSH→${VPS_USER}@${VPS_HOST}] $*"
  else
    ssh -o BatchMode=yes \
        -o StrictHostKeyChecking=accept-new \
        -o ConnectTimeout=15 \
        "${VPS_USER}@${VPS_HOST}" "$@"
  fi
}

# ─── ١) فحص ما قبل النشر — Pre-flight ────────────────────────────────────────
preflight() {
  step "١) فحص ما قبل النشر — Pre-flight"

  command -v git  &>/dev/null || err "git غير مثبّت على الجهاز المحلي"
  command -v ssh  &>/dev/null || err "ssh غير مثبّت على الجهاز المحلي"
  command -v curl &>/dev/null || err "curl غير مثبّت على الجهاز المحلي"
  ok "الأدوات المحلية جاهزة (git, ssh, curl)"

  local current_branch
  current_branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
  if [[ "$current_branch" != "$BRANCH" && "$current_branch" != "master" ]]; then
    warn "الفرع الحالي: $current_branch | فرع النشر المحدد: $BRANCH"
    warn "تأكد من دمج التغييرات في $BRANCH قبل النشر"
  else
    ok "الفرع: $current_branch ✓"
  fi

  local uncommitted
  uncommitted=$(git status --porcelain 2>/dev/null || echo "")
  if [[ -n "$uncommitted" ]]; then
    warn "يوجد تغييرات غير مُعتمدة (uncommitted) — تأكد من رفع كل شيء إلى GitHub"
  else
    ok "Working tree نظيف — لا توجد تغييرات معلّقة ✓"
  fi

  local ahead
  ahead=$(git rev-list --count "origin/${BRANCH}..HEAD" 2>/dev/null || echo "0")
  if [[ "$ahead" -gt 0 ]]; then
    warn "يوجد $ahead commit(s) لم تُرفع بعد إلى origin/${BRANCH}"
    err "ارفع التغييرات أولاً: git push origin ${BRANCH}"
  fi
  ok "كل التغييرات مرفوعة إلى GitHub ✓"
}

# ─── ٢) فحص الاتصال بـ VPS ───────────────────────────────────────────────────
check_vps_connection() {
  step "٢) فحص الاتصال بـ VPS"
  log "الاتصال بـ ${VPS_USER}@${VPS_HOST} ..."

  if is_dry; then
    echo "  [DRY-RUN] ssh ${VPS_USER}@${VPS_HOST} echo 'VPS OK'"
  else
    ssh_run "echo 'VPS connection: OK'" \
      || err "فشل الاتصال بـ VPS. تأكد من:\n  - SSH key مُضاف في ~/.ssh/authorized_keys على VPS\n  - الخادم يعمل: ${VPS_HOST}"
    ok "الاتصال بـ VPS ناجح ✓"
  fi
}

# ─── ٣) سحب آخر إصدار من Git على VPS ────────────────────────────────────────
git_pull_vps() {
  step "٣) سحب آخر إصدار من GitHub على VPS"
  log "cd ${VPS_PORTAL} && git fetch origin && git reset --hard origin/${BRANCH}"

  ssh_run "
    set -euo pipefail
    cd '${VPS_PORTAL}'
    git fetch --quiet origin
    git reset --hard origin/${BRANCH}
    echo '    Commit: '$(git log -1 --format='%h %s (%ai)' 2>/dev/null || echo 'unknown')
  "
  ok "الكود محدَّث على VPS ✓"
}

# ─── ٤) تثبيت التبعيات (production) ──────────────────────────────────────────
install_deps_vps() {
  step "٤) تثبيت تبعيات Node.js — npm ci --omit=dev"

  ssh_run "
    set -euo pipefail
    cd '${VPS_PORTAL}'
    npm ci --omit=dev --prefer-offline 2>&1 | tail -5
    echo '    Node: '$(node --version)
  "
  ok "التبعيات مثبّتة ✓"
}

# ─── ٥) إعادة بناء وتشغيل حاويات Docker Compose ─────────────────────────────
compose_up() {
  step "٥) Docker Compose — build + up"
  log "docker compose build main-portal && docker compose up -d"

  ssh_run "
    set -euo pipefail
    cd '${COMPOSE_DIR}'
    docker compose build --pull main-portal 2>&1 | tail -8
    docker compose up -d nginx postgres redis main-portal
    echo ''
    docker compose ps --format 'table {{.Name}}\t{{.Status}}\t{{.Ports}}'
  "
  ok "الحاويات تعمل ✓"
}

# ─── ٦) انتظار جاهزية الخادم ────────────────────────────────────────────────
wait_for_ready() {
  step "٦) انتظار جاهزية الخادم (حد أقصى ${READY_TIMEOUT} ثانية)"

  if is_dry; then
    echo "  [DRY-RUN] Waiting for ${BASE_URL}/api/health ..."
    return
  fi

  local retries=$(( READY_TIMEOUT / 5 ))
  local waited=0

  while [[ $retries -gt 0 ]]; do
    local code
    code=$(ssh_run "curl -s -o /dev/null -w '%{http_code}' --max-time 5 '${BASE_URL}/api/health' 2>/dev/null || echo 000")
    if [[ "$code" == "200" ]]; then
      ok "الخادم جاهز بعد ${waited} ثانية ✓"
      return
    fi
    log "لا يزال يجهّز... (HTTP ${code}) — انتظر 5 ثوانٍ"
    sleep 5
    waited=$((waited + 5))
    retries=$((retries - 1))
  done

  err "الخادم لم يستجب خلال ${READY_TIMEOUT} ثانية. تحقق من: docker compose logs main-portal"
}

# ─── ٧) البوابة العصبية الإلزامية ────────────────────────────────────────────
neural_gate() {
  step "٧) البوابة العصبية الإلزامية — Neural Gate"
  log "تشغيل neural-gate.sh على VPS ..."

  ssh_run "
    set -euo pipefail
    cd '${VPS_PORTAL}'
    SHEIKHA_BASE_URL='${BASE_URL}' \
    SHEIKHA_MCP_URL='${MCP_URL}' \
    SHEIKHA_IDE_URL='${IDE_URL}' \
    SHEIKHA_GATE_TIMEOUT='${GATE_TIMEOUT}' \
    bash scripts/neural-gate.sh
  " || err "البوابة العصبية مغلقة — النشر محظور.
  أصلح الـ endpoints الفاشلة ثم أعد تشغيل: bash scripts/vps-deploy.sh"

  ok "البوابة العصبية مفتوحة ✓"
}

# ─── ٨) الاختبار الدخاني الشامل ──────────────────────────────────────────────
smoke_test() {
  step "٨) الاختبار الدخاني الشامل — Smoke Test"

  ssh_run "
    set -euo pipefail
    cd '${VPS_PORTAL}'
    bash scripts/sheikha-smoke-test.sh '${BASE_URL}'
  " || err "الاختبار الدخاني فشل — النشر غير مكتمل. راجع السجلات."

  ok "الاختبار الدخاني نجح ✓"
}

# ─── ٩) تسجيل النشر ──────────────────────────────────────────────────────────
log_deploy() {
  step "٩) تسجيل النشر في سجل التاريخ"

  local ts
  ts=$(date '+%Y-%m-%d %H:%M:%S %Z')
  local commit
  commit=$(git log -1 --format="%h %s" 2>/dev/null || echo "unknown")
  local actor
  actor=$(whoami)
  local log_entry
  log_entry="${ts} | branch=${BRANCH} | commit=${commit} | actor=${actor} | status=success"

  log "$log_entry"

  ssh_run "
    mkdir -p '${VPS_ROOT}/deploy-logs'
    echo '${log_entry}' >> '${VPS_ROOT}/deploy-logs/deploy-history.log'
    echo '    آخر 3 نشرات:'
    tail -3 '${VPS_ROOT}/deploy-logs/deploy-history.log' | sed 's/^/      /'
  " 2>/dev/null || warn "لم يتمكن من الكتابة في سجل النشر"

  ok "النشر مُسجَّل ✓"
}

# ─── Main ─────────────────────────────────────────────────────────────────────
echo ""
echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${CYAN}║       SHEIKHA VPS DEPLOY — نشر منظومة شيخة على VPS              ║${RESET}"
echo -e "${CYAN}╚══════════════════════════════════════════════════════════════════╝${RESET}"
echo -e "  VPS   : ${VPS_USER}@${VPS_HOST}"
echo -e "  مسار  : ${VPS_PORTAL}"
echo -e "  فرع   : ${BRANCH}"
is_dry && echo -e "  وضع   : ${YELLOW}DRY-RUN (لا تغييرات فعلية)${RESET}"
echo ""

preflight
check_vps_connection
git_pull_vps
install_deps_vps
compose_up
wait_for_ready
neural_gate
smoke_test
log_deploy

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════╗${RESET}"
echo -e "${GREEN}║   🚀 النشر اكتمل بنجاح — VPS Deploy Successful                  ║${RESET}"
echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════╝${RESET}"
echo ""
