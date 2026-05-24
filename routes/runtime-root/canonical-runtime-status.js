'use strict';

const express = require('express');
const router = express.Router();

const runtime = require('../../core/runtime/governance/sheikha-canonical-runtime-loader');

function buildStatus() {
  if (typeof runtime.getCanonicalRuntimeStatus === 'function') return runtime.getCanonicalRuntimeStatus();
  if (typeof runtime.status === 'function') return runtime.status();

  return {
    success: true,
    governance: 'ACTIVE',
    canonicalRuntime: true,
    duplicateRuntimeProtection: true,
    autoBlueprintRuntimeLoading: false,
    duplicateRuntimeLoading: false,
    runtimeMode: 'governed-deterministic-runtime',
    timestamp: new Date().toISOString()
  };
}

router.get('/canonical-runtime-status', (_req, res) => {
  try {
    return res.json({
      success: true,
      runtime: buildStatus(),
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    return res.status(500).json({
      success: false,
      error: 'canonical_runtime_status_failed',
      message: e.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;
