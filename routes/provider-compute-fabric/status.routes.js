const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function readJson(relativePath) {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), relativePath),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  const report = readJson(
    'runtime/provider-registry/v1/sheikha-provider-compute-fabric-v1-report.json'
  );
  const providerRegistry = readJson(
    'runtime/provider-registry/v1/sheikha-provider-registry-v1.json'
  );
  const providers = readJson(
    'runtime/provider-registry/v1/registries/providers.json'
  );

  return res.json({
    success: true,
    providerRegistry,
    providers,
    report,
    timestamp: new Date().toISOString()
  });
});

router.get('/agreements', (_req, res) => {
  const computeContractEngine = readJson(
    'runtime/compute-contract-engine/v1/sheikha-compute-contract-engine-v1.json'
  );
  const agreementMap = readJson(
    'runtime/compute-contract-engine/v1/registries/compute-agreement-map.json'
  );
  const budgetGuard = readJson(
    'runtime/budget-guard/v1/sheikha-budget-guard-v1.json'
  );

  return res.json({
    success: true,
    computeContractEngine,
    agreementMap,
    budgetGuard,
    timestamp: new Date().toISOString()
  });
});

router.get('/readiness', (_req, res) => {
  const gpuFarmReadiness = readJson(
    'runtime/gpu-farm-readiness/v1/sheikha-gpu-farm-readiness-v1.json'
  );
  const multicloudFabric = readJson(
    'runtime/multicloud-fabric/v1/sheikha-multicloud-fabric-v1.json'
  );

  return res.json({
    success: true,
    gpuFarmReadiness,
    multicloudFabric,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
