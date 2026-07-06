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
    'runtime/capability-registry/v2/sheikha-capability-registry-v2.json'
  );
  const report = readJson(
    'runtime/capability-registry/v2/sheikha-capability-registry-v2-report.json'
  );

  return res.json({
    success: true,
    registry,
    report,
    timestamp: new Date().toISOString()
  });
});

router.get('/capabilities', (_req, res) => {
  const capabilities = readJson(
    'runtime/capability-registry/v2/registries/capability-registry-items.json'
  );

  return res.json({
    success: true,
    ...capabilities,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
