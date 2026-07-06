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
    'runtime/development-functions-fabric/v1/sheikha-development-functions-fabric-v1.json'
  );
  const report = readJson(
    'runtime/development-functions-fabric/v1/sheikha-development-functions-fabric-v1-report.json'
  );

  return res.json({
    success: true,
    registry,
    report,
    timestamp: new Date().toISOString()
  });
});

router.get('/workflow', (_req, res) => {
  const workflow = readJson(
    'runtime/development-functions-fabric/v1/registries/development-workflow-registry.json'
  );

  return res.json({
    success: true,
    workflow,
    timestamp: new Date().toISOString()
  });
});

router.get('/sdk-fabric-mcp-map', (_req, res) => {
  const sdkFabricMcpMap = readJson(
    'runtime/development-functions-fabric/v1/registries/sdk-fabric-mcp-development-map.json'
  );

  return res.json({
    success: true,
    sdkFabricMcpMap,
    timestamp: new Date().toISOString()
  });
});

router.get('/extension-tools', (_req, res) => {
  const extensionTools = readJson(
    'runtime/development-functions-fabric/v1/registries/extension-chat-tool-registry.json'
  );

  return res.json({
    success: true,
    extensionTools,
    timestamp: new Date().toISOString()
  });
});

router.get('/coverage', (_req, res) => {
  const report = readJson(
    'runtime/development-functions-fabric/v1/sheikha-development-functions-fabric-v1-report.json'
  );

  return res.json({
    success: true,
    coverage: report.coverage,
    checks: report.checks,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
