'use strict';

const {
  buildEnterpriseOperatingSystemV13
} = require('../enterprise-operating-system-v13/sheikha-enterprise-operating-system-v13');

const ENTERPRISE_PLATFORM_STACK = Object.freeze([
  'Enterprise Platform',
  'Enterprise Operating System',
  'Enterprise Platform Services',
  'Enterprise Business Platform',
  'Enterprise AI Platform',
  'Enterprise Marketplace',
  'Enterprise Customers'
]);

const PLATFORM_KERNEL_SCOPE = Object.freeze([
  'Runtime',
  'Configuration',
  'Identity',
  'Registry',
  'Governance',
  'Event Bus',
  'Logging',
  'Health',
  'Security'
]);

const CAPABILITY_CATALOG = Object.freeze([
  'Commerce',
  'Marketplace',
  'Finance',
  'AI',
  'Knowledge',
  'Analytics',
  'Supply Chain',
  'CRM',
  'Documents',
  'Notifications',
  'Automation'
]);

const CAPABILITY_REQUIREMENTS = Object.freeze([
  'Contract',
  'Version',
  'Owner',
  'Health',
  'Metrics',
  'Documentation'
]);

const OFFICIAL_DOMAINS = Object.freeze([
  'Identity',
  'Governance',
  'Commerce',
  'Marketplace',
  'Finance',
  'Supply Chain',
  'AI',
  'Knowledge',
  'Operations',
  'Developer'
]);

const UNIFIED_CONTRACT_GROUPS = Object.freeze([
  'entity',
  'api',
  'event',
  'policy',
  'module',
  'capability',
  'plugin',
  'release'
]);

const UNIFIED_REGISTRY_GROUPS = Object.freeze([
  'Modules',
  'Capabilities',
  'Domains',
  'APIs',
  'Events',
  'Policies',
  'Templates',
  'SDKs',
  'Products',
  'Releases',
  'Organizations'
]);

const PRODUCT_PLATFORM_FLOW = Object.freeze([
  'Product',
  'Identity',
  'Configuration',
  'Contracts',
  'Capabilities',
  'Monitoring',
  'Release',
  'Support'
]);

const ORGANIZATION_PLATFORM_REQUIREMENTS = Object.freeze([
  'Users',
  'Roles',
  'Policies',
  'Marketplace',
  'Billing',
  'Storage',
  'Reports',
  'Tenant Isolation'
]);

const AI_SERVICE_TYPES = Object.freeze([
  'Architecture Advisor',
  'Developer Advisor',
  'Commercial Advisor',
  'Finance Advisor',
  'Knowledge Advisor',
  'Operations Advisor'
]);

const COMMERCE_REVENUE_FLOW = Object.freeze([
  'Lead',
  'Opportunity',
  'Quotation',
  'Contract',
  'Invoice',
  'Payment',
  'Provisioning',
  'Support',
  'Renewal'
]);

const OPERATIONS_PLATFORM_REQUIREMENTS = Object.freeze([
  'Health',
  'Metrics',
  'Logs',
  'Traces',
  'Alerts',
  'Backup',
  'Recovery',
  'Capacity'
]);

const RELEASE_PLATFORM_STAGES = Object.freeze([
  'Development',
  'Integration',
  'QA',
  'Release Candidate',
  'Controlled Staging',
  'Production',
  'LTS'
]);

const SECURITY_PLATFORM_REQUIREMENTS = Object.freeze([
  'Authentication',
  'Authorization',
  'Audit',
  'Secrets',
  'Encryption',
  'Rate Limits'
]);

const DEVELOPER_PLATFORM_REQUIREMENTS = Object.freeze([
  'CLI',
  'SDKs',
  'API Explorer',
  'Documentation',
  'Templates',
  'Samples'
]);

const OBSERVABILITY_PLATFORM_VIEWS = Object.freeze([
  'Runtime Health',
  'Services',
  'Errors',
  'Deployments',
  'Releases',
  'Incidents',
  'Capacity',
  'Business KPIs'
]);

const COMMERCIAL_PLATFORM_REQUIREMENTS = Object.freeze([
  'Product Pages',
  'Pricing',
  'Contracts Or Terms',
  'Invoices Or Subscriptions',
  'Selected Payment Methods',
  'Customer Management',
  'Support',
  'Financial Reports'
]);

const PLATFORM_MATURITY_GATES = Object.freeze([
  {
    gate: 'Architecture Gate',
    criterion: 'Architecture is stable.'
  },
  {
    gate: 'Contract Gate',
    criterion: 'Contracts are unified.'
  },
  {
    gate: 'Security Gate',
    criterion: 'Security controls are complete.'
  },
  {
    gate: 'Operations Gate',
    criterion: 'Operations and monitoring are ready.'
  },
  {
    gate: 'Commercial Gate',
    criterion: 'Revenue cycle is complete.'
  },
  {
    gate: 'Production Gate',
    criterion: 'Production launch is approved.'
  }
]);

const FINAL_EXECUTION_ROADMAP = Object.freeze([
  {
    phase: 'Current Phase',
    goals: [
      'Stabilize Kernel',
      'Clean Repository',
      'Close Feature Freeze',
      'Review Unmerged Files'
    ]
  },
  {
    phase: 'Business Completion',
    goals: [
      'Complete Revenue Cycle',
      'Run Staging Environment',
      'Test Backup And Recovery'
    ]
  },
  {
    phase: 'Controlled Launch',
    goals: [
      'Launch With Limited Real Customers',
      'Monitor Performance',
      'Collect Feedback'
    ]
  },
  {
    phase: 'Continuous Growth',
    goals: [
      'Continuous Improvement',
      'Expand Products',
      'Support Partners And Developers'
    ]
  }
]);

function buildCapabilityRegistry() {
  return CAPABILITY_CATALOG.map((capability, index) => ({
    id: `PLAT-CAP-${String(index + 1).padStart(3, '0')}`,
    name: capability,
    status: 'REGISTERED',
    requirements: CAPABILITY_REQUIREMENTS,
    lifecycle: 'GOVERNED_CAPABILITY'
  }));
}

function buildDomainPlatform() {
  return OFFICIAL_DOMAINS.map((domain, index) => ({
    id: `PLAT-DOMAIN-${String(index + 1).padStart(3, '0')}`,
    name: domain,
    status: 'OFFICIAL',
    newDomainPolicy: 'ARCHITECTURE_DECISION_REQUIRED',
    boundariesRequired: true
  }));
}

function buildUnifiedContracts() {
  return UNIFIED_CONTRACT_GROUPS.map((group, index) => ({
    id: `PLAT-CONTRACT-${String(index + 1).padStart(3, '0')}`,
    path: `contracts/${group}/`,
    status: 'REFERENCE_REQUIRED',
    appliesTo: 'ALL_PLATFORM_COMPONENTS'
  }));
}

function buildUnifiedRegistry() {
  return UNIFIED_REGISTRY_GROUPS.map((group, index) => ({
    id: `PLAT-REG-${String(index + 1).padStart(3, '0')}`,
    group,
    status: 'REFERENCE_REQUIRED',
    duplicateRegistryPolicy: 'CONSOLIDATE_BEFORE_NEW_REGISTRY'
  }));
}

function buildPlatformServices() {
  return {
    productPlatform: PRODUCT_PLATFORM_FLOW,
    organizationPlatform: ORGANIZATION_PLATFORM_REQUIREMENTS,
    aiPlatform: AI_SERVICE_TYPES,
    commercePlatform: COMMERCE_REVENUE_FLOW,
    operationsPlatform: OPERATIONS_PLATFORM_REQUIREMENTS,
    releasePlatform: RELEASE_PLATFORM_STAGES,
    securityPlatform: SECURITY_PLATFORM_REQUIREMENTS,
    developerPlatform: DEVELOPER_PLATFORM_REQUIREMENTS,
    observabilityPlatform: OBSERVABILITY_PLATFORM_VIEWS,
    commercialPlatform: COMMERCIAL_PLATFORM_REQUIREMENTS
  };
}

function countPlatformRequirements(report) {
  return ENTERPRISE_PLATFORM_STACK.length +
    PLATFORM_KERNEL_SCOPE.length +
    report.capabilityPlatform.length * CAPABILITY_REQUIREMENTS.length +
    report.domainPlatform.length +
    report.unifiedContracts.length +
    report.unifiedRegistry.length +
    Object.values(report.platformServices)
      .reduce((total, items) => total + items.length, 0) +
    PLATFORM_MATURITY_GATES.length +
    FINAL_EXECUTION_ROADMAP
      .reduce((total, phase) => total + phase.goals.length, 0);
}

function validateEnterprisePlatformV20(report) {
  const missing = [];

  if (!report.platformKernel?.includes('Runtime')) {
    missing.push('platformKernel.Runtime');
  }

  if (!report.platformKernel?.includes('Governance')) {
    missing.push('platformKernel.Governance');
  }

  if (!report.capabilityPlatform?.length) {
    missing.push('capabilityPlatform');
  }

  if (!report.domainPlatform?.length) {
    missing.push('domainPlatform');
  }

  if (!report.unifiedContracts?.length) {
    missing.push('unifiedContracts');
  }

  if (!report.unifiedRegistry?.length) {
    missing.push('unifiedRegistry');
  }

  if (!report.maturityGates?.some((gate) => gate.gate === 'Commercial Gate')) {
    missing.push('Commercial Gate');
  }

  return {
    system: 'SHEIKHA_ENTERPRISE_PLATFORM_VALIDATOR_V20',
    status: missing.length ? 'BLOCKED' : 'PASSED',
    platformLayers: report.enterprisePlatformStack?.length || 0,
    kernelItems: report.platformKernel?.length || 0,
    capabilities: report.capabilityPlatform?.length || 0,
    domains: report.domainPlatform?.length || 0,
    contracts: report.unifiedContracts?.length || 0,
    registries: report.unifiedRegistry?.length || 0,
    maturityGates: report.maturityGates?.length || 0,
    requirements: countPlatformRequirements(report),
    missing
  };
}

function buildEnterprisePlatformV20(options = {}) {
  const enterpriseOperatingSystem = options.enterpriseOperatingSystem ||
    buildEnterpriseOperatingSystemV13(options);
  const commercialLaunchReady =
    enterpriseOperatingSystem.linkedLayers?.commercialLaunchReady === true;

  const draft = {
    enterprisePlatformStack: ENTERPRISE_PLATFORM_STACK,
    platformKernel: PLATFORM_KERNEL_SCOPE,
    capabilityPlatform: buildCapabilityRegistry(),
    domainPlatform: buildDomainPlatform(),
    unifiedContracts: buildUnifiedContracts(),
    unifiedRegistry: buildUnifiedRegistry(),
    platformServices: buildPlatformServices(),
    maturityGates: PLATFORM_MATURITY_GATES,
    finalExecutionRoadmap: FINAL_EXECUTION_ROADMAP
  };

  const validation = validateEnterprisePlatformV20(draft);
  const platformReady = validation.status === 'PASSED' &&
    enterpriseOperatingSystem.status === 'ACTIVE';

  return {
    system: 'SHEIKHA_ENTERPRISE_PLATFORM_V20',
    status: platformReady ? 'ACTIVE' : 'REVIEW',
    mode: 'ENTERPRISE_PLATFORM_MATURITY_MODEL',
    phase: 'PLATFORM_OPERATIONS_AND_MATURITY_PHASE',
    decision: platformReady
      ? commercialLaunchReady
        ? 'ENTERPRISE_PLATFORM_V20_ACTIVE_READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH'
        : 'ENTERPRISE_PLATFORM_V20_ACTIVE_KERNEL_FROZEN_PLATFORM_MATURITY_READY_COMMERCIAL_EVIDENCE_REQUIRED'
      : 'ENTERPRISE_PLATFORM_V20_REVIEW_REQUIRED',
    purpose: 'Unify Sheikha as a maintainable enterprise platform with a small stable kernel, governed capabilities, official domains, unified contracts, unified registry, platform services, maturity gates, and execution roadmap.',
    ...draft,
    validation,
    linkedLayers: {
      enterpriseOperatingSystemV13: enterpriseOperatingSystem.status,
      enterpriseOperatingSystemV13Decision: enterpriseOperatingSystem.decision,
      enterpriseOperatingModelV12:
        enterpriseOperatingSystem.linkedLayers?.enterpriseOperatingModelV12 || 'UNKNOWN',
      enterpriseReferenceSystemV1:
        enterpriseOperatingSystem.linkedLayers?.enterpriseReferenceSystemV1 || 'UNKNOWN',
      enterpriseConstitutionV1:
        enterpriseOperatingSystem.linkedLayers?.enterpriseConstitutionV1 || 'UNKNOWN',
      commercialLaunchReady,
      currentReleaseStage:
        enterpriseOperatingSystem.linkedLayers?.currentReleaseStage || 'UNKNOWN'
    },
    enforcement: {
      kernelMustRemainSmallAndStable: true,
      nonKernelFeaturesMustBeCapabilities: true,
      newDomainsRequireArchitectureDecision: true,
      contractsMustBeUnifiedBeforeExpansion: true,
      registriesMustBeConsolidatedBeforeNewRegistry: true,
      productsMustFollowProductPlatformFlow: true,
      organizationsRequireIsolationReadyDesign: true,
      commerceMustCompleteRevenueCycleBeforeLaunch: true,
      operationsMustProveBackupRecoveryMonitoring: true,
      productionRequiresMaturityGates: true,
      commercialLaunchRequiresEvidenceGate: true,
      repositoryCleanupRequiredBeforeReleaseLock: true
    },
    governance: {
      readOnly: true,
      platformMaturityModelOnly: true,
      noExternalMutation: true,
      noServiceRestart: true,
      noKernelModification: true,
      noPrivilegeEscalation: true,
      noUnsupportedCommercialClaims: true,
      humanApprovalRequiredForNewDomain: true,
      humanApprovalRequiredForKernelChange: true,
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
  ENTERPRISE_PLATFORM_STACK,
  PLATFORM_KERNEL_SCOPE,
  CAPABILITY_CATALOG,
  CAPABILITY_REQUIREMENTS,
  OFFICIAL_DOMAINS,
  UNIFIED_CONTRACT_GROUPS,
  UNIFIED_REGISTRY_GROUPS,
  PRODUCT_PLATFORM_FLOW,
  ORGANIZATION_PLATFORM_REQUIREMENTS,
  AI_SERVICE_TYPES,
  COMMERCE_REVENUE_FLOW,
  OPERATIONS_PLATFORM_REQUIREMENTS,
  RELEASE_PLATFORM_STAGES,
  SECURITY_PLATFORM_REQUIREMENTS,
  DEVELOPER_PLATFORM_REQUIREMENTS,
  OBSERVABILITY_PLATFORM_VIEWS,
  COMMERCIAL_PLATFORM_REQUIREMENTS,
  PLATFORM_MATURITY_GATES,
  FINAL_EXECUTION_ROADMAP,
  buildCapabilityRegistry,
  buildDomainPlatform,
  buildUnifiedContracts,
  buildUnifiedRegistry,
  buildPlatformServices,
  validateEnterprisePlatformV20,
  buildEnterprisePlatformV20
};
