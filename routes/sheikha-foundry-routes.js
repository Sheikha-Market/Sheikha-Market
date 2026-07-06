'use strict';

const express = require('express');
const router = express.Router();
const { status, buildCapability } = require('../core/foundry/sheikha-foundry-v1');

router.get('/api/sheikha/foundry/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/foundry/build', express.json(), (req, res) => {
  res.json(buildCapability(req.body || {}));
});

module.exports = router;
