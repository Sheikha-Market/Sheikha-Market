const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

function loadData() {
  return JSON.parse(fs.readFileSync(
    path.join(process.cwd(), 'runtime/sheikha-data/database/sheikha-data-governance.json'),
    'utf8'
  ));
}

router.get('/status', (_req, res) => res.json({
  success: true,
  ...loadData(),
  timestamp: new Date().toISOString()
}));

module.exports = router;
