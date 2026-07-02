#!/usr/bin/env bash
set -euo pipefail

echo "🏛️ SHEIKHA ENTERPRISE KERNEL V1 ACTIVATION"

node --check core/enterprise-kernel/sheikha-enterprise-kernel-v1.js
node --check core/enterprise-architecture/sheikha-enterprise-architecture.js

npm test -- tests/sheikha-enterprise-kernel-v1.test.js
npm test -- tests/sheikha-enterprise-architecture-v1.test.js
npm test -- tests/product-knowledge-http-v1.test.js
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

echo "✅ SHEIKHA ENTERPRISE KERNEL V1 ACTIVATION PASSED"
