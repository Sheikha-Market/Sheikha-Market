'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/api/operational-platform/v1/status', (_req, res) => {
  const reportPath = path.join(
    process.cwd(),
    'runtime/operational-platform-v1/v1/sheikha-operational-platform-v1-report.json'
  );

  if (!fs.existsSync(reportPath)) {
    return res.status(404).json({
      system: 'SHEIKHA_OPERATIONAL_PLATFORM_V1',
      status: 'REPORT_NOT_FOUND'
    });
  }

  return res.json(JSON.parse(fs.readFileSync(reportPath, 'utf8')));
});

module.exports = router;
