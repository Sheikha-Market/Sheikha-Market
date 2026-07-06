'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Enterprise Connector Fabric V1', () => {
  const root = process.cwd();

  test('enterprise connector fabric report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/enterprise-connector-fabric-v1/v1/sheikha-enterprise-connector-fabric-v1-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_ENTERPRISE_CONNECTOR_FABRIC_V1');
    expect(report.decision).toBe('ENTERPRISE_CONNECTOR_FABRIC_V1_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.connectors).toBeGreaterThanOrEqual(20);
    expect(report.coverage.policies).toBeGreaterThanOrEqual(10);
    expect(report.coverage.bindings).toBeGreaterThanOrEqual(9);
  });
});
