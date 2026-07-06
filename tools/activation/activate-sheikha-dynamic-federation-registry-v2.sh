#!/usr/bin/env bash
set -euo pipefail

mkdir -p runtime/dynamic-federation-registry

echo "🧬 SHEIKHA DYNAMIC FEDERATION REGISTRY V2 — GOVERNED READ/WRITE"

node - <<'NODE' | tee runtime/dynamic-federation-registry/sheikha-dynamic-federation-registry-v2-report.json
const {
  governedRegisterFederation,
  buildDynamicFederationRegistryV2Report
} = require('./core/dynamic-federation-registry/sheikha-dynamic-federation-registry-v2');

governedRegisterFederation({
  type: 'OPERATING_SYSTEM',
  name: 'ExampleFutureOS',
  familyName: 'Future OS Family',
  actor: 'activation-script',
  reason: 'governed dynamic expansion example'
});

governedRegisterFederation({
  type: 'AI_FRAMEWORK',
  name: 'ExampleAgenticAI',
  familyName: 'Agentic AI Family',
  actor: 'activation-script',
  reason: 'governed AI federation expansion example'
});

governedRegisterFederation({
  type: 'OPERATING_SYSTEM',
  name: 'BlockedDirectSystemWrite',
  directSystemWrite: true,
  actor: 'activation-script',
  reason: 'prove direct system writes are blocked'
});

console.log(JSON.stringify(buildDynamicFederationRegistryV2Report(), null, 2));
NODE

echo "✅ Dynamic Federation Registry V2 governed activation completed"
