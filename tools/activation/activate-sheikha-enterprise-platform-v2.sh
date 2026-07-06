#!/usr/bin/env bash
set -euo pipefail

MODE="${1:---full}"
DO_COMMIT="${2:-}"

echo "🚀 SHEIKHA ENTERPRISE PLATFORM V2 ACTIVATION"
echo "Mode: $MODE"
echo "Commit: $DO_COMMIT"

run_core() {
  echo "1) Core syntax"
  node --check server.js
  node --check routes/product-knowledge/product-knowledge.routes.js

  echo "2) Core tests"
  npm test -- tests/sheikha-enterprise-architecture-v1.test.js
  npm test -- tests/runtime-engine-loader.test.js
  npm test -- tests/security-middleware-cors.test.js
}

run_product() {
  echo "3) Product Knowledge tests"
  npm test -- tests/product-knowledge-http-v1.test.js
  npm test -- tests/product-knowledge-integration-v1.test.js
  npm test -- tests/product-digital-twin-v1.test.js
  npm test -- tests/product-intelligence-layer-v1.test.js
  npm test -- tests/product-governance-orchestrator-v1.test.js
  npm test -- tests/product-governance-pipeline-v1.test.js
  npm test -- tests/product-policy-registry-v1.test.js
  npm test -- tests/product-event-bus-v1.test.js
}

run_ui() {
  echo "4) UI / Identity checks"
  test -f public/product-knowledge/enterprise-dashboard.html
  test -f docs/product-knowledge/PRODUCT_KNOWLEDGE_UI_IDENTITY_PLAN.md
  ./tools/activation/activate-product-knowledge-ui-identity.sh
}

run_intelligence() {
  echo "5) Intelligence / Research / Graph tests"
  npm test -- tests/agi-asi-research-science-fabric-v1.test.js
  npm test -- tests/scientific-methodology-engine-v1.test.js
  npm test -- tests/knowledge-graph-engine-v1.test.js
  npm test -- tests/sheikha-evidence-registry-v1.test.js
}

run_optional() {
  echo "6) Optional enterprise fabrics"
  npm test -- tests/sheikha-universal-integration-control-plane-v1.test.js
  npm test -- tests/sdk-enterprise-federation-fabric.test.js
  npm test -- tests/sheikha-capability-sdk-mcp-federation-fabric-v1.test.js
  npm test -- tests/workflow-automation-engine-v1.test.js
  npm test -- tests/sheikha-observability-runtime-v1.test.js
}

run_full() {
  run_core
  run_product
  run_ui
  run_intelligence
  run_optional

  echo "7) Full regression"
  npm test

  echo "8) Lint"
  npm run lint

  echo "9) Restart"
  pm2 restart sheikha-main-portal --update-env

  echo "10) Readiness"
  for i in {1..30}; do
    if curl -fsS http://127.0.0.1:8080/api/health >/dev/null; then
      echo "✅ Runtime ready"
      break
    fi
    sleep 1
  done

  echo "11) Smoke"
  curl -fsS http://127.0.0.1:8080/api/health >/tmp/sheikha-health.json
  curl -fsS http://127.0.0.1:8080/api/product-knowledge/status >/tmp/sheikha-product-status.json
  curl -fsS http://127.0.0.1:8080/product-knowledge/enterprise-dashboard.html >/tmp/sheikha-product-dashboard.html

  echo "12) PM2"
  pm2 status

  echo "✅ SHEIKHA ENTERPRISE PLATFORM V2 ACTIVATION PASSED"
}

case "$MODE" in
  --core) run_core ;;
  --product) run_product ;;
  --ui) run_ui ;;
  --intelligence) run_intelligence ;;
  --optional) run_optional ;;
  --full) run_full ;;
  *) echo "Unknown mode: $MODE"; exit 1 ;;
esac

if [ "$DO_COMMIT" = "--commit" ]; then
  git add tools/activation/activate-sheikha-enterprise-platform-v2.sh
  git commit -m "Add Sheikha enterprise platform v2 activation script"
fi

git status --short
