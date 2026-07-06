'use strict';

const express = require('express');
const router = express.Router();
const { status, forge } = require('../core/foundry/sheikha-foundry-v2');

router.get('/api/sheikha/foundry/v2/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/foundry/v2/forge', express.json(), (req, res) => {
  res.json(forge(req.body || {}));
});

module.exports = router;
