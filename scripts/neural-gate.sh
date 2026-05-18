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
  body_file="$(mktemp /tmp/sheikha_gate_body.XXXXXX)"
  code="$(curl -s -o "$body_file" -w "%{http_code}" "$BASE_URL$ep" || true)"
  if [ "$code" != "200" ]; then
    echo "FAIL $ep HTTP=$code"
    cat "$body_file" || true
    fail=1
  else
    if grep -q '"success":true' "$body_file"; then
      echo "PASS $ep"
    else
      echo "FAIL $ep success=false"
      cat "$body_file"
      fail=1
    fi
  fi
  rm -f "$body_file"
done

if [ "$fail" -ne 0 ]; then
  echo "SHEIKHA_NEURAL_GATE=FAILED"
  exit 1
fi

echo "SHEIKHA_NEURAL_GATE=PASSED"
