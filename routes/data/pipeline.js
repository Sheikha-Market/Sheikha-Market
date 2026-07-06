'use strict';

const express = require('express');
const router = express.Router();
const pipeline = require('../../core/kernel/data-pipeline/data-intelligence-pipeline');

router.get('/status', (_req, res) => res.json(pipeline.status()));

router.post('/process', (req, res) => {
  return res.json(pipeline.processData(req.body || {}));
});

module.exports = router;
