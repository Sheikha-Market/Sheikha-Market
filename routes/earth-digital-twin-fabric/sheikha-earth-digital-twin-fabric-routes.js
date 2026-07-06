'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  createEarthTwin
} = require('../../runtime/earth-digital-twin-fabric/v1/sheikha-earth-digital-twin-fabric-v67');

router.get('/api/sheikha/earth-digital-twin-fabric/v67/status', (_req, res) => res.json(status()));
router.get('/api/sheikha/earth-digital-twin-fabric/v67/demo', (_req, res) => res.json(createEarthTwin()));
router.post('/api/sheikha/earth-digital-twin-fabric/v67/twin', (req, res) => res.json(createEarthTwin(req.body || {})));

module.exports = router;
