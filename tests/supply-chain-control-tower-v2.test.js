'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Supply Chain Control Tower V2', () => {
  const root = process.cwd();

  test('control tower report is active and complete', () => {
    const reportPath = path.join(root, 'runtime/supply-chain-control-tower-v2/v1/sheikha-supply-chain-control-tower-v2-report.json');
    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    expect(report.system).toBe('SHEIKHA_SUPPLY_CHAIN_CONTROL_TOWER_V2');
    expect(report.decision).toBe('SUPPLY_CHAIN_CONTROL_TOWER_V2_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.objects).toBeGreaterThanOrEqual(12);
  });
});
