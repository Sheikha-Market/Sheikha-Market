'use strict';

const express = require('express');

const {
  buildUnifiedCommerceRuntime,
  listCommerceCatalog,
  buildCommerceDashboard,
  buildCommerceOperationPlan
} = require('../../core/commerce/sheikha-unified-commerce-runtime-v1');

const router = express.Router();

router.use(express.json({ limit: '32kb', strict: true }));

function handleRead(res, operation) {
  try {
    const data = operation();
    res.status(data.passed === false ? 503 : 200).json({
      ok: data.passed !== false,
      data
    });
  } catch (error) {
    res.status(503).json({
      ok: false,
      error: 'COMMERCE_EVIDENCE_UNAVAILABLE',
      message: error.message
    });
  }
}

function handleInputError(res, error) {
  res.status(400).json({
    ok: false,
    error: 'INVALID_COMMERCE_REQUEST',
    message: error.message
  });
}

router.get('/status', (_req, res) => {
  handleRead(res, () => buildUnifiedCommerceRuntime());
});

router.get('/catalog', (req, res) => {
  handleRead(res, () => listCommerceCatalog({
    search: req.query.search,
    sector: req.query.sector,
    kind: req.query.kind
  }));
});

router.get('/sectors', (_req, res) => {
  handleRead(res, () => {
    const runtime = buildUnifiedCommerceRuntime();
    return {
      sectors: runtime.sectors,
      marketGroups: runtime.marketGroups,
      count: runtime.sectors.length
    };
  });
});

router.get('/workflows', (_req, res) => {
  handleRead(res, () => {
    const runtime = buildUnifiedCommerceRuntime();
    return {
      workflows: runtime.workflows,
      commonFlow: runtime.integration.commonFlow,
      count: runtime.workflows.length
    };
  });
});

router.get('/dashboard', (req, res) => {
  try {
    const data = buildCommerceDashboard({
      role: req.query.role,
      sector: req.query.sector
    });
    res.json({ ok: true, data });
  } catch (error) {
    handleInputError(res, error);
  }
});

router.post('/operations/plan', (req, res) => {
  try {
    const data = buildCommerceOperationPlan(req.body);
    res.status(202).json({ ok: true, data });
  } catch (error) {
    handleInputError(res, error);
  }
});

module.exports = router;
