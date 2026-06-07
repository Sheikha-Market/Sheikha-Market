'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Discovery Engine V1', () => {
  const root = process.cwd();

  test('discovery engine report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/discovery-engine-v1/v1/sheikha-discovery-engine-v1-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_DISCOVERY_ENGINE_V1');
    expect(report.decision).toBe('DISCOVERY_ENGINE_V1_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.domains).toBeGreaterThanOrEqual(15);
    expect(report.coverage.types).toBeGreaterThanOrEqual(14);
    expect(report.coverage.bindings).toBeGreaterThanOrEqual(10);
  });
});
