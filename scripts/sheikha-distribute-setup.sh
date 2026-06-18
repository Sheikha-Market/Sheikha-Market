#!/usr/bin/env bash
set -euo pipefail

# بسم الله الرحمن الرحيم
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  SHEIKHA Distributed Infrastructure Setup                                   ║
# ║  تثبيت واحد شامل لـ:                                                        ║
# ║    ✓ HAProxy (Load Balancer)                                               ║
# ║    ✓ Health-Aware Routing                                                   ║
# ║    ✓ Auto Scaling Engine                                                    ║
# ║    ✓ DNS Failover Manager                                                   ║
# ║    ✓ systemd Services & Timers                                             ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# الاستخدام:
#   chmod +x scripts/sheikha-distribute-setup.sh
#   sudo ./scripts/sheikha-distribute-setup.sh [OPTIONS]
#
# الخيارات:
#   --haproxy-only      # تثبيت HAProxy فقط
#   --autoscale-only    # تثبيت Auto Scaling فقط
#   --dns-only          # تثبيت DNS Failover فقط
#   --secondary-ip X.X.X.X  # IP السيرفر الثاني
#   --all               # تثبيت الكل (الافتراضي)
#   --dry-run           # عرض ماذا سيتم بدون تنفيذ
#
# الأمثلة:
#   sudo ./scripts/sheikha-distribute-setup.sh --all
#   sudo ./scripts/sheikha-distribute-setup.sh --secondary-ip 192.168.1.100 --all

# ─── الإعدادات ────────────────────────────────────────────────────────────────
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
readonly HAPROXY_CFG="/etc/haproxy/haproxy.cfg"
readonly HAPROXY_ERRORS="/etc/haproxy/errors"
readonly HAPROXY_FALLBACK_BIND_HOST="127.0.0.1"
readonly HAPROXY_FALLBACK_BIND_PORT="8088"

# المتغيرات العالمية
INSTALL_HAPROXY=false
INSTALL_AUTOSCALE=false
INSTALL_DNS=false
DRY_RUN=false
SECONDARY_IP=""

# ─── الألوان ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# ─── الدوال ────────────────────────────────────────────────────────────────────

print_header() {
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}"
}

print_info() {
    echo -e "${GREEN}✓${NC} $@"
}

print_warn() {
    echo -e "${YELLOW}⚠${NC} $@"
}

print_error() {
    echo -e "${RED}✗${NC} $@"
}

print_section() {
    echo -e "\n${MAGENTA}▶ $@${NC}"
}

run_command() {
    local desc="$1"
    shift
    local cmd="$@"

    if [[ "$DRY_RUN" == true ]]; then
        echo "    [DRY] $cmd"
        return 0
    fi

    echo -ne "    $desc ... "
    if eval "$cmd" >/dev/null 2>&1; then
        echo -e "${GREEN}done${NC}"
        return 0
    else
        echo -e "${RED}failed${NC}"
        return 1
    fi
}

# فحص المتطلبات
check_requirements() {
    print_section "Checking Requirements"

    # تحقق من صلاحيات root
    if [[ $EUID -ne 0 ]]; then
        print_error "This script must be run as root"
        exit 1
    fi

    print_info "Running as root"

    # تحقق من الـ tools الأساسية
    local required_tools=("curl" "sed" "grep" "awk" "jq")
    for tool in "${required_tools[@]}"; do
        if command -v "$tool" &>/dev/null; then
            print_info "$tool is installed"
        else
            if [[ "$tool" == "jq" ]]; then
                print_warn "$tool not installed (optional, some features may be limited)"
            else
                print_error "$tool is required but not installed"
                exit 1
            fi
        fi
    done
}

# تثبيت HAProxy
install_haproxy() {
    print_section "Installing HAProxy"

    # تحقق إذا كان مثبت
    if command -v haproxy &>/dev/null; then
        local version=$(haproxy -v | head -1)
        print_info "$version is already installed"
        return 0
    fi

    print_info "HAProxy not found, installing..."

    run_command "Update package lists" "apt-get update -qq"
    run_command "Install HAProxy" "apt-get install -y haproxy bc curl"

    # تحقق من النسخة
    if command -v haproxy &>/dev/null; then
        print_info "HAProxy installed successfully: $(haproxy -v | head -1)"
    else
        print_error "HAProxy installation failed"
        return 1
    fi
}

# نسخ HAProxy Config
setup_haproxy_config() {
    print_section "Setting up HAProxy Configuration"

    if [[ ! -f "$PROJECT_ROOT/config/haproxy.cfg" ]]; then
        print_error "HAProxy config not found at $PROJECT_ROOT/config/haproxy.cfg"
        return 1
    fi

    # النسخ الاحتياطي
    if [[ -f "$HAPROXY_CFG" ]]; then
        run_command "Backup existing config" "cp '$HAPROXY_CFG' '${HAPROXY_CFG}.backup.$(date +%Y%m%d-%H%M%S)'"
    fi

    # نسخ الـ Config الجديد
    run_command "Copy HAProxy config" "cp '$PROJECT_ROOT/config/haproxy.cfg' '$HAPROXY_CFG'"

    # تحديث الـ Secondary IP إذا تم توفيره
    if [[ -n "$SECONDARY_IP" ]]; then
        print_info "Updating secondary server to $SECONDARY_IP"
        sed -i -E "s|^([[:space:]]*)#([[:space:]]*server[[:space:]]+srv2[[:space:]]+)X\\.X\\.X\\.X:8080|\\1\\2${SECONDARY_IP}:8080|" "$HAPROXY_CFG"
    fi

    # إذا كان المنفذ 80 مستخدماً من خدمة أخرى، حوّل HAProxy إلى منفذ داخلي آمن.
    if ss -ltn '( sport = :80 )' | tail -n +2 | grep -q .; then
        if ! ss -ltnp '( sport = :80 )' 2>/dev/null | grep -q 'haproxy'; then
            print_warn "Port 80 is already in use by another service; switching HAProxy frontend to ${HAPROXY_FALLBACK_BIND_HOST}:${HAPROXY_FALLBACK_BIND_PORT}"
            sed -i "s/^    bind \*:80$/    bind ${HAPROXY_FALLBACK_BIND_HOST}:${HAPROXY_FALLBACK_BIND_PORT}/" "$HAPROXY_CFG"
        fi
    fi

    # فحص الـ Config
    if haproxy -c -f "$HAPROXY_CFG" >/dev/null 2>&1; then
        print_info "HAProxy configuration is valid"
    else
        print_error "HAProxy configuration validation failed"
        return 1
    fi
}

# تفعيل HAProxy
enable_haproxy() {
    print_section "Enabling HAProxy"

    run_command "Enable HAProxy service" "systemctl enable haproxy"
    run_command "Start HAProxy service" "systemctl restart haproxy"

    sleep 2

    if systemctl is-active --quiet haproxy; then
        print_info "HAProxy is running"
        # اعرض stats URL
        echo ""
        print_info "HAProxy Stats Dashboard: http://localhost:8404/stats"
    else
        print_error "HAProxy failed to start"
        return 1
    fi
}

# نسخ الـ Scripts
setup_scripts() {
    print_section "Setting up Monitoring Scripts"

    # اجعل الـ Scripts قابلة للتنفيذ
    local scripts=(
        "sheikha-haproxy-health.sh"
        "sheikha-autoscale.sh"
        "sheikha-dns-failover.sh"
    )

    for script in "${scripts[@]}"; do
        local script_path="$SCRIPT_DIR/$script"
        if [[ -f "$script_path" ]]; then
            run_command "Make $script executable" "chmod +x '$script_path'"
        fi
    done
}

# تثبيت systemd Services
install_systemd_services() {
    print_section "Installing systemd Services"

    local services=(
        "sheikha-haproxy-health.service"
        "sheikha-haproxy-health.timer"
        "sheikha-autoscale.service"
        "sheikha-dns-failover.service"
    )

    for service in "${services[@]}"; do
        local src="$SCRIPT_DIR/$service"
        local dst="/etc/systemd/system/$service"

        if [[ -f "$src" ]]; then
            run_command "Install $service" "cp '$src' '$dst' && sed -i 's|__SHEIKHA_PROJECT_ROOT__|$PROJECT_ROOT|g' '$dst' && chmod 644 '$dst'"
        fi
    done

    # Reload systemd
    run_command "Reload systemd" "systemctl daemon-reload"
}

# تفعيل الخدمات
enable_services() {
    print_section "Enabling Services"

    if [[ "$INSTALL_HAPROXY" == true ]]; then
        run_command "Enable HAProxy health monitor" "systemctl enable sheikha-haproxy-health.timer"
        run_command "Start HAProxy health monitor" "systemctl start sheikha-haproxy-health.timer"
        print_info "HAProxy health check running every 30 seconds"
    fi

    if [[ "$INSTALL_AUTOSCALE" == true ]]; then
        run_command "Enable Auto Scaling" "systemctl enable sheikha-autoscale.service"
        run_command "Start Auto Scaling" "systemctl start sheikha-autoscale.service"
        print_info "Auto Scaling engine is active"
    fi

    if [[ "$INSTALL_DNS" == true ]]; then
        run_command "Enable DNS Failover" "systemctl enable sheikha-dns-failover.service"
        run_command "Start DNS Failover" "systemctl start sheikha-dns-failover.service"
        print_info "DNS Failover manager is active"
    fi
}

# عرض الحالة
show_status() {
    print_section "System Status"

    if systemctl is-active --quiet haproxy; then
        print_info "HAProxy: RUNNING"
    else
        print_warn "HAProxy: STOPPED"
    fi

    if systemctl is-active --quiet sheikha-haproxy-health.timer; then
        print_info "HAProxy Health Monitor: ACTIVE"
    fi

    if systemctl is-active --quiet sheikha-autoscale.service; then
        print_info "Auto Scaling: ACTIVE"
    fi

    if systemctl is-active --quiet sheikha-dns-failover.service; then
        print_info "DNS Failover: ACTIVE"
    fi
}

# عرض المعلومات المهمة
show_info() {
    echo ""
    print_header "📌 IMPORTANT INFORMATION"
    echo ""
    echo "1. 📊 المراقبة (Monitoring):"
    echo "   HAProxy Stats: http://localhost:8404/stats"
    echo "   HAProxy Frontend: راجع bind في $HAPROXY_CFG (قد يتحول تلقائياً إلى 127.0.0.1:8088 إذا كان 80 محجوزاً)"
    echo "   Logs: journalctl -u sheikha-haproxy-health -f"
    echo ""
    echo "2. 🔧 التكوين (Configuration):"
    echo "   HAProxy Config: $HAPROXY_CFG"
    echo "   Scripts: $SCRIPT_DIR"
    echo ""
    echo "3. 🌍 DNS Setup (اختياري):"
    echo "   • Cloudflare:"
    echo "     export CLOUDFLARE_API_KEY='your_key'"
    echo "     export CLOUDFLARE_ZONE_ID='your_zone_id'"
    echo "   • أو استخدم /etc/hosts (محلي)"
    echo ""
    echo "4. 🔐 السيرفر الثاني (Secondary Server):"
    if [[ -n "$SECONDARY_IP" ]]; then
        echo "   IP: $SECONDARY_IP"
    else
        echo "   لم يتم تكوينه — استخدم --secondary-ip X.X.X.X"
    fi
    echo ""
}

# Parse Arguments
parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            --haproxy-only)
                INSTALL_HAPROXY=true
                shift
                ;;
            --autoscale-only)
                INSTALL_AUTOSCALE=true
                shift
                ;;
            --dns-only)
                INSTALL_DNS=true
                shift
                ;;
            --all)
                INSTALL_HAPROXY=true
                INSTALL_AUTOSCALE=true
                INSTALL_DNS=true
                shift
                ;;
            --secondary-ip)
                SECONDARY_IP="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done

    # إذا لم يتم تحديد أي شيء، ثبّت الكل
    if [[ "$INSTALL_HAPROXY" == false && "$INSTALL_AUTOSCALE" == false && "$INSTALL_DNS" == false ]]; then
        INSTALL_HAPROXY=true
        INSTALL_AUTOSCALE=true
        INSTALL_DNS=true
    fi
}

# ─── الـ Main Entry Point ────────────────────────────────────────────────────

main() {
    parse_arguments "$@"

    print_header "🚀 SHEIKHA Distributed Infrastructure Setup"

    if [[ "$DRY_RUN" == true ]]; then
        print_warn "DRY RUN MODE — No changes will be made"
    fi

    echo ""
    echo "Installation Plan:"
    [[ "$INSTALL_HAPROXY" == true ]] && echo "  ✓ HAProxy Load Balancer"
    [[ "$INSTALL_AUTOSCALE" == true ]] && echo "  ✓ Auto Scaling Engine"
    [[ "$INSTALL_DNS" == true ]] && echo "  ✓ DNS Failover Manager"
    [[ -n "$SECONDARY_IP" ]] && echo "  ✓ Secondary Server: $SECONDARY_IP"
    echo ""

    # Confirmación
    if [[ "$DRY_RUN" != true ]]; then
        read -p "Continue with installation? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_warn "Installation cancelled"
            exit 0
        fi
    fi

    echo ""

    # Ejecutar instalación
    check_requirements

    if [[ "$INSTALL_HAPROXY" == true ]]; then
        install_haproxy
        setup_haproxy_config
        enable_haproxy
    fi

    setup_scripts
    install_systemd_services
    enable_services
    show_status
    show_info

    print_header "✅ Setup Complete!"
}

main "$@"
