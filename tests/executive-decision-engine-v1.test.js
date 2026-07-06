'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Executive Decision Engine V1', () => {
  const root = process.cwd();

  test('executive decision engine report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/executive-decision-engine-v1/v1/sheikha-executive-decision-engine-v1-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_EXECUTIVE_DECISION_ENGINE_V1');
    expect(report.decision).toBe('EXECUTIVE_DECISION_ENGINE_V1_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.domains).toBeGreaterThanOrEqual(14);
    expect(report.coverage.types).toBeGreaterThanOrEqual(14);
    expect(report.coverage.bindings).toBeGreaterThanOrEqual(11);
  });
});
