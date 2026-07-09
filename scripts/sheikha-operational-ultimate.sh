#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

export KUBERNETES_SERVICE_HOST=1
export NVIDIA_VISIBLE_DEVICES=all
export SHEIKHA_CLUSTER_MODE=1
export SHEIKHA_ACCELERATION_MODE=1

echo "[sheikha] Starting ultimate operational pipeline..."
npm run -s sheikha:operational:final

echo "[sheikha] Generating unified report..."
npm run -s sheikha:from-scratch:report

echo "[sheikha] Enforcing 100% readiness gate..."
node - <<'NODE'
const { SheikhaUnifiedFromScratchStack } = require('./js/sheikha-unified-from-scratch-stack');

(async () => {
  const stack = new SheikhaUnifiedFromScratchStack();
  const result = await stack.verifyIntegration();

  const score = result.integrationVerification?.completenessScore ?? 0;
  const integrated = result.integrationVerification?.status === 'fully-integrated';
  const unified = result.finalActivation?.status === 'fully-unified';
  const fusion = result.finalActivation?.kernelAIGovernanceFusionActive === true;
  const renewal = result.finalActivation?.continuousRenewalActive === true;
  const governed = result.finalActivation?.quranAndSunnahGoverned === true;

  const pass = score === 100 && integrated && unified && fusion && renewal && governed;

  console.log(JSON.stringify({
    gate: pass ? 'PASS_100' : 'FAIL',
    score,
    integrated,
    unified,
    fusion,
    renewal,
    governed
  }, null, 2));

  if (!pass) {
    process.exit(1);
  }
})();
NODE

echo "[sheikha] Ultimate operational status: 100%"
