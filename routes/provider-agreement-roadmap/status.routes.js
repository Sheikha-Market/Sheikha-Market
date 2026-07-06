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
    'runtime/provider-agreement-roadmap/v1/sheikha-provider-agreement-roadmap-v1.json'
  );
  const report = readJson(
    'runtime/provider-agreement-roadmap/v1/sheikha-provider-agreement-roadmap-v1-report.json'
  );

  return res.json({
    success: true,
    registry,
    report,
    timestamp: new Date().toISOString()
  });
});

router.get('/agreements', (_req, res) => {
  const agreementPaths = readJson(
    'runtime/provider-agreement-roadmap/v1/registries/agreement-paths-registry.json'
  );

  return res.json({
    success: true,
    agreementPaths,
    timestamp: new Date().toISOString()
  });
});

router.get('/subscriptions', (_req, res) => {
  const subscriptions = readJson(
    'runtime/provider-agreement-roadmap/v1/registries/subscription-options-registry.json'
  );

  return res.json({
    success: true,
    subscriptions,
    timestamp: new Date().toISOString()
  });
});

router.get('/resources', (_req, res) => {
  const resources = readJson(
    'runtime/provider-agreement-roadmap/v1/registries/resource-options-registry.json'
  );

  return res.json({
    success: true,
    resources,
    timestamp: new Date().toISOString()
  });
});

router.get('/scripts', (_req, res) => {
  const scripts = readJson(
    'runtime/provider-agreement-roadmap/v1/registries/activation-scripts-registry.json'
  );

  return res.json({
    success: true,
    scripts,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
