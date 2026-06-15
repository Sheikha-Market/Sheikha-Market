'use strict';

const crypto = require('crypto');
const store = require('./store');
const references = require('./governance-reference-registry');
const civilizationGovernance = require('../civilization-governance/civilization-governance-v2');
const masterLifeCycle = require('../master-life-cycle/sheikha-master-life-cycle-v1');
const missionControl = require('../executive-mission-control/executive-mission-control-v1');
const evidenceRegistry = require('../evidence-registry/sheikha-evidence-registry-v1');
const masterLogCenter = require('../master-log-center/sheikha-master-log-center-v1');
const runtimeFabric = require('../runtime-fabric-v5/runtime-fabric-v5');
const storageGovernance = require('../storage-governance/v1/sheikha-storage-governance-v1');
const { governGovernance } = require('../governance/sheikha-governance-of-governance-v1');
const { orchestrate } = require('../orchestrator/orchestrator-fabric');

const OPERATIONAL_ROLES = Object.freeze([
  'OWNER', 'ADMIN', 'OPERATOR', 'GOVERNANCE_REVIEWER'
]);
const TWIN_TYPES = Object.freeze([
  'organization', 'program', 'project', 'facility', 'resource',
  'knowledge', 'operation', 'market', 'environment'
]);

class CommandPlaneError extends Error {
  constructor(code, message, statusCode = 400) {
    super(message);
    this.name = 'CommandPlaneError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

function authorize(context = {}, action) {
  const actorId = String(context.actorId || '').trim();
  const role = String(context.role || '').toUpperCase();
  if (!context.trusted || !actorId) {
    throw new CommandPlaneError('TRUSTED_IDENTITY_REQUIRED', 'Trusted identity is required.', 401);
  }
  if (!OPERATIONAL_ROLES.includes(role)) {
    throw new CommandPlaneError('OPERATIONAL_ROLE_REQUIRED', 'An operational role is required.', 403);
  }
  const governance = governGovernance({
    actor: actorId,
    channel: 'civilization-command-intelligence-plane',
    action,
    message: action
  });
  governance.humanApproved = context.humanApproved === true;
  const envelope = orchestrate({
    action,
    mutationRequested: true,
    mutationClass: 'GOVERNED_CIVILIZATION_WRITE'
  }, governance);
  if (!governance.allowed || !envelope.mutationAuthorized) {
    throw new CommandPlaneError(
      'GOVERNANCE_ADMISSION_DENIED',
      'Governance and explicit human approval are required.',
      403
    );
  }
  return { actorId, role, governance, envelope };
}

function requiredText(value, field) {
  const text = String(value || '').trim();
  if (!text) throw new CommandPlaneError('VALIDATION_ERROR', `${field} is required.`);
  return text;
}

function normalizedSeverity(value) {
  const severity = String(value || 'MEDIUM').toUpperCase();
  return ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(severity) ? severity : 'MEDIUM';
}

function status() {
  return {
    system: 'SHEIKHA_CIVILIZATION_COMMAND_INTELLIGENCE_PLANE_V1',
    status: 'ACTIVE_SINGLE_HOST_OPERATIONAL',
    level: 'HIGHEST_INTEGRATED_EXECUTIVE_INTELLIGENCE_PLANE',
    constitutionalReference: 'SHEIKHA_MASTER_LIFE_CYCLE_V1',
    governanceAuthority: 'SHEIKHA_CIVILIZATION_GOVERNANCE_V2',
    operationalAuthority: 'SHEIKHA_ORCHESTRATOR_FABRIC_V2_L11',
    executionFabric: 'SHEIKHA_RUNTIME_FABRIC_V5',
    capabilities: [
      'executive-command-center',
      'strategic-planning-fabric',
      'governance-intelligence-engine',
      'civilization-digital-twin',
      'risk-and-impact-intelligence',
      'evidence-linked-decisions',
      'storage-pressure-governance',
      'governed-runtime-dispatch'
    ],
    boundaries: {
      noGovernanceBypass: true,
      noAutonomousFinalJudgment: true,
      noExternalExecutionByDefault: true,
      noImpactClaimWithoutEvidence: true,
      noReligiousAuthorityClaim: true,
      humanApprovalForEveryMutation: true
    },
    storage: store.status()
  };
}

function dashboard() {
  const state = store.read();
  const openRisks = state.risks.filter(risk => risk.status !== 'CLOSED');
  return {
    commandCenter: 'SHEIKHA_EXECUTIVE_CIVILIZATION_CENTER_V1',
    status: 'ACTIVE',
    generatedAt: new Date().toISOString(),
    governance: civilizationGovernance.status(),
    masterLifeCycle: masterLifeCycle.status(),
    missionControl: missionControl.status(),
    masterLogCenter: masterLogCenter.status(),
    storageGovernance: storageGovernance.status(),
    runtimeFabric: runtimeFabric.status(),
    portfolio: {
      plans: state.plans.length,
      activePlans: state.plans.filter(plan => plan.status === 'ACTIVE').length,
      decisions: state.decisions.length,
      openRisks: openRisks.length,
      highRisks: openRisks.filter(risk => ['HIGH', 'CRITICAL'].includes(risk.severity)).length,
      impactMeasurements: state.impacts.length,
      twinNodes: state.twins.length,
      evidenceLinks: state.evidenceLinks.length
    }
  };
}

function createPlan(input = {}, context = {}) {
  const admitted = authorize(context, 'civilization_strategic_plan_create');
  const title = requiredText(input.title, 'title');
  const vision = requiredText(input.vision, 'vision');
  const objectives = Array.isArray(input.objectives)
    ? input.objectives.map(item => String(item).trim()).filter(Boolean)
    : [];
  if (!objectives.length) {
    throw new CommandPlaneError('OBJECTIVES_REQUIRED', 'At least one strategic objective is required.');
  }
  const now = new Date().toISOString();
  const plan = {
    id: `plan_${crypto.randomUUID()}`,
    title,
    vision,
    objectives,
    initiatives: Array.isArray(input.initiatives) ? input.initiatives : [],
    kpis: Array.isArray(input.kpis) ? input.kpis : [],
    status: 'DRAFT_GOVERNED',
    createdAt: now,
    createdBy: admitted.actorId,
    governanceDecisionId: null,
    executionJobId: null
  };
  return store.transact({
    action: 'STRATEGIC_PLAN_CREATED', actorId: admitted.actorId, resourceId: plan.id
  }, state => {
    state.plans.push(plan);
    return plan;
  });
}

function registerRisk(input = {}, context = {}) {
  const admitted = authorize(context, 'civilization_risk_register');
  const planId = requiredText(input.planId, 'planId');
  const description = requiredText(input.description, 'description');
  return store.transact({ action: 'RISK_REGISTERED', actorId: admitted.actorId }, state => {
    if (!state.plans.some(plan => plan.id === planId)) {
      throw new CommandPlaneError('PLAN_NOT_FOUND', 'Strategic plan was not found.', 404);
    }
    const risk = {
      id: `risk_${crypto.randomUUID()}`,
      planId,
      description,
      severity: normalizedSeverity(input.severity),
      mitigation: String(input.mitigation || '').trim() || null,
      evidenceRefs: Array.isArray(input.evidenceRefs) ? input.evidenceRefs : [],
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      createdBy: admitted.actorId
    };
    state.risks.push(risk);
    return risk;
  });
}

function evaluatePlan(planId, context = {}) {
  const admitted = authorize(context, 'civilization_plan_governance_evaluate');
  return store.transact({ action: 'PLAN_GOVERNANCE_EVALUATED', actorId: admitted.actorId }, state => {
    const plan = state.plans.find(item => item.id === planId);
    if (!plan) throw new CommandPlaneError('PLAN_NOT_FOUND', 'Strategic plan was not found.', 404);
    const risks = state.risks.filter(risk => risk.planId === planId && risk.status !== 'CLOSED');
    const unmitigatedHighRisk = risks.some(risk =>
      ['HIGH', 'CRITICAL'].includes(risk.severity) && !risk.mitigation
    );
    const decision = {
      id: `decision_${crypto.randomUUID()}`,
      planId,
      status: unmitigatedHighRisk ? 'REQUIRES_MITIGATION' : 'APPROVED_FOR_HUMAN_DECISION',
      finalAuthority: 'HUMAN_RETAINED',
      riskSummary: {
        total: risks.length,
        highOrCritical: risks.filter(risk => ['HIGH', 'CRITICAL'].includes(risk.severity)).length,
        unmitigatedHighRisk
      },
      evaluatedAt: new Date().toISOString(),
      evaluatedBy: admitted.actorId
    };
    state.decisions.push(decision);
    plan.governanceDecisionId = decision.id;
    plan.status = decision.status;
    return decision;
  });
}

function registerTwin(input = {}, context = {}) {
  const admitted = authorize(context, 'civilization_digital_twin_register');
  const type = String(input.type || '').toLowerCase();
  if (!TWIN_TYPES.includes(type)) {
    throw new CommandPlaneError('INVALID_TWIN_TYPE', 'A supported digital twin type is required.');
  }
  const provenance = requiredText(input.provenance, 'provenance');
  const twin = {
    id: `twin_${crypto.randomUUID()}`,
    type,
    name: requiredText(input.name, 'name'),
    externalId: input.externalId || null,
    parentId: input.parentId || null,
    attributes: input.attributes && typeof input.attributes === 'object' ? input.attributes : {},
    provenance,
    verification: 'SOURCE_DECLARED_NOT_INDEPENDENTLY_VERIFIED',
    createdAt: new Date().toISOString(),
    createdBy: admitted.actorId
  };
  return store.transact({
    action: 'DIGITAL_TWIN_REGISTERED', actorId: admitted.actorId, resourceId: twin.id
  }, state => {
    state.twins.push(twin);
    return twin;
  });
}

function recordImpact(input = {}, context = {}) {
  const admitted = authorize(context, 'civilization_impact_record');
  const baseline = Number(input.baseline);
  const current = Number(input.current);
  if (!Number.isFinite(baseline) || !Number.isFinite(current)) {
    throw new CommandPlaneError('IMPACT_VALUES_REQUIRED', 'Finite baseline and current values are required.');
  }
  const source = requiredText(input.source, 'source');
  const evidence = evidenceRegistry.createEvidence({
    type: 'impact-measurement',
    message: `${input.metric || 'impact'} measurement from ${source}`,
    source,
    owner: admitted.actorId,
    impactRefs: Array.isArray(input.evidenceRefs) ? input.evidenceRefs : []
  });
  const impact = {
    id: `impact_${crypto.randomUUID()}`,
    planId: input.planId || null,
    metric: requiredText(input.metric, 'metric'),
    baseline,
    current,
    delta: current - baseline,
    unit: String(input.unit || 'count'),
    source,
    evidenceId: evidence.evidence.evidenceId,
    causalityClaimed: false,
    recordedAt: new Date().toISOString(),
    recordedBy: admitted.actorId
  };
  return store.transact({
    action: 'IMPACT_RECORDED', actorId: admitted.actorId, resourceId: impact.id
  }, state => {
    state.impacts.push(impact);
    state.evidenceLinks.push({
      id: `link_${crypto.randomUUID()}`,
      evidenceId: impact.evidenceId,
      resourceType: 'impact',
      resourceId: impact.id,
      createdAt: impact.recordedAt
    });
    return impact;
  });
}

function dispatchPlan(planId, context = {}) {
  const admitted = authorize(context, 'civilization_plan_runtime_dispatch');
  const state = store.read();
  const plan = state.plans.find(item => item.id === planId);
  if (!plan) throw new CommandPlaneError('PLAN_NOT_FOUND', 'Strategic plan was not found.', 404);
  const decision = state.decisions.find(item => item.id === plan.governanceDecisionId);
  if (!decision || decision.status !== 'APPROVED_FOR_HUMAN_DECISION') {
    throw new CommandPlaneError(
      'PLAN_NOT_ADMITTED',
      'A governed plan decision is required before Runtime Fabric dispatch.',
      409
    );
  }
  const queued = runtimeFabric.submitIssue({
    issue: `Execute governed strategic plan: ${plan.title}`,
    requestedOutcome: 'bounded-execution-plan-with-evidence',
    source: 'civilization-command-intelligence-plane',
    idempotencyKey: `civilization-plan:${plan.id}`,
    correlationId: plan.id,
    priority: 'high'
  }, {
    ...context,
    actorId: admitted.actorId,
    role: admitted.role,
    trusted: true,
    humanApproved: true
  });
  store.transact({
    action: 'PLAN_DISPATCHED', actorId: admitted.actorId, resourceId: plan.id
  }, draft => {
    const record = draft.plans.find(item => item.id === plan.id);
    record.executionJobId = queued.job.id;
    record.status = 'QUEUED_FOR_BOUNDED_EXECUTION';
    return record;
  });
  return queued;
}

function snapshot() {
  const state = store.read();
  return {
    registry: 'SHEIKHA_CIVILIZATION_COMMAND_REGISTRY_V1',
    status: 'ACTIVE',
    revision: state.revision,
    plans: state.plans,
    decisions: state.decisions,
    risks: state.risks,
    impacts: state.impacts,
    twins: state.twins,
    evidenceLinks: state.evidenceLinks
  };
}

module.exports = {
  CommandPlaneError,
  TWIN_TYPES,
  createPlan,
  dashboard,
  dispatchPlan,
  evaluatePlan,
  recordImpact,
  references,
  registerRisk,
  registerTwin,
  snapshot,
  status,
  store
};
