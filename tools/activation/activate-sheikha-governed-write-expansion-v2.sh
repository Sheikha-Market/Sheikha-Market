#!/usr/bin/env bash
set -euo pipefail

echo "✍️ SHEIKHA GOVERNED WRITE EXPANSION V2"

node - <<'NODE' | tee runtime/governed-write-expansion/sheikha-governed-write-expansion-v2-report.json
const {
  governedExpandFederation
} = require('./core/governed-write-expansion/sheikha-governed-write-expansion-v2');

const result = governedExpandFederation({
  type: 'OPERATING_SYSTEM',
  name: 'ExampleGovernedOS',
  actor: 'activation-script',
  reason: 'Governed internal registry expansion demo'
});

console.log(JSON.stringify(result, null, 2));
NODE

echo "✅ Governed Write Expansion V2 completed"
