'use strict';

const {
  getEnterpriseArchitecture,
  getArchitectureStatus,
  getArchitectureLayerById,
  getArchitectureRegistry,
  validateEnterpriseArchitecture
} = require('../core/enterprise-architecture/sheikha-enterprise-architecture');

describe('Sheikha Enterprise Architecture Registry V2', () => {
  test('architecture registry is active and versioned', () => {
    const status = getArchitectureStatus();

    expect(status.system).toBe('SHEIKHA_ENTERPRISE_ARCHITECTURE_V2');
    expect(status.status).toBe('ACTIVE');
    expect(status.version).toBe('2.0.0');
    expect(status.layers).toBeGreaterThanOrEqual(18);
    expect(status.activeLayers).toBe(status.layers);
  });


  test('contains Islamic reference layer above constitution', () => {
    const layer = getArchitectureLayerById('islamic-reference-layer');
    const constitution = getArchitectureLayerById('constitution');

    expect(layer).not.toBeNull();
    expect(layer.arabicName).toBe('الدين الإسلامي');
    expect(layer.capabilities).toContain('ethical-reference');
    expect(constitution.dependencies).toContain('islamic-reference-layer');
  });


  test('contains Arabian Peninsula federation and Arabian Gulf regional layers', () => {
    const peninsula = getArchitectureLayerById('arabian-peninsula-federation-layer');
    const gulf = getArchitectureLayerById('arabian-gulf-cooperation-layer');
    const council = getArchitectureLayerById('commerce-supreme-council');

    expect(peninsula).not.toBeNull();
    expect(peninsula.arabicName).toBe('اتحاد الجزيرة العربية');
    expect(peninsula.dependencies).toContain('kingdom');

    expect(gulf).not.toBeNull();
    expect(gulf.arabicName).toBe('طبقة الخليج العربي');
    expect(gulf.dependencies).toContain('arabian-peninsula-federation-layer');

    expect(council.dependencies).toContain('arabian-gulf-cooperation-layer');
  });

  test('contains civilization, ecosystem, kingdom, federation, emirates and integration layers', () => {
    const architecture = getEnterpriseArchitecture();
    const ids = architecture.layers.map((layer) => layer.id);

    expect(architecture.identity.civilization).toBe('Saudi Global Commerce Civilization');
    expect(architecture.identity.ecosystem).toBe('Global Commerce Ecosystem');
    expect(architecture.identity.kingdom).toBe('Commerce Kingdom');
    expect(ids).toContain('global-commerce-federation');
    expect(ids).toContain('federation-of-commerce-ecosystems');
    expect(ids).toContain('commerce-emirates');
    expect(ids).toContain('universal-integration-fabric');
  });

  test('architecture terms are governed as internal terminology', () => {
    const architecture = getEnterpriseArchitecture();

    expect(architecture.governanceNote).toContain('internal architecture');
    expect(architecture.governanceNote).toContain('values');
    expect(architecture.governanceNote).toContain('do not represent governmental');
  });

  test('contains Ummah benefit value layer as ethical guidance', () => {
    const architecture = getEnterpriseArchitecture();

    expect(architecture.ummahValueLayer.arabicName).toBe('أمة محمد ﷺ');
    expect(architecture.ummahValueLayer.scope).toContain('Values guidance only');
    expect(architecture.ummahValueLayer.scope).toContain('benefiting the Ummah of Muhammad ﷺ');
    expect(architecture.ummahValueLayer.principles).toContain('Benefit to People');
    expect(architecture.ummahValueLayer.principles).toContain('Beneficial Trade');
  });

  test('layer lookup works', () => {
    const layer = getArchitectureLayerById('commerce-emirates');

    expect(layer).not.toBeNull();
    expect(layer.arabicName).toBe('إمارات التجارة');
    expect(layer.dependencies).toContain('federation-of-commerce-ecosystems');
  });

  test('registry exposes compact layer list', () => {
    const registry = getArchitectureRegistry();

    expect(Array.isArray(registry)).toBe(true);
    expect(registry.length).toBeGreaterThanOrEqual(15);
    expect(registry[0]).toHaveProperty('id');
    expect(registry[0]).toHaveProperty('capabilities');
  });

  test('validation passes with valid dependencies', () => {
    const validation = validateEnterpriseArchitecture();

    expect(validation.valid).toBe(true);
    expect(validation.dependenciesValid).toBe(true);
  });
});
