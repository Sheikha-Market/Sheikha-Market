'use strict';

const crypto = require('crypto');
const policyRegistry = require('./policy-registry');
const store = require('./store');

const PROMOTION_ROLES = Object.freeze(['OWNER', 'GOVERNANCE_REVIEWER']);
const BLOCKED_PATTERNS = Object.freeze([
  'rm -rf', 'drop database', 'truncate', 'shutdown', 'reboot',
  'تحويل مالي', 'افتح القفل'
]);

class CovenantGovernanceError extends Error {
  constructor(code, message, statusCode = 400) {
    super(message);
    this.name = 'CovenantGovernanceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

function status() {
  return {
    system: 'SHEIKHA_COVENANT_GOVERNANCE_APEX_V1',
    status: 'ACTIVE_SINGLE_HOST_OPERATIONAL',
    level: 'HIGHEST_INTERNAL_GOVERNANCE_ASSURANCE_LAYER',
    apexLevel: 17,
    constitutionalReference: 'SHEIKHA_MASTER_LIFE_CYCLE_V1',
    governanceAuthority: 'SHEIKHA_CIVILIZATION_GOVERNANCE_V2',
    governedStewardshipLayer: 'SHEIKHA_CIVILIZATION_STEWARDSHIP_APEX_V1',
    scope: 'ALL_INTERNAL_LAYERS_SYSTEMS_DOMAINS_AND_PROMOTIONS',
    capabilities: [
      'numbered-policy-registry',
      'governance-of-governance-evaluation',
      'layer-promotion-gate',
      'evidence-and-authority-assurance',
      'rollback-and-harm-assurance',
      'human-and-specialist-review-gates',
      'append-only-promotion-audit'
    ],
    boundaries: {
      referenceNotAutomatedReligiousInterpretation: true,
      noAutomatedFatwa: true,
      noClaimOfDivineAuthority: true,
      noClaimOfUnseenKnowledge: true,
      noExternalSovereignOrRegulatoryAuthorityClaim: true,
      humanScholarlyReviewForReligiousInterpretation: true,
      specialistReviewWhenRequired: true,
      noSelfPromotion: true,
      humanApprovalForPromotion: true
    },
    policyRegistry: policyRegistry.status(),
    storage: store.status()
  };
}

function evaluateAction(input = {}) {
  const message = String(input.message || '').toLowerCase();
  const violation = BLOCKED_PATTERNS.find(pattern => message.includes(pattern)) || null;
  const evidenceRequired = input.evidenceRequired === true || input.highImpact === true;
  const evidencePresent = Array.isArray(input.evidenceRefs) && input.evidenceRefs.length > 0;
  const specialistReviewRequired = input.specialistReviewRequired === true;
  const specialistReviewed = input.specialistReviewed === true;
  const reviewReasons = [];
  if (evidenceRequired && !evidencePresent) reviewReasons.push('EVIDENCE_REQUIRED');
  if (specialistReviewRequired && !specialistReviewed) {
    reviewReasons.push('SPECIALIST_REVIEW_REQUIRED');
  }
  return {
    engine: 'SHEIKHA_COVENANT_GOVERNANCE_EVALUATOR_V1',
    status: violation ? 'BLOCKED' : reviewReasons.length ? 'REVIEW_REQUIRED' : 'APPROVED',
    allowed: !violation && reviewReasons.length === 0,
    violation,
    reviewReasons,
    policiesApplied: policyRegistry.POLICIES.map(policy => policy.id),
    humanFinalAuthority: true,
    religiousInterpretationPerformed: false
  };
}

function authorizePromotion(context = {}) {
  const actorId = String(context.actorId || '').trim();
  const role = String(context.role || '').toUpperCase();
  if (!context.trusted || !actorId) {
    throw new CovenantGovernanceError('TRUSTED_IDENTITY_REQUIRED', 'Trusted identity is required.', 401);
  }
  if (!PROMOTION_ROLES.includes(role)) {
    throw new CovenantGovernanceError('PROMOTION_ROLE_REQUIRED', 'A promotion governance role is required.', 403);
  }
  if (context.humanApproved !== true) {
    throw new CovenantGovernanceError(
      'HUMAN_APPROVAL_REQUIRED',
      'Explicit human approval is required for layer promotion.',
      403
    );
  }
  return { actorId, role };
}

function promoteLayer(input = {}, context = {}) {
  const actor = authorizePromotion(context);
  const layer = String(input.layer || '').trim();
  if (!layer) throw new CovenantGovernanceError('LAYER_REQUIRED', 'layer is required.');
  const evidenceRefs = Array.isArray(input.evidenceRefs)
    ? input.evidenceRefs.map(String).filter(Boolean)
    : [];
  const checks = {
    testsPassed: input.testsPassed === true,
    lintPassed: input.lintPassed === true,
    noDrift: input.noDrift === true,
    governancePassed: input.governancePassed === true,
    evidenceLinked: evidenceRefs.length > 0,
    rollbackReady: input.rollbackReady === true,
    authorityClaimsVerified: input.authorityClaimsVerified === true,
    specialistReviewComplete: input.specialistReviewRequired !== true ||
      input.specialistReviewComplete === true,
    religiousReviewComplete: input.religiousInterpretationRequired !== true ||
      input.humanScholarlyReviewComplete === true
  };
  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed).map(([name]) => name);
  if (failedChecks.length) {
    throw new CovenantGovernanceError(
      'PROMOTION_ASSURANCE_FAILED',
      `Layer promotion checks failed: ${failedChecks.join(', ')}`,
      409
    );
  }
  const promotion = {
    id: `promotion_${crypto.randomUUID()}`,
    layer,
    targetLevel: Number.isFinite(Number(input.targetLevel)) ? Number(input.targetLevel) : null,
    decision: 'PROMOTED_UNDER_GOVERNANCE',
    checks,
    evidenceRefs,
    policyRefs: policyRegistry.POLICIES.map(policy => policy.id),
    finalAuthority: 'HUMAN_RETAINED',
    promotedAt: new Date().toISOString(),
    promotedBy: actor.actorId
  };
  return store.transact({
    action: 'LAYER_PROMOTED_UNDER_COVENANT_GOVERNANCE',
    actorId: actor.actorId,
    resourceId: promotion.id
  }, state => {
    state.promotions.push(promotion);
    return promotion;
  });
}

function snapshot() {
  const state = store.read();
  return {
    registry: 'SHEIKHA_COVENANT_GOVERNANCE_PROMOTION_REGISTRY_V1',
    status: 'ACTIVE',
    revision: state.revision,
    policies: policyRegistry.status(),
    promotions: state.promotions
  };
}

module.exports = {
  CovenantGovernanceError,
  evaluateAction,
  policyRegistry,
  promoteLayer,
  snapshot,
  status,
  store
};
