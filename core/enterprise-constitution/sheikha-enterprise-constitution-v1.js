'use strict';

const {
  buildEnterpriseOperatingSystemV11
} = require('../enterprise-operating-system/sheikha-enterprise-operating-system-v11');

const PERMANENT_PRINCIPLES = Object.freeze([
  'Truth First',
  'Governance Before Execution',
  'Human Approval For High Impact Actions',
  'No Harm',
  'Audit Everything',
  'Contracts Before Code',
  'Events Before Integrations',
  'Security By Default',
  'Observability By Default',
  'Documentation By Default'
]);

const MODULE_STANDARD = Object.freeze([
  'README.md',
  'contract.js',
  'service.js',
  'routes.js',
  'events.js',
  'policies.js',
  'tests/',
  'docs/',
  'metrics.js',
  'health.js'
]);

const CAPABILITY_STANDARD = Object.freeze([
  'Capability Name',
  'Purpose',
  'Owner',
  'Dependencies',
  'Inputs',
  'Outputs',
  'Policies',
  'Events',
  'Metrics',
  'Health',
  'Version'
]);

const API_STANDARD = Object.freeze([
  'Version',
  'Contract',
  'Authentication',
  'Authorization',
  'Rate Limits',
  'Audit',
  'Error Model',
  'Examples',
  'Deprecation Policy'
]);

const EVENT_STANDARD = Object.freeze([
  'Event Name',
  'Schema',
  'Producer',
  'Consumers',
  'Retention',
  'Audit Hash'
]);

const GOVERNANCE_FLOW_STANDARD = Object.freeze([
  'Read',
  'Validate',
  'Policy Evaluation',
  'Risk Assessment',
  'Approval',
  'Execution',
  'Audit',
  'Event'
]);

const UX_STANDARD = Object.freeze([
  'Clear title',
  'Short description',
  'Primary actions',
  'Status indicators',
  'Timeline when needed',
  'Contextual help',
  'Arabic and English support',
  'Accessibility'
]);

const QUALITY_STANDARD = Object.freeze([
  'Unit tests',
  'Integration tests',
  'Lint',
  'Contract review',
  'Documentation review',
  'Performance review'
]);

const RELEASE_STANDARD = Object.freeze([
  'Development',
  'Integration',
  'QA',
  'Release Candidate',
  'Controlled Staging',
  'Production',
  'Long Term Support'
]);

const OPERATIONS_STANDARD = Object.freeze([
  'Health Endpoint',
  'Metrics',
  'Structured Logs',
  'Tracing',
  'Alert Rules',
  'Backup Strategy',
  'Recovery Procedure'
]);

const BUSINESS_STANDARD = Object.freeze([
  'Target Customers',
  'Pricing',
  'Subscriptions',
  'Contracts',
  'Invoices',
  'Support',
  'Renewals',
  'KPIs'
]);

const AI_STANDARD = Object.freeze([
  'Role',
  'Capabilities',
  'Allowed Actions',
  'Blocked Actions',
  'Context Sources',
  'Policies',
  'Audit Requirements'
]);

const CANONICAL_ENTITIES = Object.freeze([
  'Organization',
  'Workspace',
  'Customer',
  'Supplier',
  'Product',
  'Category',
  'Order',
  'Contract',
  'Invoice',
  'Payment',
  'Subscription',
  'Shipment',
  'Knowledge',
  'AI Session',
  'Audit',
  'Event'
]);

const GOVERNANCE_COUNCIL_SCOPE = Object.freeze([
  'Architecture',
  'Data Models',
  'Contracts',
  'Policies',
  'Releases',
  'Security',
  'Compliance',
  'Commercial Launch',
  'Roadmap'
]);

const EXECUTIVE_PROGRAMS = Object.freeze([
  'Platform Consolidation',
  'Commercial Readiness',
  'Operational Excellence',
  'Developer Ecosystem',
  'Controlled Market Launch'
]);

function buildStandard(name, required) {
  return {
    name,
    status: required.length ? 'ACTIVE' : 'EMPTY',
    required,
    enforcement: 'REQUIRED_FOR_NEW_COMPONENTS'
  };
}

function buildConstitutionStandards() {
  return {
    moduleStandard: buildStandard('Module Standard', MODULE_STANDARD),
    capabilityStandard: buildStandard('Capability Standard', CAPABILITY_STANDARD),
    apiStandard: buildStandard('API Standard', API_STANDARD),
    eventStandard: buildStandard('Event Standard', EVENT_STANDARD),
    dataStandard: {
      ...buildStandard('Enterprise Data Standard', CANONICAL_ENTITIES),
      duplicateCanonicalEntityBlocked: true,
      forbiddenExamples: ['Customer2', 'ProductNew', 'InvoiceV2']
    },
    governanceStandard: buildStandard('Enterprise Governance Standard', GOVERNANCE_FLOW_STANDARD),
    uxStandard: buildStandard('Experience Standard', UX_STANDARD),
    qualityStandard: buildStandard('Quality Standard', QUALITY_STANDARD),
    releaseStandard: buildStandard('Release Standard', RELEASE_STANDARD),
    operationsStandard: buildStandard('Operations Standard', OPERATIONS_STANDARD),
    businessStandard: buildStandard('Business Standard', BUSINESS_STANDARD),
    aiStandard: buildStandard('AI Standard', AI_STANDARD)
  };
}

function countStandardItems(standards) {
  return Object.values(standards)
    .reduce((total, standard) => total + (standard.required?.length || 0), 0);
}

function validateConstitutionStandards(standards = buildConstitutionStandards()) {
  const missing = Object.entries(standards)
    .filter(([, standard]) => !Array.isArray(standard.required) || standard.required.length === 0)
    .map(([key]) => key);

  return {
    system: 'SHEIKHA_ENTERPRISE_CONSTITUTION_VALIDATOR_V1',
    status: missing.length ? 'BLOCKED' : 'PASSED',
    standards: Object.keys(standards).length,
    requiredItems: countStandardItems(standards),
    missing
  };
}

function buildEnterpriseConstitutionV1(options = {}) {
  const enterpriseOperatingSystem = options.enterpriseOperatingSystem ||
    buildEnterpriseOperatingSystemV11(options);
  const standards = buildConstitutionStandards();
  const validation = validateConstitutionStandards(standards);
  const constitutionReady = validation.status === 'PASSED' &&
    enterpriseOperatingSystem.status === 'ACTIVE';
  const commercialEvidenceReady =
    enterpriseOperatingSystem.readiness?.commercialLaunchReady === true;

  return {
    system: 'SHEIKHA_ENTERPRISE_CONSTITUTION_V1',
    status: constitutionReady ? 'ACTIVE' : 'REVIEW',
    mode: 'GOVERNED_PLATFORM_CONSTITUTION',
    decision: constitutionReady
      ? commercialEvidenceReady
        ? 'CONSTITUTION_ACTIVE_READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH'
        : 'CONSTITUTION_ACTIVE_COMMERCIAL_EVIDENCE_REQUIRED'
      : 'CONSTITUTION_REVIEW_REQUIRED',
    purpose: 'Govern every future Sheikha component through fixed enterprise principles, standards, lifecycle, and council review.',
    permanentPrinciples: PERMANENT_PRINCIPLES,
    standards,
    validation,
    governanceCouncil: {
      status: 'ACTIVE',
      scope: GOVERNANCE_COUNCIL_SCOPE,
      mandate: 'Review major changes in architecture, data models, contracts, policies, releases, security, compliance, and commercial launch.'
    },
    executivePrograms: EXECUTIVE_PROGRAMS.map((program, index) => ({
      order: index + 1,
      name: program,
      status: program === 'Commercial Readiness' && !commercialEvidenceReady
        ? 'EVIDENCE_PENDING'
        : 'ACTIVE'
    })),
    linkedLayers: {
      enterpriseOperatingSystemV11: enterpriseOperatingSystem.status,
      enterpriseOperatingSystemDecision: enterpriseOperatingSystem.decision,
      commercialLaunchReady: commercialEvidenceReady,
      currentReleaseStage: enterpriseOperatingSystem.enterpriseReleaseFabric?.currentStage || 'UNKNOWN'
    },
    enforcement: {
      noUnregisteredModule: true,
      noUncontractedCapability: true,
      noUnversionedApi: true,
      noUnregisteredEvent: true,
      noDuplicateCanonicalEntity: true,
      noHighImpactActionWithoutHumanApproval: true,
      coreMutationRequiresMajorRelease: true,
      commercialLaunchRequiresEvidenceGate: true
    },
    roadmap: [
      'Use the constitution as the review gate for all new modules and capabilities.',
      'Consolidate registries, contracts, and interfaces before adding new core engines.',
      'Complete CRM, sales, contracts, invoices, subscriptions, and customer portal evidence.',
      'Complete backup, rollback, monitoring, and incident management evidence.',
      'Launch controlled market validation only after evidence passes.'
    ],
    governance: {
      readOnly: true,
      noExternalMutation: true,
      noServiceRestart: true,
      noKernelModification: true,
      noPrivilegeEscalation: true,
      noUnsupportedCommercialClaims: true,
      humanApprovalRequiredForConstitutionChange: true,
      humanApprovalRequiredForCommercialLaunch: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار',
      tawhid: 'الله وحده لا شريك له'
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  PERMANENT_PRINCIPLES,
  MODULE_STANDARD,
  CAPABILITY_STANDARD,
  API_STANDARD,
  EVENT_STANDARD,
  GOVERNANCE_FLOW_STANDARD,
  UX_STANDARD,
  QUALITY_STANDARD,
  RELEASE_STANDARD,
  OPERATIONS_STANDARD,
  BUSINESS_STANDARD,
  AI_STANDARD,
  CANONICAL_ENTITIES,
  GOVERNANCE_COUNCIL_SCOPE,
  EXECUTIVE_PROGRAMS,
  buildStandard,
  buildConstitutionStandards,
  validateConstitutionStandards,
  buildEnterpriseConstitutionV1
};
