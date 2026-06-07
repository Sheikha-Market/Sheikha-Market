'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Admin Methodology Information Impact OS V1', () => {
  const root = process.cwd();

  test('admin methodology information impact OS report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/admin-methodology-information-impact-os-v1/v1/sheikha-admin-methodology-information-impact-os-v1-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_ADMIN_METHODOLOGY_INFORMATION_IMPACT_OS_V1');
    expect(report.decision).toBe('ADMIN_METHODOLOGY_INFORMATION_IMPACT_OS_V1_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.methodologies).toBeGreaterThanOrEqual(15);
    expect(report.coverage.procedures).toBeGreaterThanOrEqual(19);
    expect(report.coverage.forms).toBeGreaterThanOrEqual(18);
    expect(report.coverage.informationFlows).toBeGreaterThanOrEqual(6);
    expect(report.coverage.valueMappings).toBeGreaterThanOrEqual(6);
    expect(report.coverage.bindings).toBeGreaterThanOrEqual(14);
  });
});
