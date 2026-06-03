const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadReadiness() {
  const file = path.join(
    process.cwd(),
    'runtime/governance/authority-readiness/sheikha-highest-authority-readiness.json'
  );
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadReadiness(),
    timestamp: new Date().toISOString()
  });
});

router.get('/tracks', (_req, res) => {
  const data = loadReadiness();
  return res.json({ success: true, tracks: data.tracks });
});

router.get('/rules', (_req, res) => {
  const data = loadReadiness();
  return res.json({ success: true, rules: data.rules });
});

module.exports = router;
