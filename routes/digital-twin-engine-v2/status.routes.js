'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

router.get('/api/digital-twin/v2/status', (_req, res) => {
  const reportPath = path.join(
    process.cwd(),
    'runtime/digital-twin-engine-v2/v1/sheikha-digital-twin-engine-v2-report.json'
  );

  if (!fs.existsSync(reportPath)) {
    return res.status(404).json({
      system: 'SHEIKHA_DIGITAL_TWIN_ENGINE_V2',
      status: 'REPORT_NOT_FOUND'
    });
  }

  return res.json(JSON.parse(fs.readFileSync(reportPath, 'utf8')));
});

module.exports = router;
