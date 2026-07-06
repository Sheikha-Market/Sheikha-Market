'use strict';

const express = require('express');
const router = express.Router();
const { inspectBackends } = require('../../runtime/backend-registry-intelligence/sheikha-backend-registry-intelligence-v1');

router.get('/api/sheikha/backend-registry/v1/status', (_req, res) => {
  res.json(inspectBackends('/etc/haproxy/haproxy.cfg'));
});

module.exports = router;
