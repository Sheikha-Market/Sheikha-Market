'use strict';

const express = require('express');
const fabric = require(
  '../../core/production-federation/' +
  'sheikha-governed-production-federation-v1'
);

const router = express.Router();

router.use(express.json({ limit: '32kb', strict: true }));
router.use((_req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

function send(res, operation) {
  try {
    return res.json({ ok: true, data: operation() });
  } catch (error) {
    const inputError = error.code === 'UNKNOWN_PRODUCTION_MODEL';
    return res.status(inputError ? 400 : 500).json({
      ok: false,
      error: inputError
        ? error.code
        : 'PRODUCTION_FEDERATION_ERROR',
      message: error.message
    });
  }
}

router.get('/status', (_req, res) => {
  send(res, () => fabric.status());
});

router.get('/models', (_req, res) => {
  send(res, () => fabric.productionModelRegistry());
});

router.get('/systems', (_req, res) => {
  send(res, () => fabric.systemFamilyRegistry());
});

router.get('/evidence', (_req, res) => {
  send(res, () => ({
    system: fabric.SYSTEM,
    capabilities: fabric.inspectInternalEvidence()
  }));
});

router.post('/evaluate', (req, res) => {
  send(res, () => fabric.evaluateProductionChoice(req.body || {}));
});

module.exports = router;
