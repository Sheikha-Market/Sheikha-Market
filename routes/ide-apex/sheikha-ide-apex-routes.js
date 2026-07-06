'use strict';

const express = require('express');
const ideApex = require('../../runtime/ide-apex/v1/sheikha-ide-apex-v1');

const router = express.Router();

router.get('/api/sheikha/ide-apex/v1/status', (_req, res) => {
  res.json({ success: true, data: ideApex.status() });
});

module.exports = router;
