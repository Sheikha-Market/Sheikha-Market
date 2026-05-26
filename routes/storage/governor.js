'use strict';

const express = require('express');
const router = express.Router();

const governor =
require('../../core/kernel/storage/sheikha-storage-governor');

router.get('/status', (_req, res) => {
  return res.json(governor.status());
});

router.post('/store', (req, res) => {
  const body = req.body || {};

  return res.json(
    governor.store(
      body.name || 'object',
      body.data || {},
      body.meta || {}
    )
  );
});

module.exports = router;
