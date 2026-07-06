#!/usr/bin/env bash
set -euo pipefail

echo "SHEIKHA PRODUCTION INTEGRATION CONNECTION FABRIC V1 - READ ONLY"

node - <<'NODE' | tee runtime/production-integration-connection-fabric/sheikha-production-integration-connection-fabric-v1-report.json
const {
  buildProductionIntegrationConnectionFabric
} = require('./core/production-integration-connection-fabric/sheikha-production-integration-connection-fabric-v1');

console.log(JSON.stringify(buildProductionIntegrationConnectionFabric(), null, 2));
NODE

echo "Production integration connection fabric read-only report completed"
