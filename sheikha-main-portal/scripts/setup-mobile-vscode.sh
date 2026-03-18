#!/usr/bin/env bash
# =============================================================================
# بسم الله الرحمن الرحيم
# setup-mobile-vscode.sh — إعداد VS Code للجوال عبر code-server
# المشروع: منظومة شيخة — sheikha.top
# =============================================================================
# الغرض: تثبيت وتشغيل code-server لفتح VS Code من أي جهاز/جوال
# =============================================================================

set -euo pipefail

# ====================== الألوان =============================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'  # بدون لون

# ====================== المتغيرات ===========================================
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_DIR="$HOME/.config/code-server"
CONFIG_FILE="$CONFIG_DIR/config.yaml"
LOG_FILE="$PROJECT_DIR/logs/code-server.log"
PORT=8443
BIND_ADDR="0.0.0.0"  # يسمح بالوصول من أي IP

# ====================== الدوال ==============================================

log()    { echo -e "${GREEN}[✓]${NC} $1"; }
warn()   { echo -e "${YELLOW}[⚠]${NC} $1"; }
error()  { echo -e "${RED}[✗]${NC} $1"; }
info()   { echo -e "${CYAN}[ℹ]${NC} $1"; }
title()  { echo -e "\n${BOLD}${BLUE}══════════════════════════════════════════${NC}"; echo -e "${BOLD}${BLUE}  $1${NC}"; echo -e "${BOLD}${BLUE}══════════════════════════════════════════${NC}\n"; }

# ====================== فحص المتطلبات =======================================
check_requirements() {
    title "فحص المتطلبات"

    # Node.js
    if command -v node &>/dev/null; then
        NODE_VER=$(node --version)
        log "Node.js: $NODE_VER"
    else
        error "Node.js غير مثبت!"
        exit 1
    fi

    # npm
    if command -v npm &>/dev/null; then
        NPM_VER=$(npm --version)
        log "npm: $NPM_VER"
    else
        error "npm غير مثبت!"
        exit 1
    fi

    # curl
    if command -v curl &>/dev/null; then
        log "curl: متاح"
    else
        warn "curl غير متاح — سيتم تثبيته"
        sudo apt-get install -y curl 2>/dev/null || true
    fi

    log "جميع المتطلبات موجودة"
}

# ====================== توليد كلمة مرور آمنة ================================
generate_secure_password() {
    # توليد كلمة مرور عشوائية 20 حرف
    if command -v openssl &>/dev/null; then
        openssl rand -base64 20 | tr -dc 'A-Za-z0-9!@#$%' | head -c 20
    elif command -v python3 &>/dev/null; then
        python3 -c "import secrets, string; print(secrets.token_urlsafe(20))"
    else
        # fallback بسيط
        tr -dc 'A-Za-z0-9!@#$%' < /dev/urandom | head -c 20
    fi
}

# ====================== تثبيت code-server ==================================
install_code_server() {
    title "تثبيت code-server"

    if command -v code-server &>/dev/null; then
        CS_VER=$(code-server --version 2>/dev/null | head -1)
        log "code-server مثبت مسبقاً: $CS_VER"
        return 0
    fi

    info "جاري تثبيت code-server..."

    # الطريقة 1: سكربت التثبيت الرسمي
    if curl -fsSL https://code-server.dev/install.sh | sh -s -- --dry-run &>/dev/null; then
        curl -fsSL https://code-server.dev/install.sh | sh
        log "تم التثبيت عبر السكربت الرسمي"
    # الطريقة 2: npm
    elif npm install -g code-server; then
        log "تم التثبيت عبر npm"
    else
        error "فشل تثبيت code-server!"
        info "جرب يدوياً: npm install -g code-server"
        exit 1
    fi
}

# ====================== إعداد الإعدادات =====================================
configure_code_server() {
    title "إعداد ملف الإعدادات"

    # إنشاء مجلد الإعدادات
    mkdir -p "$CONFIG_DIR"
    mkdir -p "$(dirname "$LOG_FILE")"

    # إنشاء كلمة مرور آمنة إذا لم تكن موجودة
    if [ ! -f "$CONFIG_DIR/.password" ]; then
        PASS=$(generate_secure_password)
        echo "$PASS" > "$CONFIG_DIR/.password"
        chmod 600 "$CONFIG_DIR/.password"
        log "تم توليد كلمة مرور جديدة ومحفوظة في: $CONFIG_DIR/.password"
    else
        PASS=$(cat "$CONFIG_DIR/.password")
        log "كلمة المرور محملة من الملف المحفوظ"
    fi

    # كتابة ملف الإعدادات
    cat > "$CONFIG_FILE" << YAML
# ================================================================
# إعدادات code-server — منظومة شيخة
# ================================================================

# العنوان والمنفذ
bind-addr: ${BIND_ADDR}:${PORT}

# المصادقة — كلمة مرور
auth: password
password: ${PASS}

# تلقائياً HTTPS (يوصى به للاستخدام على الجوال)
cert: false

# مجلد العمل الافتراضي
# (سيفتح مشروع شيخة تلقائياً)

YAML

    chmod 600 "$CONFIG_FILE"
    log "تم كتابة ملف الإعدادات: $CONFIG_FILE"
}

# ====================== حفظ بيانات الاتصال ==================================
save_connection_info() {
    title "حفظ بيانات الاتصال"

    # الحصول على الـ IP
    LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
    PASS=$(cat "$CONFIG_DIR/.password")

    # حفظ في ملف الإعدادات
    INFO_FILE="$PROJECT_DIR/config/mobile-access.json"
    mkdir -p "$PROJECT_DIR/config"

    cat > "$INFO_FILE" << JSON
{
  "_comment": "بيانات الوصول لـ code-server — لا تشارك هذا الملف",
  "generated_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "access": {
    "local_ip": "${LOCAL_IP}",
    "port": ${PORT},
    "url_local": "http://${LOCAL_IP}:${PORT}",
    "url_https": "https://${LOCAL_IP}:${PORT}"
  },
  "auth": {
    "type": "password",
    "password_file": "${CONFIG_DIR}/.password",
    "note": "كلمة المرور محفوظة في password_file فقط — لا تظهر هنا للأمان"
  },
  "workspace": {
    "default_path": "${PROJECT_DIR}"
  },
  "status": "configured"
}
JSON

    chmod 600 "$INFO_FILE"
    log "تم حفظ معلومات الاتصال في: config/mobile-access.json"

    # عرض ملخص الاتصال
    echo ""
    echo -e "${BOLD}${GREEN}╔══════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}${GREEN}║         بيانات الاتصال من الجوال                ║${NC}"
    echo -e "${BOLD}${GREEN}╠══════════════════════════════════════════════════╣${NC}"
    echo -e "${BOLD}${GREEN}║${NC} الرابط المحلي  : ${CYAN}http://${LOCAL_IP}:${PORT}${NC}"
    echo -e "${BOLD}${GREEN}║${NC} كلمة المرور   : ${YELLOW}${PASS}${NC}"
    echo -e "${BOLD}${GREEN}║${NC} المنفذ        : ${PORT}"
    echo -e "${BOLD}${GREEN}║${NC} الحالة        : جاهز للتشغيل"
    echo -e "${BOLD}${GREEN}╚══════════════════════════════════════════════════╝${NC}"
    echo ""
    warn "احفظ كلمة المرور الآن — لن تظهر مجدداً في هذا الدليل"
    info "كلمة المرور محفوظة أيضاً في: $CONFIG_DIR/.password"
}

# ====================== تشغيل code-server ==================================
start_code_server() {
    title "تشغيل code-server"

    # إيقاف أي نسخة قديمة
    if pgrep -x "code-server" &>/dev/null; then
        warn "إيقاف نسخة قديمة من code-server..."
        pkill -x "code-server" || true
        sleep 1
    fi

    info "جاري التشغيل على المنفذ ${PORT}..."

    # التشغيل في الخلفية
    nohup code-server \
        --config "$CONFIG_FILE" \
        "$PROJECT_DIR" \
        >> "$LOG_FILE" 2>&1 &

    CS_PID=$!
    echo $CS_PID > "$CONFIG_DIR/code-server.pid"

    sleep 2

    # التحقق من التشغيل
    if ps -p $CS_PID &>/dev/null; then
        log "code-server يعمل بنجاح (PID: $CS_PID)"
        log "السجلات في: $LOG_FILE"
    else
        error "فشل تشغيل code-server!"
        info "السجلات:"
        tail -20 "$LOG_FILE" 2>/dev/null || echo "لا توجد سجلات"
        exit 1
    fi
}

# ====================== عرض الملخص النهائي ==================================
show_summary() {
    title "الملخص النهائي"

    LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
    PASS=$(cat "$CONFIG_DIR/.password")

    echo -e "${BOLD}خطوات الاتصال من الجوال:${NC}"
    echo ""
    echo -e "  ${CYAN}1.${NC} تأكد أن جهازك والجوال على نفس الشبكة (WiFi)"
    echo -e "  ${CYAN}2.${NC} افتح متصفح الجوال"
    echo -e "  ${CYAN}3.${NC} اكتب الرابط: ${BOLD}http://${LOCAL_IP}:${PORT}${NC}"
    echo -e "  ${CYAN}4.${NC} أدخل كلمة المرور: ${BOLD}${PASS}${NC}"
    echo -e "  ${CYAN}5.${NC} سيفتح VS Code مباشرة في متصفحك!"
    echo ""
    echo -e "${BOLD}أوامر إضافية:${NC}"
    echo -e "  ${YELLOW}npm run ops:mobile:start${NC}   — تشغيل code-server"
    echo -e "  ${YELLOW}npm run ops:mobile:stop${NC}    — إيقاف code-server"
    echo -e "  ${YELLOW}npm run ops:mobile:status${NC}  — فحص الحالة"
    echo -e "  ${YELLOW}npm run ops:mobile:password${NC} — عرض كلمة المرور"
    echo ""
    log "الإعداد اكتمل بنجاح!"
}

# ====================== نقطة الدخول الرئيسية ================================
main() {
    echo -e "${BOLD}${CYAN}"
    echo "  ╔══════════════════════════════════════════╗"
    echo "  ║   إعداد VS Code Mobile — منظومة شيخة   ║"
    echo "  ╚══════════════════════════════════════════╝"
    echo -e "${NC}"

    check_requirements
    install_code_server
    configure_code_server
    save_connection_info
    start_code_server
    show_summary
}

# تشغيل
main "$@"
