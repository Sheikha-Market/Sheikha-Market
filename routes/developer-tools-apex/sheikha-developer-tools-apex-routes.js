'use strict';

const express = require('express');
const router = express.Router();
const {
  getDeveloperToolsApexStatus
} = require('../../runtime/developer-tools-apex/v1/sheikha-developer-tools-apex-v1');

router.get('/api/sheikha/developer-tools-apex/v1/status', (_req, res) => {
  res.json(getDeveloperToolsApexStatus());
});

module.exports = router;
