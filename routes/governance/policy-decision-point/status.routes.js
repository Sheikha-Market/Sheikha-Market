const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const fileMap = {
  'policy-decision-point': 'sheikha-pdp.json',
  'policy-enforcement-point': 'sheikha-pep.json',
  'risk-engine': 'sheikha-risk-engine.json',
  'audit-ledger': 'sheikha-audit-ledger.json'
};

router.get('/status', (_req, res) => {
  const dir = path.basename(__dirname);
  const file = path.join(process.cwd(), 'runtime/governance', dir, fileMap[dir]);
  return res.json({
    success: true,
    ...JSON.parse(fs.readFileSync(file, 'utf8')),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
