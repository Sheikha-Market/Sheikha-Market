#!/usr/bin/env bash
set -euo pipefail

# بسم الله الرحمن الرحيم
# ╔══════════════════════════════════════════════════════════════════════════════╗
# ║  DNS Failover Manager — التوجيه الذكي على المستوى العالمي                  ║
# ║  يراقب السيرفرات ويعدّل DNS records تلقائياً عند الفشل                      ║
# ╚══════════════════════════════════════════════════════════════════════════════╝
#
# المنطق:
#   1. فحص صحة السيرفر الرئيسي
#   2. إذا معطوب → أوجّه DNS للسيرفر الثانوي
#   3. إذا عاود → أرجع للسيرفر الرئيسي
#
# الخيارات:
#   - Cloudflare API (الأفضل والأسرع)
#   - AWS Route53
#   - Namecheap
#   - أو تحديث محلي عبر /etc/hosts (للاختبار)
#
# المتطلبات:
#   - jq (للـ JSON parsing)
#   - curl
#   - Cloudflare API Key (اختياري)

# ─── الإعدادات ────────────────────────────────────────────────────────────────
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
readonly LOG_DIR="${PROJECT_ROOT}/logs"
readonly LOG_FILE="${LOG_DIR}/sheikha-dns-failover.log"
readonly METRICS_FILE="${LOG_DIR}/dns-failover-metrics.json"

# ─── الدومين والـ IPs ────────────────────────────────────────────────────────
readonly DOMAIN='sheikha.top'
readonly PRIMARY_IP="${PRIMARY_IP:-31.97.190.74}"           # السيرفر الرئيسي
readonly PRIMARY_PORT='80'
readonly SECONDARY_IP="${SECONDARY_IP:-}"                   # السيرفر الثانوي (اختياري)
readonly SECONDARY_PORT='80'

# ─── Cloudflare Configuration (اختياري) ──────────────────────────────────────
readonly CF_API_KEY="${CLOUDFLARE_API_TOKEN:-${CLOUDFLARE_API_KEY:-}}"  # استخدم API_TOKEN أولاً
readonly CF_ZONE_ID="${CLOUDFLARE_ZONE_ID:-}"              # zone_id للدومين
readonly CF_RECORD_NAME="sheikha.top"                       # اسم الـ record

# ─── فترات الفحص (ثواني) ──────────────────────────────────────────────────────
readonly HEALTH_CHECK_INTERVAL=30     # افحص كل 30 ثانية
readonly FAILOVER_TIMEOUT=3           # timeout للفحص
readonly STABILITY_CHECKS=2           # عدد الفحوصات الناجحة قبل تبديل DNS

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

# فحص صحة السيرفر عبر HTTP
health_check_http() {
    local ip="$1"
    local port="$2"

    local http_code=$(curl -s -o /dev/null -w "%{http_code}" \
        --max-time "$FAILOVER_TIMEOUT" \
        "http://${ip}:${port}/api/health" 2>/dev/null || echo "000")

    if [[ "$http_code" == "200" ]]; then
        return 0  # صحي
    else
        log_debug "HTTP check for $ip:$port returned: $http_code"
        return 1  # معطوب
    fi
}

# فحص صحة السيرفر عبر ICMP (ping)
health_check_ping() {
    local ip="$1"

    ping -c 1 -W "$FAILOVER_TIMEOUT" "$ip" >/dev/null 2>&1 && return 0 || return 1
}

# فحص شامل للسيرفر
check_server_health() {
    local ip="$1"
    local port="$2"

    # جرّب HTTP أولاً، ثم ICMP إذا فشل
    if health_check_http "$ip" "$port"; then
        return 0
    fi

    if health_check_ping "$ip"; then
        return 0
    fi

    return 1
}

# ─── Cloudflare API Integration ────────────────────────────────────────────────

# تحديث DNS Record على Cloudflare
update_cloudflare_dns() {
    local record_name="$1"
    local new_ip="$2"

    if [[ -z "$CF_API_KEY" || -z "$CF_ZONE_ID" ]]; then
        log_warn "Cloudflare API key or zone ID not configured"
        return 1
    fi

    log_info "Updating Cloudflare DNS: $record_name → $new_ip"

    # ابحث عن الـ record ID أولاً (إجبار IPv4 لتجنب حظر IP filtering على IPv6)
    local lookup_response
    lookup_response=$(curl -4 -s -X GET "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records?name=${record_name}" \
        -H "Authorization: Bearer ${CF_API_KEY}" \
        -H "Content-Type: application/json")

    local record_id
    record_id=$(echo "$lookup_response" | jq -r '.result[0].id' 2>/dev/null)

    if [[ -z "$record_id" || "$record_id" == "null" ]]; then
        log_error "Could not find DNS record ID for $record_name"
        echo "$lookup_response" | jq -c '{success, errors, messages, result_info}' >> "$LOG_FILE" 2>/dev/null || true
        return 1
    fi

    # حدّث الـ record
    local response=$(curl -4 -s -X PUT \
        "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/dns_records/${record_id}" \
        -H "Authorization: Bearer ${CF_API_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"type\": \"A\",
            \"name\": \"$record_name\",
            \"content\": \"$new_ip\",
            \"ttl\": 120,
            \"proxied\": false
        }")

    if echo "$response" | jq -e '.success' >/dev/null 2>&1; then
        log_info "✓ Cloudflare DNS updated successfully"
        return 0
    else
        log_error "✗ Failed to update Cloudflare DNS"
        echo "$response" | jq '.' >> "$LOG_FILE" 2>/dev/null || true
        return 1
    fi
}

# ─── Local /etc/hosts Failover (للاختبار) ──────────────────────────────────

update_hosts_file() {
    local domain="$1"
    local new_ip="$2"
    local hosts_file='/etc/hosts'

    if [[ ! -w "$hosts_file" ]]; then
        log_warn "Cannot write to $hosts_file (permission denied)"
        return 1
    fi

    log_info "Updating $hosts_file: $domain → $new_ip"

    # أزل الـ entry القديم
    sed -i "/[[:space:]]${domain}[[:space:]]*$/d" "$hosts_file"

    # أضف الـ entry الجديد
    echo "$new_ip    $domain" >> "$hosts_file"

    log_info "✓ Local /etc/hosts updated"
    return 0
}

# ─── AWS Route53 Integration (اختياري) ────────────────────────────────────────

# تحديث DNS على Route53
update_route53_dns() {
    local domain="$1"
    local new_ip="$2"

    # يتطلب: aws cli + credentials
    if ! command -v aws &>/dev/null; then
        log_warn "AWS CLI not installed, skipping Route53 update"
        return 1
    fi

    log_info "Updating Route53: $domain → $new_ip"

    # هذا مثال مبسط — قد تحتاج تعديل حسب إعدادات Route53
    aws route53 change-resource-record-sets \
        --hosted-zone-id "YOUR_ZONE_ID" \
        --change-batch "{
            \"Changes\": [{
                \"Action\": \"UPSERT\",
                \"ResourceRecordSet\": {
                    \"Name\": \"$domain\",
                    \"Type\": \"A\",
                    \"TTL\": 120,
                    \"ResourceRecords\": [{\"Value\": \"$new_ip\"}]
                }
            }]
        }" || {
        log_error "Failed to update Route53"
        return 1
    }

    log_info "✓ Route53 updated"
    return 0
}

# ─── Main Failover Logic ──────────────────────────────────────────────────────

perform_failover() {
    log_info "════════════════════════════════════════════"
    log_info "Performing DNS failover check..."
    log_info "════════════════════════════════════════════"

    local primary_healthy=false
    local secondary_healthy=false
    local current_ip=""

    # فحص السيرفر الرئيسي
    if check_server_health "$PRIMARY_IP" "$PRIMARY_PORT"; then
        log_info "✓ Primary server ($PRIMARY_IP) is HEALTHY"
        primary_healthy=true
    else
        log_error "✗ Primary server ($PRIMARY_IP) is DOWN"
        primary_healthy=false
    fi

    # فحص السيرفر الثانوي (إذا كان مُعرّف)
    if [[ -n "$SECONDARY_IP" ]]; then
        if check_server_health "$SECONDARY_IP" "$SECONDARY_PORT"; then
            log_info "✓ Secondary server ($SECONDARY_IP) is HEALTHY"
            secondary_healthy=true
        else
            log_debug "Secondary server ($SECONDARY_IP) is DOWN"
            secondary_healthy=false
        fi
    fi

    # تحديد الـ IP الذي يجب أن يشير إليه DNS
    if [[ "$primary_healthy" == true ]]; then
        current_ip="$PRIMARY_IP"
        log_info "Using PRIMARY server: $PRIMARY_IP"
    elif [[ -n "$SECONDARY_IP" && "$secondary_healthy" == true ]]; then
        current_ip="$SECONDARY_IP"
        log_warn "Switching to SECONDARY server: $SECONDARY_IP"
    else
        log_error "🔴 CRITICAL: All servers are DOWN!"
        save_metrics "" "$primary_healthy" "$secondary_healthy" false
        if [[ "${FAIL_ON_ALL_DOWN:-0}" == "1" ]]; then
            return 2
        fi
        log_warn "All servers down, service will continue monitoring"
        return 0
    fi

    # حدّث DNS (جرّب كل الطرق)
    local dns_updated=false

    # Cloudflare
    if [[ -n "$CF_API_KEY" && -n "$CF_ZONE_ID" ]]; then
        update_cloudflare_dns "$CF_RECORD_NAME" "$current_ip" && dns_updated=true
    fi

    # AWS Route53
    # update_route53_dns "$DOMAIN" "$current_ip" && dns_updated=true

    # Local /etc/hosts (للاختبار)
    update_hosts_file "$DOMAIN" "$current_ip" && dns_updated=true

    # حفظ المقاييس
    save_metrics "$current_ip" "$primary_healthy" "$secondary_healthy" "$dns_updated"

    return 0
}

# حفظ المقاييس
save_metrics() {
    local current_ip="$1"
    local primary_healthy="$2"
    local secondary_healthy="$3"
    local dns_updated="$4"

    mkdir -p "$LOG_DIR"

    cat > "$METRICS_FILE" <<EOF
{
  "timestamp": "$(date -Is)",
  "domain": "$DOMAIN",
  "current_ip": "$current_ip",
  "primary": {
    "ip": "$PRIMARY_IP",
    "status": "$primary_healthy"
  },
  "secondary": {
    "ip": "$SECONDARY_IP",
    "status": "$secondary_healthy"
  },
  "dns_updated": $dns_updated
}
EOF
}

# ─── الـ Entry Point ────────────────────────────────────────────────────────

main() {
    mkdir -p "$LOG_DIR"

    log_info "════════════════════════════════════════════════════════"
    log_info "🌍 DNS Failover Manager Started"
    log_info "════════════════════════════════════════════════════════"
    log_info "Domain: $DOMAIN"
    log_info "Primary: $PRIMARY_IP:$PRIMARY_PORT"
    [[ -n "$SECONDARY_IP" ]] && log_info "Secondary: $SECONDARY_IP:$SECONDARY_PORT"
    log_info "Check Interval: ${HEALTH_CHECK_INTERVAL}s"

    if [[ "${CONTINUOUS:-0}" == "1" ]]; then
        log_info "Running in continuous mode..."
        while true; do
            if ! perform_failover; then
                log_warn "Failover cycle returned non-zero, continuing loop"
            fi
            sleep "$HEALTH_CHECK_INTERVAL"
        done
    else
        # تشغيل واحد فقط
        perform_failover || true
    fi

    return 0
}

main "$@"
