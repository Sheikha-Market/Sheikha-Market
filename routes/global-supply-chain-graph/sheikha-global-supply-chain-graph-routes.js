'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  buildSupplyChain
} = require('../../runtime/global-supply-chain-graph/v1/sheikha-global-supply-chain-graph-v66');

router.get('/api/sheikha/global-supply-chain-graph/v66/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/global-supply-chain-graph/v66/demo', (_req, res) => res.json(buildSupplyChain()));
router.post('/api/sheikha/global-supply-chain-graph/v66/build', (req, res) => res.json(buildSupplyChain(req.body || {})));

module.exports = router;
