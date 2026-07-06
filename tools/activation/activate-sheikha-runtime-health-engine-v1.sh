#!/usr/bin/env bash
set -euo pipefail

mkdir -p runtime/runtime-health

node - <<'NODE' | tee runtime/runtime-health/sheikha-runtime-health-engine-v1-report.json
const {
  buildRuntimeHealthReport
} = require('./core/runtime-health/sheikha-runtime-health-engine-v1');

console.log(JSON.stringify(buildRuntimeHealthReport(), null, 2));
NODE
