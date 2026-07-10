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
      arabicName: current.arabicName,
      language: current.language,
      valuesReference: current.valuesReference,
      architectureComponents: current.architectureComponents,
      capabilities: current.capabilities,
      boundaries: current.boundaries,
      operationalBoundaryScopes: current.operationalBoundaryScopes,
      resourceClasses: current.resourceClasses,
      capacityGovernance: current.capacityGovernance,
      benefitDomains: current.benefitDomains,
      priorityPolicy: current.priorityPolicy,
      governance: current.governance
    }
  });
});

router.get('/evidence', (_req, res) => {
  return res.json({ success: true, result: fabric.evidence() });
});

router.use(evaluationRoutes);

module.exports = router;
