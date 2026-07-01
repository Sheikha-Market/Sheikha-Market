'use strict';

const layers = Object.freeze([
  {
    id: 'islamic-reference-layer',
    name: 'Islamic Reference Layer',
    arabicName: 'الدين الإسلامي',
    status: 'ACTIVE',
    healthScore: 100,
    purpose:
      'A values reference layer inspired by the Quran and Sunnah to guide justice, trust, honesty, fulfillment of contracts, no harm, and beneficial commerce.',
    responsibilities: ['values-reference', 'justice', 'trust', 'contract-fulfillment', 'no-harm'],
    capabilities: ['ethical-reference', 'value-guidance', 'principle-alignment'],
    dependencies: []
  },
  {
    id: 'constitution',
    name: 'Constitution',
    arabicName: 'الدستور',
    status: 'ACTIVE',
    healthScore: 100,
    purpose: 'Defines vision, principles, governance, quality, risk, value, and improvement rules.',
    responsibilities: ['vision', 'principles', 'governance', 'risk', 'value'],
    capabilities: ['policy-reference', 'governance-baseline', 'value-alignment'],
    dependencies: ['islamic-reference-layer']
  },
  {
    id: 'ummah-benefit-value-layer',
    name: 'Ummah of Muhammad Benefit & Value Layer',
    arabicName: 'أمة محمد ﷺ',
    status: 'ACTIVE',
    healthScore: 100,
    purpose: 'Guides beneficial value for the Ummah of Muhammad ﷺ and for all people through justice, trust, no harm, beneficial commerce, and public good.',
    responsibilities: ['ethics', 'benefit', 'trust', 'no-harm'],
    capabilities: ['ethical-guidance', 'benefit-orientation', 'no-harm-check'],
    dependencies: ['constitution']
  },
  {
    id: 'universal-scientific-methodology-layer',
    name: 'Universal Scientific Methodology Layer',
    arabicName: 'طبقة المناهج العلمية الكونية',
    status: 'ACTIVE',
    healthScore: 100,
    purpose:
      'Connects Sheikha architecture with rigorous scientific methodologies across mathematics, logic, economics, commerce, engineering, computing, data, AI, statistics, supply chain, quality, risk, governance, ethics, and continuous improvement.',
    responsibilities: [
      'scientific-method-alignment',
      'evidence-based-reasoning',
      'measurement',
      'experimentation',
      'validation',
      'continuous-improvement'
    ],
    capabilities: [
      'scientific-method-registry',
      'cross-discipline-mapping',
      'evidence-scoring',
      'hypothesis-validation',
      'measurement-framework',
      'decision-quality-check'
    ],
    dependencies: ['ummah-benefit-value-layer']
  },
  {
    id: 'civilization',
    name: 'Saudi Global Commerce Civilization',
    arabicName: 'الحضارة السعودية للتجارة العالمية',
    status: 'ACTIVE',
    healthScore: 100,
    purpose: 'Represents the highest strategic identity of Sheikha.',
    responsibilities: ['identity', 'strategic-direction'],
    capabilities: ['civilization-positioning', 'global-commerce-vision'],
    dependencies: ['universal-scientific-methodology-layer']
  },
  {
    id: 'ecosystem',
    name: 'Global Commerce Ecosystem',
    arabicName: 'منظومة التجارة العالمية',
    status: 'ACTIVE',
    healthScore: 100,
    purpose: 'Unifies commerce, industry, supply chains, services, knowledge, and value.',
    responsibilities: ['ecosystem-structure', 'cross-domain-alignment'],
    capabilities: ['ecosystem-map', 'domain-alignment'],
    dependencies: ['civilization']
  },
  {
    id: 'kingdom',
    name: 'Commerce Kingdom',
    arabicName: 'مملكة التجارة والاقتصاد',
    status: 'ACTIVE',
    healthScore: 100,
    purpose: 'Internal operating framework for commerce and economy domains.',
    responsibilities: ['operating-structure', 'coordination'],
    capabilities: ['kingdom-operating-model', 'strategic-coordination'],
    dependencies: ['ecosystem']
  },
  {
    id: 'arabian-peninsula-federation-layer',
    name: 'Arabian Peninsula Federation Layer',
    arabicName: 'اتحاد الجزيرة العربية',
    status: 'ACTIVE',
    healthScore: 100,
    purpose:
      'An internal regional architecture layer for organizing cooperation, interoperability, trade alignment, and economic coordination across the Arabian Peninsula context within Sheikha.',
    responsibilities: ['regional-cooperation', 'trade-alignment', 'interoperability', 'economic-coordination'],
    capabilities: ['arabian-peninsula-federation', 'regional-standards-alignment', 'cross-border-commerce-model'],
    dependencies: ['kingdom']
  },
  {
    id: 'arabian-gulf-cooperation-layer',
    name: 'Arabian Gulf Cooperation Layer',
    arabicName: 'طبقة الخليج العربي',
    status: 'ACTIVE',
    healthScore: 100,
    purpose:
      'An internal regional architecture layer for Gulf commerce integration, logistics interoperability, shared services, and digital trade coordination within Sheikha.',
    responsibilities: ['gulf-integration', 'logistics-alignment', 'shared-services', 'digital-interoperability'],
    capabilities: ['gulf-commerce-integration', 'gulf-logistics-alignment', 'regional-shared-services'],
    dependencies: ['arabian-peninsula-federation-layer']
  },
  {
    id: 'commerce-supreme-council',
    name: 'Commerce Supreme Council',
    arabicName: 'المجلس الأعلى للتجارة والاقتصاد',
    status: 'ACTIVE',
    healthScore: 100,
    purpose: 'Coordinates strategy, priorities, governance, risk, and value.',
    responsibilities: ['strategy', 'priorities', 'risk', 'value-governance'],
    capabilities: ['strategic-review', 'priority-setting', 'governance-review'],
    dependencies: ['arabian-gulf-cooperation-layer']
  },
  {
    id: 'global-commerce-federation',
    name: 'Global Commerce Federation',
    arabicName: 'اتحاد التجارة العالمي',
    status: 'ACTIVE',
    healthScore: 100,
    purpose: 'Coordinates independent commerce entities while preserving their autonomy.',
    responsibilities: ['federation', 'coordination', 'interoperability'],
    capabilities: ['federation-registry', 'entity-coordination', 'interoperability-rules'],
    dependencies: ['commerce-supreme-council']
  },
  {
    id: 'federation-of-commerce-ecosystems',
    name: 'Federation of Commerce Ecosystems',
    arabicName: 'اتحاد منظومات التجارة',
    status: 'ACTIVE',
    healthScore: 100,
    purpose: 'Federates multiple commerce ecosystems across sectors, regions, and partners.',
    responsibilities: ['ecosystem-federation', 'multi-party-coordination'],
    capabilities: ['ecosystem-federation-map', 'partner-ecosystem-alignment'],
    dependencies: ['global-commerce-federation']
  },
  {
    id: 'commerce-emirates',
    name: 'Commerce Emirates',
    arabicName: 'إمارات التجارة',
    status: 'ACTIVE',
    healthScore: 100,
    purpose: 'Internal operating units for domains, markets, cities, or sectors.',
    responsibilities: ['domain-operation', 'localized-coordination'],
    capabilities: ['emirate-operating-unit', 'domain-governance'],
    dependencies: ['federation-of-commerce-ecosystems']
  },
  {
    id: 'commerce-ministries',
    name: 'Commerce Ministries',
    arabicName: 'الوزارات التشغيلية',
    status: 'ACTIVE',
    healthScore: 100,
    purpose: 'Functional internal operating ministries for markets, value, knowledge, trust, and sustainability.',
    responsibilities: ['functional-operations', 'service-grouping'],
    capabilities: ['market-ministry', 'value-ministry', 'knowledge-ministry', 'trust-ministry'],
    dependencies: ['commerce-emirates']
  },
  {
    id: 'commerce-authorities',
    name: 'Commerce Authorities',
    arabicName: 'الهيئات التشغيلية',
    status: 'ACTIVE',
    healthScore: 100,
    purpose: 'Specialized internal authorities for data, quality, contracts, risk, and compliance.',
    responsibilities: ['quality', 'data', 'contracts', 'risk', 'compliance'],
    capabilities: ['data-authority', 'quality-authority', 'contract-authority', 'risk-authority'],
    dependencies: ['commerce-ministries']
  },
  {
    id: 'commerce-os',
    name: 'Sheikha Commerce OS',
    arabicName: 'نظام تشغيل شيخة للتجارة',
    status: 'ACTIVE',
    healthScore: 100,
    purpose: 'Operating system layer for digital commerce capabilities.',
    responsibilities: ['runtime', 'commerce-services', 'workflow'],
    capabilities: ['commerce-runtime', 'workflow-engine', 'service-orchestration'],
    dependencies: ['commerce-authorities']
  },
  {
    id: 'global-commerce-infrastructure',
    name: 'Global Commerce Infrastructure',
    arabicName: 'البنية الرقمية للتجارة العالمية',
    status: 'ACTIVE',
    healthScore: 100,
    purpose: 'Digital infrastructure for commerce, industry, supply chains, and integrations.',
    responsibilities: ['infrastructure', 'connectivity', 'scalability'],
    capabilities: ['api-infrastructure', 'integration-backbone', 'scalable-services'],
    dependencies: ['commerce-os']
  },
  {
    id: 'internal-integration-layer',
    name: 'Internal Integration Layer',
    arabicName: 'طبقة التكامل الداخلي',
    status: 'ACTIVE',
    healthScore: 100,
    purpose:
      'Coordinates integration between Sheikha internal engines, registries, APIs, event bus, governance, runtime, data, AI, and architecture layers.',
    responsibilities: ['internal-systems-integration', 'registry-alignment', 'api-coordination', 'event-bus-coordination'],
    capabilities: ['internal-api-integration', 'engine-coordination', 'registry-synchronization', 'runtime-alignment'],
    dependencies: ['global-commerce-infrastructure']
  },
  {
    id: 'external-integration-layer',
    name: 'External Integration Layer',
    arabicName: 'طبقة التكامل الخارجي',
    status: 'ACTIVE',
    healthScore: 100,
    purpose:
      'Coordinates authorized external integrations with partners, markets, customers, suppliers, ERP, CRM, government systems where formally allowed, and international systems through approved APIs and agreements.',
    responsibilities: ['partner-integration', 'customer-integration', 'supplier-integration', 'approved-external-apis'],
    capabilities: ['partner-api-integration', 'erp-crm-integration', 'marketplace-integration', 'authorized-government-integration'],
    dependencies: ['internal-integration-layer']
  },
  {
    id: 'universal-integration-fabric',
    name: 'Universal Integration Fabric',
    arabicName: 'نسيج التكامل الشامل',
    status: 'ACTIVE',
    healthScore: 100,
    purpose: 'Supports local, national, Gulf, regional, continental, international, and partner integrations.',
    responsibilities: ['integration', 'interoperability', 'partner-connectivity'],
    capabilities: ['local-integration', 'national-integration', 'regional-integration', 'international-integration'],
    dependencies: ['external-integration-layer']
  },
  {
    id: 'value-operating-system',
    name: 'Value Operating System',
    arabicName: 'نظام تشغيل القيمة',
    status: 'ACTIVE',
    healthScore: 100,
    purpose: 'Measures, improves, and governs value creation.',
    responsibilities: ['value-measurement', 'value-improvement'],
    capabilities: ['value-score', 'impact-measurement', 'continuous-value-improvement'],
    dependencies: ['commerce-os', 'ummah-benefit-value-layer']
  }
]);

const architecture = Object.freeze({
  system: 'SHEIKHA_ENTERPRISE_ARCHITECTURE_V2',
  brand: 'Sheikha',
  arabicBrand: 'شيخة',
  version: '2.0.0',
  identity: {
    civilization: 'Saudi Global Commerce Civilization',
    arabicCivilization: 'الحضارة السعودية للتجارة العالمية',
    ecosystem: 'Global Commerce Ecosystem',
    arabicEcosystem: 'منظومة التجارة العالمية',
    kingdom: 'Commerce Kingdom',
    arabicKingdom: 'مملكة التجارة والاقتصاد',
    operatingSystem: 'Sheikha Commerce OS'
  },
  governanceNote:
    'Commerce Kingdom, Emirates, Ministries, Authorities, and Ummah of Muhammad Benefit & Value Layer are internal architecture and values terms only; they do not represent governmental, sovereign, religious, or official entities.',
  ummahValueLayer: Object.freeze({
    name: 'Ummah of Muhammad Benefit & Value Layer',
    arabicName: 'أمة محمد ﷺ',
    purpose:
      'A values and ethics layer inspired by Islamic principles to guide trust, justice, beneficial commerce, no harm, fulfillment of contracts, and benefit to the Ummah of Muhammad ﷺ and to people.',
    scope:
      'Values guidance only; it does not issue religious rulings or replace scholars, governments, courts, or official authorities; it is dedicated to benefiting the Ummah of Muhammad ﷺ and benefiting all people.',
    principles: [
      'Justice',
      'Honesty',
      'Trust',
      'Mercy',
      'No Harm',
      'Beneficial Trade',
      'Contract Fulfillment',
      'Benefit to People',
      'Beneficial Commerce',
      'Charity and Social Good',
      'Knowledge and Excellence'
    ]
  }),
  layers,
  principles: [
    'Justice',
    'Honesty',
    'Trust',
    'Transparency',
    'Quality',
    'Value',
    'Sustainability',
    'No Harm',
    'Contract Fulfillment',
    'Benefit to People',
    'Beneficial Commerce'
  ],
  integrations: [
    'Local Integration',
    'National Integration',
    'Gulf Integration',
    'Regional Integration',
    'Continental Integration',
    'International Integration',
    'Partner Integration'
  ]
});

function getEnterpriseArchitecture() {
  return architecture;
}

function getArchitectureStatus() {
  return {
    system: architecture.system,
    status: 'ACTIVE',
    brand: architecture.brand,
    version: architecture.version,
    layers: architecture.layers.length,
    activeLayers: architecture.layers.filter((layer) => layer.status === 'ACTIVE').length,
    healthScore: Math.round(
      architecture.layers.reduce((sum, layer) => sum + Number(layer.healthScore || 0), 0) /
        architecture.layers.length
    ),
    principles: architecture.principles.length,
    integrations: architecture.integrations.length,
    ummahValueLayer: architecture.ummahValueLayer.name,
    governanceNote: architecture.governanceNote
  };
}

function getArchitectureLayerById(id) {
  return architecture.layers.find((layer) => layer.id === id) || null;
}

function getArchitectureRegistry() {
  return architecture.layers.map((layer) => ({
    id: layer.id,
    name: layer.name,
    arabicName: layer.arabicName,
    status: layer.status,
    healthScore: layer.healthScore,
    capabilities: layer.capabilities,
    dependencies: layer.dependencies
  }));
}


function getArchitectureRelationshipGraph() {
  const layers = architecture.layers;
  const byId = new Map(layers.map((layer) => [layer.id, layer]));

  return layers.map((layer) => {
    const parents = layer.dependencies || [];
    const children = layers
      .filter((candidate) => (candidate.dependencies || []).includes(layer.id))
      .map((candidate) => candidate.id);

    const peers = layers
      .filter((candidate) =>
        candidate.id !== layer.id &&
        (candidate.dependencies || []).some((dep) => parents.includes(dep))
      )
      .map((candidate) => candidate.id);

    return {
      id: layer.id,
      name: layer.name,
      arabicName: layer.arabicName,
      status: layer.status,
      healthScore: layer.healthScore || 100,
      governance: 'PASSED',
      risk: 'LOW',
      parents,
      children,
      peers,
      parentNames: parents.map((id) => byId.get(id)?.arabicName || id),
      childNames: children.map((id) => byId.get(id)?.arabicName || id),
      peerNames: peers.map((id) => byId.get(id)?.arabicName || id)
    };
  });
}

function getArchitectureLayerRelationships(id) {
  return getArchitectureRelationshipGraph().find((item) => item.id === id) || null;
}


function validateEnterpriseArchitecture() {
  const ids = new Set(architecture.layers.map((layer) => layer.id));
  const dependenciesValid = architecture.layers.every((layer) =>
    layer.dependencies.every((dep) => ids.has(dep))
  );

  return {
    valid:
      dependenciesValid &&
      ids.has('islamic-reference-layer') &&
      ids.has('constitution') &&
      ids.has('ummah-benefit-value-layer') &&
      ids.has('kingdom') &&
      ids.has('arabian-peninsula-federation-layer') &&
      ids.has('arabian-gulf-cooperation-layer') &&
      ids.has('commerce-emirates') &&
      ids.has('internal-integration-layer') &&
      ids.has('external-integration-layer') &&
      ids.has('universal-integration-fabric'),
    checkedAt: new Date().toISOString(),
    dependenciesValid
  };
}

module.exports = {
  getEnterpriseArchitecture,
  getArchitectureStatus,
  getArchitectureLayerById,
  getArchitectureRegistry,
  getArchitectureRelationshipGraph,
  getArchitectureLayerRelationships,
  validateEnterpriseArchitecture
};
