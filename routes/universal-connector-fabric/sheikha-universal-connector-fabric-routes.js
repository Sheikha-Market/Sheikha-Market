'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  connectorPlan
} = require('../../runtime/universal-connector-fabric/v116/sheikha-universal-connector-fabric-v116');

router.get(
  '/api/sheikha/universal-connector-fabric/v116/status',
  (_req, res) => res.json(status())
);

router.get(
  '/api/sheikha/universal-connector-fabric/v116/demo',
  (_req, res) => res.json(connectorPlan())
);

router.post(
  '/api/sheikha/universal-connector-fabric/v116/plan',
  (req, res) => res.json(connectorPlan(req.body || {}))
);

module.exports = router;
