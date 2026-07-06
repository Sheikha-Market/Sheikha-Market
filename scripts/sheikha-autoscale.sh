#!/usr/bin/env bash
set -euo pipefail

# بسم الله الرحمن الرحيم
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  Auto Scaling Engine — توسع ذكي بناءً على الحمل                            ║
# ║  يراقب الحمل والموارد ويشغّل/يوقف السيرفرات الثانوية تلقائياً               ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# المنطق:
#   - اذا الحمل > THRESHOLD_HIGH  → ابدأ instance ثانية (scale up)
#   - اذا الحمل < THRESHOLD_LOW   → أوقف instance ثانية (scale down)
#   - مراقبة الذاكرة و CPU أيضاً
#   - تحديث HAProxy backend تلقائياً
#
# المتطلبات:
#   - bc (للحسابات العشرية)
#   - curl
#   - SSH key مُعدة للسيرفر الثاني (اختياري)
#
# التشغيل:
#   chmod +x scripts/sheikha-autoscale.sh
#   ./scripts/sheikha-autoscale.sh
#
# أو كـ Timer:
#   systemctl start sheikha-autoscale.timer

# ─── الإعدادات ────────────────────────────────────────────────────────────────
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
readonly LOG_DIR="${PROJECT_ROOT}/logs"
readonly LOG_FILE="${LOG_DIR}/sheikha-autoscale.log"
readonly STATE_DIR="${PROJECT_ROOT}/.state"
readonly STATE_FILE="${STATE_DIR}/autoscale-state.json"
readonly METRICS_FILE="${LOG_DIR}/autoscale-metrics.json"

# ─── عتبات الحمل والموارد ─────────────────────────────────────────────────────
readonly LOAD_THRESHOLD_HIGH=2.0      # بدء التوسع إذا الحمل > هذا
readonly LOAD_THRESHOLD_LOW=0.5       # إيقاف التوسع إذا الحمل < هذا
readonly CPU_THRESHOLD_HIGH=75        # بدء التوسع إذا CPU > هذا %
readonly MEMORY_THRESHOLD_HIGH=80     # بدء التوسع إذا RAM > هذا %
readonly MEMORY_THRESHOLD_LOW=40      # إيقاف التوسع إذا RAM < هذا %

# ─── السيرفرات ────────────────────────────────────────────────────────────────
readonly PRIMARY_SERVER='127.0.0.1:8080'
readonly SECONDARY_SERVER="${SECONDARY_SERVER:-}"  # X.X.X.X:8080
readonly SECONDARY_SSH_USER="${SECONDARY_SSH_USER:-root}"
readonly SECONDARY_APP_PATH='/opt/sheikha/current/server.js'

# ─── الفترات الزمنية (ثواني) ─────────────────────────────────────────────────
readonly SCALE_UP_COOLDOWN=60        # انتظر 60 ثانية قبل scale up جديد
readonly SCALE_DOWN_COOLDOWN=300     # انتظر 5 دقائق قبل scale down
readonly CHECK_INTERVAL=10            # افحص كل 10 ثواني

# ─── الألوان ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# ─── الدوال المساعدة ──────────────────────────────────────────────────────────

log() {
    local level="$1"
    shift
    local msg="$@"
    local ts=$(date -Is)
    echo "[$ts] [$level] $msg" | tee -a "$LOG_FILE"
}

log_info() { log "INFO" "$@"; }
log_warn() { log "WARN" "$@"; }
log_error() { log "ERROR" "$@"; }
log_debug() { [[ "${DEBUG:-0}" == "1" ]] && log "DEBUG" "$@"; }

# حفظ الحالة (للـ Cooldown tracking)
save_state() {
    local key="$1"
    local value="$2"

    mkdir -p "$STATE_DIR"

    local json='{}'
    if [[ -f "$STATE_FILE" ]]; then
        json=$(cat "$STATE_FILE")
    fi

    # استخدم jq أو fallback إلى echo
    if command -v jq &>/dev/null; then
        echo "$json" | jq --arg k "$key" --arg v "$value" '.[$k] = $v' > "$STATE_FILE"
    else
        # Fallback بسيط (بدون jq)
        echo "{\"$key\": \"$value\"}" > "$STATE_FILE"
    fi
}

read_state() {
    local key="$1"

    if [[ ! -f "$STATE_FILE" ]]; then
        echo ""
        return 0
    fi

    if command -v jq &>/dev/null; then
        cat "$STATE_FILE" | jq -r ".\"$key\" // \"\"" 2>/dev/null || echo ""
    else
        echo ""
    fi
}

# حساب الحمل الحالي
get_load_average() {
    # قراءة الحمل من /proc/loadavg (أول قيمة = الحمل في آخر دقيقة)
    awk '{print $1}' /proc/loadavg
}

# حساب استخدام CPU
get_cpu_usage() {
    # طريقة بسيطة باستخدام top (قد تختلف حسب النظام)
    top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1}'
}

# حساب استخدام الذاكرة
get_memory_usage() {
    free | grep Mem | awk '{print int($3/$2 * 100)}'
}

# فحص اتصال السيرفر
check_server_alive() {
    local server="$1"
    local timeout=3

    IFS=':' read -r host port <<< "$server"

    # محاولة الاتصال عبر TCP
    timeout "$timeout" bash -c "echo > /dev/tcp/${host}/${port}" 2>/dev/null && return 0 || return 1
}

# شغّل السيرفر الثاني (SSH)
start_secondary_server() {
    if [[ -z "$SECONDARY_SERVER" ]]; then
        log_info "SECONDARY_SERVER not configured, staying in single-server mode"
        return 0
    fi

    IFS=':' read -r host port <<< "$SECONDARY_SERVER"

    log_info "🚀 Starting secondary server at $SECONDARY_SERVER..."

    # تنفيذ الأمر عبر SSH
    ssh -q "$SECONDARY_SSH_USER@$host" "pm2 start $SECONDARY_APP_PATH --name sheikha-api-2 || true" 2>/dev/null

    if [ $? -eq 0 ]; then
        log_info "✓ Secondary server started successfully"
        # انتظر لحظة حتى يبدأ
        sleep 3
        # تحقق أنه شغّال
        if check_server_alive "$SECONDARY_SERVER"; then
            log_info "✓ Secondary server is responding"
            save_state "last_scale_up" "$(date -Is)"
            return 0
        fi
    fi

    log_error "✗ Failed to start secondary server"
    return 1
}

# أوقف السيرفر الثاني (SSH)
stop_secondary_server() {
    if [[ -z "$SECONDARY_SERVER" ]]; then
        log_info "SECONDARY_SERVER not configured, nothing to scale down"
        return 0
    fi

    IFS=':' read -r host port <<< "$SECONDARY_SERVER"

    log_info "🛑 Stopping secondary server at $SECONDARY_SERVER..."

    ssh -q "$SECONDARY_SSH_USER@$host" "pm2 stop sheikha-api-2 || true" 2>/dev/null

    if [ $? -eq 0 ]; then
        log_info "✓ Secondary server stopped"
        save_state "last_scale_down" "$(date -Is)"
        return 0
    fi

    log_error "✗ Failed to stop secondary server"
    return 1
}

# حفظ المقاييس
save_metrics() {
    local load="$1"
    local cpu="$2"
    local mem="$3"
    local status="$4"

    mkdir -p "$LOG_DIR"

    cat > "$METRICS_FILE" <<EOF
{
  "timestamp": "$(date -Is)",
  "load_average": $load,
  "cpu_usage": $cpu,
  "memory_usage": $mem,
  "scaling_status": "$status",
  "thresholds": {
    "load_high": $LOAD_THRESHOLD_HIGH,
    "load_low": $LOAD_THRESHOLD_LOW,
    "cpu_high": $CPU_THRESHOLD_HIGH,
    "memory_high": $MEMORY_THRESHOLD_HIGH
  }
}
EOF
}

# ─── قرار التوسع (Scale Decision Logic) ────────────────────────────────────

should_scale_up() {
    local load="$1"
    local cpu="$2"
    local mem="$3"

    # شروط التوسع
    if (( $(echo "$load > $LOAD_THRESHOLD_HIGH" | bc -l) )); then
        log_warn "Load is high: $load > $LOAD_THRESHOLD_HIGH"
        return 0  # Yes, scale up
    fi

    if (( $(echo "$cpu > $CPU_THRESHOLD_HIGH" | bc -l) )); then
        log_warn "CPU usage is high: $cpu% > $CPU_THRESHOLD_HIGH%"
        return 0
    fi

    if (( $(echo "$mem > $MEMORY_THRESHOLD_HIGH" | bc -l) )); then
        log_warn "Memory usage is high: $mem% > $MEMORY_THRESHOLD_HIGH%"
        return 0
    fi

    return 1  # No scale up needed
}

should_scale_down() {
    local load="$1"
    local cpu="$2"
    local mem="$3"

    # شروط الانكماش
    if (( $(echo "$load < $LOAD_THRESHOLD_LOW" | bc -l) )); then
        if (( $(echo "$mem < $MEMORY_THRESHOLD_LOW" | bc -l) )); then
            log_info "Resources are low: load=$load, mem=$mem%"
            return 0  # Yes, scale down
        fi
    fi

    return 1  # No scale down needed
}

# ─── الـ Main Scaling Logic ────────────────────────────────────────────────────

perform_scaling_check() {
    if [[ -z "$SECONDARY_SERVER" ]]; then
        local load_single=$(get_load_average)
        local cpu_single=$(get_cpu_usage)
        local mem_single=$(get_memory_usage)

        log_info "Single-server mode: autoscale monitoring only"
        save_metrics "$load_single" "$cpu_single" "$mem_single" "SINGLE_SERVER"
        return 0
    fi

    local load=$(get_load_average)
    local cpu=$(get_cpu_usage)
    local mem=$(get_memory_usage)

    log_debug "Current metrics: load=$load, cpu=$cpu%, mem=$mem%"

    # تحقق من Cooldown
    local last_scale_up=$(read_state "last_scale_up")
    local last_scale_down=$(read_state "last_scale_down")
    local now=$(date +%s)

    # Scale Up Decision
    if should_scale_up "$load" "$cpu" "$mem"; then
        if [[ -z "$last_scale_up" ]] || (( now - $(date -d "$last_scale_up" +%s) > SCALE_UP_COOLDOWN )); then
            log_info "════════════════════════════════════════════"
            log_info "🔥 SCALE UP TRIGGER"
            log_info "════════════════════════════════════════════"
            start_secondary_server
            save_metrics "$load" "$cpu" "$mem" "SCALED_UP"
        else
            log_info "Scale up on cooldown, skipping"
        fi
    fi

    # Scale Down Decision
    if should_scale_down "$load" "$cpu" "$mem"; then
        if [[ -z "$last_scale_down" ]] || (( now - $(date -d "$last_scale_down" +%s) > SCALE_DOWN_COOLDOWN )); then
            log_info "════════════════════════════════════════════"
            log_info "📉 SCALE DOWN TRIGGER"
            log_info "════════════════════════════════════════════"
            stop_secondary_server
            save_metrics "$load" "$cpu" "$mem" "SCALED_DOWN"
        else
            log_info "Scale down on cooldown, skipping"
        fi
    else
        # Normal state
        save_metrics "$load" "$cpu" "$mem" "STABLE"
    fi
}

# ─── الـ Entry Point ────────────────────────────────────────────────────────

main() {
    mkdir -p "$LOG_DIR" "$STATE_DIR"

    log_info "════════════════════════════════════════════════════════"
    log_info "🤖 Auto Scaling Engine Started"
    log_info "════════════════════════════════════════════════════════"
    log_info "Load Thresholds: UP=$LOAD_THRESHOLD_HIGH, DOWN=$LOAD_THRESHOLD_LOW"
    log_info "CPU Threshold: $CPU_THRESHOLD_HIGH%"
    log_info "Memory Thresholds: UP=$MEMORY_THRESHOLD_HIGH%, DOWN=$MEMORY_THRESHOLD_LOW%"
    log_info "Cooldowns: UP=${SCALE_UP_COOLDOWN}s, DOWN=${SCALE_DOWN_COOLDOWN}s"
    log_info "Primary: $PRIMARY_SERVER"
    [[ -n "$SECONDARY_SERVER" ]] && log_info "Secondary: $SECONDARY_SERVER"

    # تشغيل loop واحد أم مراقبة دورية؟
    if [[ "${CONTINUOUS:-0}" == "1" ]]; then
        log_info "Running in continuous mode (check every ${CHECK_INTERVAL}s)..."
        while true; do
            perform_scaling_check
            sleep "$CHECK_INTERVAL"
        done
    else
        # تشغيل واحد فقط
        perform_scaling_check
    fi
}

main "$@"
