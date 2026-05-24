#!/usr/bin/env node
'use strict';

const express = require('express');
const router = express.Router();

const canonicalRuntime = require('../../core/runtime/governance/sheikha-canonical-runtime-loader');

function canonicalRuntimeStatusPayload() {
  const status = canonicalRuntime.getCanonicalRuntimeStatus();
  return {
    success: true,
    runtime: status.runtime,
    governance: status.governance,
    duplicateRuntimeLoading: status.duplicateRuntimeLoading,
    autoBlueprintRuntimeLoading: status.autoBlueprintRuntimeLoading,
    canonicalConvergence: true,
    runtimeMode: 'governed-deterministic-runtime',
    nestedRepoExecution: status.nestedRepoExecution,
    recursiveScannerRuntimeLoading: status.recursiveScannerRuntimeLoading,
    canonicalRoot: status.canonicalRoot,
    policy: status.policy,
    timestamp: new Date().toISOString()
  };
}

function canonicalRuntimeStatus(_req, res) {
  return res.json(canonicalRuntimeStatusPayload());
}

function attachCanonicalRuntimeRoutes(targetRouter) {
  targetRouter.get('/canonical-runtime-status', canonicalRuntimeStatus);
  targetRouter.get('/canonical-runtime/status', canonicalRuntimeStatus);

  targetRouter.get('/canonical-runtime/paths', (_req, res) => {
    const status = canonicalRuntime.getCanonicalRuntimeStatus();
    res.json({
      success: true,
      runtime: status.runtime,
      governance: status.governance,
      canonicalRoot: status.canonicalRoot,
      canonicalRuntimePaths: status.canonicalRuntimePaths,
      auditOnlyPaths: status.auditOnlyPaths,
      blockedRuntimePaths: status.blockedRuntimePaths,
      timestamp: new Date().toISOString()
    });
  });

  targetRouter.post('/canonical-runtime/evaluate-path', express.json(), (req, res) => {
    const body = req.body || {};
    res.json({
      success: true,
      runtime: 'canonical',
      governance: 'active',
      decision: canonicalRuntime.classifyRuntimePath(body.path || body.target || '.'),
      timestamp: new Date().toISOString()
    });
  });
}

attachCanonicalRuntimeRoutes(router);

router.canonicalRuntimeStatus = canonicalRuntimeStatus;
router.canonicalRuntimeStatusPayload = canonicalRuntimeStatusPayload;
router.attachCanonicalRuntimeRoutes = attachCanonicalRuntimeRoutes;

if (require.main === module) {
  console.log(JSON.stringify(canonicalRuntimeStatusPayload(), null, 2));
}

module.exports = router;
