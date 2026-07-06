#!/usr/bin/env bash
set -euo pipefail

mkdir -p runtime/template-engine-unification

echo "SHEIKHA TEMPLATE ENGINE UNIFICATION V11"

node - <<'NODE' | tee runtime/template-engine-unification/sheikha-template-engine-unification-v11-report.json
const {
  buildTemplateEngineUnificationReport,
  unifyTemplateExpansion
} = require('./core/template-engine-unification/sheikha-template-engine-unification-v11');

const report = buildTemplateEngineUnificationReport();
const expansion = unifyTemplateExpansion();

console.log(JSON.stringify({
  ...report,
  sampleUnifiedExpansion: expansion
}, null, 2));
NODE

echo "Template Engine Unification V11 completed"
