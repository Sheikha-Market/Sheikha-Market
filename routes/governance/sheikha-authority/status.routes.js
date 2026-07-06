const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadAuthority() {
  const file = path.join(
    process.cwd(),
    'runtime/governance/sheikha-authority/sheikha-authority.json'
  );

  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    ...loadAuthority(),
    timestamp: new Date().toISOString()
  });
});

router.get('/boundaries', (_req, res) => {
  const authority = loadAuthority();
  return res.json({
    success: true,
    boundaries: authority.boundaries,
    rule: authority.rule
  });
});

router.get('/scope', (_req, res) => {
  const authority = loadAuthority();
  return res.json({
    success: true,
    scope: authority.scope
  });
});

module.exports = router;
