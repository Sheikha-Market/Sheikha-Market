'use strict';

const {
  buildEnterpriseOperatingPlatformV9
} = require('../enterprise-operating-platform/sheikha-enterprise-operating-platform-v9');
const {
  buildCommercialLaunchValidation
} = require('../commercial-launch-validation/sheikha-commercial-launch-validation-v1');

const SOVEREIGN_CORE = Object.freeze([
  'Sheikha Kernel',
  'Runtime',
  'Identity',
  'Governance',
  'Security',
  'Audit',
  'Event Bus',
  'Registry',
  'Policy Engine',
  'Configuration'
]);

const ENTERPRISE_PLATFORMS = Object.freeze([
  'Enterprise Platform',
  'AI Platform',
  'Developer Platform',
  'Marketplace Platform',
  'Knowledge Platform',
  'Commerce Platform',
  'Finance Platform',
  'Supply Chain Platform',
  'Analytics Platform'
]);

const BUSINESS_PLATFORMS = Object.freeze([
  'CRM',
  'Sales',
  'Procurement',
  'Inventory',
  'Warehouse',
  'Accounting',
  'HR',
  'Projects',
  'Support',
  'Partners',
  'Customers'
]);

const EXPERIENCE_LAYER = Object.freeze([
  'Executive Dashboard',
  'Business Dashboard',
  'Customer Portal',
  'Partner Portal',
  'Supplier Portal',
  'Developer Portal',
  'Admin Portal',
  'Mobile',
  'API',
  'CLI'
]);

const UNIFIED_REGISTRY_CATALOG = Object.freeze([
  'Modules',
  'Capabilities',
  'Events',
  'Policies',
  'Contracts',
  'Routes',
  'SDKs',
  'Templates',
  'Pipelines',
  'Jobs',
  'Agents',
  'AI Models',
  'Extensions',
  'Plugins'
]);

const CAPABILITY_CONTRACT_FIELDS = Object.freeze([
  'Name',
  'Owner',
  'Dependencies',
  'Version',
  'Health',
  'Tests',
  'Policies',
  'Routes',
  'Events',
  'Metrics',
  'SLA'
]);

const CANONICAL_DATA_MODEL = Object.freeze([
  'Organization',
  'Workspace',
  'Department',
  'User',
  'Role',
  'Customer',
  'Supplier',
  'Product',
  'Inventory',
  'Quotation',
  'Order',
  'Contract',
  'Invoice',
  'Payment',
  'Subscription',
  'Shipment',
  'Knowledge',
  'Audit',
  'Event'
]);

const ENTERPRISE_LIFECYCLE = Object.freeze([
  'Idea',
  'Architecture',
  'Implementation',
  'Tests',
  'Governance',
  'QA',
  'Staging',
  'Production',
  'Monitoring',
  'Improvement'
]);

const ENTERPRISE_AI_ROLES = Object.freeze([
  'Executive Advisor',
  'Commercial Advisor',
  'Supply Chain Advisor',
  'Accounting Advisor',
  'Legal Advisor',
  'Compliance Advisor',
  'Developer Advisor',
  'Architecture Advisor',
  'Security Advisor',
  'Knowledge Advisor'
]);

const INTEGRATION_FABRIC = Object.freeze([
  'REST APIs',
  'Webhooks',
  'SDKs',
  'CLI',
  'Import',
  'Export',
  'Streaming',
  'Event Bus'
]);

const OPERATIONS_FABRIC = Object.freeze([
  'Health',
  'Metrics',
  'Logs',
  'Tracing',
  'Alerting',
  'Capacity',
  'Backups',
  'Recovery',
  'Incidents',
  'Maintenance'
]);

const GOVERNANCE_FLOW = Object.freeze([
  'Read',
  'Validate',
  'Policy',
  'Risk',
  'Approval',
  'Execution',
  'Audit',
  'Events',
  'Analytics'
]);

const COMMERCIAL_FABRIC = Object.freeze([
  'Marketing',
  'Lead',
  'Opportunity',
  'Quotation',
  'Approval',
  'Contract',
  'Invoice',
  'Payment',
  'Provisioning',
  'Support',
  'Renewal'
]);

const RELEASE_FABRIC = Object.freeze([
  'Development',
  'Nightly',
  'Integration',
  'QA',
  'Release Candidate',
  'Controlled Staging',
  'Production',
  'LTS'
]);

const CONTROL_TOWER_SIGNALS = Object.freeze([
  'Runtime Health',
  'Business Health',
  'Revenue',
  'Customers',
  'Orders',
  'Contracts',
  'Payments',
  'AI Usage',
  'Marketplace Activity',
  'Alerts',
  'Backups',
  'Recovery Status',
  'Release Status'
]);

function buildDependencyGraph() {
  const nodes = [
    'Sovereign Core',
    'Enterprise Platform',
    'Business Platform',
    'Experience Layer',
    'External Integrations'
  ];
  const edges = [
    { from: 'External Integrations', to: 'Experience Layer', type: 'USES' },
    { from: 'Experience Layer', to: 'Business Platform', type: 'USES' },
    { from: 'Business Platform', to: 'Enterprise Platform', type: 'USES' },
    { from: 'Enterprise Platform', to: 'Sovereign Core', type: 'USES' }
  ];

  return {
    nodes,
    edges,
    forbiddenReverseDependencies: [
      'Sovereign Core -> Business Platform',
      'Sovereign Core -> Experience Layer',
      'Enterprise Platform -> External Integrations'
    ],
    reverseDependencyBlocked: true
  };
}

function buildCapabilityGraph() {
  return {
    system: 'SHEIKHA_ENTERPRISE_CAPABILITY_GRAPH_V11',
    status: 'ACTIVE',
    contractFields: CAPABILITY_CONTRACT_FIELDS,
    reusableCapabilities: [
      'identity',
      'governance',
      'audit',
      'eventing',
      'workflow',
      'commerce',
      'knowledge',
      'ai-assistance',
      'analytics',
      'operations'
    ],
    rule: 'Applications request capabilities; capabilities bind to registered platforms through governance.'
  };
}

function buildReadiness(platformV9, commercialLaunch) {
  const coreReady = platformV9.status === 'ACTIVE' &&
    platformV9.readiness?.productionCandidateReady === true;
  const commercialEvidenceReady = commercialLaunch.readiness?.commercialLaunchReady === true;
  const foundationReady = coreReady &&
    commercialLaunch.status !== 'BLOCKED' &&
    commercialLaunch.missingDomains?.length === 0;

  return {
    coreReady,
    platformV9Ready: platformV9.status === 'ACTIVE',
    productionCandidateReady: platformV9.readiness?.productionCandidateReady === true,
    commercialEvidenceReady,
    commercialLaunchReady: commercialEvidenceReady,
    foundationReady,
    nextPhase: commercialEvidenceReady
      ? 'CONTROLLED_COMMERCIAL_LAUNCH'
      : 'COMPLETE_COMMERCIAL_EVIDENCE_AND_STAGING_REHEARSAL'
  };
}

function buildEnterpriseOperatingSystemV11(options = {}) {
  const platformV9 = options.platformV9 || buildEnterpriseOperatingPlatformV9(options);
  const commercialLaunch = options.commercialLaunch ||
    buildCommercialLaunchValidation(options);
  const readiness = buildReadiness(platformV9, commercialLaunch);
  const dependencyGraph = buildDependencyGraph();

  return {
    system: 'SHEIKHA_ENTERPRISE_OPERATING_SYSTEM_V11',
    status: readiness.foundationReady ? 'ACTIVE' : 'REVIEW',
    mode: 'GOVERNED_ENTERPRISE_OPERATING_SYSTEM_FOUNDATION',
    decision: readiness.commercialLaunchReady
      ? 'ENTERPRISE_OS_READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH'
      : 'ENTERPRISE_OS_ACTIVE_COMMERCIAL_EVIDENCE_REQUIRED',
    hierarchy: {
      sovereignCore: SOVEREIGN_CORE,
      enterprisePlatforms: ENTERPRISE_PLATFORMS,
      businessPlatforms: BUSINESS_PLATFORMS,
      experienceLayer: EXPERIENCE_LAYER
    },
    unifiedEnterpriseRegistry: {
      status: 'ACTIVE',
      catalog: UNIFIED_REGISTRY_CATALOG,
      sourceOfTruth: true,
      rule: 'No new core component without registry, owner, version, policy, and audit path.'
    },
    capabilityGraph: buildCapabilityGraph(),
    dependencyGraph,
    lifecycle: {
      status: 'ACTIVE',
      stages: ENTERPRISE_LIFECYCLE
    },
    enterpriseAiFabric: {
      status: 'ACTIVE',
      roles: ENTERPRISE_AI_ROLES,
      sharedControls: [
        'Registry',
        'Policies',
        'Contracts',
        'Audit',
        'Context',
        'Human Review For High Impact'
      ]
    },
    enterpriseDataFabric: {
      status: 'ACTIVE',
      canonicalModel: CANONICAL_DATA_MODEL,
      duplicateEntityCreationBlocked: true
    },
    enterpriseIntegrationFabric: {
      status: 'ACTIVE',
      channels: INTEGRATION_FABRIC
    },
    enterpriseOperationsFabric: {
      status: 'ACTIVE',
      signals: OPERATIONS_FABRIC
    },
    enterpriseGovernanceFabric: {
      status: 'ACTIVE',
      flow: GOVERNANCE_FLOW,
      externalChangeRequiresHumanApproval: true
    },
    enterpriseCommercialFabric: {
      status: commercialLaunch.readiness?.commercialLaunchReady
        ? 'READY'
        : 'EVIDENCE_PENDING',
      lifecycle: COMMERCIAL_FABRIC,
      evidenceGate: commercialLaunch.system,
      pendingEvidence: commercialLaunch.pending?.map((item) => item.id) || []
    },
    enterpriseReleaseFabric: {
      status: 'ACTIVE',
      stages: RELEASE_FABRIC,
      currentStage: readiness.commercialLaunchReady
        ? 'Controlled Staging'
        : 'Release Candidate'
    },
    enterpriseControlTower: {
      status: 'ACTIVE',
      signals: CONTROL_TOWER_SIGNALS,
      launchDecision: commercialLaunch.decision
    },
    linkedLayers: {
      enterpriseOperatingPlatformV9: platformV9.status,
      commercialLaunchValidationV1: commercialLaunch.status,
      commercialLaunchDecision: commercialLaunch.decision
    },
    readiness,
    roadmap: [
      'Core freeze and registry enforcement.',
      'Complete CRM, sales, contracts, invoices, subscriptions, and customer portal.',
      'Verify backup, rollback, monitoring, and staging with real operational evidence.',
      'Open controlled commercial launch only after revenue and support evidence passes.',
      'Expand through partner marketplace, stable SDKs, versioned APIs, and developer ecosystem.'
    ],
    governance: {
      readOnly: true,
      noExternalMutation: true,
      noServiceRestart: true,
      noKernelModification: true,
      noPrivilegeEscalation: true,
      noUnsupportedRevenueClaims: true,
      humanApprovalRequiredForExternalChange: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار',
      tawhid: 'الله وحده لا شريك له'
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  SOVEREIGN_CORE,
  ENTERPRISE_PLATFORMS,
  BUSINESS_PLATFORMS,
  EXPERIENCE_LAYER,
  UNIFIED_REGISTRY_CATALOG,
  CANONICAL_DATA_MODEL,
  ENTERPRISE_LIFECYCLE,
  ENTERPRISE_AI_ROLES,
  COMMERCIAL_FABRIC,
  RELEASE_FABRIC,
  buildDependencyGraph,
  buildCapabilityGraph,
  buildReadiness,
  buildEnterpriseOperatingSystemV11
};
