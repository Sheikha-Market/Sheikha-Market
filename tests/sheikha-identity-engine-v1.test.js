'use strict';

const { buildReport, scoreFromChecks } = require('../tools/activation/activate-sheikha-identity-engine-v1');

describe('Sheikha Identity Engine V1', () => {
  test('scores checks deterministically', () => {
    expect(scoreFromChecks({ a: true, b: false, c: true })).toEqual({
      passed: 2,
      total: 3,
      score: 67
    });
  });

  test('builds unified identity report with executive and runtime domains', () => {
    const report = buildReport();

    expect(report.system).toBe('SHEIKHA_IDENTITY_ENGINE_V1');
    expect(report.domains.runtimeIdentity.status).toBe('ACTIVE');
    expect(report.domains.executiveIdentity.executiveHealthScore).toBe(100);
    expect(report.domains.visualIdentity.theme).toBeTruthy();
  });
});