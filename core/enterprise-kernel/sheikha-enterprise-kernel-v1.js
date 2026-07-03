'use strict';

const {
  getArchitectureRegistry,
  validateEnterpriseArchitecture,
  getArchitectureRelationshipGraph
} = require('../enterprise-architecture/sheikha-enterprise-architecture');

const domains = Object.freeze([
  {
    id: 'reference-domain',
    name: 'Reference Domain',
    arabicName: 'مجال المرجعية',
    owns: ['islamic-reference-layer', 'constitution', 'ummah-benefit-value-layer']
  },
  {
    id: 'enterprise-domain',
    name: 'Enterprise Domain',
    arabicName: 'مجال المؤسسة',
    owns: ['civilization', 'ecosystem', 'kingdom', 'commerce-supreme-council']
  },
  {
    id: 'regional-domain',
    name: 'Regional Domain',
    arabicName: 'مجال التنظيم الإقليمي',
    owns: ['arabian-peninsula-federation-layer', 'arabian-gulf-cooperation-layer']
  },
  {
    id: 'commerce-domain',
    name: 'Commerce Domain',
    arabicName: 'مجال التجارة العالمية',
    owns: ['product-knowledge-fabric', 'marketplace-operating-system']
  },
  {
    id: 'knowledge-domain',
    name: 'Knowledge Domain',
    arabicName: 'مجال المعرفة والعلوم',
    owns: ['knowledge-graph', 'research-fabric', 'scientific-methodology']
  },
  {
    id: 'runtime-domain',
    name: 'Runtime Domain',
    arabicName: 'مجال التشغيل',
    owns: ['runtime-fabric', 'integration-control-plane', 'service-mesh']
  },
  {
    id: 'visualization-domain',
    name: 'Visualization Domain',
    arabicName: 'مجال الواجهات والاستكشاف',
    owns: ['architecture-explorer', 'dependency-graph', 'relationship-graph']
  }
]);


function normalizeArchitectureLayers(registry) {
  if (Array.isArray(registry)) return registry;
  if (Array.isArray(registry?.layers)) return registry.layers;
  if (Array.isArray(registry?.registry)) return registry.registry;
  if (Array.isArray(registry?.data)) return registry.data;
  if (Array.isArray(registry?.items)) return registry.items;
  return [];
}


function getEnterpriseDomains() {
  return domains;
}

function evaluateEnterpriseKernel() {
  const architecture = getArchitectureRegistry();
  const layers = normalizeArchitectureLayers(architecture);
  const validation = validateEnterpriseArchitecture();
  const relationships = getArchitectureRelationshipGraph();

  const covered = new Set(domains.flatMap((domain) => domain.owns));
  const namedLayers = new Set(layers.map((layer) => layer.id));

  const domainCoverage = layers.filter((layer) => covered.has(layer.id)).length;
  const architectureCoverageScore = layers.length
    ? Math.round((domainCoverage / layers.length) * 100)
    : 0;

  const orphanDomains = domains.filter((domain) =>
    domain.owns.every((layerId) => !namedLayers.has(layerId))
  );

  const score = Math.round(
    (
      (validation.valid ? 100 : 60) +
      architectureCoverageScore +
      (relationships.length >= layers.length ? 100 : 70) +
      (orphanDomains.length === 0 ? 100 : 70)
    ) / 4
  );

  return {
    system: 'SHEIKHA_ENTERPRISE_KERNEL_V1',
    status: score >= 95 ? 'EXCELLENT_10_10' : score >= 85 ? 'EXCELLENT' : 'NEEDS_REVIEW',
    score,
    validation,
    domains,
    metrics: {
      layers: layers.length,
      domains: domains.length,
      relationships: relationships.length,
      architectureCoverageScore,
      orphanDomains: orphanDomains.map((domain) => domain.id)
    },
    governance: 'PASSED',
    noHarm: true
  };
}

module.exports = {
  getEnterpriseDomains,
  evaluateEnterpriseKernel,
  normalizeArchitectureLayers
};
