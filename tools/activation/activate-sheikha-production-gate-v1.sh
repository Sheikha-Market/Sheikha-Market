#!/usr/bin/env bash
set -euo pipefail

mkdir -p runtime/production-gate

node - <<'NODE' | tee runtime/production-gate/sheikha-production-gate-v1-report.json
const {
  buildProductionGateReport
} = require('./core/production-gate/sheikha-production-gate-v1');

console.log(JSON.stringify(buildProductionGateReport(), null, 2));
NODE
