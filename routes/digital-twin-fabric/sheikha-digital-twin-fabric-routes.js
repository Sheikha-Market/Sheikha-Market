'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  createTwin,
  demoTwin
} = require('../../runtime/digital-twin-fabric/v1/sheikha-digital-twin-fabric-v64');

router.get('/api/sheikha/digital-twin-fabric/v64/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/digital-twin-fabric/v64/demo', (_req, res) => res.json(demoTwin()));
router.post('/api/sheikha/digital-twin-fabric/v64/twin', (req, res) => res.json(createTwin(req.body || {})));

module.exports = router;
