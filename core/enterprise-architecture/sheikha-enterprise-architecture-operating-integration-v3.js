'use strict';

const {
  getEnterpriseArchitecture,
  getArchitectureLayerById,
  getArchitectureRegistry,
  getArchitectureRelationshipGraph,
  validateEnterpriseArchitecture
} = require('./sheikha-enterprise-architecture');

const {
  getEnterpriseDomains,
  evaluateEnterpriseKernel
} = require('../enterprise-kernel/sheikha-enterprise-kernel-v1');

const {
  getSheikhaCivilizationSystem,
  evaluateCivilizationReadiness
} = require('../sheikha-civilization/sheikha-civilization-kingdom-global-trade');

const {
  buildFederationOperatingFabricStatus
} = require('../federation-operating-fabric-integration/sheikha-federation-operating-fabric-integration-v9');

const organizationalHierarchy = Object.freeze([
  {
    level: 'L00',
    id: 'islamic-reference-layer',
    role: 'values-reference',
    arabicRole: 'مرجعية القيم',
    scope: 'values-guidance-only'
  },
  {
    level: 'L01',
    id: 'constitution',
    role: 'constitutional-governance',
    arabicRole: 'الحوكمة الدستورية',
    scope: 'internal-platform-governance'
  },
  {
    level: 'L02',
    id: 'ummah-benefit-value-layer',
    role: 'benefit-and-no-harm',
    arabicRole: 'نفع أمة محمد ﷺ والناس',
    scope: 'benefit-guidance-without-religious-authority'
  },
  {
    level: 'L03',
    id: 'universal-scientific-methodology-layer',
    role: 'scientific-methodology',
    arabicRole: 'المنهج العلمي',
    scope: 'evidence-measurement-validation'
  },
  {
    level: 'L04',
    id: 'civilization',
    role: 'strategic-civilization-identity',
    arabicRole: 'الحضارة',
    scope: 'strategic-identity'
  },
  {
    level: 'L05',
    id: 'ecosystem',
    role: 'ecosystem-operating-model',
    arabicRole: 'المنظومة',
    scope: 'cross-domain-operating-model'
  },
  {
    level: 'L06',
    id: 'kingdom',
    role: 'administrative-operating-framework',
    arabicRole: 'المملكة التشغيلية',
    scope: 'internal-administrative-organization'
  },
  {
    level: 'L07',
    id: 'commerce-supreme-council',
    role: 'executive-priority-and-risk-review',
    arabicRole: 'المجلس الأعلى',
    scope: 'strategy-priority-risk-value'
  },
  {
    level: 'L08',
    id: 'global-commerce-federation',
    role: 'federated-commerce-coordination',
    arabicRole: 'الاتحاد',
    scope: 'multi-entity-coordination'
  },
  {
    level: 'L09',
    id: 'federation-of-commerce-ecosystems',
    role: 'ecosystem-federation',
    arabicRole: 'اتحاد المنظومات',
    scope: 'sector-region-partner-federation'
  },
  {
    level: 'L10',
    id: 'commerce-emirates',
    role: 'domain-operating-units',
    arabicRole: 'الإمارات التشغيلية',
    scope: 'internal-domain-units'
  },
  {
    level: 'L11',
    id: 'commerce-ministries',
    role: 'functional-management',
    arabicRole: 'الإدارات والوزارات التشغيلية',
    scope: 'administrative-functional-management'
  },
  {
    level: 'L12',
    id: 'commerce-authorities',
    role: 'technical-and-regulatory-authorities',
    arabicRole: 'الهيئات الفنية والحوكمية',
    scope: 'quality-data-risk-compliance'
  },
  {
    level: 'L13',
    id: 'commerce-os',
    role: 'runtime-operating-system',
    arabicRole: 'نظام التشغيل',
    scope: 'workflow-service-orchestration'
  },
  {
    level: 'L14',
    id: 'internal-integration-layer',
    role: 'internal-systems-integration',
    arabicRole: 'التكامل الداخلي',
    scope: 'engines-registries-apis-events'
  },
  {
    level: 'L15',
    id: 'external-integration-layer',
    role: 'approved-external-integration',
    arabicRole: 'التكامل الخارجي',
    scope: 'authorized-partner-customer-supplier-integration'
  },
  {
    level: 'L16',
    id: 'universal-integration-fabric',
    role: 'universal-integration-fabric',
    arabicRole: 'نسيج التكامل الشامل',
    scope: 'local-national-regional-international-partner'
  }
]);

const operatingPillars = Object.freeze([
  {
    id: 'administrative-organization',
    arabicName: 'التنظيم الإداري',
    owns: ['kingdom', 'commerce-supreme-council', 'commerce-emirates', 'commerce-ministries', 'commerce-authorities'],
    outputs: ['mandates', 'roles', 'responsibilities', 'delegation-map', 'escalation-path']
  },
  {
    id: 'technical-organization',
    arabicName: 'التنظيم الفني',
    owns: ['commerce-os', 'global-commerce-infrastructure', 'internal-integration-layer', 'external-integration-layer', 'universal-integration-fabric'],
    outputs: ['runtime-map', 'api-map', 'integration-map', 'service-boundaries', 'observability-contract']
  },
  {
    id: 'scientific-organization',
    arabicName: 'التنظيم العلمي',
    owns: ['universal-scientific-methodology-layer', 'planning-analysis-layer', 'product-knowledge-fabric', 'value-operating-system'],
    outputs: ['evidence-model', 'measurement-method', 'knowledge-map', 'experimentation-cycle', 'improvement-loop']
  },
  {
    id: 'governance-organization',
    arabicName: 'التنظيم الحوكمي',
    owns: ['islamic-reference-layer', 'constitution', 'ummah-benefit-value-layer', 'religion-renewal-service-layer'],
    outputs: ['policy-baseline', 'no-harm-gate', 'review-boundaries', 'audit-trail', 'human-review-gate']
  },
  {
    id: 'federation-organization',
    arabicName: 'تنظيم الاتحاد والتوسع',
    owns: ['global-commerce-federation', 'federation-of-commerce-ecosystems', 'arabian-peninsula-federation-layer', 'arabian-gulf-cooperation-layer'],
    outputs: ['federation-map', 'relationship-map', 'capability-map', 'compatibility-map', 'expansion-gate']
  }
]);

const emirateOperatingUnits = Object.freeze([
  {
    id: 'commerce-emirate',
    arabicName: 'إمارة التجارة',
    domain: 'commerce',
    governedBy: 'commerce-emirates',
    technicalAuthority: 'commerce-authorities',
    scientificSupport: 'universal-scientific-methodology-layer',
    outputs: ['market-rules', 'trade-workflows', 'supplier-buyer-coordination']
  },
  {
    id: 'knowledge-emirate',
    arabicName: 'إمارة المعرفة والعلوم',
    domain: 'knowledge',
    governedBy: 'commerce-emirates',
    technicalAuthority: 'product-knowledge-fabric',
    scientificSupport: 'universal-scientific-methodology-layer',
    outputs: ['knowledge-registries', 'research-evidence', 'learning-loop']
  },
  {
    id: 'technology-emirate',
    arabicName: 'إمارة التقنية والتكامل',
    domain: 'technology',
    governedBy: 'commerce-emirates',
    technicalAuthority: 'internal-integration-layer',
    scientificSupport: 'planning-analysis-layer',
    outputs: ['runtime-integration', 'api-integration', 'sdk-mcp-fabric']
  },
  {
    id: 'value-emirate',
    arabicName: 'إمارة القيمة والأثر',
    domain: 'value',
    governedBy: 'commerce-emirates',
    technicalAuthority: 'value-operating-system',
    scientificSupport: 'planning-analysis-layer',
    outputs: ['impact-measurement', 'benefit-score', 'continuous-improvement']
  }
]);

function layer(id) {
  return getArchitectureLayerById(id);
}

function hydrateHierarchy() {
  return organizationalHierarchy.map((item) => ({
    ...item,
    layer: layer(item.id),
    status: layer(item.id)?.status || 'MISSING'
  }));
}

function hydratePillars() {
  return operatingPillars.map((pillar) => {
    const layers = pillar.owns.map((id) => layer(id)).filter(Boolean);

    return {
      ...pillar,
      layers: layers.map((item) => ({
        id: item.id,
        name: item.name,
        arabicName: item.arabicName,
        status: item.status,
        capabilities: item.capabilities
      })),
      coverage: {
        expected: pillar.owns.length,
        present: layers.length,
        ready: layers.length === pillar.owns.length
      }
    };
  });
}

function buildIntegrationContracts() {
  return [
    {
      from: 'الحضارة',
      to: 'المملكة التشغيلية',
      contract: 'Vision -> Operating Model',
      evidence: ['civilization', 'ecosystem', 'kingdom']
    },
    {
      from: 'المملكة التشغيلية',
      to: 'الإمارات التشغيلية',
      contract: 'Operating Model -> Domain Units',
      evidence: ['kingdom', 'commerce-supreme-council', 'commerce-emirates']
    },
    {
      from: 'الإمارة',
      to: 'الوزارات والهيئات',
      contract: 'Domain Unit -> Functional Management and Technical Authority',
      evidence: ['commerce-emirates', 'commerce-ministries', 'commerce-authorities']
    },
    {
      from: 'المنهج العلمي',
      to: 'التنفيذ الفني',
      contract: 'Evidence -> Measurement -> Runtime Integration',
      evidence: ['universal-scientific-methodology-layer', 'planning-analysis-layer', 'commerce-os']
    },
    {
      from: 'التكامل الداخلي',
      to: 'التكامل الخارجي',
      contract: 'Internal Readiness -> Approved External Interoperability',
      evidence: ['internal-integration-layer', 'external-integration-layer', 'universal-integration-fabric']
    }
  ];
}

function evaluateOperatingIntegration() {
  const validation = validateEnterpriseArchitecture();
  const architecture = getEnterpriseArchitecture();
  const registry = getArchitectureRegistry();
  const relationshipGraph = getArchitectureRelationshipGraph();
  const kernel = evaluateEnterpriseKernel();
  const civilization = getSheikhaCivilizationSystem();
  const civilizationReadiness = evaluateCivilizationReadiness();
  const federationStatus = buildFederationOperatingFabricStatus();
  const hierarchy = hydrateHierarchy();
  const pillars = hydratePillars();
  const missingHierarchy = hierarchy.filter((item) => item.status === 'MISSING');
  const uncoveredPillars = pillars.filter((item) => !item.coverage.ready);
  const score = Math.round((
    (validation.valid ? 100 : 60) +
    (kernel.score || 0) +
    (civilizationReadiness.score || 0) +
    (federationStatus.status === 'ACTIVE' ? 100 : 70) +
    (missingHierarchy.length === 0 ? 100 : 70) +
    (uncoveredPillars.length === 0 ? 100 : 70)
  ) / 6);

  return {
    system: 'SHEIKHA_ENTERPRISE_ARCHITECTURE_OPERATING_INTEGRATION_V3',
    status: score >= 95 ? 'ACTIVE_100_INTEGRATED' : 'NEEDS_REVIEW',
    score,
    mode: 'ADMINISTRATIVE_TECHNICAL_SCIENTIFIC_GOVERNED_INTEGRATION',
    architecture: {
      system: architecture.system,
      version: architecture.version,
      layers: registry.length,
      relationships: relationshipGraph.length,
      validation
    },
    hierarchy,
    pillars,
    emirates: emirateOperatingUnits,
    contracts: buildIntegrationContracts(),
    linkedSystems: {
      enterpriseKernel: {
        system: kernel.system,
        status: kernel.status,
        score: kernel.score
      },
      civilizationSystem: {
        system: civilization.system,
        status: civilization.status,
        readiness: civilizationReadiness.status,
        score: civilizationReadiness.score
      },
      federationOperatingFabric: {
        system: federationStatus.system,
        status: federationStatus.status,
        readiness: federationStatus.readiness
      }
    },
    governance: {
      internalArchitectureTermsOnly: true,
      noGovernmentalAuthorityClaim: true,
      noSovereignAuthorityClaim: true,
      noReligiousAuthorityClaim: true,
      valuesGuidanceOnly: true,
      humanReviewForHighImpact: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار'
    },
    nextActions: [
      'Expose the operating integration map in the Architecture Explorer.',
      'Link each Emirate operating unit to measurable KPIs and evidence.',
      'Attach Enterprise Inspector read-only evidence for V3 status.',
      'Keep external integrations behind agreements, credentials, and human approval.'
    ],
    timestamp: new Date().toISOString()
  };
}

function getOperatingIntegrationStatus() {
  const result = evaluateOperatingIntegration();

  return {
    system: result.system,
    status: result.status,
    score: result.score,
    mode: result.mode,
    hierarchyLevels: result.hierarchy.length,
    pillars: result.pillars.length,
    emirates: result.emirates.length,
    contracts: result.contracts.length,
    governance: result.governance,
    timestamp: result.timestamp
  };
}

module.exports = {
  organizationalHierarchy,
  operatingPillars,
  emirateOperatingUnits,
  hydrateHierarchy,
  hydratePillars,
  buildIntegrationContracts,
  evaluateOperatingIntegration,
  getOperatingIntegrationStatus
};
