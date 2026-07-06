'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha SaaS Platform Layer V1', () => {
  const root = process.cwd();

  test('SaaS platform layer report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/saas-platform-layer-v1/v1/sheikha-saas-platform-layer-v1-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_SAAS_PLATFORM_LAYER_V1');
    expect(report.decision).toBe('SAAS_PLATFORM_LAYER_V1_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.tenantTypes).toBeGreaterThanOrEqual(6);
    expect(report.coverage.isolationRules).toBeGreaterThanOrEqual(5);
    expect(report.coverage.plans).toBeGreaterThanOrEqual(5);
    expect(report.coverage.roles).toBeGreaterThanOrEqual(11);
    expect(report.coverage.services).toBeGreaterThanOrEqual(14);
    expect(report.coverage.bindings).toBeGreaterThanOrEqual(12);
  });
});
