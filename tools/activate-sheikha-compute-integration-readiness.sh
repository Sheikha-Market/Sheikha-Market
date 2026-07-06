#!/usr/bin/env bash
set -euo pipefail

echo "[SHEIKHA] Compute Integration Readiness Activation"
echo "[SHEIKHA] Provider compute fabric"
npm run ops:provider-compute-fabric:v1

echo "[SHEIKHA] Commercial real activation gates"
npm run ops:commercial-real-activation:v1

echo "[SHEIKHA] Multi supercomputer cloud fabric"
npm run ops:multi-supercomputer-cloud-fabric:v1

echo "[SHEIKHA] AI supercomputer cloud cluster pipeline fabric"
npm run ops:ai-supercomputer-cloud-cluster-pipeline-fabric:v1

echo "[SHEIKHA] Customer classification"
npm run ops:customer-classification:v1

echo "[SHEIKHA] Provider agreement roadmap"
npm run ops:provider-agreement-roadmap:v1

if [[ "${SHEIKHA_COMPUTE_INTEGRATION_RUN_FULL_CHECKS:-true}" == "true" ]]; then
  echo "[SHEIKHA] Runtime tests"
  npm test

  echo "[SHEIKHA] Runtime lint"
  npm run lint
fi

echo "SHEIKHA_COMPUTE_INTEGRATION_READINESS_ACTIVE"
