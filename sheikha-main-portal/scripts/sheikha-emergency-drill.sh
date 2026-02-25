#!/usr/bin/env bash
set -euo pipefail

# بسم الله الرحمن الرحيم
# SHEIKHA EMERGENCY DRILL — فحص طوارئ سريع شامل

BASE_URL="${SHEIKHA_BASE_URL:-http://localhost:8080}"
OWNER_KEY="${SHEIKHA_OWNER_KEY:-}"
ADMIN_JWT="${SHEIKHA_ADMIN_JWT:-}"
WEBHOOK_KEY="${SHEIKHA_COMMS_WEBHOOK_KEY:-}"

fail_count=0
warn_count=0

step() {
    echo
    echo "[$1] $2"
}

ok() { echo "✅ $1"; }
warn() { echo "⚠️  $1"; warn_count=$((warn_count + 1)); }
fail() { echo "❌ $1"; fail_count=$((fail_count + 1)); }

echo "=== SHEIKHA EMERGENCY DRILL ==="
echo "time: $(date '+%F %T')"
echo "base: ${BASE_URL}"

step 1 "health"
if curl -fsS "${BASE_URL}/health" >/dev/null; then
    ok "service reachable"
else
    fail "service not reachable"
fi

step 2 "comms readiness"
if readiness_json="$(curl -fsS "${BASE_URL}/api/comms/readiness" 2>/dev/null)"; then
    echo "${readiness_json}" | python3 -m json.tool >/dev/null 2>&1 || true
    if echo "${readiness_json}" | rg '"mode"\s*:\s*"real_send"' >/dev/null 2>&1; then
        ok "comms mode = real_send"
    else
        warn "comms mode is not real_send"
    fi
    if [[ -n "${WEBHOOK_KEY}" ]]; then
        ok "webhook key present"
    else
        warn "SHEIKHA_COMMS_WEBHOOK_KEY missing"
    fi
else
    fail "cannot read comms readiness"
fi

step 3 "smart architecture"
if [[ -n "${OWNER_KEY}" ]]; then
    if arch_json="$(curl -fsS "${BASE_URL}/api/erp/architecture/status" -H "x-owner-key: ${OWNER_KEY}" 2>/dev/null)"; then
        if echo "${arch_json}" | rg '"status"\s*:\s*"active"' >/dev/null 2>&1; then
            ok "smart architecture active"
        else
            warn "smart architecture not fully active"
        fi
    else
        fail "cannot read architecture status"
    fi
else
    warn "SHEIKHA_OWNER_KEY missing (architecture admin check skipped)"
fi

step 4 "auth + billing"
if [[ -n "${ADMIN_JWT}" ]]; then
    if curl -fsS "${BASE_URL}/api/comms/billing/dashboard?days=30" \
        -H "Authorization: Bearer ${ADMIN_JWT}" >/dev/null 2>&1; then
        ok "admin jwt valid for billing dashboard"
    else
        fail "admin jwt invalid/expired for billing dashboard"
    fi
else
    warn "SHEIKHA_ADMIN_JWT missing"
fi

step 5 "host resources"
disk_use="$(df -h / | awk 'NR==2{print $5}')"
mem_use="$(free -m | awk '/Mem:/ {printf("%.0f%%", ($3/$2)*100)}')"
echo "disk: ${disk_use}"
echo "mem : ${mem_use}"
if [[ "${disk_use%%%}" -ge 90 ]]; then
    fail "disk usage critical (${disk_use})"
elif [[ "${disk_use%%%}" -ge 80 ]]; then
    warn "disk usage high (${disk_use})"
else
    ok "disk usage healthy (${disk_use})"
fi

echo
echo "=== RESULT ==="
echo "fails: ${fail_count}"
echo "warns: ${warn_count}"
if [[ "${fail_count}" -gt 0 ]]; then
    echo "status: INCIDENT"
    exit 2
fi
if [[ "${warn_count}" -gt 0 ]]; then
    echo "status: DEGRADED"
    exit 1
fi
echo "status: READY"
exit 0

