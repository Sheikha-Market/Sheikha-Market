'use strict';

const {
  REFERENCE_DOMAINS,
  REFERENCE_RELEASE_STAGES,
  REFERENCE_QUALITY_GATES,
  buildEnterpriseReferenceSystemV1
} = require('../enterprise-reference-system/sheikha-enterprise-reference-system-v1');

const ENTERPRISE_OPERATING_CHAIN = Object.freeze([
  'Enterprise Vision',
  'Enterprise Strategy',
  'Enterprise Governance',
  'Enterprise Architecture',
  'Enterprise Platform',
  'Enterprise Products',
  'Enterprise Operations',
  'Enterprise Customers'
]);

const PLATFORM_GOVERNANCE_BOARD_SCOPE = Object.freeze([
  'Architecture',
  'Data Models',
  'APIs',
  'Contracts',
  'Policies',
  'Releases',
  'Security',
  'Performance'
]);

const OFFICIAL_ARCHITECTURE_MAP = Object.freeze([
  'Kernel',
  'Runtime',
  'Platform Services',
  'Business Domains',
  'Applications',
  'User Experience'
]);

const DOMAIN_GOVERNANCE_REQUIREMENTS = Object.freeze([
  'Description',
  'Owner',
  'Boundaries',
  'Interfaces',
  'Events',
  'Metrics',
  'Tests',
  'Documentation'
]);

const COMPONENT_LIFECYCLE_STATES = Object.freeze([
  'Draft',
  'Approved',
  'Implemented',
  'Verified',
  'Released',
  'Operational',
  'Deprecated',
  'Archived'
]);

const VERSION_POLICY = Object.freeze([
  {
    level: 'Major',
    rule: 'Architecture changes or backward-incompatible contract changes.'
  },
  {
    level: 'Minor',
    rule: 'Compatible capabilities or new enterprise features.'
  },
  {
    level: 'Patch',
    rule: 'Fixes, stability improvements, documentation, and compatible refinements.'
  }
]);

const PRODUCTION_READINESS_GATE = Object.freeze([
  'Service Health',
  'Tests Passed',
  'Contract Compatibility',
  'Critical Component Test Coverage',
  'Backup Status',
  'Rollback Plan',
  'Security Review',
  'Documentation Review'
]);

const COMMERCIAL_OPERATING_FLOW = Object.freeze([
  'Marketing',
  'Lead Management',
  'Sales',
  'Contracts',
  'Billing',
  'Provisioning',
  'Customer Success',
  'Support',
  'Renewal'
]);

const OPERATIONS_CENTER_SECTIONS = Object.freeze([
  {
    name: 'Technology',
    metrics: ['Service Status', 'Errors', 'Performance', 'Usage']
  },
  {
    name: 'Operations',
    metrics: ['Incidents', 'Backups', 'Recovery', 'Alerts']
  },
  {
    name: 'Business',
    metrics: ['Customers', 'Contracts', 'Subscriptions', 'Invoices', 'Revenue']
  }
]);

const ROADMAP_PROGRAMS = Object.freeze([
  {
    name: 'Foundation Consolidation',
    focus: ['Domain unification', 'Registry unification', 'Repository cleanup', 'Contract documentation']
  },
  {
    name: 'Commercial Platform Completion',
    focus: ['CRM', 'Contracts', 'Billing', 'Subscriptions', 'Customer Portal']
  },
  {
    name: 'Controlled Staging Validation',
    focus: ['Pilot launch', 'Performance measurement', 'UX improvement', 'Operations improvement']
  },
  {
    name: 'Commercial Launch And Scale',
    focus: ['Commercial launch', 'Customer expansion', 'Performance improvement', 'Partner and developer support']
  }
]);

const SUCCESS_METRICS = Object.freeze({
  technical: [
    'Response Time',
    'Availability',
    'Error Rate'
  ],
  operational: [
    'Recovery Time',
    'Backup Success Rate',
    'Incident Count'
  ],
  commercial: [
    'Active Customers',
    'Conversion Rate',
    'Monthly Revenue',
    'Customer Retention'
  ]
});

const CURRENT_EXECUTION_PRIORITIES = Object.freeze([
  'Repository Cleanup',
  'Core Feature Freeze',
  'Customer Journey Completion',
  'Operational Verification',
  'Controlled Market Launch'
]);

function buildPlatformGovernanceBoard() {
  return {
    name: 'Platform Governance Board',
    status: 'ACTIVE',
    executionAuthority: false,
    reviewAndApprovalAuthority: true,
    scope: PLATFORM_GOVERNANCE_BOARD_SCOPE,
    decisionModel: 'REVIEW_APPROVE_RECORD_AUDIT'
  };
}

function buildDomainGovernanceProgram(domains = REFERENCE_DOMAINS) {
  return domains.map((domain, index) => ({
    id: `DOMAIN-GOV-${String(index + 1).padStart(3, '0')}`,
    domain,
    status: 'ACTIVE',
    requirements: DOMAIN_GOVERNANCE_REQUIREMENTS,
    newDomainPolicy: 'ARCHITECTURE_DECISION_REQUIRED'
  }));
}

function buildComponentLifecyclePolicy() {
  return COMPONENT_LIFECYCLE_STATES.map((state, index) => ({
    order: index + 1,
    state,
    status: 'ACTIVE'
  }));
}

function buildOperationsCenter() {
  return {
    name: 'Enterprise Operations Center',
    status: 'ACTIVE',
    sections: OPERATIONS_CENTER_SECTIONS,
    purpose: 'Unify technology, operations, and business visibility for enterprise operation.'
  };
}

function buildRoadmapPrograms(commercialLaunchReady = false) {
  return ROADMAP_PROGRAMS.map((program, index) => ({
    order: index + 1,
    name: program.name,
    focus: program.focus,
    status: program.name === 'Commercial Launch And Scale' && !commercialLaunchReady
      ? 'EVIDENCE_PENDING'
      : 'ACTIVE'
  }));
}

function countOperatingModelRequirements(model) {
  return ENTERPRISE_OPERATING_CHAIN.length +
    PLATFORM_GOVERNANCE_BOARD_SCOPE.length +
    OFFICIAL_ARCHITECTURE_MAP.length +
    (model.domainGovernance?.length || 0) * DOMAIN_GOVERNANCE_REQUIREMENTS.length +
    COMPONENT_LIFECYCLE_STATES.length +
    VERSION_POLICY.length +
    PRODUCTION_READINESS_GATE.length +
    COMMERCIAL_OPERATING_FLOW.length +
    OPERATIONS_CENTER_SECTIONS
      .reduce((total, section) => total + section.metrics.length, 0) +
    Object.values(SUCCESS_METRICS)
      .reduce((total, metrics) => total + metrics.length, 0) +
    CURRENT_EXECUTION_PRIORITIES.length;
}

function validateEnterpriseOperatingModel(model) {
  const missing = [];

  if (!model.platformGovernanceBoard?.reviewAndApprovalAuthority) {
    missing.push('platformGovernanceBoard.reviewAndApprovalAuthority');
  }

  if (!model.domainGovernance?.length) {
    missing.push('domainGovernance');
  }

  if (!model.componentLifecycle?.length) {
    missing.push('componentLifecycle');
  }

  if (!model.productionReadinessGate?.length) {
    missing.push('productionReadinessGate');
  }

  if (!model.commercialOperatingFlow?.length) {
    missing.push('commercialOperatingFlow');
  }

  return {
    system: 'SHEIKHA_ENTERPRISE_OPERATING_MODEL_VALIDATOR_V12',
    status: missing.length ? 'BLOCKED' : 'PASSED',
    requirements: countOperatingModelRequirements(model),
    domains: model.domainGovernance?.length || 0,
    lifecycleStates: model.componentLifecycle?.length || 0,
    roadmapPrograms: model.roadmapPrograms?.length || 0,
    missing
  };
}

function buildEnterpriseOperatingModelV12(options = {}) {
  const enterpriseReferenceSystem = options.enterpriseReferenceSystem ||
    buildEnterpriseReferenceSystemV1(options);
  const commercialLaunchReady =
    enterpriseReferenceSystem.linkedLayers?.commercialLaunchReady === true;

  const model = {
    platformGovernanceBoard: buildPlatformGovernanceBoard(),
    officialArchitectureMap: OFFICIAL_ARCHITECTURE_MAP,
    domainGovernance: buildDomainGovernanceProgram(),
    componentLifecycle: buildComponentLifecyclePolicy(),
    versionPolicy: VERSION_POLICY,
    productionReadinessGate: PRODUCTION_READINESS_GATE,
    commercialOperatingFlow: COMMERCIAL_OPERATING_FLOW,
    operationsCenter: buildOperationsCenter(),
    roadmapPrograms: buildRoadmapPrograms(commercialLaunchReady),
    successMetrics: SUCCESS_METRICS,
    currentExecutionPriorities: CURRENT_EXECUTION_PRIORITIES
  };

  const validation = validateEnterpriseOperatingModel(model);
  const operatingModelReady = validation.status === 'PASSED' &&
    enterpriseReferenceSystem.status === 'ACTIVE';

  return {
    system: 'SHEIKHA_ENTERPRISE_OPERATING_MODEL_V12',
    status: operatingModelReady ? 'ACTIVE' : 'REVIEW',
    mode: 'ENTERPRISE_OPERATIONS_PHASE_MODEL',
    phase: 'ENTERPRISE_OPERATIONS_PHASE',
    decision: operatingModelReady
      ? commercialLaunchReady
        ? 'OPERATING_MODEL_ACTIVE_READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH'
        : 'OPERATING_MODEL_ACTIVE_FEATURE_FROZEN_COMMERCIAL_VALIDATION_REQUIRED'
      : 'OPERATING_MODEL_REVIEW_REQUIRED',
    purpose: 'Move Sheikha from build phase into a governed enterprise operations phase with board review, domain governance, lifecycle, release, readiness, commercial flow, operations center, and measurable success metrics.',
    enterpriseOperatingChain: ENTERPRISE_OPERATING_CHAIN,
    referenceReleaseStages: REFERENCE_RELEASE_STAGES,
    referenceQualityGates: REFERENCE_QUALITY_GATES,
    ...model,
    validation,
    linkedLayers: {
      enterpriseReferenceSystemV1: enterpriseReferenceSystem.status,
      enterpriseReferenceSystemDecision: enterpriseReferenceSystem.decision,
      enterpriseConstitutionV1:
        enterpriseReferenceSystem.linkedLayers?.enterpriseConstitutionV1 || 'UNKNOWN',
      enterpriseOperatingSystemV11:
        enterpriseReferenceSystem.linkedLayers?.enterpriseOperatingSystemV11 || 'UNKNOWN',
      commercialLaunchReady,
      currentReleaseStage:
        enterpriseReferenceSystem.linkedLayers?.currentReleaseStage || 'UNKNOWN'
    },
    enforcement: {
      noMajorChangeWithoutBoardReview: true,
      noDomainWithoutOwnerBoundariesInterfacesEventsMetricsTestsDocs: true,
      noComponentWithoutLifecycleState: true,
      noProductionReleaseWithoutReadinessGate: true,
      noCommercialLaunchWithoutEvidence: true,
      featureFreezeForCurrentRelease: true,
      criticalFixesAllowedDuringFreeze: true,
      repositoryCleanupRequiredBeforeReleaseLock: true,
      customerJourneyMustBeEndToEnd: true,
      stagingValidationRequiredBeforeProduction: true
    },
    governance: {
      readOnly: true,
      operatingModelOnly: true,
      noExternalMutation: true,
      noServiceRestart: true,
      noKernelModification: true,
      noPrivilegeEscalation: true,
      noUnsupportedCommercialClaims: true,
      humanApprovalRequiredForMajorRelease: true,
      humanApprovalRequiredForProductionLaunch: true,
      humanApprovalRequiredForCommercialLaunch: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار',
      tawhid: 'الله وحده لا شريك له'
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  ENTERPRISE_OPERATING_CHAIN,
  PLATFORM_GOVERNANCE_BOARD_SCOPE,
  OFFICIAL_ARCHITECTURE_MAP,
  DOMAIN_GOVERNANCE_REQUIREMENTS,
  COMPONENT_LIFECYCLE_STATES,
  VERSION_POLICY,
  PRODUCTION_READINESS_GATE,
  COMMERCIAL_OPERATING_FLOW,
  OPERATIONS_CENTER_SECTIONS,
  ROADMAP_PROGRAMS,
  SUCCESS_METRICS,
  CURRENT_EXECUTION_PRIORITIES,
  buildPlatformGovernanceBoard,
  buildDomainGovernanceProgram,
  buildComponentLifecyclePolicy,
  buildOperationsCenter,
  buildRoadmapPrograms,
  validateEnterpriseOperatingModel,
  buildEnterpriseOperatingModelV12
};
