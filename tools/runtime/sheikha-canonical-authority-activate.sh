#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="${SHEIKHA_ROOT:-$(pwd)}"
cd "$ROOT"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " SHEIKHA CANONICAL AUTHORITY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

node --check server.js
npm run lint

curl -sf http://127.0.0.1:8080/api/health >/dev/null
curl -sf http://127.0.0.1:8080/api/runtime-root/health >/dev/null
curl -sf http://127.0.0.1:8080/api/runtime-root/canonical-runtime-status >/dev/null

echo
echo "Runtime Root:"
curl -s http://127.0.0.1:8080/api/runtime-root/health | jq

echo
echo "Canonical Runtime:"
curl -s http://127.0.0.1:8080/api/runtime-root/canonical-runtime-status | jq

echo
echo "Sheikha-Core:"
curl -s http://127.0.0.1:8080/api/sheikha/ai-gateway/status | jq || true

echo
echo "✅ Sheikha Canonical Authority active"
