'use strict';

const express = require('express');
const technicalCapabilityApex = require(
  '../../runtime/technical-capability-apex/v1/sheikha-technical-capability-apex-v1'
);

const router = express.Router();

router.get('/api/sheikha/technical-capability-apex/v1/status', (_req, res) => {
  res.json({ success: true, data: technicalCapabilityApex.status() });
});

module.exports = router;
