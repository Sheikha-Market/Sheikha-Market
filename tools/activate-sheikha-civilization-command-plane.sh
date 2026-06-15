#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RESTART_PM2=false
REQUIRE_CLEAN=false

for argument in "$@"; do
  case "$argument" in
    --restart-pm2) RESTART_PM2=true ;;
    --require-clean) REQUIRE_CLEAN=true ;;
    *) echo "Unknown option: $argument" >&2; exit 2 ;;
  esac
done

cd "$ROOT"

echo '[SHEIKHA] Civilization Command Plane activation started'

node --check runtime/civilization-command-intelligence-plane/store.js
node --check runtime/civilization-command-intelligence-plane/governance-reference-registry.js
node --check runtime/civilization-command-intelligence-plane/civilization-command-intelligence-plane-v1.js
node --check routes/civilization-command-intelligence-plane-routes.js
node --check tools/civilization-command-intelligence-plane/sheikha-civilization-command-intelligence-plane-v1.js
node --check server.js

npm run ops:civilization-command-plane:v1
npx eslint \
  runtime/civilization-command-intelligence-plane \
  routes/civilization-command-intelligence-plane-routes.js \
  tools/civilization-command-intelligence-plane/sheikha-civilization-command-intelligence-plane-v1.js \
  tests/civilization-command-intelligence-plane-v1.test.js
npx jest tests/civilization-command-intelligence-plane-v1.test.js \
  tests/sheikha-enterprise-inspector-v3.test.js \
  --config jest.config.js --runInBand
npm run lint
npm test -- --runInBand
node tools/governance/runtime-integrity-verifier.js
node tools/governance/runtime-admission-controller.js

if [[ "$REQUIRE_CLEAN" == true ]]; then
  node tools/drift/sheikha-runtime-drift-detector.js
else
  node tools/drift/sheikha-runtime-drift-detector.js || true
fi

if [[ "$RESTART_PM2" == true ]]; then
  pm2 restart sheikha-main-portal --update-env
  pm2 save
fi

echo '[SHEIKHA] Civilization Command Plane activation completed'
