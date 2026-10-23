'use strict';

const express = require('express');
const {
  assessAsset,
  getHubStatus
} = require('../runtime/sheikha-ai-model-hub/v1/sheikha-ai-model-hub-v1');

const router = express.Router();
const { buildRepositoryIntegrationRouter } = require('./sheikha-repository-integration-v1');
router.use('/api/sheikha/model-hub/v1/integrations', buildRepositoryIntegrationRouter());

router.get('/api/sheikha/model-hub/v1/status', (_req, res) => {
  res.json(getHubStatus());
});

router.post('/api/sheikha/model-hub/v1/assess', express.json({ limit: '32kb' }), (req, res) => {
  const result = assessAsset(req.body || {});
  res.status(result.commercialApproved ? 200 : 422).json(result);
});

module.exports = router;
