'use strict';

const {
  buildLayer,
  buildReport,
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

  test('exposes unified kernels and evidence verification fabric', () => {
    const report = buildReport();

    expect(report.kernelTopology.root).toBe('SHEIKHA ROOT');
    expect(report.kernelTopology.kernels).toContain('Identity Kernel');
    expect(report.kernelTopology.kernels).toContain('Executive Kernel');
    expect(report.unifiedRuntimeBus.name).toBe('Unified Runtime Bus');
    expect(report.unifiedVerificationFabric.evidenceBasedVerification).toBe(true);
    expect(report.unifiedVerificationFabric.stages).toContain('Evidence Verification');
  });

  test('exposes unified identity engine and governance cycle', () => {
    const report = buildReport();

    expect(report.identityEngine.name).toBe('Sheikha Identity Engine');
    expect(report.identityEngine.domains).toContain('Runtime Identity');
    expect(report.governanceCycle[0]).toBe('الرؤية');
    expect(report.governanceCycle.at(-1)).toBe('إعادة القياس');
  });
});