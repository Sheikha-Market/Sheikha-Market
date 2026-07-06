'use strict';

const express = require('express');
const router = express.Router();
const cluster = require('../runtime/model-cluster/sheikha-model-cluster-pipeline-v1');

router.use(express.json({ limit: '2mb' }));

router.get('/api/sheikha/model-cluster/status', (req, res) => {
  res.json({
    success: true,
    status: 'ACTIVE',
    cluster: 'SHEIKHA_MODEL_CLUSTER_V1',
    scheduler: 'SHEIKHA_PIPELINE_SCHEDULER_V1',
    models: cluster.detectModels()
  });
});

router.post('/api/sheikha/model-cluster/plan', (req, res) => {
  res.json({
    success: true,
    ...cluster.pipelinePlan(req.body.message || '')
  });
});

module.exports = router;
