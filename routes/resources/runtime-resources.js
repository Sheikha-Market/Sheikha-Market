'use strict';

const express = require('express');
const router = express.Router();

const resources =
require('../../core/kernel/resources/runtime/sheikha-runtime-resource-fabric');

router.get('/status', (_req, res) => {
  return res.json(resources.status());
});

router.post('/allocate', (req, res) => {
  return res.json(
    resources.allocate(req.body || {})
  );
});

router.post('/report', (_req, res) => {
  return res.json(resources.report());
});

module.exports = router;
