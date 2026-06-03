const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

function loadGovernance() {
  return JSON.parse(fs.readFileSync(
    path.join(process.cwd(), 'runtime/pr-governance/sheikha-pr-governance.json'),
    'utf8'
  ));
}

router.get('/status', (_req, res) => res.json({
  success: true,
  ...loadGovernance(),
  timestamp: new Date().toISOString()
}));

module.exports = router;
