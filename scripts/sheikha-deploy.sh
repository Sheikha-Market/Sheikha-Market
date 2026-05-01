#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                       sheikha-deploy.sh                                     ║
# ║              سكربت النشر — Deploy Pipeline لمنظومة شيخة                     ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# الاستخدام:
#   ./scripts/sheikha-deploy.sh [local|pilot|production] [--dry-run]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TARGET="${1:-local}"
DRY_RUN="${2:-}"

# ─── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RESET='\033[0m'

log()  { echo -e "${CYAN}[DEPLOY]${RESET} $*"; }
ok()   { echo -e "${GREEN}[DEPLOY] ✅${RESET} $*"; }
warn() { echo -e "${YELLOW}[DEPLOY] ⚠️ ${RESET} $*"; }
err()  { echo -e "${RED}[DEPLOY] ❌${RESET} $*"; exit 1; }
step() { echo -e "\n${CYAN}══ $* ══${RESET}"; }

is_dry() { [[ "$DRY_RUN" == "--dry-run" ]]; }
run()    { if is_dry; then echo "  [DRY-RUN] $*"; else eval "$@"; fi; }

# ─── Pre-flight Checks ────────────────────────────────────────────────────────

preflight() {
    step "فحص ما قبل النشر"

    command -v node &>/dev/null || err "Node.js غير مثبّت"
    ok "Node.js: $(node --version)"

    command -v git &>/dev/null || err "git غير مثبّت"
    ok "git: $(git --version | head -1)"

    cd "$PROJECT_DIR"

    if [[ "$TARGET" == "production" ]]; then
        BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
        if [[ "$BRANCH" != "main" && "$BRANCH" != "master" ]]; then
            warn "النشر للـ production من فرع غير رئيسي: $BRANCH"
        fi
    fi

    ok "الفحص المسبق اكتمل"
}

# ─── Install Dependencies ─────────────────────────────────────────────────────

install_deps() {
    step "تثبيت التبعيات"
    cd "$PROJECT_DIR"

    if [[ "$TARGET" == "production" ]]; then
        run "npm ci --omit=dev"
    else
        run "npm install"
    fi
    ok "التبعيات جاهزة"
}

# ─── Run Tests ────────────────────────────────────────────────────────────────

run_tests() {
    step "تشغيل الاختبارات"
    cd "$PROJECT_DIR"

    if is_dry; then
        log "[DRY-RUN] سيتم تشغيل: node scripts/test-sheikha-root.js"
        log "[DRY-RUN] سيتم تشغيل: node scripts/test-sheikha-os.js"
        return
    fi

    node scripts/test-sheikha-root.js && ok "test-sheikha-root: نجح" || err "test-sheikha-root: فشل"
    node scripts/test-sheikha-os.js   && ok "test-sheikha-os: نجح"   || err "test-sheikha-os: فشل"
}

# ─── Build ────────────────────────────────────────────────────────────────────

build() {
    step "البناء"
    cd "$PROJECT_DIR"

    # في المشروع الحالي: لا build step مطلوب (Node.js مباشر)
    ok "البناء اكتمل (no-build-required)"
}

# ─── Deploy ───────────────────────────────────────────────────────────────────

deploy() {
    step "النشر — البيئة: $TARGET"
    cd "$PROJECT_DIR"

    case "$TARGET" in
        local)
            log "نشر محلي — تشغيل مباشر"
            if command -v pm2 &>/dev/null; then
                run "pm2 restart ecosystem.config.js --update-env || pm2 start ecosystem.config.js"
            else
                warn "PM2 غير متوفر — يمكن تشغيل: node server.js"
            fi
            ;;

        pilot)
            log "نشر Pilot"
            run "NODE_ENV=pilot pm2 restart ecosystem.config.js --update-env || NODE_ENV=pilot pm2 start ecosystem.config.js"
            ;;

        production)
            log "نشر Production"
            warn "التأكيد: أنت تنشر للـ production!"
            if ! is_dry; then
                read -r -p "هل أنت متأكد؟ (اكتب 'yes'): " CONFIRM
                [[ "$CONFIRM" == "yes" ]] || err "تم إلغاء النشر"
            fi
            run "NODE_ENV=production pm2 restart ecosystem.config.js --update-env"
            ;;
    esac

    ok "النشر اكتمل"
}

# ─── Post-deploy ─────────────────────────────────────────────────────────────

post_deploy() {
    step "فحص ما بعد النشر"

    # انتظر قليلًا
    if ! is_dry; then sleep 3; fi

    PORT="${PORT:-8080}"
    if command -v curl &>/dev/null && ! is_dry; then
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${PORT}/health" 2>/dev/null || echo "000")
        if [[ "$STATUS" == "200" ]]; then
            ok "الخادم يستجيب: HTTP $STATUS"
        else
            warn "الخادم أعاد: HTTP $STATUS"
        fi
    fi

    ok "النشر مكتمل — $(date '+%Y-%m-%d %H:%M:%S %Z')"
}

# ─── Main ─────────────────────────────────────────────────────────────────────

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║      SHEIKHA DEPLOY — بدء النشر           ║"
echo "╚══════════════════════════════════════════╝"
log "الهدف: $TARGET $(is_dry && echo '(DRY RUN)' || echo '')"
echo ""

preflight
install_deps
run_tests
build
deploy
post_deploy

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║    🚀 النشر اكتمل بنجاح!                  ║"
echo "╚══════════════════════════════════════════╝"
echo ""
