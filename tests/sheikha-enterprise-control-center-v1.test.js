'use strict';

const {
  buildEnterprisePluginRegistry
} = require('../core/enterprise-plugin-registry/sheikha-enterprise-plugin-registry-v1');

describe('Sheikha Enterprise Control Center V1', () => {
  test('builds governed plugin registry', () => {
    const report = buildEnterprisePluginRegistry();
    expect(report.status).toBe('ACTIVE');
    expect(report.summary.active).toBeGreaterThan(0);
    expect(report.governance.noHarm).toBe(true);
  });

  test('keeps high impact actions non-active', () => {
    const report = buildEnterprisePluginRegistry();
    const highImpact = report.plugins.filter(p => p.highImpact);
    expect(highImpact.every(p => p.status !== 'ACTIVE')).toBe(true);
  });
});
