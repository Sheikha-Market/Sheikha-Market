'use strict';

const express = require('express');

const {
  buildUnifiedProductRuntime
} = require(
  '../../core/product-runtime/sheikha-unified-product-runtime-v1'
);
const {
  evaluateEvidenceDecision
} = require(
  '../../core/sheikha-logic/sheikha-logic-governance-engine-v1'
);

const router = express.Router();

router.use(express.json({ limit: '64kb', strict: true }));

function statusResponse(res, selector) {
  try {
    const status = buildUnifiedProductRuntime();
    res.status(status.passed ? 200 : 503).json({
      ok: status.passed,
      data: selector ? selector(status) : status
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      error: 'UNIFIED_PRODUCT_EVIDENCE_UNAVAILABLE',
      message: error.message
    });
  }
}

router.get('/status', (_req, res) => statusResponse(res));

router.get('/products', (_req, res) => statusResponse(res, (status) => ({
  system: status.system,
  status: status.status,
  products: status.products,
  hardwareCompatibility: status.hardwareCompatibility,
  claimBoundary: status.claimBoundary
})));

router.get('/routes', (_req, res) => statusResponse(res, (status) => ({
  productRoutes: status.productRoutes,
  checks: status.routeChecks
})));

router.get('/logic', (_req, res) => statusResponse(res, (status) => ({
  decisions: status.decisions,
  governance: status.governance,
  claimPolicy: status.claimPolicy
})));

router.post('/logic/evaluate', (req, res) => {
  const result = evaluateEvidenceDecision({
    ...req.body,
    qualifiedHumanReview: false
  });
  res.status(result.verified ? 200 : 422).json({
    ok: result.verified,
    data: result
  });
});

module.exports = router;
