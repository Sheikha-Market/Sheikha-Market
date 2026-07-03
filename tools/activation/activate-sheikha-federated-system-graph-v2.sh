#!/usr/bin/env bash
set -euo pipefail

echo "🕸️ SHEIKHA FEDERATED SYSTEM GRAPH V2 — READ ONLY"

node - <<'NODE' | tee runtime/federated-system-graph/sheikha-federated-system-graph-v2-report.json
const {
  buildFederatedSystemGraph
} = require('./core/federated-system-graph/sheikha-federated-system-graph-v2');

console.log(JSON.stringify(buildFederatedSystemGraph(), null, 2));
NODE

echo "✅ Federated System Graph V2 read-only activation completed"
