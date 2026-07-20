'use strict';

const express = require('express');

const {
  getPublicCatalog,
  getStatus,
  listDomains,
  listPublicPages,
  resolvePublicRoute,
} = require(
  '../../core/site-registry/sheikha-site-registry-v2'
);

const router = express.Router();

router.get('/status', (_req, res) => {
  res.json({ ok: true, data: getStatus() });
});

router.get('/identity', (_req, res) => {
  res.json({ ok: true, data: getPublicCatalog().identity });
});

router.get('/domains', (_req, res) => {
  res.json({ ok: true, data: listDomains() });
});

router.get('/pages', (req, res) => {
  res.json({
    ok: true,
    data: listPublicPages({
      domain: req.query.domain,
      search: req.query.search,
      limit: req.query.limit,
    }),
  });
});

router.get('/resolve', (req, res) => {
  const result = resolvePublicRoute(req.query.path);
  res.status(result.found ? 200 : 404).json({
    ok: result.found,
    data: result,
  });
});

module.exports = router;
