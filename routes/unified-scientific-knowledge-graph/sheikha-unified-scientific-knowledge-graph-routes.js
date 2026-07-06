'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  buildScienceGraph
} = require('../../runtime/unified-scientific-knowledge-graph/v1/sheikha-unified-scientific-knowledge-graph-v68');

router.get('/api/sheikha/unified-scientific-knowledge-graph/v68/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/unified-scientific-knowledge-graph/v68/demo', (_req, res) => res.json(buildScienceGraph()));
router.post('/api/sheikha/unified-scientific-knowledge-graph/v68/build', (req, res) => res.json(buildScienceGraph(req.body || {})));

module.exports = router;
