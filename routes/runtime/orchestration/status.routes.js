const express = require('express');
const orchestrator = require('../../../core/orchestration/sheikha-root-orchestrator');
const router = express.Router();

function getStatus(_req, res) {
  const startedAt = Date.now();
  try {
    const status = orchestrator.status();
    return res.json({
      success: true,
      fabric: 'SHEIKHA_DISTRIBUTED_RUNTIME_ORCHESTRATION',
      status: status.status,
      orchestration: status.orchestration,
      mode: status.mode,
      layers: status.layers,
      summary: status.summary,
      optionalIntegrations: status.optionalIntegrations,
      offlineOperation: status.offlineOperation,
      canonicalRuntime: status.canonicalRuntime,
      governance: {
        audit_required: true,
        rollback_required: true,
        human_approval_required: true,
        readiness_is_evidence_based: true,
        optional_external_integrations_block_local_runtime: false
      },
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

router.get('/status', getStatus);
router.get('/orchestration', getStatus);

module.exports = router;
