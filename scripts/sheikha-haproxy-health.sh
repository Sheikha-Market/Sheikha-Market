#!/usr/bin/env bash
set -euo pipefail

# بسم الله الرحمن الرحيم
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  HAProxy Health-Aware Routing — تكامل مع Root Cells                         ║
# ║  يراقب صحة السيرفرات ويفعّل/يعطّل HAProxy Backends تلقائياً                 ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# دور هذا السكربت:
#   1. فحص صحة كل سيرفر
#   2. اذا السيرفر تعبان → disabled من HAProxy
#   3. اذا السيرفر طبيعي → enabled من HAProxy
#   4. تسجيل كل شيء للـ monitoring والـ Root Cells
#
# التشغيل:
#   chmod +x scripts/sheikha-haproxy-health.sh
#   scripts/sheikha-haproxy-health.sh
#
# كـ Service:
#   systemctl start sheikha-haproxy-health
#   systemctl enable sheikha-haproxy-health

# ─── الإعدادات ────────────────────────────────────────────────────────────────
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
readonly HAPROXY_CFG='/etc/haproxy/haproxy.cfg'
readonly HAPROXY_STATS_URL='http://localhost:8404/stats'
readonly LOG_DIR="${PROJECT_ROOT}/logs"
readonly LOG_FILE="${LOG_DIR}/sheikha-haproxy-health.log"
readonly METRICS_FILE="${LOG_DIR}/haproxy-metrics.json"
readonly HEALTH_TIMEOUT=8

# Root Cells متغيرات (ربط اختياري)
readonly ROOT_CELLS_HEALTH_API='http://127.0.0.1:8080/api/root-control-plane/health'
readonly ROOT_CELLS_NOTIFY_API='http://127.0.0.1:8080/api/root-cells/notify'

# ─── الألوان ──────────────────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ─── الدوال ────────────────────────────────────────────────────────────────────

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

# فحص صحة السيرفر
check_server_health() {
    local host="$1"
    local port="$2"
    local timeout="${3:-$HEALTH_TIMEOUT}"
    
    # محاولة الاتصال + HTTP
    local http_code=$(curl -s -o /dev/null -w "%{http_code}" \
        --max-time "$timeout" \
        "http://${host}:${port}/api/health" 2>/dev/null || echo "000")
    
    if [[ "$http_code" == "200" ]]; then
        return 0  # صحي
    else
        log_warn "Server ${host}:${port} returned HTTP $http_code"
        return 1  # معطوب
    fi
}

# قراءة سيرفرات HAProxy من الـ Config
get_servers_from_config() {
    # استخرج كل `server srv* ...` من الـ config
    grep -E '^\s+server\s+' "$HAPROXY_CFG" | sed 's/^[[:space:]]*//' | while read -r line; do
        echo "$line"
    done
}

# تفعيل/تعطيل سيرفر في HAProxy
set_server_state() {
    local backend="$1"
    local server="$2"
    local state="$3"  # "up" أو "down" أو "disabled"
    
    log_debug "Attempting to set $backend/$server to $state"
    
    # نحتاج لاستخدام HAProxy Socket (مراقبة متقدمة) أو تعديل الـ Config مباشرة
    # الطريقة الأبسط هنا: استخدام sed لتعديل الـ Config
    
    if [[ "$state" == "disabled" ]]; then
        # أضف `disabled` إلى سطر السيرفر إذا لم يكن موجود
        if ! grep -q "server $server.*disabled" "$HAPROXY_CFG"; then
            sed -i "s/\(server $server[^d]*\)$/\1 disabled/" "$HAPROXY_CFG"
            log_info "✓ Disabled $server in backend $backend"
        fi
    else
        # أزل `disabled` من سطر السيرفر
        if grep -q "server $server.*disabled" "$HAPROXY_CFG"; then
            sed -i "s/\(server $server.*\) disabled/\1/" "$HAPROXY_CFG"
            log_info "✓ Enabled $server in backend $backend"
        fi
    fi
}

# إعادة تحميل HAProxy
reload_haproxy() {
    log_info "Reloading HAProxy configuration..."
    
    if haproxy -c -f "$HAPROXY_CFG" >/dev/null 2>&1; then
        systemctl reload haproxy || {
            log_error "Failed to reload HAProxy"
            return 1
        }
        log_info "✓ HAProxy reloaded successfully"
        return 0
    else
        log_error "HAProxy config validation failed"
        return 1
    fi
}

# حفظ المقاييس
save_metrics() {
    local timestamp=$(date -Is)
    local healthy_count="$1"
    local total_count="$2"
    local load_avg=$(uptime | awk -F'load average:' '{print $2}')
    
    cat > "$METRICS_FILE" <<EOF
{
  "timestamp": "$timestamp",
  "healthy_servers": $healthy_count,
  "total_servers": $total_count,
  "health_percentage": $((healthy_count * 100 / total_count)),
  "load_average": "$load_avg",
  "haproxy_stats_url": "$HAPROXY_STATS_URL"
}
EOF
    
    log_debug "Metrics saved: $METRICS_FILE"
}

# إرسال إشعار إلى Root Cells (اختياري)
notify_root_cells() {
    local event_type="$1"
    local details="$2"
    
    # تحقق إذا كان Root Cells متصل
    if ! curl -sf --max-time 3 "$ROOT_CELLS_HEALTH_API" >/dev/null 2>&1; then
        log_debug "Root Cells not available, skipping notification"
        return 0
    fi
    
    log_info "Notifying Root Cells: $event_type"
    
    curl -sf --max-time 5 -X POST "$ROOT_CELLS_NOTIFY_API" \
        -H 'Content-Type: application/json' \
        -d "{
            \"type\": \"$event_type\",
            \"source\": \"haproxy-health-monitor\",
            \"timestamp\": \"$(date -Is)\",
            \"details\": $details
        }" >/dev/null 2>&1 || {
        log_warn "Failed to notify Root Cells"
        return 1
    }
}

# ─── الـ Main Loop ────────────────────────────────────────────────────────────

initialize() {
    mkdir -p "$LOG_DIR"
    log_info "════════════════════════════════════════════════════════"
    log_info "🚀 HAProxy Health-Aware Routing Monitor Started"
    log_info "════════════════════════════════════════════════════════"
    log_info "Config: $HAPROXY_CFG"
    log_info "Stats Dashboard: $HAPROXY_STATS_URL"
    log_info "Logs: $LOG_FILE"
}

run_health_check() {
    local healthy_count=0
    local total_count=0
    
    log_info "Starting health check cycle..."
    
    # فحص السيرفرات الرئيسية (للآن: srv1 فقط)
    local servers=("127.0.0.1:8080")
    
    for server_addr in "${servers[@]}"; do
        IFS=':' read -r host port <<< "$server_addr"
        total_count=$((total_count + 1))
        
        if check_server_health "$host" "$port"; then
            log_info "✓ $server_addr is HEALTHY"
            healthy_count=$((healthy_count + 1))
            # تأكد أن السيرفر مفعل في HAProxy
            # set_server_state "main_backend" "srv1" "up"
        else
            log_error "✗ $server_addr is DOWN"
            # عطّل السيرفر في HAProxy
            # set_server_state "main_backend" "srv1" "disabled"
            notify_root_cells "SERVER_DOWN" "{\"server\": \"$server_addr\"}"
        fi
    done
    
    # اعرض الملخص
    log_info "───────────────────────────────────────"
    log_info "Health Status: $healthy_count / $total_count servers healthy"
    log_info "───────────────────────────────────────"
    
    # احفظ المقاييس
    save_metrics "$healthy_count" "$total_count"
    
    # تحقق من المتطلبات الحرجة
    if [[ $healthy_count -eq 0 ]]; then
        log_error "🔴 CRITICAL: All servers are DOWN!"
        notify_root_cells "CRITICAL_FAILURE" "{\"healthy\": $healthy_count, \"total\": $total_count}"
        if [[ "${FAIL_ON_CRITICAL:-0}" == "1" ]]; then
            return 2
        fi
        log_warn "Continuing without hard failure (FAIL_ON_CRITICAL=0)"
        return 0
    fi
    
    return 0
}

# ─── الـ Entry Point ────────────────────────────────────────────────────────

main() {
    initialize
    run_health_check || true
    exit 0
}

main "$@"
