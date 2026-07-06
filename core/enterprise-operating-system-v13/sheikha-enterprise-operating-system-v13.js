'use strict';

const {
  buildEnterpriseOperatingModelV12
} = require('../enterprise-operating-model/sheikha-enterprise-operating-model-v12');

const ENTERPRISE_OS_V13_COMPOSITION = Object.freeze([
  'Kernel',
  'Runtime',
  'Platform',
  'Products',
  'Organizations',
  'Customers',
  'Partners',
  'Developers',
  'Marketplace'
]);

const PRODUCT_FACTORY_FLOW = Object.freeze([
  'New Product',
  'Template',
  'Contracts',
  'Registry',
  'Governance',
  'Tests',
  'Documentation',
  'CI',
  'Release'
]);

const ORGANIZATION_FACTORY_FLOW = Object.freeze([
  'Organization',
  'Workspace',
  'Identity',
  'Policies',
  'Marketplace',
  'Billing',
  'Monitoring'
]);

const TENANT_PLATFORM_REQUIREMENTS = Object.freeze([
  'Tenant Data Isolation',
  'Tenant Policies',
  'Tenant Users',
  'Tenant Products',
  'Tenant Billing',
  'Tenant Reports',
  'Cross Tenant Isolation'
]);

const COMMERCE_PLATFORM_FLOW = Object.freeze([
  'CRM',
  'Lead',
  'Quotation',
  'Contract',
  'Invoice',
  'Payment',
  'Subscription',
  'Support',
  'Renewal'
]);

const AI_PLATFORM_SERVICES = Object.freeze([
  'Architecture Advisor',
  'Developer Advisor',
  'Sales Advisor',
  'Finance Advisor',
  'Legal Advisor',
  'Knowledge Advisor',
  'Executive Advisor'
]);

const KNOWLEDGE_PLATFORM_ASSETS = Object.freeze([
  'Policies',
  'Manuals',
  'Tutorials',
  'Architecture',
  'API Docs',
  'Business Docs'
]);

const ANALYTICS_PLATFORM_METRICS = Object.freeze([
  'Performance',
  'Customers',
  'Revenue',
  'Usage',
  'Errors',
  'Incidents',
  'Subscriptions'
]);

const SDK_PLATFORM_LANGUAGES = Object.freeze([
  'JavaScript',
  'TypeScript',
  'Python',
  'Go',
  'Java',
  'C#',
  'PHP',
  'Rust'
]);

const DEVELOPER_PLATFORM_TOOLS = Object.freeze([
  'CLI',
  'SDK',
  'API Explorer',
  'Examples',
  'Templates',
  'Development Environment',
  'Test Environment'
]);

const MARKETPLACE_ECOSYSTEM_ASSETS = Object.freeze([
  'Plugins',
  'Extensions',
  'Templates',
  'SDKs',
  'Integrations',
  'Connectors'
]);

const OPERATIONS_CENTER_CAPABILITIES = Object.freeze([
  'Runtime',
  'Health',
  'Logs',
  'Metrics',
  'Incidents',
  'Alerts',
  'Releases',
  'Backups',
  'Recovery',
  'Capacity'
]);

const RELEASE_TRAIN_STAGES = Object.freeze([
  'Architecture Freeze',
  'Contract Freeze',
  'Feature Freeze',
  'QA',
  'Release Candidate',
  'Controlled Staging',
  'Production',
  'LTS'
]);

const FINANCIAL_PLATFORM_FLOW = Object.freeze([
  'Pricing',
  'Quotations',
  'Contracts',
  'Invoices',
  'Payments',
  'Subscriptions',
  'Renewals',
  'Revenue Analytics'
]);

const SUCCESS_PLATFORM_METRICS = Object.freeze([
  'Activation Rate',
  'Usage',
  'Customer Satisfaction',
  'Renewal',
  'Support',
  'Retention'
]);

const ARCHITECTURE_COUNCIL_SCOPE = Object.freeze([
  'Architecture Changes',
  'Contracts',
  'Data Models',
  'APIs',
  'Release Management',
  'Architecture Decision Records'
]);

const STRATEGIC_PRIORITIES = Object.freeze([
  'Core Freeze',
  'Repository Cleanup',
  'Commercial Journey Completion',
  'Controlled Staging With Real Customers',
  'Products Above Platform'
]);

function buildProgram(id, name, category, capabilities, status = 'ACTIVE') {
  return {
    id,
    name,
    category,
    status,
    capabilities,
    requiredOperatingControls: [
      'Contract',
      'Registry',
      'Governance',
      'Metrics',
      'Documentation'
    ]
  };
}

function buildEnterprisePrograms(commercialLaunchReady = false) {
  return [
    buildProgram('EOS13-P01', 'Enterprise Product Factory', 'Factory', PRODUCT_FACTORY_FLOW),
    buildProgram('EOS13-P02', 'Enterprise Organization Factory', 'Factory', ORGANIZATION_FACTORY_FLOW),
    buildProgram('EOS13-P03', 'Enterprise Tenant Platform', 'Platform', TENANT_PLATFORM_REQUIREMENTS),
    buildProgram('EOS13-P04', 'Enterprise Commerce Platform', 'Commercial', COMMERCE_PLATFORM_FLOW),
    buildProgram('EOS13-P05', 'Enterprise AI Platform', 'AI', AI_PLATFORM_SERVICES),
    buildProgram('EOS13-P06', 'Enterprise Knowledge Platform', 'Knowledge', KNOWLEDGE_PLATFORM_ASSETS),
    buildProgram('EOS13-P07', 'Enterprise Analytics Platform', 'Analytics', ANALYTICS_PLATFORM_METRICS),
    buildProgram('EOS13-P08', 'Enterprise SDK Platform', 'Developer', SDK_PLATFORM_LANGUAGES),
    buildProgram('EOS13-P09', 'Enterprise Developer Platform', 'Developer', DEVELOPER_PLATFORM_TOOLS),
    buildProgram('EOS13-P10', 'Enterprise Marketplace Ecosystem', 'Ecosystem', MARKETPLACE_ECOSYSTEM_ASSETS),
    buildProgram('EOS13-P11', 'Enterprise Operations Center', 'Operations', OPERATIONS_CENTER_CAPABILITIES),
    buildProgram('EOS13-P12', 'Enterprise Release Train', 'Release', RELEASE_TRAIN_STAGES),
    buildProgram(
      'EOS13-P13',
      'Enterprise Financial Platform',
      'Financial',
      FINANCIAL_PLATFORM_FLOW,
      commercialLaunchReady ? 'ACTIVE' : 'EVIDENCE_PENDING'
    ),
    buildProgram('EOS13-P14', 'Enterprise Success Platform', 'Customer Success', SUCCESS_PLATFORM_METRICS),
    buildProgram('EOS13-P15', 'Enterprise Architecture Council', 'Governance', ARCHITECTURE_COUNCIL_SCOPE)
  ];
}

function buildProductHostModel() {
  return {
    status: 'ACTIVE',
    purpose: 'Allow Sheikha to host multiple governed products instead of operating as one product.',
    composition: ENTERPRISE_OS_V13_COMPOSITION,
    supportedProductTypes: [
      'Marketplace Product',
      'AI Service',
      'Knowledge Product',
      'Commerce Product',
      'Developer Tool',
      'Integration Connector'
    ],
    productAdmission: [
      'Template',
      'Contract',
      'Registry',
      'Governance Review',
      'Test Evidence',
      'Documentation',
      'Release Train'
    ]
  };
}

function countProgramCapabilities(programs) {
  return programs.reduce((total, program) => total + program.capabilities.length, 0);
}

function validateEnterpriseOperatingSystemV13(report) {
  const missing = [];

  if (!report.productHostModel?.composition?.includes('Products')) {
    missing.push('productHostModel.Products');
  }

  if (!report.programs?.length || report.programs.length < 15) {
    missing.push('programs');
  }

  if (!report.programs?.some((program) => program.name === 'Enterprise Product Factory')) {
    missing.push('Enterprise Product Factory');
  }

  if (!report.programs?.some((program) => program.name === 'Enterprise Commerce Platform')) {
    missing.push('Enterprise Commerce Platform');
  }

  if (!report.programs?.some((program) => program.name === 'Enterprise Architecture Council')) {
    missing.push('Enterprise Architecture Council');
  }

  return {
    system: 'SHEIKHA_ENTERPRISE_OPERATING_SYSTEM_VALIDATOR_V13',
    status: missing.length ? 'BLOCKED' : 'PASSED',
    programs: report.programs?.length || 0,
    capabilities: countProgramCapabilities(report.programs || []),
    compositionLayers: report.productHostModel?.composition?.length || 0,
    strategicPriorities: report.strategicPriorities?.length || 0,
    missing
  };
}

function buildEnterpriseOperatingSystemV13(options = {}) {
  const enterpriseOperatingModel = options.enterpriseOperatingModel ||
    buildEnterpriseOperatingModelV12(options);
  const commercialLaunchReady =
    enterpriseOperatingModel.linkedLayers?.commercialLaunchReady === true;
  const programs = buildEnterprisePrograms(commercialLaunchReady);
  const draft = {
    productHostModel: buildProductHostModel(),
    programs,
    strategicPriorities: STRATEGIC_PRIORITIES
  };
  const validation = validateEnterpriseOperatingSystemV13(draft);
  const enterpriseOsReady = validation.status === 'PASSED' &&
    enterpriseOperatingModel.status === 'ACTIVE';

  return {
    system: 'SHEIKHA_ENTERPRISE_OPERATING_SYSTEM_V13',
    status: enterpriseOsReady ? 'ACTIVE' : 'REVIEW',
    mode: 'MULTI_PRODUCT_ENTERPRISE_OS',
    phase: 'PRODUCT_OPERATIONS_PHASE',
    decision: enterpriseOsReady
      ? commercialLaunchReady
        ? 'ENTERPRISE_OS_V13_ACTIVE_READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH'
        : 'ENTERPRISE_OS_V13_ACTIVE_CORE_FROZEN_PRODUCT_OPERATIONS_READY_COMMERCIAL_EVIDENCE_REQUIRED'
      : 'ENTERPRISE_OS_V13_REVIEW_REQUIRED',
    purpose: 'Turn Sheikha from a single platform build into a governed enterprise operating system that can host products, organizations, tenants, customers, partners, developers, and marketplace assets.',
    productHostModel: draft.productHostModel,
    programs,
    validation,
    linkedLayers: {
      enterpriseOperatingModelV12: enterpriseOperatingModel.status,
      enterpriseOperatingModelDecision: enterpriseOperatingModel.decision,
      enterpriseReferenceSystemV1:
        enterpriseOperatingModel.linkedLayers?.enterpriseReferenceSystemV1 || 'UNKNOWN',
      enterpriseConstitutionV1:
        enterpriseOperatingModel.linkedLayers?.enterpriseConstitutionV1 || 'UNKNOWN',
      enterpriseOperatingSystemV11:
        enterpriseOperatingModel.linkedLayers?.enterpriseOperatingSystemV11 || 'UNKNOWN',
      commercialLaunchReady,
      currentReleaseStage:
        enterpriseOperatingModel.linkedLayers?.currentReleaseStage || 'UNKNOWN'
    },
    strategicPriorities: STRATEGIC_PRIORITIES,
    enforcement: {
      infrastructureExpansionFrozen: true,
      newProductsMustUseProductFactory: true,
      newOrganizationsMustUseOrganizationFactory: true,
      tenantIsolationRequired: true,
      commerceMustUseEndToEndRevenueFlow: true,
      aiServicesMustDeclareContractPoliciesRegistryMetrics: true,
      sdkLanguagesMustShareContractsAndVersions: true,
      releaseTrainRequiredForProduction: true,
      architectureCouncilRequiredForBreakingChanges: true,
      commercialLaunchRequiresEvidenceGate: true,
      repositoryCleanupRequiredBeforeReleaseLock: true
    },
    governance: {
      readOnly: true,
      operatingSystemModelOnly: true,
      noExternalMutation: true,
      noServiceRestart: true,
      noKernelModification: true,
      noPrivilegeEscalation: true,
      noUnsupportedCommercialClaims: true,
      humanApprovalRequiredForNewProductLaunch: true,
      humanApprovalRequiredForTenantIsolationChange: true,
      humanApprovalRequiredForCommercialLaunch: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار',
      tawhid: 'الله وحده لا شريك له'
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  ENTERPRISE_OS_V13_COMPOSITION,
  PRODUCT_FACTORY_FLOW,
  ORGANIZATION_FACTORY_FLOW,
  TENANT_PLATFORM_REQUIREMENTS,
  COMMERCE_PLATFORM_FLOW,
  AI_PLATFORM_SERVICES,
  KNOWLEDGE_PLATFORM_ASSETS,
  ANALYTICS_PLATFORM_METRICS,
  SDK_PLATFORM_LANGUAGES,
  DEVELOPER_PLATFORM_TOOLS,
  MARKETPLACE_ECOSYSTEM_ASSETS,
  OPERATIONS_CENTER_CAPABILITIES,
  RELEASE_TRAIN_STAGES,
  FINANCIAL_PLATFORM_FLOW,
  SUCCESS_PLATFORM_METRICS,
  ARCHITECTURE_COUNCIL_SCOPE,
  STRATEGIC_PRIORITIES,
  buildProgram,
  buildEnterprisePrograms,
  buildProductHostModel,
  validateEnterpriseOperatingSystemV13,
  buildEnterpriseOperatingSystemV13
};
