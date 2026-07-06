'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  meshPlan
} = require('../../runtime/autonomous-service-mesh-fabric/v115/sheikha-autonomous-service-mesh-fabric-v115');

router.get(
  '/api/sheikha/autonomous-service-mesh-fabric/v115/status',
  (_req, res) => res.json(status())
);

router.get(
  '/api/sheikha/autonomous-service-mesh-fabric/v115/demo',
  (_req, res) => res.json(meshPlan())
);

router.post(
  '/api/sheikha/autonomous-service-mesh-fabric/v115/plan',
  (req, res) => res.json(meshPlan(req.body || {}))
);

module.exports = router;
