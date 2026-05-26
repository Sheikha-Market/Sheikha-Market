'use strict';

const express = require('express');
const router = express.Router();
const gateway = require('../../core/kernel/ai-gateway/sheikha-provider-gateway');

router.get('/status', (_req, res) => res.json(gateway.status()));

router.post('/ask', async (req, res) => {
  const body = req.body || {};
  res.json(await gateway.ask(body.prompt || '', body.context || {}));
});

module.exports = router;
