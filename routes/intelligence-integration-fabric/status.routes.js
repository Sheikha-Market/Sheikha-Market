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
    'runtime/intelligence-integration-fabric/v1/sheikha-intelligence-integration-fabric-v1.json'
  );
  const report = readJson(
    'runtime/intelligence-integration-fabric/v1/sheikha-intelligence-integration-fabric-v1-report.json'
  );

  return res.json({
    success: true,
    registry,
    report,
    timestamp: new Date().toISOString()
  });
});

router.get('/units', (_req, res) => {
  const units = readJson(
    'runtime/intelligence-integration-fabric/v1/registries/intelligence-units-registry.json'
  );

  return res.json({
    success: true,
    units,
    timestamp: new Date().toISOString()
  });
});

router.get('/topology', (_req, res) => {
  const topology = readJson(
    'runtime/intelligence-integration-fabric/v1/registries/integration-topology-registry.json'
  );

  return res.json({
    success: true,
    topology,
    timestamp: new Date().toISOString()
  });
});

router.get('/sdk-fabric-mcp-map', (_req, res) => {
  const sdkFabricMcpMap = readJson(
    'runtime/intelligence-integration-fabric/v1/registries/sdk-fabric-mcp-intelligence-map.json'
  );

  return res.json({
    success: true,
    sdkFabricMcpMap,
    timestamp: new Date().toISOString()
  });
});

router.get('/coverage', (_req, res) => {
  const report = readJson(
    'runtime/intelligence-integration-fabric/v1/sheikha-intelligence-integration-fabric-v1-report.json'
  );

  return res.json({
    success: true,
    coverage: report.coverage,
    checks: report.checks,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
