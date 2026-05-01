#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# ══════════════════════════════════════════════════════════════════
# sheikha.sh — نقطة تحكم موحدة لكل عمليات PM2
# ══════════════════════════════════════════════════════════════════
# الاستخدام:
#   bash scripts/sheikha.sh start       ← تشغيل الخادم الرئيسي
#   bash scripts/sheikha.sh stop        ← إيقاف الخادم الرئيسي
#   bash scripts/sheikha.sh restart     ← إعادة تشغيل الخادم
#   bash scripts/sheikha.sh status      ← حالة جميع العمليات
#   bash scripts/sheikha.sh logs        ← سجلات الخادم
#   bash scripts/sheikha.sh smoke       ← تشغيل smoke test
#   bash scripts/sheikha.sh pull        ← git pull ثم restart
#   bash scripts/sheikha.sh deploy      ← pull + restart + smoke
#   bash scripts/sheikha.sh list        ← قائمة كل العمليات الحية
# ══════════════════════════════════════════════════════════════════
# ⚙️  أسماء العمليات في ecosystem.config.js:
#   sheikha-api           ← الخادم الرئيسي (المنفذ 8080)
#   sheikha-copilot       ← خادم MCP (المنفذ 3091)
#   sheikha-meta-background
#   sheikha-health-monitor
#   sheikha-ollama-copilot
# ══════════════════════════════════════════════════════════════════

set -euo pipefail

# ── الألوان ───────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

MAIN="sheikha-api"      # الاسم الرسمي في ecosystem.config.js
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log()  { echo -e "${CYAN}[sheikha]${RESET} $*"; }
ok()   { echo -e "${GREEN}✅${RESET} $*"; }
warn() { echo -e "${YELLOW}⚠️ ${RESET} $*"; }
err()  { echo -e "${RED}❌${RESET} $*"; }

CMD="${1:-help}"

case "$CMD" in

  start)
    log "تشغيل الخادم الرئيسي ($MAIN)..."
    pm2 start "$DIR/ecosystem.config.js" --only "$MAIN"
    pm2 save
    ok "تم تشغيل $MAIN"
    ;;

  stop)
    log "إيقاف الخادم الرئيسي ($MAIN)..."
    pm2 stop "$MAIN" 2>/dev/null || warn "$MAIN غير مشغّل"
    pm2 save
    ok "تم إيقاف $MAIN"
    ;;

  restart)
    log "إعادة تشغيل الخادم الرئيسي ($MAIN)..."
    if pm2 describe "$MAIN" > /dev/null 2>&1; then
      pm2 restart "$MAIN"
    else
      warn "العملية '$MAIN' غير موجودة — جارٍ بدء تشغيل جديد..."
      pm2 start "$DIR/ecosystem.config.js" --only "$MAIN"
    fi
    pm2 save
    ok "تم إعادة تشغيل $MAIN"
    ;;

  status)
    echo -e "${BOLD}══ حالة جميع عمليات PM2 ══${RESET}"
    pm2 list
    ;;

  logs)
    LINES="${2:-100}"
    log "سجلات $MAIN (آخر $LINES سطر)..."
    pm2 logs "$MAIN" --lines "$LINES"
    ;;

  smoke)
    log "تشغيل Smoke Test..."
    bash "$DIR/scripts/sheikha-smoke-test.sh" "${2:-http://127.0.0.1:8080}"
    ;;

  pull)
    log "جارٍ git pull..."
    cd "$DIR"
    git pull
    ok "Git pull مكتمل"
    "$0" restart
    ;;

  deploy)
    log "Deploy: pull → restart → smoke test"
    cd "$DIR"
    git pull
    ok "Git pull مكتمل"
    "$0" restart
    sleep 5
    "$0" smoke
    ;;

  list)
    pm2 list
    ;;

  help|--help|-h|*)
    echo -e "${BOLD}بسم الله الرحمن الرحيم${RESET}"
    echo -e "${BOLD}sheikha.sh — نقطة تحكم موحدة${RESET}"
    echo ""
    echo -e "  ${CYAN}start${RESET}          تشغيل الخادم الرئيسي (sheikha-api)"
    echo -e "  ${CYAN}stop${RESET}           إيقاف الخادم الرئيسي"
    echo -e "  ${CYAN}restart${RESET}        إعادة التشغيل (يبدأ تلقائياً إن لم يكن مشغلاً)"
    echo -e "  ${CYAN}status${RESET}         عرض حالة كل العمليات"
    echo -e "  ${CYAN}logs [N]${RESET}       عرض آخر N سطر من السجلات (افتراضي: 100)"
    echo -e "  ${CYAN}smoke [BASE]${RESET}   تشغيل smoke test"
    echo -e "  ${CYAN}pull${RESET}           git pull ثم restart"
    echo -e "  ${CYAN}deploy${RESET}         pull + restart + smoke test"
    echo -e "  ${CYAN}list${RESET}           قائمة كل عمليات pm2"
    echo ""
    echo -e "  أسماء العمليات الرسمية:"
    echo -e "    ${YELLOW}sheikha-api${RESET}           الخادم الرئيسي :8080"
    echo -e "    ${YELLOW}sheikha-copilot${RESET}       خادم MCP :3091"
    echo -e "    ${YELLOW}sheikha-meta-background${RESET}"
    echo -e "    ${YELLOW}sheikha-health-monitor${RESET}"
    echo -e "    ${YELLOW}sheikha-ollama-copilot${RESET}  :3092"
    ;;
esac
