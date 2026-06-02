const express = require('express');
const router = express.Router();

const {
  buildRuntimeVerification
} = require('../../../lib/runtime-verification/runtime-verification-manager');

router.get('/status', (_req, res) => {
  return res.json(buildRuntimeVerification());
});

module.exports = router;
