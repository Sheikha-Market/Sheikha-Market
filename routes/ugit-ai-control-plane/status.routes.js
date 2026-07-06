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
    'runtime/ugit-ai-control-plane/v1/sheikha-ugit-ai-control-plane-v1.json'
  );
  const report = readJson(
    'runtime/ugit-ai-control-plane/v1/sheikha-ugit-ai-control-plane-v1-report.json'
  );

  return res.json({
    success: true,
    registry,
    report,
    timestamp: new Date().toISOString()
  });
});

router.get('/layers', (_req, res) => {
  const layers = readJson(
    'runtime/ugit-ai-control-plane/v1/registries/operating-layers-registry.json'
  );

  return res.json({
    success: true,
    layers,
    timestamp: new Date().toISOString()
  });
});

router.get('/domains', (_req, res) => {
  const domains = readJson(
    'runtime/ugit-ai-control-plane/v1/registries/domain-pipeline-registry.json'
  );

  return res.json({
    success: true,
    domains,
    timestamp: new Date().toISOString()
  });
});

router.get('/tools', (_req, res) => {
  const tooling = readJson(
    'runtime/ugit-ai-control-plane/v1/registries/tooling-control-registry.json'
  );

  return res.json({
    success: true,
    tooling,
    timestamp: new Date().toISOString()
  });
});

router.get('/policies', (_req, res) => {
  const policies = readJson(
    'runtime/ugit-ai-control-plane/v1/registries/governance-policy-registry.json'
  );

  return res.json({
    success: true,
    policies,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
