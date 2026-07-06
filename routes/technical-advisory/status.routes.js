const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

function loadAdvisory() {
  return JSON.parse(fs.readFileSync(
    path.join(process.cwd(), 'runtime/technical-advisory/sheikha-technical-advisory-governance.json'),
    'utf8'
  ));
}

router.get('/status', (_req, res) => res.json({
  success: true,
  ...loadAdvisory(),
  timestamp: new Date().toISOString()
}));

module.exports = router;
