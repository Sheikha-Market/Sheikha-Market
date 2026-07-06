'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Commercial Ops V2', () => {
  const root = process.cwd();

  test('commercial ops summary is active and complete', () => {
    const reportPath = path.join(root, 'runtime/executive-dashboard-generator-v2/v1/sheikha-commercial-ops-v2-summary.json');
    expect(fs.existsSync(reportPath)).toBe(true);
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    expect(report.system).toBe('SHEIKHA_COMMERCIAL_OPS_V2');
    expect(report.decision).toBe('COMMERCIAL_OPS_V2_ACTIVE_100');
    expect(report.reports.length).toBe(3);
    for (const r of report.reports) {
      expect(r.score).toBe(100);
      expect(r.missing).toEqual([]);
    }
  });
});
