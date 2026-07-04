'use strict';

const {
  domainDashboardDefaults,
  withDomainDashboardDefaults
} = require('../core/contracts/sheikha-domain-data-contracts-v1');

describe('Sheikha Domain Data Contracts V1', () => {
  test('provides default domain arrays and objects', () => {
    expect(Array.isArray(domainDashboardDefaults.salvageYards)).toBe(true);
    expect(Array.isArray(domainDashboardDefaults.historicalEras)).toBe(true);
    expect(Array.isArray(domainDashboardDefaults.leadershipPrinciples)).toBe(true);
    expect(Array.isArray(domainDashboardDefaults.preciousMetals)).toBe(true);
    expect(Array.isArray(domainDashboardDefaults.commercialActivities)).toBe(true);
    expect(typeof domainDashboardDefaults.AI).toBe('object');
  });

  test('merges custom dashboard without losing required defaults', () => {
    const dashboard = withDomainDashboardDefaults({ label: 'Auto Salvage' });

    expect(dashboard.label).toBe('Auto Salvage');
    expect(Array.isArray(dashboard.salvageYards)).toBe(true);
    expect(Array.isArray(dashboard.historicalNetworks)).toBe(true);
  });
});
