'use strict';

const express = require('express');
const router = express.Router();

const { loadRuntime } = require('../../runtime/loader/sheikha-runtime-loader');

router.get('/api/sheikha/master-blueprint/v1/status', (_req, res) => {
  res.json({
    success: true,
    system: 'SHEIKHA_MASTER_BLUEPRINT_V1',
    runtime: loadRuntime()
  });
});

module.exports = router;
