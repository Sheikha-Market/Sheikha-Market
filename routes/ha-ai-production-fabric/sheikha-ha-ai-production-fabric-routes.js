'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  health,
  routeTask,
  saveVector
} = require('../../runtime/ha-ai-production-fabric/v1/sheikha-ha-ai-production-fabric-v1');

router.get('/api/sheikha/ha-ai-production-fabric/v1/status', (_req, res) => {
  res.json(status());
});

router.get('/api/sheikha/ha-ai-production-fabric/v1/health', (_req, res) => {
  res.json(health());
});

router.post('/api/sheikha/ha-ai-production-fabric/v1/route', (req, res) => {
  res.json(routeTask(req.body?.message || '', req.body?.mode || 'smart'));
});

router.post('/api/sheikha/ha-ai-production-fabric/v1/vector/upsert', (req, res) => {
  res.json(saveVector(req.body?.id, req.body?.text || '', req.body?.metadata || {}));
});

module.exports = router;
