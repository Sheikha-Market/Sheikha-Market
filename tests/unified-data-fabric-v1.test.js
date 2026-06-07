'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Unified Data Fabric V1', () => {
  const root = process.cwd();

  test('unified data fabric report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/unified-data-fabric-v1/v1/sheikha-unified-data-fabric-v1-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_UNIFIED_DATA_FABRIC_V1');
    expect(report.decision).toBe('UNIFIED_DATA_FABRIC_V1_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.sources).toBeGreaterThanOrEqual(15);
    expect(report.coverage.policies).toBeGreaterThanOrEqual(8);
  });
});
