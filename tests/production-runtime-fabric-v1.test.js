'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Production Runtime Fabric V1', () => {
  const root = process.cwd();

  test('production runtime fabric report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/production-runtime-fabric-v1/v1/sheikha-production-runtime-fabric-v1-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_PRODUCTION_RUNTIME_FABRIC_V1');
    expect(report.decision).toBe('PRODUCTION_RUNTIME_FABRIC_V1_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.services).toBeGreaterThanOrEqual(12);
    expect(report.coverage.endpoints).toBeGreaterThanOrEqual(10);
    expect(report.coverage.bindings).toBeGreaterThanOrEqual(14);
  });
});
