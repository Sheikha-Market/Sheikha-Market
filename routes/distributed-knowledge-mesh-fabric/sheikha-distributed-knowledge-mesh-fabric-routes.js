'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  knowledgePlan
} = require('../../runtime/distributed-knowledge-mesh-fabric/v118/sheikha-distributed-knowledge-mesh-fabric-v118');

router.get(
  '/api/sheikha/distributed-knowledge-mesh-fabric/v118/status',
  (_req, res) => res.json(status())
);

router.get(
  '/api/sheikha/distributed-knowledge-mesh-fabric/v118/demo',
  (_req, res) => res.json(knowledgePlan())
);

router.post(
  '/api/sheikha/distributed-knowledge-mesh-fabric/v118/plan',
  (req, res) => res.json(knowledgePlan(req.body || {}))
);

module.exports = router;
