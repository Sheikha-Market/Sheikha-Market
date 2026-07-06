'use strict';

const {
  organizationalHierarchy,
  operatingPillars,
  emirateOperatingUnits,
  hydrateHierarchy,
  hydratePillars,
  buildIntegrationContracts,
  evaluateOperatingIntegration,
  getOperatingIntegrationStatus
} = require('../core/enterprise-architecture/sheikha-enterprise-architecture-operating-integration-v3');

describe('Sheikha Enterprise Architecture Operating Integration V3', () => {
  test('defines the full administrative hierarchy from values to integration fabric', () => {
    const hierarchy = hydrateHierarchy();

    expect(organizationalHierarchy.length).toBeGreaterThanOrEqual(16);
    expect(hierarchy.every((item) => item.status === 'ACTIVE')).toBe(true);
    expect(hierarchy.map((item) => item.id)).toEqual(expect.arrayContaining([
      'ummah-benefit-value-layer',
      'civilization',
      'kingdom',
      'commerce-emirates',
      'commerce-ministries',
      'commerce-authorities',
      'universal-integration-fabric'
    ]));
  });

  test('maps administrative, technical, scientific, governance, and federation pillars', () => {
    const pillars = hydratePillars();

    expect(operatingPillars.map((pillar) => pillar.id)).toEqual(expect.arrayContaining([
      'administrative-organization',
      'technical-organization',
      'scientific-organization',
      'governance-organization',
      'federation-organization'
    ]));
    expect(pillars.every((pillar) => pillar.coverage.ready)).toBe(true);
    expect(pillars.find((pillar) => pillar.id === 'technical-organization').outputs)
      .toContain('integration-map');
  });

  test('defines emirate operating units as internal domain units', () => {
    expect(emirateOperatingUnits.map((unit) => unit.id)).toEqual(expect.arrayContaining([
      'commerce-emirate',
      'knowledge-emirate',
      'technology-emirate',
      'value-emirate'
    ]));
    expect(emirateOperatingUnits.every((unit) => unit.governedBy === 'commerce-emirates'))
      .toBe(true);
  });

  test('builds integration contracts between civilization, kingdom, emirates, science, and runtime', () => {
    const contracts = buildIntegrationContracts();

    expect(contracts.length).toBeGreaterThanOrEqual(5);
    expect(contracts.map((contract) => contract.contract)).toContain('Vision -> Operating Model');
    expect(contracts.map((contract) => contract.contract))
      .toContain('Evidence -> Measurement -> Runtime Integration');
  });

  test('evaluates operating integration as active and governed', () => {
    const result = evaluateOperatingIntegration();

    expect(result.system).toBe('SHEIKHA_ENTERPRISE_ARCHITECTURE_OPERATING_INTEGRATION_V3');
    expect(result.status).toBe('ACTIVE_100_INTEGRATED');
    expect(result.score).toBeGreaterThanOrEqual(95);
    expect(result.linkedSystems.enterpriseKernel.status).toBe('EXCELLENT_10_10');
    expect(result.linkedSystems.federationOperatingFabric.status).toBe('ACTIVE');
    expect(result.governance.noReligiousAuthorityClaim).toBe(true);
    expect(result.governance.noGovernmentalAuthorityClaim).toBe(true);
    expect(result.governance.noHarm).toBe(true);
  });

  test('builds compact status for routes and inspectors', () => {
    const status = getOperatingIntegrationStatus();

    expect(status.status).toBe('ACTIVE_100_INTEGRATED');
    expect(status.hierarchyLevels).toBeGreaterThanOrEqual(16);
    expect(status.pillars).toBe(5);
    expect(status.emirates).toBeGreaterThanOrEqual(4);
    expect(status.governance.valuesGuidanceOnly).toBe(true);
  });
});
