'use strict';

const express = require('express');
const { buildRuntimeApexStatus } = require('../runtime/sheikha-studio/core/sheikha-runtime-apex-v2');
const { classifyResourceRarity } = require('../runtime/sheikha-studio/core/sheikha-unified-ecosystem-v1');

const router = express.Router();

router.get('/status', (_req, res) => res.json({ ok: true, data: buildRuntimeApexStatus() }));
router.get('/products', (_req, res) => {
  const status = buildRuntimeApexStatus();
  res.json({ ok: true, data: { count: status.productCount, products: status.products } });
});
router.get('/firmware', (_req, res) => res.json({ ok: true, data: buildRuntimeApexStatus().firmware }));
router.get('/tpm', (_req, res) => res.json({ ok: true, data: buildRuntimeApexStatus().tpm }));
router.post('/rarity', express.json({ limit: '16kb' }), (req, res) => {
  const result = classifyResourceRarity(req.body || {});
  res.status(result.status === 'INSUFFICIENT_EVIDENCE' ? 422 : 200).json({
    ok: result.status !== 'INSUFFICIENT_EVIDENCE',
    data: result,
  });
});

module.exports = router;
