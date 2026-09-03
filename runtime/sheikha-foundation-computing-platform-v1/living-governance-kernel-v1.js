'use strict';

const { validateGovernedObject } = require('./universal-governed-object-v1');
const { decide } = require('./policy-decision-point-v1');
const { enforce } = require('./policy-enforcement-point-v1');
const { canUse } = require('./authorization-engine-v1');
const { createEvent } = require('./governance-event-fabric-v1');
const { evidenceRecord } = require('./evidence-observability-v1');
const { governance, validatePolicySources } = require('./quran-sunnah-governance-v1');
const { assetRights } = require('./asset-ownership-rights-v1');
const { legalRegistrySchema } = require('./law-regulation-standards-registry-v1');
const { validateShariaBindings } = require('./sharia-source-validator-v1');
const { validateMappingReview } = require('./sharia-policy-mapping-review-v1');

const steps = Object.freeze([
  'VALIDATE_UGO',
  'VALIDATE_OWNER_RIGHTS_AND_PROVENANCE',
  'VALIDATE_APPLICABLE_LAW_AND_STANDARD_STATE',
  'VALIDATE_SHARIA_SOURCE_AND_DOCUMENTED_POLICY_MAPPING_BINDINGS_WHEN_APPLICABLE',
  'CLASSIFY_RISK_AND_HIGH_IMPACT',
  'CALL_POLICY_DECISION_POINT',
  'VERIFY_AUTHORIZATION_WHEN_REQUIRED',
  'REQUIRE_BOUND_DECISION_EVIDENCE',
  'CREATE_GOVERNANCE_DECISION_EVENT',
  'CREATE_EVIDENCE_RECORD',
  'CALL_POLICY_ENFORCEMENT_POINT_ONLY_AFTER_ALLOW',
  'RETURN_DECISION_EVIDENCE_AND_NEXT_STATE',
]);

function validateRights(object = {}, context = {}) {
  const requiresRights =
    context.requiresRightsValidation === true ||
    object.type === 'RESOURCE' ||
    object.type === 'ASSET';

  if (!requiresRights) return { ok: true, reason: 'RIGHTS_VALIDATION_NOT_APPLICABLE' };

  if (!object.owner || !object.rights || !object.provenance) {
    return { ok: false, reason: 'OWNER_RIGHTS_AND_PROVENANCE_REQUIRED' };
  }

  if (
    object.rights === 'UNKNOWN_UNVERIFIED' ||
    !assetRights.classes.includes(object.rights)
  ) {
    return { ok: false, reason: 'RIGHTS_NOT_PRODUCTION_ELIGIBLE' };
  }

  return { ok: true, reason: 'RIGHTS_VERIFIED' };
}

function validateLegal(context = {}) {
  if (context.legalApplicable !== true) {
    return { ok: true, reason: 'LEGAL_VALIDATION_NOT_APPLICABLE' };
  }

  if (!legalRegistrySchema.statuses.includes(context.legalStatus)) {
    return { ok: false, reason: 'UNKNOWN_LEGAL_STATUS' };
  }

  if (context.legalStatus !== 'CURRENT_VERIFIED') {
    return { ok: false, reason: 'LEGAL_STATE_NOT_CURRENT_VERIFIED' };
  }

  return { ok: true, reason: 'LEGAL_STATE_CURRENT_VERIFIED' };
}

function validateDecisionEvidence(context = {}) {
  const evidenceId = typeof context.evidenceId === 'string' ? context.evidenceId.trim() : '';
  const payloadHash = typeof context.payloadHash === 'string' ? context.payloadHash.trim() : '';
  const evidenceSource =
    typeof context.evidenceSource === 'string' ? context.evidenceSource.trim() : '';

  if ((!evidenceId && !payloadHash) || !evidenceSource) {
    return {
      ok: false,
      reason: 'DECISION_EVIDENCE_REQUIRED',
      evidenceId: evidenceId || null,
      payloadHash: payloadHash || null,
      evidenceSource: evidenceSource || null,
    };
  }

  return {
    ok: true,
    reason: 'DECISION_EVIDENCE_BOUND',
    evidenceId: evidenceId || null,
    payloadHash: payloadHash || evidenceId,
    evidenceSource,
  };
}

function govern({ object, policy = {}, context = {}, action = null } = {}) {
  const validation = validateGovernedObject(object || {});
  if (!validation.ok) {
    return { allowed: false, executed: false, reason: 'UGO_INVALID', validation };
  }

  const rightsValidation = validateRights(object, context);
  const legalValidation = validateLegal(context);

  const mappingReviewGateAvailable = typeof validateMappingReview === 'function';
  if (!mappingReviewGateAvailable) {
    return {
      allowed: false,
      executed: false,
      reason: 'POLICY_MAPPING_REVIEW_GATE_UNAVAILABLE',
    };
  }

  const sourceValidation = policy.shariaApplies === true
    ? validatePolicySources(policy, context)
    : typeof validateShariaBindings === 'function'
      ? { ok: true, reason: 'SHARIA_POLICY_NOT_APPLICABLE', results: [] }
      : { ok: false, reason: 'SHARIA_SOURCE_VALIDATOR_UNAVAILABLE' };

  const decision = decide({
    object,
    policy: { ...policy, failClosed: governance.controls.failClosed },
    context,
    rightsValidation,
    legalValidation,
    sourceValidation,
  });

  const highImpact = context.highImpact === true;
  const authorizationValid = !highImpact || canUse(context.authorization);

  const finalDecision =
    decision.decision === 'ALLOW' && authorizationValid
      ? decision
      : decision.decision !== 'ALLOW'
        ? decision
        : { decision: 'DENY', reason: 'VALID_AUTHORIZATION_REQUIRED' };

  const decisionEvidence = validateDecisionEvidence(context);
  if (!decisionEvidence.ok) {
    return {
      allowed: false,
      executed: false,
      reason: decisionEvidence.reason,
      decision: finalDecision,
      rightsValidation,
      legalValidation,
      sourceValidation,
      decisionEvidence,
    };
  }

  const event = createEvent(
    finalDecision.decision === 'ALLOW' ? 'BENEFIT_EVENT' : 'RISK_EVENT',
    object.id,
    context.eventSource || 'SHEIKHA_LIVING_GOVERNANCE_KERNEL_V1',
    decisionEvidence.evidenceId || decisionEvidence.payloadHash,
    context.correlationId || object.id,
    context.at || new Date().toISOString(),
  );

  const evidence = evidenceRecord({
    objectId: object.id,
    event: event.type,
    source: decisionEvidence.evidenceSource,
    payloadHash: decisionEvidence.payloadHash,
    metrics: {
      decision: finalDecision.decision,
      reason: finalDecision.reason,
      sourceValidation: sourceValidation.reason,
      rightsValidation: rightsValidation.reason,
      legalValidation: legalValidation.reason,
    },
    at: event.at,
  });

  if (finalDecision.decision !== 'ALLOW') {
    return {
      allowed: false,
      executed: false,
      reason: finalDecision.reason,
      decision: finalDecision,
      event,
      evidence,
      rightsValidation,
      legalValidation,
      sourceValidation,
      decisionEvidence,
    };
  }

  const enforcement = enforce(finalDecision, action);

  return {
    allowed: true,
    executed: enforcement.executed === true,
    reason: finalDecision.reason,
    decision: finalDecision,
    enforcement,
    event,
    evidence,
    rightsValidation,
    legalValidation,
    sourceValidation,
    decisionEvidence,
  };
}

module.exports = {
  steps,
  validateRights,
  validateLegal,
  validateDecisionEvidence,
  govern,
};
