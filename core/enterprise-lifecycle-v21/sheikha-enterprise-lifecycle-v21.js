'use strict';

const {
  buildEnterprisePlatformV20
} = require('../enterprise-platform-v20/sheikha-enterprise-platform-v20');

const ENTERPRISE_LIFECYCLE_STAGES = Object.freeze([
  'Idea',
  'Analysis',
  'Architecture',
  'Approval',
  'Implementation',
  'Verification',
  'Integration',
  'Release Candidate',
  'Controlled Staging',
  'Production',
  'Monitoring',
  'Continuous Improvement',
  'Retirement'
]);

const PORTFOLIO_AREAS = Object.freeze([
  'Products',
  'Programs',
  'Projects',
  'Capabilities',
  'Domains',
  'Releases',
  'Risks',
  'Decisions',
  'Roadmaps'
]);

const PORTFOLIO_ITEM_REQUIREMENTS = Object.freeze([
  'Stable ID',
  'Owner',
  'Status',
  'Metrics',
  'Release Link'
]);

const ADR_FIELDS = Object.freeze([
  'ADR ID',
  'Title',
  'Status',
  'Context',
  'Decision',
  'Alternatives',
  'Consequences'
]);

const CAPABILITY_MANAGEMENT_REQUIREMENTS = Object.freeze([
  'Contract',
  'Owner',
  'Version',
  'APIs',
  'Events',
  'Policies',
  'Tests',
  'Documentation',
  'KPIs'
]);

const INITIAL_RISK_REGISTER = Object.freeze([
  {
    risk: 'Service outage',
    impact: 'High',
    probability: 'Low',
    treatment: 'High availability and recovery runbook'
  },
  {
    risk: 'Data loss',
    impact: 'High',
    probability: 'Low',
    treatment: 'Backup plus restore test'
  },
  {
    risk: 'API compatibility break',
    impact: 'Medium',
    probability: 'Low',
    treatment: 'Versioning and contract gate'
  },
  {
    risk: 'Performance regression',
    impact: 'Medium',
    probability: 'Medium',
    treatment: 'Performance tests and monitoring'
  }
]);

const TECHNICAL_DEBT_FIELDS = Object.freeze([
  'Cause',
  'Impact',
  'Priority',
  'Target Resolution Date'
]);

const ENTERPRISE_KPI_REGISTRY = Object.freeze({
  technical: [
    'Availability',
    'Error Rate',
    'Response Time',
    'Test Coverage',
    'Deployment Success'
  ],
  operational: [
    'Backup Success',
    'Restore Time',
    'Incident Resolution'
  ],
  commercial: [
    'Leads',
    'Conversion',
    'MRR',
    'ARR',
    'Customer Retention',
    'Renewal Rate'
  ]
});

const RELEASE_GOVERNANCE_REQUIREMENTS = Object.freeze([
  'Release ID',
  'Architecture Version',
  'Contract Version',
  'Database Version',
  'API Version',
  'SDK Version',
  'Documentation Version'
]);

const CUSTOMER_SUCCESS_STAGES = Object.freeze([
  'Prospect',
  'Lead',
  'Opportunity',
  'Customer',
  'Onboarding',
  'Adoption',
  'Expansion',
  'Renewal'
]);

const FINANCIAL_GOVERNANCE_FLOW = Object.freeze([
  'Pricing',
  'Quotes',
  'Contracts',
  'Invoices',
  'Payments',
  'Revenue',
  'Financial Reports'
]);

const COMPLIANCE_CONTROLS = Object.freeze([
  'Clear Audit Logs',
  'Documented Policies',
  'Change Traceability',
  'Permission Management',
  'Record Retention Policy'
]);

const KNOWLEDGE_GRAPH_RELATIONS = Object.freeze([
  'Product',
  'Capability',
  'Module',
  'API',
  'Event',
  'Policy',
  'Test',
  'Release',
  'Customer'
]);

const CONTINUOUS_IMPROVEMENT_LOOP = Object.freeze([
  'Metrics',
  'Analysis',
  'Prioritization',
  'Implementation',
  'Verification',
  'Release'
]);

const OPERATIONAL_VERIFICATION_GATES = Object.freeze([
  'Core Verification',
  'Runtime Verification',
  'Architecture Verification',
  'Security Verification',
  'Business Flow Verification',
  'Operations Verification',
  'Production Readiness',
  'Commercial Readiness'
]);

const ROADMAP_PHASES = Object.freeze([
  {
    phase: 'V1 Stable',
    goals: ['Stabilize Kernel', 'Clean Git', 'Freeze Contracts', 'Close Feature Freeze']
  },
  {
    phase: 'Controlled Staging',
    goals: ['Run Controlled Staging', 'Test Backup And Restore', 'Measure Real Performance', 'Collect User Feedback']
  },
  {
    phase: 'Gradual Commercial Launch',
    goals: ['Launch Gradually', 'Improve Continuously', 'Expand Services']
  }
]);

const LONG_TERM_PLATFORM_LAYERS = Object.freeze([
  {
    layer: 'Core Platform',
    changeRate: 'VERY_SLOW',
    scope: ['Kernel', 'Governance', 'Registry', 'Runtime', 'Security']
  },
  {
    layer: 'Business Platform',
    changeRate: 'CONTROLLED',
    scope: ['Commerce', 'Knowledge', 'AI', 'Supply Chain']
  },
  {
    layer: 'Products & Solutions',
    changeRate: 'FAST',
    scope: ['Customer Products', 'Services', 'Solutions']
  }
]);

function buildPortfolioManagement() {
  return PORTFOLIO_AREAS.map((area, index) => ({
    id: `LIFE-PORT-${String(index + 1).padStart(3, '0')}`,
    area,
    status: 'ACTIVE',
    requirements: PORTFOLIO_ITEM_REQUIREMENTS
  }));
}

function buildArchitectureDecisionRecordProgram() {
  return {
    status: 'ACTIVE',
    prefix: 'ADR',
    requiredFields: ADR_FIELDS,
    example: {
      id: 'ADR-001',
      title: 'Adopt Engine Registry',
      status: 'Accepted'
    }
  };
}

function buildCapabilityManagement() {
  return {
    status: 'ACTIVE',
    unitOfManagement: 'Capability',
    requirements: CAPABILITY_MANAGEMENT_REQUIREMENTS
  };
}

function buildTechnicalDebtRegister() {
  return {
    status: 'ACTIVE',
    requiredFields: TECHNICAL_DEBT_FIELDS,
    visibility: 'VISIBLE_AND_PRIORITIZED'
  };
}

function buildReleaseGovernance() {
  return {
    status: 'ACTIVE',
    requiredVersions: RELEASE_GOVERNANCE_REQUIREMENTS,
    releasePolicy: 'EVERY_RELEASE_MUST_DECLARE_VERSION_EVIDENCE'
  };
}

function buildOperationalVerificationGates(evidence = {}) {
  return OPERATIONAL_VERIFICATION_GATES.map((gate, index) => {
    const evidenceKey = gate
      .toLowerCase()
      .replaceAll(' ', '')
      .replace('verification', 'Verified')
      .replace('readiness', 'Ready');
    const complete = evidence[evidenceKey] === true;

    return {
      id: `LIFE-GATE-${String(index + 1).padStart(3, '0')}`,
      gate,
      status: complete ? 'PASSED' : 'EVIDENCE_REQUIRED'
    };
  });
}

function countLifecycleRequirements(report) {
  return ENTERPRISE_LIFECYCLE_STAGES.length +
    report.portfolioManagement.length * PORTFOLIO_ITEM_REQUIREMENTS.length +
    ADR_FIELDS.length +
    CAPABILITY_MANAGEMENT_REQUIREMENTS.length +
    report.riskRegister.length * 4 +
    TECHNICAL_DEBT_FIELDS.length +
    Object.values(ENTERPRISE_KPI_REGISTRY)
      .reduce((total, metrics) => total + metrics.length, 0) +
    RELEASE_GOVERNANCE_REQUIREMENTS.length +
    CUSTOMER_SUCCESS_STAGES.length +
    FINANCIAL_GOVERNANCE_FLOW.length +
    COMPLIANCE_CONTROLS.length +
    KNOWLEDGE_GRAPH_RELATIONS.length +
    CONTINUOUS_IMPROVEMENT_LOOP.length +
    OPERATIONAL_VERIFICATION_GATES.length +
    ROADMAP_PHASES.reduce((total, phase) => total + phase.goals.length, 0);
}

function validateEnterpriseLifecycleV21(report) {
  const missing = [];

  if (!report.lifecycleStages?.includes('Production')) {
    missing.push('lifecycleStages.Production');
  }

  if (!report.portfolioManagement?.length) {
    missing.push('portfolioManagement');
  }

  if (!report.architectureDecisionRecords?.requiredFields?.includes('Consequences')) {
    missing.push('architectureDecisionRecords.Consequences');
  }

  if (!report.capabilityManagement?.requirements?.includes('KPIs')) {
    missing.push('capabilityManagement.KPIs');
  }

  if (!report.operationalVerificationGates?.some((gate) => gate.gate === 'Business Flow Verification')) {
    missing.push('Business Flow Verification');
  }

  return {
    system: 'SHEIKHA_ENTERPRISE_LIFECYCLE_VALIDATOR_V21',
    status: missing.length ? 'BLOCKED' : 'PASSED',
    lifecycleStages: report.lifecycleStages?.length || 0,
    portfolioAreas: report.portfolioManagement?.length || 0,
    risks: report.riskRegister?.length || 0,
    kpis: Object.values(report.kpiRegistry || {})
      .reduce((total, metrics) => total + metrics.length, 0),
    operationalGates: report.operationalVerificationGates?.length || 0,
    requirements: countLifecycleRequirements(report),
    missing
  };
}

function buildEnterpriseLifecycleV21(options = {}) {
  const enterprisePlatform = options.enterprisePlatform ||
    buildEnterprisePlatformV20(options);
  const evidence = options.operationalEvidence || {};
  const commercialLaunchReady =
    enterprisePlatform.linkedLayers?.commercialLaunchReady === true;
  const operationalVerificationGates = buildOperationalVerificationGates(evidence);
  const allOperationalGatesPassed = operationalVerificationGates
    .every((gate) => gate.status === 'PASSED');

  const draft = {
    lifecycleStages: ENTERPRISE_LIFECYCLE_STAGES,
    portfolioManagement: buildPortfolioManagement(),
    architectureDecisionRecords: buildArchitectureDecisionRecordProgram(),
    capabilityManagement: buildCapabilityManagement(),
    riskRegister: INITIAL_RISK_REGISTER,
    technicalDebtRegister: buildTechnicalDebtRegister(),
    kpiRegistry: ENTERPRISE_KPI_REGISTRY,
    releaseGovernance: buildReleaseGovernance(),
    customerSuccessFramework: CUSTOMER_SUCCESS_STAGES,
    financialGovernance: FINANCIAL_GOVERNANCE_FLOW,
    complianceFramework: COMPLIANCE_CONTROLS,
    enterpriseKnowledgeGraph: KNOWLEDGE_GRAPH_RELATIONS,
    continuousImprovementLoop: CONTINUOUS_IMPROVEMENT_LOOP,
    operationalVerificationGates,
    roadmap: ROADMAP_PHASES,
    longTermPlatformLayers: LONG_TERM_PLATFORM_LAYERS
  };

  const validation = validateEnterpriseLifecycleV21(draft);
  const lifecycleReady = validation.status === 'PASSED' &&
    enterprisePlatform.status === 'ACTIVE';
  const productionReady = allOperationalGatesPassed && commercialLaunchReady;

  return {
    system: 'SHEIKHA_ENTERPRISE_LIFECYCLE_V21',
    status: lifecycleReady ? 'ACTIVE' : 'REVIEW',
    mode: 'ENTERPRISE_LIFECYCLE_MANAGEMENT',
    phase: 'PRODUCTION_CANDIDATE_LIFECYCLE_GOVERNANCE',
    decision: lifecycleReady
      ? productionReady
        ? 'ENTERPRISE_LIFECYCLE_ACTIVE_PRODUCTION_READY'
        : 'ENTERPRISE_LIFECYCLE_ACTIVE_PRODUCTION_CANDIDATE_OPERATIONAL_EVIDENCE_REQUIRED'
      : 'ENTERPRISE_LIFECYCLE_REVIEW_REQUIRED',
    purpose: 'Manage all Sheikha components, products, capabilities, risks, decisions, releases, customers, finances, compliance, knowledge, and improvement through one governed enterprise lifecycle.',
    ...draft,
    validation,
    linkedLayers: {
      enterprisePlatformV20: enterprisePlatform.status,
      enterprisePlatformV20Decision: enterprisePlatform.decision,
      enterpriseOperatingSystemV13:
        enterprisePlatform.linkedLayers?.enterpriseOperatingSystemV13 || 'UNKNOWN',
      enterpriseOperatingModelV12:
        enterprisePlatform.linkedLayers?.enterpriseOperatingModelV12 || 'UNKNOWN',
      enterpriseReferenceSystemV1:
        enterprisePlatform.linkedLayers?.enterpriseReferenceSystemV1 || 'UNKNOWN',
      enterpriseConstitutionV1:
        enterprisePlatform.linkedLayers?.enterpriseConstitutionV1 || 'UNKNOWN',
      commercialLaunchReady,
      currentReleaseStage:
        enterprisePlatform.linkedLayers?.currentReleaseStage || 'UNKNOWN'
    },
    readiness: {
      productionCandidate: true,
      productionReady,
      allOperationalGatesPassed,
      commercialLaunchReady,
      pendingOperationalGates: operationalVerificationGates
        .filter((gate) => gate.status !== 'PASSED')
        .map((gate) => gate.gate)
    },
    enforcement: {
      everyComponentMustHaveLifecycleState: true,
      portfolioItemsRequireStableIdOwnerStatusMetricsReleaseLink: true,
      architectureDecisionsRequireAdr: true,
      capabilitiesManagedAsFirstClassUnits: true,
      risksMustBeRegistered: true,
      technicalDebtMustBeVisible: true,
      releasesMustDeclareVersionEvidence: true,
      customerJourneyMustBeTracked: true,
      financialFlowMustBeGoverned: true,
      complianceControlsMustBeDocumented: true,
      knowledgeGraphMustLinkImpact: true,
      productionReadyRequiresAllOperationalGates: true,
      noProductionReadyClaimWithoutEvidence: true
    },
    governance: {
      readOnly: true,
      lifecycleManagementOnly: true,
      noExternalMutation: true,
      noServiceRestart: true,
      noKernelModification: true,
      noPrivilegeEscalation: true,
      noUnsupportedProductionClaims: true,
      noUnsupportedCommercialClaims: true,
      humanApprovalRequiredForProductionReady: true,
      humanApprovalRequiredForCommercialLaunch: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار',
      tawhid: 'الله وحده لا شريك له'
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  ENTERPRISE_LIFECYCLE_STAGES,
  PORTFOLIO_AREAS,
  PORTFOLIO_ITEM_REQUIREMENTS,
  ADR_FIELDS,
  CAPABILITY_MANAGEMENT_REQUIREMENTS,
  INITIAL_RISK_REGISTER,
  TECHNICAL_DEBT_FIELDS,
  ENTERPRISE_KPI_REGISTRY,
  RELEASE_GOVERNANCE_REQUIREMENTS,
  CUSTOMER_SUCCESS_STAGES,
  FINANCIAL_GOVERNANCE_FLOW,
  COMPLIANCE_CONTROLS,
  KNOWLEDGE_GRAPH_RELATIONS,
  CONTINUOUS_IMPROVEMENT_LOOP,
  OPERATIONAL_VERIFICATION_GATES,
  ROADMAP_PHASES,
  LONG_TERM_PLATFORM_LAYERS,
  buildPortfolioManagement,
  buildArchitectureDecisionRecordProgram,
  buildCapabilityManagement,
  buildTechnicalDebtRegister,
  buildReleaseGovernance,
  buildOperationalVerificationGates,
  validateEnterpriseLifecycleV21,
  buildEnterpriseLifecycleV21
};
