'use strict';

const express = require('express');
const router = express.Router();

const { status, meshPlan } = require('../../runtime/global-transport-mesh-fabric/v113/sheikha-global-transport-mesh-fabric-v113');

router.get('/api/sheikha/global-transport-mesh-fabric/v113/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/global-transport-mesh-fabric/v113/demo', (_req, res) => res.json(meshPlan()));
router.post('/api/sheikha/global-transport-mesh-fabric/v113/plan', (req, res) => res.json(meshPlan(req.body || {})));

module.exports = router;
