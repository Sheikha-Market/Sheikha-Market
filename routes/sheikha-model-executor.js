'use strict';

const express = require('express');
const router = express.Router();
const executor = require('../runtime/model-cluster/sheikha-model-executor-v1');

router.use(express.json({ limit: '2mb' }));

router.get('/api/sheikha/model-executor/status', (req, res) => {
  res.json({
    success: true,
    status: 'ACTIVE',
    executor: 'SHEIKHA_MODEL_EXECUTOR_V1',
    models: executor.listModels()
  });
});

router.post('/api/sheikha/model-executor/execute', (req, res) => {
  res.json(executor.execute(req.body.message || '', req.body.options || {}));
});

module.exports = router;
