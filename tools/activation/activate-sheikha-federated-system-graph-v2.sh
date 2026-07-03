#!/usr/bin/env bash
set -euo pipefail

mkdir -p runtime/federated-system-graph

echo "🕸️ SHEIKHA FEDERATED SYSTEM GRAPH V2 — READ ONLY"

node - <<'NODE' | tee runtime/federated-system-graph/sheikha-federated-system-graph-v2-report.json
const {
  buildFederatedSystemGraphV2
} = require('./core/federated-system-graph/sheikha-federated-system-graph-v2');

console.log(JSON.stringify(buildFederatedSystemGraphV2(), null, 2));
NODE

echo "✅ Federated System Graph V2 read-only activation completed"
