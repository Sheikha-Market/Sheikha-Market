'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Operational Platform V1', () => {
  const root = process.cwd();

  test('operational platform report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/operational-platform-v1/v1/sheikha-operational-platform-v1-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_OPERATIONAL_PLATFORM_V1');
    expect(report.decision).toBe('OPERATIONAL_PLATFORM_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.digitalTwinAssets).toBeGreaterThanOrEqual(10);
    expect(report.coverage.controlTowerObjects).toBeGreaterThanOrEqual(10);
    expect(report.coverage.dashboards).toBeGreaterThanOrEqual(8);
    expect(report.coverage.marketplaceCatalog).toBeGreaterThanOrEqual(9);
    expect(report.coverage.crmSalesPipelineStages).toBeGreaterThanOrEqual(10);
  });

  test('package script exists', () => {
    const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
    expect(packageJson.scripts['ops:operational-platform:v1']).toBe(
      'node tools/operational-platform-v1/sheikha-operational-platform-v1.js'
    );
  });
});
