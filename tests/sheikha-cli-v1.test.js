'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha CLI V1', () => {
  test('CLI is active', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'bin/sheikha'))).toBe(true);
    const report = require('../runtime/sheikha-cli-v1/v1/sheikha-cli-v1-report.json');
    expect(report.system).toBe('SHEIKHA_CLI_V1');
    expect(report.decision).toBe('SHEIKHA_CLI_V1_ACTIVE_100');
    expect(report.commands.length).toBeGreaterThanOrEqual(12);
  });
});
