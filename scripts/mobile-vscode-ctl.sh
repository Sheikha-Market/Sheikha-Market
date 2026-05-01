#!/usr/bin/env bash
# بسم الله الرحمن الرحيم
# mobile-vscode-ctl.sh — التحكم في code-server (تشغيل/إيقاف/حالة/كلمة مرور)
# الاستخدام: bash scripts/mobile-vscode-ctl.sh [start|stop|status|password|restart]

set -euo pipefail

CONFIG_DIR="$HOME/.config/code-server"
CONFIG_FILE="$CONFIG_DIR/config.yaml"
PID_FILE="$CONFIG_DIR/code-server.pid"
LOG_FILE="$(dirname "$(dirname "${BASH_SOURCE[0]}")")/logs/code-server.log"
PORT=8443

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()   { echo -e "${GREEN}[✓]${NC} $1"; }
warn()  { echo -e "${YELLOW}[⚠]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; }
info()  { echo -e "${CYAN}[ℹ]${NC} $1"; }

cmd_start() {
    if [ ! -f "$CONFIG_FILE" ]; then
        error "لم يتم الإعداد بعد!"
        info "شغّل أولاً: bash scripts/setup-mobile-vscode.sh"
        exit 1
    fi

    if pgrep -x "code-server" &>/dev/null; then
        warn "code-server يعمل بالفعل"
        cmd_status
        return
    fi

    PROJECT_DIR="$(dirname "$(dirname "${BASH_SOURCE[0]}")")"
    mkdir -p "$(dirname "$LOG_FILE")"

    nohup code-server --config "$CONFIG_FILE" "$PROJECT_DIR" >> "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    sleep 2

    if pgrep -x "code-server" &>/dev/null; then
        LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
        log "code-server يعمل"
        info "الرابط: http://${LOCAL_IP}:${PORT}"
    else
        error "فشل التشغيل — راجع: $LOG_FILE"
        exit 1
    fi
}

cmd_stop() {
    if pgrep -x "code-server" &>/dev/null; then
        pkill -x "code-server" || true
        rm -f "$PID_FILE"
        log "تم إيقاف code-server"
    else
        warn "code-server لا يعمل حالياً"
    fi
}

cmd_status() {
    LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
    echo ""
    echo -e "${BOLD}حالة code-server:${NC}"
    if pgrep -x "code-server" &>/dev/null; then
        PID=$(pgrep -x "code-server" | head -1)
        echo -e "  الحالة  : ${GREEN}يعمل (PID: $PID)${NC}"
        echo -e "  الرابط  : ${CYAN}http://${LOCAL_IP}:${PORT}${NC}"
        echo -e "  السجلات : $LOG_FILE"
    else
        echo -e "  الحالة  : ${RED}متوقف${NC}"
        info "لتشغيله: npm run ops:mobile:start"
    fi
    echo ""
}

cmd_password() {
    if [ -f "$CONFIG_DIR/.password" ]; then
        PASS=$(cat "$CONFIG_DIR/.password")
        echo ""
        echo -e "${BOLD}كلمة المرور الحالية:${NC}"
        echo -e "  ${YELLOW}${PASS}${NC}"
        echo ""
    else
        error "لم يتم الإعداد بعد — شغّل: bash scripts/setup-mobile-vscode.sh"
    fi
}

cmd_restart() {
    cmd_stop
    sleep 1
    cmd_start
}

cmd_logs() {
    if [ -f "$LOG_FILE" ]; then
        tail -50 "$LOG_FILE"
    else
        warn "لا توجد سجلات بعد"
    fi
}

# نقطة الدخول
ACTION="${1:-status}"
case "$ACTION" in
    start)    cmd_start ;;
    stop)     cmd_stop ;;
    status)   cmd_status ;;
    password) cmd_password ;;
    restart)  cmd_restart ;;
    logs)     cmd_logs ;;
    *)
        echo "الاستخدام: $0 [start|stop|status|password|restart|logs]"
        exit 1
        ;;
esac
