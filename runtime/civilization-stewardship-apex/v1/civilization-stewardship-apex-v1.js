'use strict';

const crypto = require('crypto');
const store = require('./store');
const commandPlane = require(
  '../../civilization-command-intelligence-plane/civilization-command-intelligence-plane-v1'
);
const civilizationGovernance = require('../../civilization-governance/civilization-governance-v2');
const masterLifeCycle = require('../../master-life-cycle/sheikha-master-life-cycle-v1');
const evidenceRegistry = require('../../evidence-registry/sheikha-evidence-registry-v1');
const { governGovernance } = require('../../governance/sheikha-governance-of-governance-v1');
const { orchestrate } = require('../../orchestrator/orchestrator-fabric');

const STEWARDSHIP_ROLES = Object.freeze([
  'OWNER', 'ADMIN', 'GOVERNANCE_REVIEWER'
]);
const RATIFICATION_ROLES = Object.freeze([
  'OWNER', 'ADMIN', 'GOVERNANCE_REVIEWER'
]);
const RISK_LEVELS = Object.freeze(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);

class StewardshipApexError extends Error {
  constructor(code, message, statusCode = 400) {
    super(message);
    this.name = 'StewardshipApexError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

function requiredText(value, field) {
  const text = String(value || '').trim();
  if (!text) throw new StewardshipApexError('VALIDATION_ERROR', `${field} is required.`);
  return text;
}

function requiredList(value, field) {
  const list = Array.isArray(value)
    ? value.map(item => String(item).trim()).filter(Boolean)
    : [];
  if (!list.length) {
    throw new StewardshipApexError('VALIDATION_ERROR', `${field} requires at least one item.`);
  }
  return list;
}

function normalizeRisks(value) {
  return (Array.isArray(value) ? value : []).map((risk) => {
    const level = String(risk?.level || 'MEDIUM').toUpperCase();
    return {
      id: `stewardship_risk_${crypto.randomUUID()}`,
      description: requiredText(risk?.description, 'risk.description'),
      level: RISK_LEVELS.includes(level) ? level : 'MEDIUM',
      mitigation: String(risk?.mitigation || '').trim() || null
    };
  });
}

function authorize(context = {}, action, allowedRoles = STEWARDSHIP_ROLES) {
  const actorId = String(context.actorId || '').trim();
  const role = String(context.role || '').toUpperCase();
  if (!context.trusted || !actorId) {
    throw new StewardshipApexError('TRUSTED_IDENTITY_REQUIRED', 'Trusted identity is required.', 401);
  }
  if (!allowedRoles.includes(role)) {
    throw new StewardshipApexError('STEWARDSHIP_ROLE_REQUIRED', 'A stewardship role is required.', 403);
  }

  const governance = governGovernance({
    actor: actorId,
    channel: 'civilization-stewardship-apex',
    action,
    message: action
  });
  governance.humanApproved = context.humanApproved === true;
  const envelope = orchestrate({
    action,
    mutationRequested: true,
    mutationClass: 'GOVERNED_INSTITUTIONAL_STEWARDSHIP_WRITE'
  }, governance);
  if (!governance.allowed || !envelope.mutationAuthorized) {
    throw new StewardshipApexError(
      'GOVERNANCE_ADMISSION_DENIED',
      'Governance and explicit human approval are required.',
      403
    );
  }
  return { actorId, role, governance, envelope };
}

function status() {
  return {
    system: 'SHEIKHA_CIVILIZATION_STEWARDSHIP_APEX_V1',
    status: 'ACTIVE_SINGLE_HOST_OPERATIONAL',
    level: 'HIGHEST_GOVERNED_INSTITUTIONAL_STEWARDSHIP_LAYER',
    apexLevel: 16,
    constitutionalReference: 'SHEIKHA_MASTER_LIFE_CYCLE_V1',
    governanceAuthority: 'SHEIKHA_CIVILIZATION_GOVERNANCE_V2',
    delegatedCommandPlane: 'SHEIKHA_CIVILIZATION_COMMAND_INTELLIGENCE_PLANE_V1',
    operationalAuthority: 'SHEIKHA_ORCHESTRATOR_FABRIC_V2_L11',
    capabilities: [
      'institutional-mandate-registry',
      'beneficiary-and-objective-assurance',
      'evidence-and-risk-readiness-review',
      'human-ratification-gate',
      'governed-command-plane-delegation',
      'append-only-audit-trace',
      'sdk-api-inspector-integration'
    ],
    boundaries: {
      subordinateToConstitutionalReference: true,
      cannotOverrideGovernance: true,
      noAutonomousRatification: true,
      noExecutionWithoutDelegation: true,
      noPublicImpactClaimWithoutEvidence: true,
      noReligiousAuthorityClaim: true,
      noExternalAuthorityClaim: true,
      humanApprovalForEveryMutation: true
    },
    storage: store.status()
  };
}

function dashboard() {
  const state = store.read();
  return {
    apex: status(),
    governance: civilizationGovernance.status(),
    masterLifeCycle: masterLifeCycle.status(),
    commandPlane: commandPlane.status(),
    portfolio: {
      mandates: state.mandates.length,
      drafts: state.mandates.filter(item => item.status === 'DRAFT_EVIDENCE_REQUIRED').length,
      readyForRatification: state.mandates.filter(
        item => item.status === 'READY_FOR_HUMAN_RATIFICATION'
      ).length,
      delegated: state.mandates.filter(item => item.status === 'RATIFIED_AND_DELEGATED').length,
      reviews: state.reviews.length,
      delegations: state.delegations.length,
      evidenceLinks: state.evidenceLinks.length
    },
    generatedAt: new Date().toISOString()
  };
}

function registerMandate(input = {}, context = {}) {
  const admitted = authorize(context, 'civilization_stewardship_mandate_register');
  const mandate = {
    id: `mandate_${crypto.randomUUID()}`,
    title: requiredText(input.title, 'title'),
    purpose: requiredText(input.purpose, 'purpose'),
    beneficiaries: requiredList(input.beneficiaries, 'beneficiaries'),
    objectives: requiredList(input.objectives, 'objectives'),
    successMeasures: requiredList(input.successMeasures, 'successMeasures'),
    principles: requiredList(input.principles || ['truth', 'justice', 'no_harm'], 'principles'),
    risks: normalizeRisks(input.risks),
    status: 'DRAFT_EVIDENCE_REQUIRED',
    finalAuthority: 'HUMAN_RETAINED',
    createdAt: new Date().toISOString(),
    createdBy: admitted.actorId,
    latestReviewId: null,
    delegatedPlanId: null
  };

  return store.transact({
    action: 'STEWARDSHIP_MANDATE_REGISTERED',
    actorId: admitted.actorId,
    resourceId: mandate.id
  }, state => {
    state.mandates.push(mandate);
    return mandate;
  });
}

function attachEvidence(mandateId, input = {}, context = {}) {
  const admitted = authorize(context, 'civilization_stewardship_evidence_attach');
  const source = requiredText(input.source, 'source');
  const summary = requiredText(input.summary, 'summary');
  const state = store.read();
  if (!state.mandates.some(item => item.id === mandateId)) {
    throw new StewardshipApexError('MANDATE_NOT_FOUND', 'Stewardship mandate was not found.', 404);
  }

  const accepted = evidenceRegistry.createEvidence({
    type: input.type || 'governance-decision',
    message: summary,
    source,
    owner: admitted.actorId,
    correlationId: mandateId,
    knowledgeRefs: Array.isArray(input.knowledgeRefs) ? input.knowledgeRefs : []
  });
  const link = {
    id: `stewardship_evidence_${crypto.randomUUID()}`,
    mandateId,
    evidenceId: accepted.evidence.evidenceId,
    source,
    classification: accepted.evidence.classification,
    verification: input.independentlyVerified === true
      ? 'HUMAN_VERIFIED_SOURCE'
      : 'SOURCE_DECLARED_REQUIRES_INDEPENDENT_REVIEW',
    attachedAt: new Date().toISOString(),
    attachedBy: admitted.actorId
  };

  return store.transact({
    action: 'STEWARDSHIP_EVIDENCE_ATTACHED',
    actorId: admitted.actorId,
    resourceId: link.id
  }, draft => {
    draft.evidenceLinks.push(link);
    return link;
  });
}

function reviewMandate(mandateId, context = {}) {
  const admitted = authorize(context, 'civilization_stewardship_mandate_review');
  return store.transact({
    action: 'STEWARDSHIP_MANDATE_REVIEWED',
    actorId: admitted.actorId,
    resourceId: mandateId
  }, state => {
    const mandate = state.mandates.find(item => item.id === mandateId);
    if (!mandate) {
      throw new StewardshipApexError('MANDATE_NOT_FOUND', 'Stewardship mandate was not found.', 404);
    }
    const mandateEvidence = state.evidenceLinks.filter(item => item.mandateId === mandateId);
    const evidenceCount = mandateEvidence.length;
    const verifiedEvidenceCount = mandateEvidence.filter(
      item => item.verification === 'HUMAN_VERIFIED_SOURCE'
    ).length;
    const unmitigatedHighRisk = mandate.risks.some(
      risk => ['HIGH', 'CRITICAL'].includes(risk.level) && !risk.mitigation
    );
    const checks = {
      beneficiariesDefined: mandate.beneficiaries.length > 0,
      objectivesDefined: mandate.objectives.length > 0,
      successMeasuresDefined: mandate.successMeasures.length > 0,
      evidenceLinked: evidenceCount > 0,
      independentlyVerifiedEvidenceLinked: verifiedEvidenceCount > 0,
      highRisksMitigated: !unmitigatedHighRisk,
      finalAuthorityRetainedByHuman: mandate.finalAuthority === 'HUMAN_RETAINED'
    };
    const ready = Object.values(checks).every(Boolean);
    const review = {
      id: `stewardship_review_${crypto.randomUUID()}`,
      mandateId,
      status: ready ? 'READY_FOR_HUMAN_RATIFICATION' : 'REQUIRES_REMEDIATION',
      checks,
      evidenceCount,
      verifiedEvidenceCount,
      reviewedAt: new Date().toISOString(),
      reviewedBy: admitted.actorId
    };
    state.reviews.push(review);
    mandate.latestReviewId = review.id;
    mandate.status = review.status;
    return review;
  });
}

function ratifyAndDelegate(mandateId, input = {}, context = {}) {
  const admitted = authorize(
    context,
    'civilization_stewardship_mandate_ratify',
    RATIFICATION_ROLES
  );
  if (String(input.decision || '').toUpperCase() !== 'APPROVE') {
    throw new StewardshipApexError(
      'EXPLICIT_RATIFICATION_REQUIRED',
      'An explicit APPROVE ratification decision is required.'
    );
  }

  const state = store.read();
  const mandate = state.mandates.find(item => item.id === mandateId);
  if (!mandate) {
    throw new StewardshipApexError('MANDATE_NOT_FOUND', 'Stewardship mandate was not found.', 404);
  }
  if (mandate.status !== 'READY_FOR_HUMAN_RATIFICATION') {
    throw new StewardshipApexError(
      'MANDATE_NOT_READY',
      'The mandate must pass evidence and risk review before ratification.',
      409
    );
  }
  if (mandate.delegatedPlanId) {
    throw new StewardshipApexError('MANDATE_ALREADY_DELEGATED', 'The mandate is already delegated.', 409);
  }

  const plan = commandPlane.createPlan({
    title: mandate.title,
    vision: mandate.purpose,
    objectives: mandate.objectives,
    initiatives: Array.isArray(input.initiatives) ? input.initiatives : [],
    kpis: mandate.successMeasures
  }, {
    ...context,
    actorId: admitted.actorId,
    role: admitted.role,
    trusted: true,
    humanApproved: true
  });

  return store.transact({
    action: 'STEWARDSHIP_MANDATE_RATIFIED_AND_DELEGATED',
    actorId: admitted.actorId,
    resourceId: mandateId,
    metadata: { delegatedPlanId: plan.id }
  }, draft => {
    const record = draft.mandates.find(item => item.id === mandateId);
    const delegation = {
      id: `stewardship_delegation_${crypto.randomUUID()}`,
      mandateId,
      delegatedPlanId: plan.id,
      target: 'SHEIKHA_CIVILIZATION_COMMAND_INTELLIGENCE_PLANE_V1',
      executionAuthorized: false,
      ratifiedAt: new Date().toISOString(),
      ratifiedBy: admitted.actorId
    };
    record.status = 'RATIFIED_AND_DELEGATED';
    record.delegatedPlanId = plan.id;
    draft.delegations.push(delegation);
    return delegation;
  });
}

function snapshot() {
  const state = store.read();
  return {
    registry: 'SHEIKHA_CIVILIZATION_STEWARDSHIP_REGISTRY_V1',
    status: 'ACTIVE',
    revision: state.revision,
    mandates: state.mandates,
    reviews: state.reviews,
    delegations: state.delegations,
    evidenceLinks: state.evidenceLinks
  };
}

module.exports = {
  RATIFICATION_ROLES,
  STEWARDSHIP_ROLES,
  StewardshipApexError,
  attachEvidence,
  dashboard,
  ratifyAndDelegate,
  registerMandate,
  reviewMandate,
  snapshot,
  status,
  store
};
