#!/usr/bin/env bash
set -euo pipefail

echo "🔒 SHEIKHA ENTERPRISE APEX FINAL CLOSURE V1"

echo "1) Core validation"
node --check server.js
node --check core/enterprise-kernel/sheikha-enterprise-kernel-v1.js
node --check core/enterprise-architecture/sheikha-enterprise-architecture.js
node --check routes/enterprise-architecture/status.routes.js
node --check routes/product-knowledge/product-knowledge.routes.js

echo "2) Strategic tests"
npm test -- tests/sheikha-enterprise-kernel-v1.test.js
npm test -- tests/sheikha-enterprise-architecture-v1.test.js
npm test -- tests/sheikha-civilization-kingdom-global-trade-v1.test.js
npm test -- tests/product-knowledge-http-v1.test.js
npm test -- tests/product-digital-twin-v1.test.js
npm test -- tests/product-governance-orchestrator-v1.test.js

echo "3) Full regression"
npm test

echo "4) Lint"
npm run lint

echo "5) Restart runtime"
pm2 restart sheikha-main-portal --update-env

echo "6) Readiness"
for i in {1..30}; do
  if curl -fsS http://127.0.0.1:8080/api/health >/dev/null; then
    echo "✅ Runtime ready"
    break
  fi
  sleep 1
done

echo "7) Smoke outputs"
mkdir -p runtime/closure

curl -fsS http://127.0.0.1:8080/api/health \
  > runtime/closure/sheikha-health.json

curl -fsS http://127.0.0.1:8080/api/enterprise-architecture/relationships \
  > runtime/closure/sheikha-architecture-relationships.json

curl -fsS http://127.0.0.1:8080/api/product-knowledge/status \
  > runtime/closure/sheikha-product-knowledge-status.json

echo "8) Kernel score"
node - <<'NODE' > runtime/closure/sheikha-enterprise-kernel-final.json
const { evaluateEnterpriseKernel } = require('./core/enterprise-kernel/sheikha-enterprise-kernel-v1');
console.log(JSON.stringify(evaluateEnterpriseKernel(), null, 2));
NODE

echo "9) PM2 status"
pm2 status

echo "10) Git state"
git status --short

echo "✅ SHEIKHA ENTERPRISE APEX FINAL CLOSURE PASSED"
