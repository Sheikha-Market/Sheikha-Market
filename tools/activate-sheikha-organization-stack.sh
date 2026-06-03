#!/usr/bin/env bash
set -euo pipefail

echo "== SHEIKHA ACTIVATION START =="

node --check server.js
npm run lint

echo "== Restart PM2 =="
pm2 restart ecosystem.config.js --update-env
pm2 save

echo "== Verify core endpoints =="
curl -s http://127.0.0.1:8080/api/runtime/introspection/routes | jq '.success,.total' || true
curl -s http://127.0.0.1:8080/api/organization/sheikha/status | jq || true
curl -s http://127.0.0.1:8080/api/system-of-systems/status | jq || true
curl -s http://127.0.0.1:8080/api/governance/supreme-control/status | jq || true
curl -s http://127.0.0.1:8080/api/governance/constitutional-fabric/status | jq || true
curl -s http://127.0.0.1:8080/api/governance/sheikha-authority/status | jq || true
curl -s http://127.0.0.1:8080/api/governance/authority-readiness/status | jq || true
curl -s http://127.0.0.1:8080/api/exchange/sheikha/status | jq || true
curl -s http://127.0.0.1:8080/api/market-infrastructure/status | jq || true
curl -s http://127.0.0.1:8080/api/advisory-commercial/status | jq || true
curl -s http://127.0.0.1:8080/api/advisory-compliance/status | jq || true
curl -s http://127.0.0.1:8080/api/legislative-regulatory-licensing/status | jq || true

echo "== Git status =="
git status --short

echo "== SHEIKHA ACTIVATION COMPLETE =="
