'use strict';
const report = require('../runtime/identity-fabric-v1/v1/sheikha-identity-fabric-v1-report.json');

describe('Sheikha Identity Fabric V1', () => {
  test('identity fabric is active', () => {
    expect(report.system).toBe('SHEIKHA_IDENTITY_FABRIC_V1');
    expect(report.decision).toBe('IDENTITY_FABRIC_V1_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.roles).toBeGreaterThanOrEqual(10);
    expect(report.coverage.policies).toBeGreaterThanOrEqual(7);
    expect(report.coverage.isolationRules).toBeGreaterThanOrEqual(6);
  });
});
