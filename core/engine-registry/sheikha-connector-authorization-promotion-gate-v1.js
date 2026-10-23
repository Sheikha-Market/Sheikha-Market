'use strict';

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..', '..');
const CONFIG_PATH = path.join(
  ROOT,
  'config/sheikha-connector-authorization-promotion-gate-v1.json'
);

const {
  buildConnectorIdentityEvidenceBinding,
} = require('./sheikha-connector-identity-evidence-binding-v1');
const {
  projectApprovedEvidenceLedger,
} = require('./sheikha-connector-evidence-intake-review-v1');

function readConfig() {
  return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

function normalizeOperations(value) {
  if (!Array.isArray(value)) return ['READ'];
  return [...new Set(
    value
      .map((item) => String(item || '').trim().toUpperCase())
      .filter(Boolean)
  )];
}

function recordIsUsable(record, connectorId, binding) {
  if (!record || record.connectorId !== connectorId) return false;
  if (record.status !== 'VERIFIED') return false;
  if (!record.evidenceId || !record.kind) return false;
  if (!record.integrity || record.integrity.algorithm !== 'SHA-256') return false;
  if (!record.integrity.digest) return false;
  if (!record.signature || record.signature.status !== 'VERIFIED') return false;
  if (!record.signature.signerIdentity) return false;
  if (!record.evidenceRegistryRef) return false;
  if (!Array.isArray(record.operations) || !record.operations.includes('READ')) {
    return false;
  }
  if (
    Array.isArray(record.domains) &&
    binding.domains.length > 0 &&
    !binding.domains.every((domain) => record.domains.includes(domain))
  ) {
    return false;
  }
  if (
    record.expiresAt &&
    new Date(record.expiresAt).getTime() <= Date.now()
  ) {
    return false;
  }
  return true;
}

function collectEvidence(ledger, connectorId, binding) {
  return ledger.records.filter((record) =>
    recordIsUsable(record, connectorId, binding)
  );
}

function hasKind(records, kind) {
  return records.some((record) => record.kind === kind);
}

function evaluateConnectorPromotion(input = {}) {
  const config = readConfig();
  const identityRegistry = buildConnectorIdentityEvidenceBinding();
  const ledger = projectApprovedEvidenceLedger();

  const connectorId = String(input.connectorId || '').trim();
  const operations = normalizeOperations(input.operations);
  const requestedTarget = String(
    input.target || 'AUTHORIZATION_REVIEW'
  ).trim().toUpperCase();

  if (!connectorId) {
    return {
      system: config.system,
      decision: 'DENY',
      reason: 'CONNECTOR_ID_REQUIRED',
      autoPromoted: false,
      authorizationGranted: false,
      liveGranted: false,
    };
  }

  const binding = identityRegistry.bindings.find(
    (item) => item.connectorId === connectorId
  );

  if (!binding) {
    return {
      system: config.system,
      connectorId,
      decision: config.governance.unknownConnectorDecision,
      reason: 'CONNECTOR_NOT_REGISTERED',
      autoPromoted: false,
      authorizationGranted: false,
      liveGranted: false,
    };
  }

  if (requestedTarget !== 'AUTHORIZATION_REVIEW') {
    return {
      system: config.system,
      connectorId,
      decision: 'DENY',
      reason: 'LIVE_OR_STATE_PROMOTION_NOT_SUPPORTED',
      autoPromoted: false,
      authorizationGranted: false,
      liveGranted: false,
    };
  }

  const mutationRequested = operations.some((operation) =>
    config.blockedMutationOperations.includes(operation)
  );

  if (mutationRequested) {
    return {
      system: config.system,
      connectorId,
      decision: config.governance.mutationRequestDecision,
      reason: 'MUTATION_OPERATION_BLOCKED',
      operations,
      autoPromoted: false,
      authorizationGranted: false,
      liveGranted: false,
    };
  }

  const evidence = collectEvidence(
    ledger,
    connectorId,
    binding
  );

  const evidenceOwnerIdentities = [
    ...new Set(
      evidence
        .map((record) => record.ownerIdentity)
        .filter(Boolean)
    ),
  ];
  const effectiveOwnerIdentity =
    binding.ownerIdentity ||
    (evidenceOwnerIdentities.length === 1
      ? evidenceOwnerIdentities[0]
      : null);
  const ownerIdentityPresent = Boolean(effectiveOwnerIdentity);
  const ownerIdentityConsistent =
    evidenceOwnerIdentities.length <= 1;
  const identityBound = Boolean(binding.connectorIdentity);
  const dataScopeDeclared =
    Array.isArray(binding.dataScope) && binding.dataScope.length > 0;
  const permissionScopeDeclared =
    Array.isArray(binding.permissionScope?.requested) &&
    binding.permissionScope.requested.includes('READ');

  const checks = {
    identityBound,
    ownerIdentityPresent,
    ownerIdentityConsistent,
    dataScopeDeclared,
    permissionScopeDeclared,
    termsOrContractEvidence:
      hasKind(evidence, 'TERMS_OR_CONTRACT'),
    authorizationEvidence:
      hasKind(evidence, 'AUTHORIZATION'),
    humanApprovalEvidence:
      hasKind(evidence, 'HUMAN_APPROVAL'),
    evidenceRegistryBinding:
      evidence.length > 0 &&
      evidence.every((record) => Boolean(record.evidenceRegistryRef)),
    evidenceIntegrity:
      evidence.length > 0 &&
      evidence.every((record) =>
        record.integrity?.algorithm === 'SHA-256' &&
        Boolean(record.integrity?.digest)
      ),
    evidenceSignatures:
      evidence.length > 0 &&
      evidence.every((record) =>
        record.signature?.status === 'VERIFIED' &&
        Boolean(record.signature?.signerIdentity)
      ),
  };

  const missing = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([check]) => check);

  const decision = missing.length === 0
    ? 'ELIGIBLE'
    : 'REVIEW';

  return {
    system: config.system,
    version: config.version,
    connectorId,
    connectorIdentity: binding.connectorIdentity,
    ownerRole: binding.ownerRole,
    ownerIdentity: effectiveOwnerIdentity,
    target: requestedTarget,
    operations,
    decision,
    reason:
      decision === 'ELIGIBLE'
        ? 'ALL_AUTHORIZATION_REVIEW_EVIDENCE_PRESENT'
        : 'EVIDENCE_OR_OWNER_BINDING_INCOMPLETE',
    checks,
    missing,
    evidenceRefs: evidence.map((record) => record.evidenceId),
    evidenceCount: evidence.length,
    readOnlyEvaluation: true,
    autoPromoted: false,
    authorizationGranted: false,
    liveGranted: false,
    nextAction:
      decision === 'ELIGIBLE'
        ? 'HUMAN_AUTHORIZATION_REVIEW_REQUIRED'
        : 'COMPLETE_MISSING_EVIDENCE_AND_OWNER_BINDING',
  };
}

function buildPromotionGateStatus() {
  const config = readConfig();
  const identityRegistry = buildConnectorIdentityEvidenceBinding();
  const ledger = projectApprovedEvidenceLedger();

  const evaluations = identityRegistry.bindings.map((binding) =>
    evaluateConnectorPromotion({
      connectorId: binding.connectorId,
      operations: ['READ'],
      target: 'AUTHORIZATION_REVIEW',
    })
  );

  const decisions = evaluations.reduce((acc, item) => {
    acc[item.decision] = (acc[item.decision] || 0) + 1;
    return acc;
  }, { DENY: 0, REVIEW: 0, ELIGIBLE: 0 });

  return {
    system: config.system,
    version: config.version,
    status: 'CLEAR',
    mode: config.mode,
    governance: config.governance,
    summary: {
      connectorsEvaluated: evaluations.length,
      evidenceLedgerRecords: ledger.records.length,
      deny: decisions.DENY || 0,
      review: decisions.REVIEW || 0,
      eligible: decisions.ELIGIBLE || 0,
      authorizationsGranted: 0,
      livePromotionsGranted: 0,
    },
    truth: {
      evaluationOnly: true,
      noAutomaticAuthorization: true,
      noAutomaticLivePromotion: true,
      eligibilityIsNotAuthorization: true,
    },
    evaluations,
  };
}

module.exports = {
  buildPromotionGateStatus,
  evaluateConnectorPromotion,
};
