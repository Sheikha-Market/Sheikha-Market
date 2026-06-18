'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  analyze
} = require('../../runtime/industrial-material-lifecycle-fabric/v1/sheikha-industrial-material-lifecycle-fabric-v1');

router.get('/api/sheikha/industrial-material-lifecycle-fabric/v1/status', (_req, res) => res.json(status()));
router.post('/api/sheikha/industrial-material-lifecycle-fabric/v1/analyze', (req, res) => res.json(analyze(req.body || {})));

module.exports = router;
