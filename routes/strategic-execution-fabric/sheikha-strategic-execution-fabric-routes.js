'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  executionPlan
} = require('../../runtime/strategic-execution-fabric/v86/sheikha-strategic-execution-fabric-v86');

router.get(
  '/api/sheikha/strategic-execution-fabric/v86/status',
  (_req, res) => res.json(status())
);

router.get(
  '/api/sheikha/strategic-execution-fabric/v86/demo',
  (_req, res) => res.json(executionPlan())
);

router.post(
  '/api/sheikha/strategic-execution-fabric/v86/plan',
  (req, res) => res.json(executionPlan(req.body || {}))
);

module.exports = router;
