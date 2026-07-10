'use strict';

const express = require('express');
const fabric = require(
  '../../runtime/universal-benefit-boundary/v1/sheikha-universal-benefit-boundary-v1'
);

const router = express.Router();

router.post('/evaluate', (req, res) => {
  const result = fabric.evaluateCapability(req.body || {});
  const statusCode = result.decision === 'DENY' ? 422 : 200;
  return res.status(statusCode).json({ success: result.decision !== 'DENY', result });
});

router.post('/transform-boundary', (req, res) => {
  const result = fabric.transformBoundary(req.body || {});
  const statusCode = result.status === 'INVALID_BOUNDARY_REQUEST' ? 422 : 200;
  return res.status(statusCode).json({
    success: result.status !== 'INVALID_BOUNDARY_REQUEST',
    result
  });
});

router.post('/classify-capacity', (req, res) => {
  const result = fabric.classifyPermittedCapacity(req.body || {});
  const statusCode = result.decision === 'DENY' ? 422 : 200;
  return res.status(statusCode).json({
    success: result.decision !== 'DENY',
    result
  });
});

router.post('/plan-integration', (req, res) => {
  const result = fabric.planCapacityIntegration(req.body || {});
  const statusCode = result.decision === 'DENY' ? 422 : 200;
  return res.status(statusCode).json({
    success: result.decision !== 'DENY',
    result
  });
});

module.exports = router;
