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
  const registry = readJson(
    'runtime/resource-intelligence-simulation-fabric/v1/sheikha-resource-intelligence-simulation-fabric-v1.json'
  );
  const report = readJson(
    'runtime/resource-intelligence-simulation-fabric/v1/sheikha-resource-intelligence-simulation-fabric-v1-report.json'
  );

  return res.json({
    success: true,
    registry,
    report,
    timestamp: new Date().toISOString()
  });
});

router.get('/registries', (_req, res) => {
  const hsCodeIntelligence = readJson(
    'runtime/hs-intelligence-engine/v1/registries/hs-domain-map.json'
  );
  const globalResourceGraphV2 = readJson(
    'runtime/global-resource-graph-v2/v1/registries/resource-nodes.json'
  );
  const supplyChainSimulation = readJson(
    'runtime/supply-chain-simulation/v1/registries/simulation-models.json'
  );
  const smartCitiesEngine = readJson(
    'runtime/smart-cities-engine/v1/registries/smart-city-domains.json'
  );

  return res.json({
    success: true,
    registries: {
      hsCodeIntelligence,
      globalResourceGraphV2,
      supplyChainSimulation,
      smartCitiesEngine
    },
    timestamp: new Date().toISOString()
  });
});

router.get('/coverage', (_req, res) => {
  const report = readJson(
    'runtime/resource-intelligence-simulation-fabric/v1/sheikha-resource-intelligence-simulation-fabric-v1-report.json'
  );

  return res.json({
    success: true,
    coverage: report.coverage,
    checks: report.checks,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
