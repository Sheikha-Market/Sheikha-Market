const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadFabric() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        'runtime/governance/domain-contract-fabric/sheikha-domain-contract-fabric.json'
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

router.get('/domains', (_req, res) => {
  const data = loadFabric();
  return res.json({ success: true, domains: data.domains });
});

router.get('/rules', (_req, res) => {
  const data = loadFabric();
  return res.json({ success: true, rules: data.rules });
});

module.exports = router;
