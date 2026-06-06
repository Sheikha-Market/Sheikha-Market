'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Digital Twin Engine V2', () => {
  const root = process.cwd();

  test('digital twin engine report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/digital-twin-engine-v2/v1/sheikha-digital-twin-engine-v2-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_DIGITAL_TWIN_ENGINE_V2');
    expect(report.decision).toBe('DIGITAL_TWIN_ENGINE_V2_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.assets).toBeGreaterThanOrEqual(12);
    expect(report.coverage.metrics).toBeGreaterThanOrEqual(15);
    expect(report.coverage.integrations).toBeGreaterThanOrEqual(8);
  });
});
