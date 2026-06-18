'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  universeGraph
} = require('../../runtime/knowledge-universe-graph/v76/sheikha-knowledge-universe-graph-v76');

router.get('/api/sheikha/knowledge-universe-graph/v76/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/knowledge-universe-graph/v76/demo', (_req, res) => res.json(universeGraph()));
router.post('/api/sheikha/knowledge-universe-graph/v76/build', (req, res) => res.json(universeGraph(req.body || {})));

module.exports = router;
