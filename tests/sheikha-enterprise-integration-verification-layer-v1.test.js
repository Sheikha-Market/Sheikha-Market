'use strict';

const {
  buildLayer,
  scoreFromChecks
} = require('../tools/activation/activate-sheikha-enterprise-integration-verification-layer-v1');

describe('Sheikha Enterprise Integration Verification Layer V1', () => {
  test('scores layer checks deterministically', () => {
    expect(scoreFromChecks({ a: true, b: true, c: false })).toEqual({
      passed: 2,
      total: 3,
      score: 67
    });
  });

  test('builds a ready layer when all checks pass', () => {
    const layer = buildLayer('Identity', {
      reportPresent: true,
      active: true
    }, ['Runtime']);

    expect(layer.name).toBe('Identity');
    expect(layer.status).toBe('READY');
    expect(layer.score).toBe(100);
    expect(layer.dependencies).toEqual(['Runtime']);
  });

  test('builds a degraded layer when checks partially pass', () => {
    const layer = buildLayer('Cloud', {
      api200: true,
      metrics200: false,
      performance200: true
    }, ['OS']);

    expect(layer.status).toBe('DEGRADED');
    expect(layer.score).toBe(67);
  });
});