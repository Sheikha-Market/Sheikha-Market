const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadKernel() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        'runtime/federation/organizational-kernel/sheikha-organizational-federation-kernel.json'
      ),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadKernel(),
    timestamp: new Date().toISOString()
  });
});

router.get('/layers', (_req, res) => {
  const data = loadKernel();

  return res.json({
    success: true,
    federationLayers: data.federationLayers
  });
});

router.get('/nodes', (_req, res) => {
  const data = loadKernel();

  return res.json({
    success: true,
    federationNodes: data.federationNodes
  });
});

module.exports = router;
