#!/usr/bin/env bash
set -euo pipefail

mkdir -p runtime/enterprise-architecture-operating-integration

echo "SHEIKHA ENTERPRISE ARCHITECTURE OPERATING INTEGRATION V3"

node - <<'NODE' | tee runtime/enterprise-architecture-operating-integration/sheikha-enterprise-architecture-operating-integration-v3-report.json
const {
  evaluateOperatingIntegration
} = require('./core/enterprise-architecture/sheikha-enterprise-architecture-operating-integration-v3');

console.log(JSON.stringify(evaluateOperatingIntegration(), null, 2));
NODE

echo "Enterprise Architecture Operating Integration V3 completed"
