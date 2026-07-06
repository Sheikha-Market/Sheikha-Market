'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  policyPlan
} = require('../../runtime/policy-enforcement-mesh-fabric/v122/sheikha-policy-enforcement-mesh-fabric-v122');

router.get(
  '/api/sheikha/policy-enforcement-mesh-fabric/v122/status',
  (_req, res) => res.json(status())
);

router.get(
  '/api/sheikha/policy-enforcement-mesh-fabric/v122/demo',
  (_req, res) => res.json(policyPlan())
);

router.post(
  '/api/sheikha/policy-enforcement-mesh-fabric/v122/plan',
  (req, res) => res.json(policyPlan(req.body || {}))
);

module.exports = router;
