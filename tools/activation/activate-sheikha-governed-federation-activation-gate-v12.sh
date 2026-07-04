#!/usr/bin/env bash
set -euo pipefail

mkdir -p runtime/governed-federation-activation-gate

echo "SHEIKHA GOVERNED FEDERATION ACTIVATION GATE V12"

node - <<'NODE' | tee runtime/governed-federation-activation-gate/sheikha-governed-federation-activation-gate-v12-report.json
const {
  buildGovernedFederationActivationGateReport
} = require('./core/governed-federation-activation-gate/sheikha-governed-federation-activation-gate-v12');

console.log(JSON.stringify(buildGovernedFederationActivationGateReport(), null, 2));
NODE

echo "Governed Federation Activation Gate V12 completed"
