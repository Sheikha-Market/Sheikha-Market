const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadRegistry() {
  return JSON.parse(
    fs.readFileSync(
      path.join(
        process.cwd(),
        'runtime/global-domain-registry/sheikha-global-domain-registry.json'
      ),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadRegistry(),
    timestamp: new Date().toISOString()
  });
});

router.get('/registries', (_req, res) => {
  const data = loadRegistry();
  return res.json({ success: true, registries: data.registries });
});

router.get('/domain-types', (_req, res) => {
  const data = loadRegistry();
  return res.json({ success: true, domainTypes: data.domainTypes });
});

module.exports = router;
