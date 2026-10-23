'use strict';

const express = require('express');
const {
  buildRegistry,
  getStatus,
  listPages,
} = require(
  '../../core/site-registry/sheikha-engine-domain-registry-v3'
);
const {
  inspectEngineRuntime,
} = require(
  '../../core/site-registry/sheikha-engine-domain-health-v3'
);
const {
  buildMasterRegistry,
  getEngine,
  getDomainEngines,
  resolveIntentOwner,
} = require(
  '../../core/engine-registry/sheikha-master-engine-registry-v1'
);
const {
  buildEngineIntegrations,
  getDomainIntegration,
  getEngineIntegration,
} = require(
  '../../core/engine-registry/sheikha-engine-integration-fabric-v1'
);
const {
  buildAuthorityCapabilityMatrix,
  getConnectorCapability,
  getDomainConnectorCapabilities,
} = require(
  '../../core/engine-registry/' +
  'sheikha-connector-authority-capability-matrix-v1'
);
const {
  buildConnectorIdentityEvidenceBinding,
  getConnectorIdentityBinding,
  getDomainIdentityBindings,
} = require(
  '../../core/engine-registry/' +
  'sheikha-connector-identity-evidence-binding-v1'
);
const {
  buildPromotionGateStatus,
  evaluateConnectorPromotion,
} = require(
  '../../core/engine-registry/' +
  'sheikha-connector-authorization-promotion-gate-v1'
);
const {
  evaluateReviewCandidate,
  prepareEvidenceIntake,
  projectApprovedEvidenceLedger,
  queueStatus,
} = require(
  '../../core/engine-registry/' +
  'sheikha-connector-evidence-intake-review-v1'
);
const {
  buildReviewerAuthorityRegistry,
  evaluateReviewerAuthority,
} = require(
  '../../core/engine-registry/' +
  'sheikha-reviewer-authority-registry-v1'
);
const {
  evaluateAssignmentRatification,
  prepareAssignmentProposal,
  proposalGateStatus,
} = require(
  '../../core/engine-registry/' +
  'sheikha-reviewer-assignment-proposal-gate-v1'
);
const {
  buildManualCommitGateStatus,
  evaluateManualAssignmentCommit,
} = require(
  '../../core/engine-registry/' +
  'sheikha-reviewer-assignment-manual-commit-gate-v1'
);
const {
  buildWritePlanStatus,
  previewAssignmentWritePlan,
} = require(
  '../../core/engine-registry/' +
  'sheikha-reviewer-assignment-write-plan-v1'
);
const {
  buildAuditDriftGuardStatus,
  inspectAssignmentDrift,
} = require(
  '../../core/engine-registry/' +
  'sheikha-reviewer-assignment-audit-drift-guard-v1'
);
const {
  buildRecoveryPlan,
  inspectRecoveryReadiness,
} = require(
  '../../core/engine-registry/' +
  'sheikha-reviewer-assignment-recovery-reconciliation-v1'
);
const {
  buildAssignmentGovernanceSummary,
} = require(
  '../../core/engine-registry/' +
  'sheikha-assignment-governance-summary-v1'
);

const router = express.Router();

router.use('/architecture', require(
  './sheikha-master-architecture-topology-routes-v1.cjs'
).createTopologyRoutes());

router.get('/status', (_req, res) => {
  res.json({ ok: true, data: getStatus() });
});

router.get('/domains', (_req, res) => {
  res.json({ ok: true, data: buildRegistry().domains });
});

router.get('/pages', (req, res) => {
  res.json({
    ok: true,
    data: listPages({
      domain: req.query.domain,
      engine: req.query.engine,
      search: req.query.search,
      limit: req.query.limit,
    }),
  });
});

router.get('/registry', (_req, res) => {
  res.json({ ok: true, data: buildRegistry() });
});

router.get('/health', (_req, res) => {
  const registry = buildRegistry();
  res.json({ ok: true, data: inspectEngineRuntime(registry) });
});

router.get('/master-engines', (_req, res) => {
  res.json({ ok: true, data: buildMasterRegistry() });
});

router.get('/master-engines/:id', (req, res) => {
  const engine = getEngine(req.params.id);
  res.status(engine ? 200 : 404).json({
    ok: Boolean(engine),
    data: engine,
  });
});

router.get('/domain-engines/:domain', (req, res) => {
  res.json({
    ok: true,
    data: getDomainEngines(req.params.domain),
  });
});

router.get('/intent-owner', (req, res) => {
  const engine = resolveIntentOwner(req.query.intent);
  res.status(engine ? 200 : 404).json({
    ok: Boolean(engine),
    data: {
      intent: String(req.query.intent || ''),
      engine,
    },
  });
});

router.get('/integrations', (_req, res) => {
  res.json({ ok: true, data: buildEngineIntegrations() });
});

router.get('/integrations/engine/:id', (req, res) => {
  const data = getEngineIntegration(req.params.id);
  res.status(data ? 200 : 404).json({
    ok: Boolean(data),
    data,
  });
});

router.get('/integrations/domain/:domain', (req, res) => {
  res.json({
    ok: true,
    data: getDomainIntegration(req.params.domain),
  });
});

router.get('/authority-matrix', (_req, res) => {
  res.json({
    ok: true,
    data: buildAuthorityCapabilityMatrix(),
  });
});

router.get('/authority-matrix/connector/:id', (req, res) => {
  const data = getConnectorCapability(req.params.id);
  res.status(data ? 200 : 404).json({
    ok: Boolean(data),
    data,
  });
});

router.get('/authority-matrix/domain/:domain', (req, res) => {
  res.json({
    ok: true,
    data: getDomainConnectorCapabilities(req.params.domain),
  });
});

router.get('/identity-evidence-bindings', (_req, res) => {
  res.json({
    ok: true,
    data: buildConnectorIdentityEvidenceBinding(),
  });
});

router.get('/identity-evidence-bindings/connector/:id', (req, res) => {
  const data = getConnectorIdentityBinding(req.params.id);
  res.status(data ? 200 : 404).json({
    ok: Boolean(data),
    data,
  });
});

router.get('/identity-evidence-bindings/domain/:domain', (req, res) => {
  res.json({
    ok: true,
    data: getDomainIdentityBindings(req.params.domain),
  });
});

router.get('/authorization-promotion-gate', (_req, res) => {
  res.json({
    ok: true,
    data: buildPromotionGateStatus(),
  });
});

router.post('/authorization-promotion-gate/evaluate', (req, res) => {
  const data = evaluateConnectorPromotion(req.body || {});
  const status =
    data.reason === 'CONNECTOR_ID_REQUIRED' ? 422 :
    data.reason === 'CONNECTOR_NOT_REGISTERED' ? 404 :
    200;
  res.status(status).json({
    ok: status === 200,
    data,
  });
});

router.get('/evidence-review-queue', (_req, res) => {
  res.json({
    ok: true,
    data: queueStatus(),
  });
});

router.post('/evidence-review-queue/intake-preview', (req, res) => {
  const data = prepareEvidenceIntake(req.body || {});
  const status =
    data.reason === 'CONNECTOR_ID_REQUIRED' ? 422 :
    data.reason === 'CONNECTOR_NOT_REGISTERED' ? 404 :
    data.decision === 'DENY' ? 400 :
    200;
  res.status(status).json({
    ok: status === 200,
    data,
  });
});

router.post('/evidence-review-queue/review-preview', (req, res) => {
  const body = req.body || {};
  const data = evaluateReviewCandidate(
    body.candidate || {},
    body.review || {}
  );
  res.json({
    ok: true,
    data,
  });
});

router.get('/evidence-review-queue/approved-ledger-preview', (_req, res) => {
  res.json({
    ok: true,
    data: projectApprovedEvidenceLedger(),
  });
});

router.get('/reviewer-authority-registry', (_req, res) => {
  res.json({
    ok: true,
    data: buildReviewerAuthorityRegistry(),
  });
});

router.post('/reviewer-authority-registry/evaluate', (req, res) => {
  const data = evaluateReviewerAuthority(req.body || {});
  const status =
    data.reason === 'REVIEWER_IDENTITY_REQUIRED' ? 422 : 200;
  res.status(status).json({
    ok: status === 200,
    data,
  });
});

router.get('/reviewer-assignment-proposal-gate', (_req, res) => {
  res.json({
    ok: true,
    data: proposalGateStatus(),
  });
});

router.post('/reviewer-assignment-proposal-gate/propose-preview', (req, res) => {
  const data = prepareAssignmentProposal(req.body || {});
  const status = data.decision === 'DENY' ? 400 : 200;
  res.status(status).json({
    ok: status === 200,
    data,
  });
});

router.post('/reviewer-assignment-proposal-gate/ratify-preview', (req, res) => {
  const body = req.body || {};
  const data = evaluateAssignmentRatification(
    body.proposal || {},
    body.ratification || {}
  );
  res.json({
    ok: true,
    data,
  });
});

router.get('/reviewer-assignment-manual-commit-gate', (_req, res) => {
  res.json({
    ok: true,
    data: buildManualCommitGateStatus(),
  });
});

router.post('/reviewer-assignment-manual-commit-gate/evaluate', (req, res) => {
  const data = evaluateManualAssignmentCommit(req.body || {});
  const status = data.reason === 'PROPOSAL_ID_REQUIRED' ? 422 : 200;
  res.status(status).json({
    ok: status === 200,
    data,
  });
});

router.get('/reviewer-assignment-write-plan', (_req, res) => {
  res.json({
    ok: true,
    data: buildWritePlanStatus(),
  });
});

router.post('/reviewer-assignment-write-plan/preview', (req, res) => {
  const data = previewAssignmentWritePlan(req.body || {});
  res.json({
    ok: true,
    data,
  });
});

router.get('/reviewer-assignment-audit-drift-guard', (_req, res) => {
  res.json({
    ok: true,
    data: buildAuditDriftGuardStatus(),
  });
});

router.post('/reviewer-assignment-audit-drift-guard/inspect', (_req, res) => {
  res.json({
    ok: true,
    data: inspectAssignmentDrift(),
  });
});

router.get('/reviewer-assignment-recovery-plan', (_req, res) => {
  res.json({
    ok: true,
    data: buildRecoveryPlan(),
  });
});

router.post('/reviewer-assignment-recovery-plan/inspect', (_req, res) => {
  res.json({
    ok: true,
    data: inspectRecoveryReadiness(),
  });
});

router.get('/assignment-governance-summary', (_req, res) => {
  res.json({
    ok: true,
    data: buildAssignmentGovernanceSummary(),
  });
});

module.exports = router;
