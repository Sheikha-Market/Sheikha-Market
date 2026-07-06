'use strict';

const express = require('express');
const cloudProductionDeploymentApex = require(
  '../../runtime/cloud-production-deployment-apex/v1/sheikha-cloud-production-deployment-apex-v1'
);

const router = express.Router();

router.get('/api/sheikha/cloud-production-deployment-apex/v1/status', (_req, res) => {
  res.json({ success: true, data: cloudProductionDeploymentApex.status() });
});

router.get('/api/sheikha/cloud-production-deployment-apex/v1/plan', (_req, res) => {
  res.json({ success: true, data: cloudProductionDeploymentApex.productionPlan() });
});

router.get('/api/sheikha/cloud-production-deployment-apex/v1/gcp-readiness', (_req, res) => {
  res.json({ success: true, data: cloudProductionDeploymentApex.gcpReadiness() });
});

router.get('/api/sheikha/cloud-production-deployment-apex/v1/nginx-template', (req, res) => {
  const template = cloudProductionDeploymentApex.nginxZeroBufferTemplate({
    domain: req.query.domain,
    upstream: req.query.upstream
  });

  res.type('text/plain').send(`${template}\n`);
});

module.exports = router;
