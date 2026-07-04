#!/usr/bin/env bash
set -euo pipefail

mkdir -p runtime/staging-validation

node - <<'NODE' | tee runtime/staging-validation/sheikha-staging-validation-v1-report.json
const {
  validateStaging
} = require('./core/staging-validation/sheikha-staging-validation-v1');

console.log(JSON.stringify(validateStaging(), null, 2));
NODE
