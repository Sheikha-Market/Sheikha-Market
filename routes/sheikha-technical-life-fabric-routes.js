'use strict';

const express = require('express');
const router = express.Router();
const { status } = require('../core/life-fabric/sheikha-technical-life-operating-ecosystem-v1');

router.get('/api/sheikha/life-fabric/v1/status', (_req, res) => {
  res.json(status());
});

module.exports = router;
