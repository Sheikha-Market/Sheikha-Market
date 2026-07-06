#!/usr/bin/env bash
set -euo pipefail

echo "🎨 SHEIKHA PRODUCT KNOWLEDGE UI + IDENTITY ACTIVATION"

node --check routes/product-knowledge/product-knowledge.routes.js
npm test -- tests/product-knowledge-http-v1.test.js
npm test -- tests/product-digital-twin-v1.test.js
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

curl -I http://127.0.0.1:8080/product-knowledge/enterprise-dashboard.html
curl -s http://127.0.0.1:8080/api/product-knowledge/status >/tmp/sheikha-product-ui-status.json

echo "✅ UI + Identity activation passed"
