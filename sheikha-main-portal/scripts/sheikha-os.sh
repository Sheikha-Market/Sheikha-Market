#!/usr/bin/env bash
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║                        sheikha-os.sh                                        ║
# ║              سكربت Sheikha OS — التحكم في طبقة النظام                       ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# الاستخدام:
#   ./scripts/sheikha-os.sh [status|start|stop|restart|health|info]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CMD="${1:-status}"

# ─── Colors ───────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
RESET='\033[0m'

log()    { echo -e "${CYAN}[SHEIKHA-OS]${RESET} $*"; }
ok()     { echo -e "${GREEN}[SHEIKHA-OS] ✅${RESET} $*"; }
warn()   { echo -e "${YELLOW}[SHEIKHA-OS] ⚠️ ${RESET} $*"; }
err()    { echo -e "${RED}[SHEIKHA-OS] ❌${RESET} $*"; }

# ─── Helpers ──────────────────────────────────────────────────────────────────

check_node() {
    if ! command -v node &>/dev/null; then
        err "Node.js غير مثبّت"
        exit 1
    fi
    NODE_VER=$(node --version)
    log "Node.js: $NODE_VER"
}

check_pm2() {
    command -v pm2 &>/dev/null
}

# ─── Commands ─────────────────────────────────────────────────────────────────

cmd_info() {
    echo ""
    echo "╔══════════════════════════════════════════╗"
    echo "║          SHEIKHA OS — معلومات النظام       ║"
    echo "╚══════════════════════════════════════════╝"
    check_node
    echo ""
    log "دليل المشروع: $PROJECT_DIR"
    log "المنصة:       $(uname -s) / $(uname -m)"
    log "التاريخ:      $(date '+%Y-%m-%d %H:%M:%S %Z')"
    log "Uptime:       $(uptime -p 2>/dev/null || uptime)"
    echo ""

    # ذاكرة
    if command -v free &>/dev/null; then
        TOTAL=$(free -h | awk '/^Mem:/{print $2}')
        USED=$(free -h  | awk '/^Mem:/{print $3}')
        FREE=$(free -h  | awk '/^Mem:/{print $4}')
        log "RAM — الكلي: $TOTAL | المستخدم: $USED | الحر: $FREE"
    fi

    # معالج
    if [[ -f /proc/cpuinfo ]]; then
        CORES=$(nproc 2>/dev/null || grep -c ^processor /proc/cpuinfo)
        log "CPU Cores: $CORES"
    fi
    echo ""
}

cmd_status() {
    echo ""
    log "فحص حالة الخدمات..."

    if check_pm2; then
        ok "PM2 متوفر"
        cd "$PROJECT_DIR"
        pm2 list --no-color 2>/dev/null || warn "لا توجد عمليات PM2 نشطة"
    else
        warn "PM2 غير مثبّت — يعمل بدون PM2"
        # تحقق من المنفذ
        if command -v lsof &>/dev/null && lsof -i:8080 &>/dev/null; then
            ok "الخادم يعمل على المنفذ 8080"
        else
            warn "الخادم لا يعمل على المنفذ 8080"
        fi
    fi
    echo ""
}

cmd_start() {
    log "تشغيل المنظومة..."
    cd "$PROJECT_DIR"

    if check_pm2; then
        pm2 start ecosystem.config.js || { err "فشل تشغيل PM2"; exit 1; }
        pm2 save
        ok "المنظومة تعمل عبر PM2"
    else
        warn "PM2 غير متوفر — تشغيل مباشر"
        node server.js &
        ok "الخادم يعمل (PID: $!)"
    fi
    echo ""
}

cmd_stop() {
    log "إيقاف المنظومة..."
    cd "$PROJECT_DIR"

    if check_pm2; then
        pm2 stop all || warn "لا توجد عمليات للإيقاف"
        ok "توقّفت جميع العمليات"
    else
        warn "PM2 غير متوفر — إيقاف يدوي"
        pkill -f "node server.js" 2>/dev/null && ok "الخادم أُوقف" || warn "لم يُعثر على عملية نشطة"
    fi
    echo ""
}

cmd_restart() {
    log "إعادة تشغيل المنظومة..."
    cmd_stop
    sleep 2
    cmd_start
}

cmd_health() {
    log "فحص صحة المنظومة..."
    cd "$PROJECT_DIR"

    # اختبار HTTP
    PORT="${PORT:-8080}"
    if command -v curl &>/dev/null; then
        STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT/health" 2>/dev/null || echo "000")
        if [[ "$STATUS" == "200" ]]; then
            ok "HTTP health check: $STATUS ✔"
        else
            warn "HTTP health check: $STATUS"
        fi
    else
        warn "curl غير متوفر — تخطّي HTTP check"
    fi

    # ذاكرة
    if command -v free &>/dev/null; then
        MEM_PCT=$(free | awk '/^Mem:/{printf "%.0f", $3/$2*100}')
        if [[ $MEM_PCT -gt 85 ]]; then
            warn "استخدام الذاكرة عالٍ: ${MEM_PCT}%"
        else
            ok "الذاكرة: ${MEM_PCT}% مستخدمة"
        fi
    fi

    # مساحة القرص
    if command -v df &>/dev/null; then
        DISK_PCT=$(df -h "$PROJECT_DIR" | awk 'NR==2{gsub(/%/,""); print $5}')
        if [[ $DISK_PCT -gt 85 ]]; then
            warn "مساحة القرص محدودة: ${DISK_PCT}% مستخدمة"
        else
            ok "القرص: ${DISK_PCT}% مستخدمة"
        fi
    fi

    echo ""
}

# ─── Main ─────────────────────────────────────────────────────────────────────

case "$CMD" in
    info)    cmd_info ;;
    status)  cmd_status ;;
    start)   check_node; cmd_start ;;
    stop)    cmd_stop ;;
    restart) check_node; cmd_restart ;;
    health)  cmd_health ;;
    *)
        echo ""
        echo "الاستخدام: $0 [status|start|stop|restart|health|info]"
        echo ""
        echo "  info     — معلومات النظام"
        echo "  status   — حالة الخدمات"
        echo "  start    — تشغيل المنظومة"
        echo "  stop     — إيقاف المنظومة"
        echo "  restart  — إعادة التشغيل"
        echo "  health   — فحص الصحة"
        echo ""
        exit 1
        ;;
esac
