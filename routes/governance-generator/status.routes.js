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
    'runtime/governance-generator/v1/sheikha-governance-generator-v1.json'
  );
  const report = readJson(
    'runtime/governance-generator/v1/sheikha-governance-generator-v1-report.json'
  );

  return res.json({
    success: true,
    registry,
    report,
    timestamp: new Date().toISOString()
  });
});

router.get('/generation-registry', (_req, res) => {
  const generationRegistry = readJson(
    'runtime/governance-generator/v1/registries/governance-generation-registry.json'
  );

  return res.json({
    success: true,
    generationRegistry,
    timestamp: new Date().toISOString()
  });
});

router.get('/policy-templates', (_req, res) => {
  const policyTemplates = readJson(
    'runtime/governance-generator/v1/registries/governance-policy-template-registry.json'
  );

  return res.json({
    success: true,
    policyTemplates,
    timestamp: new Date().toISOString()
  });
});

router.get('/sdk-fabric-mcp-map', (_req, res) => {
  const sdkFabricMcpMap = readJson(
    'runtime/governance-generator/v1/registries/sdk-fabric-mcp-governance-generator-map.json'
  );

  return res.json({
    success: true,
    sdkFabricMcpMap,
    timestamp: new Date().toISOString()
  });
});

router.get('/earth-development-cycle', (_req, res) => {
  const earthDevelopmentCycle = readJson(
    'runtime/governance-generator/v1/registries/earth-development-governance-cycle.json'
  );

  return res.json({
    success: true,
    earthDevelopmentCycle,
    timestamp: new Date().toISOString()
  });
});

router.get('/questions', (_req, res) => {
  const questions = readJson(
    'runtime/governance-generator/v1/registries/user-interaction-question-registry.json'
  );

  return res.json({
    success: true,
    questions,
    timestamp: new Date().toISOString()
  });
});

router.get('/coverage', (_req, res) => {
  const report = readJson(
    'runtime/governance-generator/v1/sheikha-governance-generator-v1-report.json'
  );

  return res.json({
    success: true,
    coverage: report.coverage,
    checks: report.checks,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
