'use strict';

const crypto = require('crypto');
const covenant = require('../../covenant-governance-apex/v1/covenant-governance-apex-v1');
const registry = require('./layer-contract-registry');
const store = require('./store');

class LayerGovernanceError extends Error {
  constructor(code, message, statusCode = 400) {
    super(message);
    this.name = 'LayerGovernanceError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

function status() {
  const catalog = registry.snapshot();
  return {
    system: 'SHEIKHA_LAYER_GOVERNANCE_AND_PROMOTION_OS_V1',
    status: 'ACTIVE_SINGLE_HOST_OPERATIONAL',
    level: 'HIGHEST_GOVERNED_LAYER_LIFECYCLE_CONTROL_PLANE',
    apexLevel: 18,
    governanceAuthority: 'SHEIKHA_COVENANT_GOVERNANCE_APEX_V1',
    constitutionalReference: 'SHEIKHA_MASTER_LIFE_CYCLE_V1',
    scope: 'ALL_REGISTERED_LAYERS_CAPABILITIES_INTEGRATIONS_AND_PROMOTIONS',
    capabilities: [
      'automatic-layer-discovery-and-indexing',
      'layer-contract-and-capability-registry',
      'compatibility-and-integration-analysis',
      'governed-ai-promotion-assessment',
      'evidence-gated-promotion-proposals',
      'human-ratified-covenant-promotion',
      'append-only-layer-lifecycle-audit'
    ],
    automation: {
      discovery: 'AUTOMATIC',
      assessment: 'AUTOMATIC_ADVISORY',
      recommendation: 'AUTOMATIC_ADVISORY',
      proposal: 'TRUSTED_IDENTITY_REQUIRED',
      promotion: 'HUMAN_APPROVAL_AND_COVENANT_GATES_REQUIRED'
    },
    boundaries: {
      noSelfPromotion: true,
      noUnboundedAutonomy: true,
      noAutomaticFinalApproval: true,
      noActualAgiClaim: true,
      noActualAsiClaim: true,
      humanFinalAuthority: true
    },
    indexedLayers: catalog.layerCount,
    indexedFabricRoutes: catalog.fabric.routeCount,
    intelligence: catalog.intelligence.boundaries,
    storage: store.status()
  };
}

function findLayer(system) {
  return registry.snapshot().layers.find(layer => layer.system === system) || null;
}

function assessLayer(input = {}) {
  const system = String(input.layer || input.system || '').trim();
  if (!system) throw new LayerGovernanceError('LAYER_REQUIRED', 'layer is required.');
  const layer = findLayer(system);
  const evidenceRefs = Array.isArray(input.evidenceRefs)
    ? input.evidenceRefs.map(String).filter(Boolean)
    : [];
  const checks = {
    registered: Boolean(layer),
    purposeDefined: Boolean(input.purpose || layer?.definition),
    capabilitiesDefined: Array.isArray(input.capabilities)
      ? input.capabilities.length > 0
      : Boolean(layer?.capabilities.length),
    integrationDeclared: Boolean(input.integration || layer?.integration),
    testsPassed: input.testsPassed === true,
    lintPassed: input.lintPassed === true,
    noDrift: input.noDrift === true,
    governancePassed: input.governancePassed === true,
    evidenceLinked: evidenceRefs.length > 0,
    rollbackReady: input.rollbackReady === true,
    authorityClaimsVerified: input.authorityClaimsVerified === true
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passed / Object.keys(checks).length) * 100);
  const failedChecks = Object.entries(checks).filter(([, value]) => !value).map(([key]) => key);
  const assessment = {
    id: `assessment_${crypto.randomUUID()}`,
    layer: system,
    currentOrder: layer?.order || null,
    targetLevel: Number.isFinite(Number(input.targetLevel)) ? Number(input.targetLevel) : 18,
    score,
    decision: failedChecks.length === 0
      ? 'ELIGIBLE_FOR_HUMAN_GOVERNANCE_REVIEW'
      : 'REMEDIATION_REQUIRED',
    checks,
    failedChecks,
    evidenceRefs,
    aiAdvisory: {
      generative: 'May draft the assessment and remediation report from evidence.',
      rag: 'May ground the assessment in registered contracts and evidence.',
      agentic: 'May plan bounded remediation and request approved tools.',
      multiAgent: 'May coordinate role-scoped technical, risk, and governance reviews.',
      agi: 'RESEARCH_ONLY_NOT_AN_OPERATIONAL_CAPABILITY',
      asi: 'RESEARCH_ONLY_NOT_AN_OPERATIONAL_CAPABILITY'
    },
    automaticPromotionPerformed: false,
    humanFinalAuthority: true,
    assessedAt: new Date().toISOString()
  };
  return store.transact({ action: 'LAYER_ASSESSED', resourceId: assessment.id }, state => {
    state.assessments.push(assessment);
    return assessment;
  });
}

function authorize(context = {}) {
  const actorId = String(context.actorId || '').trim();
  const role = String(context.role || '').toUpperCase();
  if (!context.trusted || !actorId) {
    throw new LayerGovernanceError('TRUSTED_IDENTITY_REQUIRED', 'Trusted identity is required.', 401);
  }
  if (!['OWNER', 'GOVERNANCE_REVIEWER'].includes(role)) {
    throw new LayerGovernanceError('LAYER_GOVERNANCE_ROLE_REQUIRED', 'Governance role required.', 403);
  }
  return { actorId, role, humanApproved: context.humanApproved === true };
}

function createPromotionProposal(input = {}, context = {}) {
  const actor = authorize(context);
  const assessment = assessLayer(input);
  const proposal = {
    id: `layer_proposal_${crypto.randomUUID()}`,
    layer: assessment.layer,
    targetLevel: assessment.targetLevel,
    status: assessment.failedChecks.length ? 'REMEDIATION_REQUIRED' : 'AWAITING_HUMAN_RATIFICATION',
    assessmentId: assessment.id,
    checks: assessment.checks,
    evidenceRefs: assessment.evidenceRefs,
    proposedBy: actor.actorId,
    proposedAt: new Date().toISOString(),
    humanFinalAuthority: true
  };
  return store.transact({
    action: 'LAYER_PROMOTION_PROPOSED', actorId: actor.actorId, resourceId: proposal.id
  }, state => {
    state.proposals.push(proposal);
    return proposal;
  });
}

function ratifyPromotion(proposalId, context = {}) {
  const actor = authorize(context);
  if (!actor.humanApproved) {
    throw new LayerGovernanceError('HUMAN_APPROVAL_REQUIRED', 'Explicit human approval required.', 403);
  }
  const state = store.read();
  const proposal = state.proposals.find(item => item.id === proposalId);
  if (!proposal) throw new LayerGovernanceError('PROPOSAL_NOT_FOUND', 'Proposal not found.', 404);
  if (proposal.status !== 'AWAITING_HUMAN_RATIFICATION') {
    throw new LayerGovernanceError('PROPOSAL_NOT_READY', 'Proposal is not ready for ratification.', 409);
  }
  const promotion = covenant.promoteLayer({
    layer: proposal.layer,
    targetLevel: proposal.targetLevel,
    ...proposal.checks,
    evidenceRefs: proposal.evidenceRefs
  }, context);
  return store.transact({
    action: 'LAYER_PROMOTION_RATIFIED', actorId: actor.actorId, resourceId: proposal.id
  }, current => {
    const stored = current.proposals.find(item => item.id === proposal.id);
    stored.status = 'RATIFIED_AND_PROMOTED';
    stored.ratifiedAt = new Date().toISOString();
    stored.covenantPromotionId = promotion.id;
    current.promotions.push(promotion);
    return { proposal: stored, promotion };
  });
}

function snapshot() {
  const state = store.read();
  return {
    registry: 'SHEIKHA_LAYER_LIFECYCLE_REGISTRY_V1',
    status: 'ACTIVE',
    revision: state.revision,
    catalog: registry.snapshot(),
    assessments: state.assessments,
    proposals: state.proposals,
    promotions: state.promotions
  };
}

module.exports = {
  LayerGovernanceError,
  assessLayer,
  createPromotionProposal,
  ratifyPromotion,
  registry,
  snapshot,
  status,
  store
};
