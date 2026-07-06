const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadSystem() {
  return JSON.parse(
    fs.readFileSync(
      path.join(process.cwd(), 'runtime/system-of-systems/sheikha-system-of-systems.json'),
      'utf8'
    )
  );
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadSystem(),
    timestamp: new Date().toISOString()
  });
});

router.get('/domains', (_req, res) => {
  const data = loadSystem();
  return res.json({ success: true, domains: data.domains });
});

module.exports = router;
