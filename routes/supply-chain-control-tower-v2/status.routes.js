'use strict';
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/api/supply-chain/control-tower/v2/status', (_req, res) => {
  const reportPath = path.join(process.cwd(), 'runtime/supply-chain-control-tower-v2/v1/sheikha-supply-chain-control-tower-v2-report.json');
  if (!fs.existsSync(reportPath)) return res.status(404).json({ system: 'SHEIKHA_SUPPLY_CHAIN_CONTROL_TOWER_V2', status: 'REPORT_NOT_FOUND' });
  return res.json(JSON.parse(fs.readFileSync(reportPath, 'utf8')));
});

module.exports = router;
