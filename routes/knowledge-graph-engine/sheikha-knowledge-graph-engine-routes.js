'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  buildGraph,
  demoGraph
} = require('../../runtime/knowledge-graph-engine/v3/sheikha-knowledge-graph-engine-v63');

router.get('/api/sheikha/knowledge-graph-engine/v63/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/knowledge-graph-engine/v63/demo', (_req, res) => res.json(demoGraph()));
router.post('/api/sheikha/knowledge-graph-engine/v63/build', (req, res) => res.json(buildGraph(req.body || {})));

module.exports = router;
