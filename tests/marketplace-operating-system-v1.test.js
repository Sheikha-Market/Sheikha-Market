'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Marketplace Operating System V1', () => {
  const root = process.cwd();

  test('marketplace operating system report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/marketplace-operating-system-v1/v1/sheikha-marketplace-operating-system-v1-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_MARKETPLACE_OPERATING_SYSTEM_V1');
    expect(report.decision).toBe('MARKETPLACE_OPERATING_SYSTEM_V1_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.objects).toBeGreaterThanOrEqual(16);
    expect(report.coverage.workflows).toBeGreaterThanOrEqual(12);
    expect(report.coverage.bindings).toBeGreaterThanOrEqual(12);
  });
});
