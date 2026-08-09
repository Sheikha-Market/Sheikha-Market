'use strict';

const express = require('express');
const path = require('node:path');

const {
  verify
} = require(
  '../../runtime/root-architecture/v3/sheikha-root-verifier-v3'
);

const router = express.Router();
const ROOT = path.resolve(__dirname, '../..');

function sendTruthMatrix(_req, res) {
  const result = verify(ROOT);
  res.set('Cache-Control', 'no-store');
  return res.status(result.status === 'VERIFIED' ? 200 : 503).json({
    ok: result.status === 'VERIFIED',
    data: result
  });
}

router.get('/status', sendTruthMatrix);
router.get('/truth-matrix', sendTruthMatrix);

module.exports = router;
