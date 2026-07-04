'use strict';

const {
  scoreService,
  buildRuntimeHealthReport
} = require('../core/runtime-health/sheikha-runtime-health-engine-v1');

describe('Sheikha Runtime Health Engine V1', () => {
  test('scores active service as healthy', () => {
    expect(scoreService({ status: 'ACTIVE' })).toBe(100);
  });

  test('builds unified runtime health report', () => {
    const report = buildRuntimeHealthReport();

    expect(report.system).toBe('SHEIKHA_RUNTIME_HEALTH_ENGINE_V1');
    expect(report.status).toBe('HEALTHY');
    expect(report.overallScore).toBeGreaterThanOrEqual(90);
    expect(report.safety.noHarm).toBe(true);
  });
});
