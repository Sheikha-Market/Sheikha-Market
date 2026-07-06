'use strict';

const express = require('express');
const debuggingApex = require(
  '../../runtime/debugging-apex/v1/sheikha-debugging-apex-v1'
);

const router = express.Router();

router.get('/api/sheikha/debugging-apex/v1/status', (_req, res) => {
  res.json({ success: true, data: debuggingApex.status() });
});

module.exports = router;
