#!/usr/bin/env bash
set -euo pipefail

echo "🚀 SHEIKHA PRODUCT KNOWLEDGE ENTERPRISE APEX ACTIVATION"

ROOT="$(pwd)"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"

echo "📍 Root: $ROOT"
echo "🌿 Branch: $BRANCH"

echo "1) Syntax checks"
node --check core/product-knowledge/product-digital-twin.js
node --check core/product-knowledge/product-intelligence-layer.js
node --check core/product-knowledge/product-governance-orchestrator.js
node --check core/product-knowledge/product-governance-pipeline.js
node --check core/product-knowledge/product-governance-rules.js
node --check core/product-knowledge/product-policy-registry.js
node --check core/product-knowledge/product-event-bus.js
node --check routes/product-knowledge/product-knowledge.routes.js

echo "2) Product Knowledge focused tests"
npm test -- tests/product-digital-twin-v1.test.js
npm test -- tests/product-intelligence-layer-v1.test.js
npm test -- tests/product-governance-orchestrator-v1.test.js
npm test -- tests/product-governance-pipeline-v1.test.js
npm test -- tests/product-governance-rules-v1.test.js
npm test -- tests/product-policy-registry-v1.test.js
npm test -- tests/product-event-bus-v1.test.js
npm test -- tests/product-decision-events-v1.test.js
npm test -- tests/product-knowledge-http-v1.test.js
npm test -- tests/product-knowledge-integration-v1.test.js

echo "3) Full regression"
npm test

echo "4) Lint"
npm run lint

echo "5) Runtime restart"
pm2 restart sheikha-main-portal --update-env
pm2 status

echo "6) Smoke tests"
curl -s http://127.0.0.1:8080/api/product-knowledge/status >/tmp/sheikha-product-status.json
curl -s -X POST http://127.0.0.1:8080/api/product-knowledge/decision \
  -H "Content-Type: application/json" \
  -d '{
    "id":"apex-copper-cable",
    "name":"Copper Cable",
    "category":"metals",
    "description":"Industrial copper cable scrap",
    "specifications":{"unit":"kg"},
    "standards":["internal-inspection-required"],
    "price":{"amount":25,"currency":"SAR"},
    "quality":{"score":90},
    "risk":{"level":"LOW"},
    "status":"APPROVED",
    "force":true
  }' >/tmp/sheikha-product-decision.json

echo "7) Git status"
git status --short

echo "✅ ACTIVATION PASSED"
echo "📄 Smoke outputs:"
echo " - /tmp/sheikha-product-status.json"
echo " - /tmp/sheikha-product-decision.json"
