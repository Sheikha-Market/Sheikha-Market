#!/usr/bin/env bash
set -euo pipefail

echo "🧩 SHEIKHA CAPABILITY REGISTRY + COMPATIBILITY MATRIX V1"

node - <<'NODE' | tee runtime/capability-compatibility/sheikha-capability-compatibility-v1-report.json
const {
  listCapabilities,
  buildCapabilityGraph,
  queryCompatibility,
  evaluateCompatibility
} = require('./core/capability-compatibility/sheikha-capability-compatibility-v1');

const report = {
  system: 'SHEIKHA_CAPABILITY_COMPATIBILITY_ACTIVATION_V1',
  status: 'ACTIVE',
  capabilities: listCapabilities(),
  sampleCapabilityGraph: buildCapabilityGraph({
    id: 'postgresql-federation',
    name: 'PostgreSQL Federation',
    capabilities: ['storage', 'query', 'backup']
  }),
  linuxCompatibility: queryCompatibility('linux-family'),
  postgresqlOnLinux: evaluateCompatibility('postgresql-federation', 'linux-family'),
  safety: {
    governedInternalGraphOnly: true,
    advisoryOnly: true,
    noExternalMutation: true,
    noHarm: true
  }
};

console.log(JSON.stringify(report, null, 2));
NODE

echo "✅ Capability Registry + Compatibility Matrix V1 completed"
