#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-${SHEIKHA_BASE_URL:-http://127.0.0.1:8080}}"

required=(
  "/api/health"
  "/api/network/dns/status"
  "/api/network/dbus/status"
  "/api/network/neural/status"
  "/api/governance/status"
)

fail=0

for ep in "${required[@]}"; do
  code="$(curl -s -o /tmp/sheikha_gate_body.txt -w "%{http_code}" "$BASE_URL$ep" || true)"
  if [ "$code" != "200" ]; then
    echo "FAIL $ep HTTP=$code"
    cat /tmp/sheikha_gate_body.txt || true
    fail=1
  else
    if grep -q '"success":true' /tmp/sheikha_gate_body.txt; then
      echo "PASS $ep"
    else
      echo "FAIL $ep success=false"
      cat /tmp/sheikha_gate_body.txt
      fail=1
    fi
  fi
done

if [ "$fail" -ne 0 ]; then
  echo "SHEIKHA_NEURAL_GATE=FAILED"
  exit 1
fi

echo "SHEIKHA_NEURAL_GATE=PASSED"
