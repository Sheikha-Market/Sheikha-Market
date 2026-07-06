'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  buildClusterPlan
} = require('../../runtime/industrial-cluster-fabric/v1/sheikha-industrial-cluster-fabric-v69');

router.get('/api/sheikha/industrial-cluster-fabric/v69/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/industrial-cluster-fabric/v69/demo', (_req, res) => res.json(buildClusterPlan()));
router.post('/api/sheikha/industrial-cluster-fabric/v69/build', (req, res) => res.json(buildClusterPlan(req.body || {})));

module.exports = router;
