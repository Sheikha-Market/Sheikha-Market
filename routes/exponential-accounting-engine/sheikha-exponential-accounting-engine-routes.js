'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  calculateExponentialAccounting
} = require('../../runtime/exponential-accounting-engine/v1/sheikha-exponential-accounting-engine-v1');

router.get('/api/sheikha/exponential-accounting-engine/v1/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/exponential-accounting-engine/v1/calculate', (req, res) => {
  res.json(calculateExponentialAccounting(req.body || {}));
});

module.exports = router;
