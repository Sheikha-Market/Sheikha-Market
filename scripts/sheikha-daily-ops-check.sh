#!/usr/bin/env bash
set -euo pipefail

# بسم الله الرحمن الرحيم
# فحص يومي سريع للجاهزية التشغيلية — شيخة

BASE_URL="${SHEIKHA_BASE_URL:-http://localhost:8080}"
OWNER_KEY="${SHEIKHA_OWNER_KEY:-}"
ADMIN_JWT="${SHEIKHA_ADMIN_JWT:-}"

echo "=== SHEIKHA DAILY OPS CHECK ==="
echo "time: $(date '+%F %T')"
echo

echo "[1] health"
curl -fsS "${BASE_URL}/health" && echo
echo

echo "[2] comms readiness"
curl -fsS "${BASE_URL}/api/comms/readiness" | python3 -m json.tool
echo

echo "[3] comms providers summary"
curl -fsS "${BASE_URL}/api/comms/providers" | python3 -m json.tool
echo

if [[ -n "${OWNER_KEY}" ]]; then
    echo "[4] smart digital architecture (ERP unified)"
    curl -fsS "${BASE_URL}/api/erp/architecture/status" \
      -H "x-owner-key: ${OWNER_KEY}" | python3 -m json.tool
    echo
else
    echo "[4] smart digital architecture skipped (SHEIKHA_OWNER_KEY not set)"
    echo
fi

if [[ -n "${ADMIN_JWT}" ]]; then
    echo "[5] billing dashboard"
    curl -fsS "${BASE_URL}/api/comms/billing/dashboard?days=30" \
      -H "Authorization: Bearer ${ADMIN_JWT}" | python3 -m json.tool
    echo
else
    echo "[5] billing dashboard skipped (SHEIKHA_ADMIN_JWT not set)"
    echo
fi

echo "=== DONE ==="
