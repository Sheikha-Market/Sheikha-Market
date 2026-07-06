'use strict';

const express = require('express');
const router = express.Router();
const { getEnterpriseState } = require('../core/enterprise/sheikha-enterprise-orchestrator-v1');

router.get('/api/sheikha/enterprise-orchestrator/status', (_req, res) => {
  res.json(getEnterpriseState());
});

router.get('/api/sheikha/enterprise-os/status', (_req, res) => {
  res.json(getEnterpriseState());
});

module.exports = router;
