#!/usr/bin/env bash
set -euo pipefail

echo "🏛️ SHEIKHA CIVILIZATION / KINGDOM / GLOBAL TRADE ACTIVATION V1"

node --check core/sheikha-civilization/sheikha-civilization-kingdom-global-trade.js

npm test -- tests/sheikha-civilization-kingdom-global-trade-v1.test.js
npm test -- tests/sheikha-enterprise-architecture-v1.test.js
npm test -- tests/product-knowledge-http-v1.test.js
npm test -- tests/product-digital-twin-v1.test.js
npm test -- tests/product-governance-orchestrator-v1.test.js

npm run lint

pm2 restart sheikha-main-portal --update-env

echo "⏳ Waiting for runtime readiness..."
for i in {1..30}; do
  if curl -fsS http://127.0.0.1:8080/api/health >/dev/null; then
    echo "✅ Runtime ready"
    break
  fi
  sleep 1
done

curl -fsS http://127.0.0.1:8080/api/health >/tmp/sheikha-civilization-health.json

echo "✅ SHEIKHA CIVILIZATION KINGDOM GLOBAL TRADE ACTIVATION PASSED"
