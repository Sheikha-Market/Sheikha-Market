#!/usr/bin/env bash
set -euo pipefail

mkdir -p runtime/optional-engine-contract-fabric

echo "SHEIKHA OPTIONAL ENGINE CONTRACT FABRIC V14"

node - <<'NODE' | tee runtime/optional-engine-contract-fabric/sheikha-optional-engine-contract-fabric-v14-report.json
const {
  buildOptionalEngineContractFabricReport
} = require('./core/optional-engine-contract-fabric/sheikha-optional-engine-contract-fabric-v14');

console.log(JSON.stringify(buildOptionalEngineContractFabricReport(), null, 2));
NODE

echo "Optional Engine Contract Fabric V14 completed"
