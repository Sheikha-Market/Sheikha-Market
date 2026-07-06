#!/usr/bin/env bash
set -euo pipefail

mkdir -p runtime/living-federation-operating-system

echo "SHEIKHA LIVING FEDERATION OPERATING SYSTEM V13"

node - <<'NODE' | tee runtime/living-federation-operating-system/sheikha-living-federation-operating-system-v13-report.json
const {
  buildLivingFederationOperatingSystem
} = require('./core/living-federation-operating-system/sheikha-living-federation-operating-system-v13');

console.log(JSON.stringify(buildLivingFederationOperatingSystem(), null, 2));
NODE

echo "Living Federation Operating System V13 completed"
