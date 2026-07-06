'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  regenerativeKnowledgePlan
} = require('../../runtime/regenerative-knowledge-fabric/v128/sheikha-regenerative-knowledge-fabric-v128');

router.get('/api/sheikha/regenerative-knowledge-fabric/v128/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/regenerative-knowledge-fabric/v128/demo', (_req, res) => res.json(regenerativeKnowledgePlan()));
router.post('/api/sheikha/regenerative-knowledge-fabric/v128/plan', (req, res) => res.json(regenerativeKnowledgePlan(req.body || {})));

module.exports = router;
