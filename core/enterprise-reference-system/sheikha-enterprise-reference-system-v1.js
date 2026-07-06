'use strict';

const {
  CANONICAL_ENTITIES,
  buildEnterpriseConstitutionV1
} = require('../enterprise-constitution/sheikha-enterprise-constitution-v1');

const REFERENCE_QUESTIONS = Object.freeze([
  'What is it?',
  'Why does it exist?',
  'What does it integrate with?',
  'How is it governed?'
]);

const REFERENCE_ARCHITECTURE_LAYERS = Object.freeze([
  'Business Layer',
  'Application Layer',
  'Capability Layer',
  'Service Layer',
  'Platform Layer',
  'Runtime Layer',
  'Infrastructure Layer'
]);

const REFERENCE_CONTRACTS = Object.freeze([
  'Entity Contract',
  'API Contract',
  'Event Contract',
  'Capability Contract',
  'Module Contract',
  'Plugin Contract',
  'SDK Contract',
  'Policy Contract',
  'Release Contract'
]);

const ENTERPRISE_REGISTRY_GROUPS = Object.freeze([
  'Modules',
  'Services',
  'Capabilities',
  'APIs',
  'Events',
  'Policies',
  'Contracts',
  'Templates',
  'SDKs',
  'AI Agents',
  'Pipelines',
  'Releases'
]);

const REFERENCE_DOMAINS = Object.freeze([
  'Identity',
  'Governance',
  'Security',
  'Commerce',
  'Marketplace',
  'Supply Chain',
  'Finance',
  'Knowledge',
  'AI',
  'Operations',
  'Developer Experience',
  'Analytics'
]);

const EXTENDED_CANONICAL_DATA = Object.freeze([
  'Organization',
  'Workspace',
  'Department',
  'User',
  'Role',
  'Permission',
  'Customer',
  'Supplier',
  'Product',
  'Order',
  'Invoice',
  'Payment',
  'Contract',
  'Subscription',
  'Shipment',
  'Knowledge',
  'Audit'
]);

const REFERENCE_EVENT_SHAPE = Object.freeze([
  'Metadata',
  'Payload',
  'Schema Version',
  'Producer',
  'Consumers',
  'Audit'
]);

const REFERENCE_SECURITY_REQUIREMENTS = Object.freeze([
  'Authentication',
  'Authorization',
  'Secrets',
  'Encryption',
  'Audit',
  'Rate Limits'
]);

const REFERENCE_OBSERVABILITY_REQUIREMENTS = Object.freeze([
  'Health',
  'Metrics',
  'Logs',
  'Traces',
  'Alerts'
]);

const REFERENCE_AI_REQUIREMENTS = Object.freeze([
  'Purpose',
  'Permission Boundaries',
  'Context Sources',
  'Governance Policies',
  'Audit Mechanism',
  'Human Review For High Impact'
]);

const REFERENCE_RELEASE_STAGES = Object.freeze([
  'Architecture Freeze',
  'Contract Freeze',
  'Feature Freeze',
  'Release Candidate',
  'Controlled Staging',
  'Production',
  'Long-Term Support'
]);

const REFERENCE_QUALITY_GATES = Object.freeze([
  'Architecture Review',
  'Contract Review',
  'Security Review',
  'Performance Review',
  'Documentation Review',
  'Test Review'
]);

const REFERENCE_COMMERCIAL_REQUIREMENTS = Object.freeze([
  'Target Market',
  'Customer Segments',
  'Pricing Model',
  'Subscription Model',
  'Support Model',
  'SLA',
  'KPIs'
]);

const REFERENCE_PROGRAMS = Object.freeze([
  'Architecture Consolidation',
  'Contract Standardization',
  'Commercial Platform',
  'Operations Excellence',
  'Developer Ecosystem',
  'Controlled Market Launch'
]);

function buildReferenceSection(name, items, constitutionStandardKey) {
  return {
    name,
    status: items.length ? 'ACTIVE' : 'EMPTY',
    items,
    constitutionStandardKey,
    enforcement: 'REFERENCE_REQUIRED_FOR_NEW_COMPONENTS'
  };
}

function buildEnterpriseReferenceSections() {
  return {
    architecture: buildReferenceSection(
      'Enterprise Reference Architecture',
      REFERENCE_ARCHITECTURE_LAYERS,
      'moduleStandard'
    ),
    contracts: buildReferenceSection(
      'Enterprise Reference Contracts',
      REFERENCE_CONTRACTS,
      'capabilityStandard'
    ),
    registry: buildReferenceSection(
      'Enterprise Reference Registry',
      ENTERPRISE_REGISTRY_GROUPS,
      'moduleStandard'
    ),
    domains: buildReferenceSection(
      'Enterprise Reference Domains',
      REFERENCE_DOMAINS,
      'dataStandard'
    ),
    data: buildReferenceSection(
      'Enterprise Reference Data',
      EXTENDED_CANONICAL_DATA,
      'dataStandard'
    ),
    events: buildReferenceSection(
      'Enterprise Reference Events',
      REFERENCE_EVENT_SHAPE,
      'eventStandard'
    ),
    security: buildReferenceSection(
      'Enterprise Reference Security',
      REFERENCE_SECURITY_REQUIREMENTS,
      'governanceStandard'
    ),
    observability: buildReferenceSection(
      'Enterprise Reference Observability',
      REFERENCE_OBSERVABILITY_REQUIREMENTS,
      'operationsStandard'
    ),
    ai: buildReferenceSection(
      'Enterprise Reference AI',
      REFERENCE_AI_REQUIREMENTS,
      'aiStandard'
    ),
    release: buildReferenceSection(
      'Enterprise Reference Release',
      REFERENCE_RELEASE_STAGES,
      'releaseStandard'
    ),
    quality: buildReferenceSection(
      'Enterprise Reference Quality',
      REFERENCE_QUALITY_GATES,
      'qualityStandard'
    ),
    commercial: buildReferenceSection(
      'Enterprise Reference Commercial',
      REFERENCE_COMMERCIAL_REQUIREMENTS,
      'businessStandard'
    )
  };
}

function buildReferenceContractsIndex(sections = buildEnterpriseReferenceSections()) {
  return REFERENCE_CONTRACTS.map((contract, index) => ({
    id: `REF-CONTRACT-${String(index + 1).padStart(3, '0')}`,
    name: contract,
    requiredFor: [
      'new-modules',
      'new-services',
      'new-capabilities',
      'public-apis'
    ],
    governedBy: sections.contracts.name,
    status: 'ACTIVE'
  }));
}

function buildReferenceDomainIndex(sections = buildEnterpriseReferenceSections()) {
  return REFERENCE_DOMAINS.map((domain, index) => ({
    id: `REF-DOMAIN-${String(index + 1).padStart(3, '0')}`,
    name: domain,
    creationPolicy: 'ARCHITECTURE_DECISION_REQUIRED_FOR_NEW_DOMAIN',
    governedBy: sections.domains.name,
    status: 'ACTIVE'
  }));
}

function countReferenceItems(sections) {
  return Object.values(sections)
    .reduce((total, section) => total + (section.items?.length || 0), 0);
}

function validateEnterpriseReferenceSystem(sections = buildEnterpriseReferenceSections()) {
  const missing = Object.entries(sections)
    .filter(([, section]) => !Array.isArray(section.items) || section.items.length === 0)
    .map(([key]) => key);

  const missingCanonical = EXTENDED_CANONICAL_DATA
    .filter((entity) => !CANONICAL_ENTITIES.includes(entity) &&
      !['Department', 'User', 'Role', 'Permission'].includes(entity));

  return {
    system: 'SHEIKHA_ENTERPRISE_REFERENCE_SYSTEM_VALIDATOR_V1',
    status: missing.length || missingCanonical.length ? 'BLOCKED' : 'PASSED',
    sections: Object.keys(sections).length,
    requiredItems: countReferenceItems(sections),
    missing,
    missingCanonical
  };
}

function buildEnterpriseReferenceSystemV1(options = {}) {
  const enterpriseConstitution = options.enterpriseConstitution ||
    buildEnterpriseConstitutionV1(options);
  const sections = buildEnterpriseReferenceSections();
  const validation = validateEnterpriseReferenceSystem(sections);
  const referenceReady = validation.status === 'PASSED' &&
    enterpriseConstitution.status === 'ACTIVE';
  const commercialLaunchReady =
    enterpriseConstitution.linkedLayers?.commercialLaunchReady === true;

  return {
    system: 'SHEIKHA_ENTERPRISE_REFERENCE_SYSTEM_V1',
    status: referenceReady ? 'ACTIVE' : 'REVIEW',
    mode: 'GOVERNED_ENTERPRISE_REFERENCE_SYSTEM',
    decision: referenceReady
      ? commercialLaunchReady
        ? 'REFERENCE_SYSTEM_ACTIVE_READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH'
        : 'REFERENCE_SYSTEM_ACTIVE_COMMERCIAL_EVIDENCE_REQUIRED'
      : 'REFERENCE_SYSTEM_REVIEW_REQUIRED',
    purpose: 'Provide one reference model for Sheikha architecture, contracts, registries, domains, data, events, security, observability, AI, release, quality, and commercial readiness.',
    referenceQuestions: REFERENCE_QUESTIONS,
    sections,
    contractIndex: buildReferenceContractsIndex(sections),
    domainIndex: buildReferenceDomainIndex(sections),
    validation,
    linkedLayers: {
      enterpriseConstitutionV1: enterpriseConstitution.status,
      enterpriseConstitutionDecision: enterpriseConstitution.decision,
      enterpriseOperatingSystemV11:
        enterpriseConstitution.linkedLayers?.enterpriseOperatingSystemV11 || 'UNKNOWN',
      commercialLaunchReady,
      currentReleaseStage:
        enterpriseConstitution.linkedLayers?.currentReleaseStage || 'UNKNOWN'
    },
    enforcement: {
      everyComponentMustDeclareReferenceLayer: true,
      everyComponentMustDeclarePurpose: true,
      everyComponentMustDeclareIntegrations: true,
      everyComponentMustDeclareGovernance: true,
      noUnreferencedDomainCreation: true,
      noDivergentContractModel: true,
      noCanonicalDataDuplication: true,
      noEventWithoutMetadataPayloadSchemaProducerConsumersAudit: true,
      noServiceWithoutSecurityObservabilityQualityReleaseReference: true,
      commercialLaunchRequiresEvidenceGate: true
    },
    roadmap: REFERENCE_PROGRAMS.map((program, index) => ({
      order: index + 1,
      name: program,
      status: program === 'Commercial Platform' && !commercialLaunchReady
        ? 'EVIDENCE_PENDING'
        : 'ACTIVE'
    })),
    governance: {
      readOnly: true,
      referenceOnly: true,
      noExternalMutation: true,
      noServiceRestart: true,
      noKernelModification: true,
      noPrivilegeEscalation: true,
      noUnsupportedCommercialClaims: true,
      humanApprovalRequiredForNewDomain: true,
      humanApprovalRequiredForContractBreakingChange: true,
      humanApprovalRequiredForCommercialLaunch: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار',
      tawhid: 'الله وحده لا شريك له'
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  REFERENCE_QUESTIONS,
  REFERENCE_ARCHITECTURE_LAYERS,
  REFERENCE_CONTRACTS,
  ENTERPRISE_REGISTRY_GROUPS,
  REFERENCE_DOMAINS,
  EXTENDED_CANONICAL_DATA,
  REFERENCE_EVENT_SHAPE,
  REFERENCE_SECURITY_REQUIREMENTS,
  REFERENCE_OBSERVABILITY_REQUIREMENTS,
  REFERENCE_AI_REQUIREMENTS,
  REFERENCE_RELEASE_STAGES,
  REFERENCE_QUALITY_GATES,
  REFERENCE_COMMERCIAL_REQUIREMENTS,
  REFERENCE_PROGRAMS,
  buildReferenceSection,
  buildEnterpriseReferenceSections,
  buildReferenceContractsIndex,
  buildReferenceDomainIndex,
  validateEnterpriseReferenceSystem,
  buildEnterpriseReferenceSystemV1
};
