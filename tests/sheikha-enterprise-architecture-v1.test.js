'use strict';

const {
  getEnterpriseArchitecture,
  getArchitectureStatus,
  validateEnterpriseArchitecture
} = require('../core/enterprise-architecture/sheikha-enterprise-architecture');

describe('Sheikha Enterprise Architecture V1', () => {
  test('architecture is active and complete', () => {
    const status = getArchitectureStatus();

    expect(status.system).toBe('SHEIKHA_ENTERPRISE_ARCHITECTURE_V1');
    expect(status.status).toBe('ACTIVE');
    expect(status.layers).toBeGreaterThanOrEqual(20);
  });

  test('contains civilization, ecosystem, kingdom, federation, emirates and integration layers', () => {
    const architecture = getEnterpriseArchitecture();

    expect(architecture.identity.civilization).toBe('Saudi Global Commerce Civilization');
    expect(architecture.identity.ecosystem).toBe('Global Commerce Ecosystem');
    expect(architecture.identity.kingdom).toBe('Commerce Kingdom');
    expect(architecture.layers).toContain('Global Commerce Federation');
    expect(architecture.layers).toContain('Federation of Commerce Ecosystems');
    expect(architecture.layers).toContain('Commerce Emirates');
    expect(architecture.layers).toContain('Universal Integration Fabric');
  });

  test('architecture terms are governed as internal terminology', () => {
    const architecture = getEnterpriseArchitecture();

    expect(architecture.governanceNote).toContain('internal architecture terms');
    expect(architecture.governanceNote).not.toContain('official government');
  });

  test('validation passes', () => {
    expect(validateEnterpriseArchitecture().valid).toBe(true);
  });
});
