#!/usr/bin/env bash
set -euo pipefail

echo "🚀 SHEIKHA FULL FINAL ACTIVATION"

echo "1) Preflight"
node --version
npm --version
git status --short
pm2 status

echo "2) Enterprise Platform V2"
./tools/activation/activate-sheikha-enterprise-platform-v2.sh --full

echo "3) Enterprise Kernel 10/10"
./tools/activation/activate-sheikha-enterprise-kernel-v1.sh

echo "4) Civilization / Kingdom / Global Trade"
./tools/activation/activate-sheikha-civilization-kingdom-global-trade-v1.sh

echo "5) UI / Identity"
./tools/activation/activate-product-knowledge-ui-identity.sh

echo "6) Final Closure"
./tools/activation/close-sheikha-enterprise-apex-v1.sh

echo "7) Final Verification"
node - <<'NODE'
const { evaluateEnterpriseKernel } = require('./core/enterprise-kernel/sheikha-enterprise-kernel-v1');
console.log(JSON.stringify(evaluateEnterpriseKernel(), null, 2));
NODE

npm test
npm run lint

pm2 restart sheikha-main-portal --update-env

for i in {1..30}; do
  if curl -fsS http://127.0.0.1:8080/api/health >/dev/null; then
    echo "✅ Runtime ready"
    break
  fi
  sleep 1
done

curl -fsS http://127.0.0.1:8080/api/health >/tmp/sheikha-final-health.json

echo "✅ SHEIKHA FULL FINAL ACTIVATION PASSED"
git status --short
git log --oneline -10
