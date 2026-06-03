const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadCapabilityRegistry() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        'runtime/governance/capability-registry/sheikha-capability-registry.json'
      ),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadCapabilityRegistry(),
    timestamp: new Date().toISOString()
  });
});

router.get('/domains', (_req, res) => {
  const registry = loadCapabilityRegistry();

  return res.json({
    success: true,
    domains: registry.domains,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
