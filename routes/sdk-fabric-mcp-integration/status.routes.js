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
    'runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1.json'
  );
  const report = readJson(
    'runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json'
  );

  return res.json({
    success: true,
    registry,
    report,
    timestamp: new Date().toISOString()
  });
});

router.get('/catalog', (_req, res) => {
  const integrationCatalog = readJson(
    'runtime/sdk-fabric-mcp-integration/v1/registries/integration-catalog.json'
  );
  const sdkFabricMap = readJson(
    'runtime/sdk-fabric-mcp-integration/v1/registries/sdk-fabric-map.json'
  );
  const mcpToolCatalog = readJson(
    'runtime/sdk-fabric-mcp-integration/v1/registries/mcp-tool-catalog.json'
  );

  return res.json({
    success: true,
    catalog: {
      integrationCatalog,
      sdkFabricMap,
      mcpToolCatalog
    },
    timestamp: new Date().toISOString()
  });
});

router.get('/customer-environments', (_req, res) => {
  const customerEnvironmentMap = readJson(
    'runtime/sdk-fabric-mcp-integration/v1/registries/customer-environment-map.json'
  );

  return res.json({
    success: true,
    customerEnvironmentMap,
    timestamp: new Date().toISOString()
  });
});

router.get('/root-neural-governance', (_req, res) => {
  const rootNeuralGovernanceCellMap = readJson(
    'runtime/sdk-fabric-mcp-integration/v1/registries/root-neural-governance-cell-map.json'
  );

  return res.json({
    success: true,
    rootNeuralGovernanceCellMap,
    timestamp: new Date().toISOString()
  });
});

router.get('/coverage', (_req, res) => {
  const report = readJson(
    'runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json'
  );

  return res.json({
    success: true,
    coverage: report.coverage,
    checks: report.checks,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
