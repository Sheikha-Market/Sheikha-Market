'use strict';

const express = require('express');
const fabric = require(
  '../../runtime/universal-benefit-boundary/v1/sheikha-universal-benefit-boundary-v1'
);
const evaluationRoutes = require('./evaluation.routes');

const router = express.Router();

router.use(express.json({ limit: '64kb' }));

router.get('/status', (_req, res) => {
  return res.json({ success: true, result: fabric.status() });
});

router.get('/capabilities', (_req, res) => {
  const current = fabric.registry();
  return res.json({
    success: true,
    result: {
      system: current.system,
      status: current.status,
      capabilities: current.capabilities,
      boundaries: current.boundaries,
      benefitDomains: current.benefitDomains,
      governance: current.governance
    }
  });
});

router.get('/evidence', (_req, res) => {
  return res.json({ success: true, result: fabric.evidence() });
});

router.use(evaluationRoutes);

module.exports = router;
