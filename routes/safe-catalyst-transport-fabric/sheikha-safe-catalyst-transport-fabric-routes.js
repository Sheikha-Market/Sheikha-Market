'use strict';

const express = require('express');
const router = express.Router();
const { status, analyze } = require('../../runtime/safe-catalyst-transport-fabric/v1/sheikha-safe-catalyst-transport-fabric-v1');

router.get('/api/sheikha/safe-catalyst-transport-fabric/v1/status', (_req, res) => res.json(status()));
router.post('/api/sheikha/safe-catalyst-transport-fabric/v1/analyze', (req, res) => res.json(analyze(req.body || {})));

module.exports = router;
