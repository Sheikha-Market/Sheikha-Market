'use strict';

const express = require('express');
const router = express.Router();
const report = require('../../../core/kernel/storage/reports/storage-health');

router.get('/health', (_req, res) => {
  return res.json(report.health());
});

module.exports = router;
