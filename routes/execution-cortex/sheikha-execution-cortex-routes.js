'use strict';

const express = require('express');
const router = express.Router();

const {
  loadExecutionCortexOmega
} = require('../../runtime/execution-cortex/sheikha-execution-cortex-omega');

router.get('/api/sheikha/execution-cortex/v1/status', (_req, res) => {

  res.json({
    success: true,
    system: 'SHEIKHA_EXECUTION_CORTEX_OMEGA_V1',
    cortex: loadExecutionCortexOmega()
  });

});

module.exports = router;
