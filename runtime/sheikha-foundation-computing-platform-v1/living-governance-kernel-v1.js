'use strict';

const { validateGovernedObject } = require('./universal-governed-object-v1');
const { decide } = require('./policy-decision-point-v1');
const { enforce } = require('./policy-enforcement-point-v1');
const { verifyAndConsume } = require('./authorization-engine-v1');
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
  'DERIVE_RISK_AND_HIGH_IMPACT_FROM_GOVERNED_DATA',
  'CALL_POLICY_DECISION_POINT',
  'ENFORCE_PRODUCTION_ELIGIBILITY_BEFORE_EXECUTABLE_ACTION',
  'REQUIRE_BOUND_DECISION_EVIDENCE',
  'VERIFY_AUTHORIZATION_OBJECT_ACTION_SCOPE_WHEN_REQUIRED',
  'ATOMICALLY_CONSUME_SINGLE_USE_AUTHORIZATION_WHEN_REQUIRED',
  'CREATE_GOVERNANCE_DECISION_EVENT',
  'CREATE_EVIDENCE_RECORD',
  'CALL_POLICY_ENFORCEMENT_POINT_ONLY_AFTER_ALL_GATES',
  'RETURN_DECISION_EVIDENCE_AND_NEXT_STATE'
]);

const HIGH_IMPACT_CLASSES = Object.freeze([
  'HIGH',
  'CRITICAL',
  'PRODUCTION',
  'FINANCIAL',
  'PHYSICAL_CONTROL',
  'EXTERNAL_COMMITMENT'
]);

function nonBlank(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function impactClassIsHigh(value) {
  return nonBlank(value) && HIGH_IMPACT_CLASSES.includes(value.trim().toUpperCase());
}

function normalizeRequestedAction(action, context = {}) {
  if (typeof action === 'function') {
    return Object.freeze({
      id: nonBlank(context.actionId) ? context.actionId.trim() : null,
      scope: Array.isArray(context.actionScope) ? [...context.actionScope] : [],
      execute: action,
      executable: true,
      highImpact: context.actionHighImpact === true,
      impactClass: context.actionImpactClass || null,
      movesMoney: context.movesMoney === true,
      physicalControl: context.physicalControl === true,
      productionMutation: context.productionMutation === true,
      externalCommitment: context.externalCommitment === true
    });
  }

  if (action && typeof action === 'object') {
    return Object.freeze({
      id: nonBlank(action.id) ? action.id.trim() : null,
      scope: Array.isArray(action.scope) ? [...action.scope] : [],
      execute: typeof action.execute === 'function' ? action.execute : null,
      executable: action.executable === true || typeof action.execute === 'function',
      highImpact: action.highImpact === true,
      impactClass: action.impactClass || null,
      movesMoney: action.movesMoney === true,
      physicalControl: action.physicalControl === true,
      productionMutation: action.productionMutation === true,
      externalCommitment: action.externalCommitment === true
    });
  }

  return Object.freeze({
    id: null,
    scope: [],
    execute: null,
    executable: false,
    highImpact: false,
    impactClass: null,
    movesMoney: false,
    physicalControl: false,
    productionMutation: false,
    externalCommitment: false
  });
}

function deriveHighImpact({ object = {}, policy = {}, action = {}, context = {} } = {}) {
  const governedHighImpact =
    object.highImpact === true ||
    impactClassIsHigh(object.classification) ||
    policy.highImpact === true ||
    impactClassIsHigh(policy.impactClass) ||
    action.highImpact === true ||
    impactClassIsHigh(action.impactClass) ||
    action.movesMoney === true ||
    action.physicalControl === true ||
    action.productionMutation === true ||
    action.externalCommitment === true;

  return Object.freeze({
    governedHighImpact,
    callerElevatedHighImpact: context.highImpact === true,
    highImpact: governedHighImpact || context.highImpact === true,
    callerMayDowngradeGovernedImpact: false
  });
}

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
      evidenceSource: evidenceSource || null
    };
  }

  return {
    ok: true,
    reason: 'DECISION_EVIDENCE_BOUND',
    evidenceId: evidenceId || null,
    payloadHash: payloadHash || evidenceId,
    evidenceSource
  };
}

async function govern({ object, policy = {}, context = {}, action = null } = {}) {
  const validation = validateGovernedObject(object || {});
  if (!validation.ok) {
    return { allowed: false, executed: false, reason: 'UGO_INVALID', validation };
  }

  const requestedAction = normalizeRequestedAction(action, context);
  const impact = deriveHighImpact({ object, policy, action: requestedAction, context });
  const governedContext = {
    ...context,
    highImpact: impact.highImpact
  };

  const rightsValidation = validateRights(object, governedContext);
  const legalValidation = validateLegal(governedContext);

  const mappingReviewGateAvailable = typeof validateMappingReview === 'function';
  if (!mappingReviewGateAvailable) {
    return {
      allowed: false,
      executed: false,
      reason: 'POLICY_MAPPING_REVIEW_GATE_UNAVAILABLE'
    };
  }

  const sourceValidation = policy.shariaApplies === true
    ? validatePolicySources(policy, governedContext)
    : typeof validateShariaBindings === 'function'
      ? { ok: true, reason: 'SHARIA_POLICY_NOT_APPLICABLE', results: [] }
      : { ok: false, reason: 'SHARIA_SOURCE_VALIDATOR_UNAVAILABLE' };

  const decision = decide({
    object,
    policy: { ...policy, failClosed: governance.controls.failClosed },
    context: governedContext,
    rightsValidation,
    legalValidation,
    sourceValidation
  });

  if (decision.decision !== 'ALLOW') {
    return {
      allowed: false,
      executed: false,
      reason: decision.reason,
      decision,
      rightsValidation,
      legalValidation,
      sourceValidation,
      impact,
      requestedAction
    };
  }

  if (requestedAction.executable && validation.productionEligible !== true) {
    return {
      allowed: false,
      executed: false,
      reason: 'PRODUCTION_ELIGIBILITY_REQUIRED',
      decision,
      validation,
      rightsValidation,
      legalValidation,
      sourceValidation,
      impact,
      requestedAction
    };
  }

  const decisionEvidence = validateDecisionEvidence(governedContext);
  if (!decisionEvidence.ok) {
    return {
      allowed: false,
      executed: false,
      reason: decisionEvidence.reason,
      decision,
      rightsValidation,
      legalValidation,
      sourceValidation,
      impact,
      requestedAction,
      decisionEvidence
    };
  }

  let authorizationDecision = {
    ok: true,
    consumed: false,
    reason: 'AUTHORIZATION_NOT_REQUIRED_FOR_LOW_IMPACT'
  };

  if (impact.highImpact === true) {
    if (!nonBlank(requestedAction.id)) {
      return {
        allowed: false,
        executed: false,
        reason: 'BOUND_ACTION_ID_REQUIRED_FOR_HIGH_IMPACT',
        decision,
        rightsValidation,
        legalValidation,
        sourceValidation,
        impact,
        requestedAction,
        decisionEvidence
      };
    }

    authorizationDecision = await verifyAndConsume({
      authorization: governedContext.authorization,
      expectedObjectId: object.id,
      expectedAction: requestedAction.id,
      expectedScope: requestedAction.scope,
      claimStore: governedContext.authorizationClaimStore,
      evidenceRef:
        governedContext.authorizationEvidenceRef ||
        decisionEvidence.evidenceId ||
        decisionEvidence.payloadHash,
      now: governedContext.now == null ? Date.now() : governedContext.now
    });

    if (!authorizationDecision.ok) {
      return {
        allowed: false,
        executed: false,
        reason: authorizationDecision.reason,
        decision,
        rightsValidation,
        legalValidation,
        sourceValidation,
        impact,
        requestedAction,
        decisionEvidence,
        authorizationDecision
      };
    }
  }

  const finalDecision = {
    ...decision,
    reason: impact.highImpact
      ? 'POLICY_AND_BOUND_AUTHORIZATION_CONDITIONS_SATISFIED'
      : decision.reason
  };

  const event = createEvent(
    'BENEFIT_EVENT',
    object.id,
    governedContext.eventSource || 'SHEIKHA_LIVING_GOVERNANCE_KERNEL_V1',
    decisionEvidence.evidenceId || decisionEvidence.payloadHash,
    governedContext.correlationId || object.id,
    governedContext.at || new Date().toISOString()
  );

  const evidence = evidenceRecord({
    objectId: object.id,
    event: event.type,
    source: decisionEvidence.evidenceSource,
    payloadHash: decisionEvidence.payloadHash,
    metrics: {
      decision: finalDecision.decision,
      reason: finalDecision.reason,
      highImpact: impact.highImpact,
      governedHighImpact: impact.governedHighImpact,
      authorizationReason: authorizationDecision.reason,
      sourceValidation: sourceValidation.reason,
      rightsValidation: rightsValidation.reason,
      legalValidation: legalValidation.reason
    },
    at: event.at
  });

  const enforcement = enforce(finalDecision, requestedAction.execute);

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
    impact,
    requestedAction,
    decisionEvidence,
    authorizationDecision
  };
}

module.exports = {
  steps,
  HIGH_IMPACT_CLASSES,
  normalizeRequestedAction,
  deriveHighImpact,
  validateRights,
  validateLegal,
  validateDecisionEvidence,
  govern
};
