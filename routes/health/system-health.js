'use strict';

const express = require('express');
const router = express.Router();

const health = require('../../core/kernel/health/sheikha-health-governor');
const resources = require('../../core/kernel/resources/sheikha-resource-governor');

router.get('/status', (_req, res) => {
  return res.json({
    success: true,
    health: health.status(),
    resources: resources.status()
  });
});

module.exports = router;
