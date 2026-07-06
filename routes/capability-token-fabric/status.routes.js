const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadFabric() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        'runtime/capability-token-fabric/sheikha-capability-token-fabric.json'
      ),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadFabric(),
    timestamp: new Date().toISOString()
  });
});

router.get('/layers', (_req, res) => {
  const data = loadFabric();

  return res.json({
    success: true,
    tokenLayers: data.tokenLayers
  });
});

router.get('/scopes', (_req, res) => {
  const data = loadFabric();

  return res.json({
    success: true,
    capabilityScopes: data.capabilityScopes
  });
});

module.exports = router;
