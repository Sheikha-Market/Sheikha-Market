'use strict';

const {
  buildProductionGateReport
} = require('../core/production-gate/sheikha-production-gate-v1');

describe('Sheikha Production Gate V1', () => {
  test('passes when all checks pass', () => {
    const report = buildProductionGateReport();

    expect(report.system).toBe('SHEIKHA_PRODUCTION_GATE_V1');
    expect(report.status).toBe('READY_FOR_STAGING');
    expect(report.productionReady).toBe(true);
    expect(report.score).toBe(100);
  });

  test('blocks when governance fails', () => {
    const report = buildProductionGateReport({ governance: false });

    expect(report.status).toBe('BLOCKED');
    expect(report.productionReady).toBe(false);
    expect(report.blocked.map((item) => item.name)).toContain('governance');
  });
});
