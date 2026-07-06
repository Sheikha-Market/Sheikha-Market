'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Developer Platform V1', () => {
  const root = process.cwd();

  test('developer platform report is active and complete', () => {
    const reportPath = path.join(
      root,
      'runtime/sheikha-developer-platform/v1/sheikha-developer-platform-v1-report.json'
    );

    expect(fs.existsSync(reportPath)).toBe(true);

    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

    expect(report.system).toBe('SHEIKHA_DEVELOPER_PLATFORM_V1');
    expect(report.decision).toBe('SHEIKHA_DEVELOPER_PLATFORM_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.studioModules).toBeGreaterThanOrEqual(10);
    expect(report.coverage.ideCapabilities).toBeGreaterThanOrEqual(8);
    expect(report.coverage.lspCapabilities).toBeGreaterThanOrEqual(9);
    expect(report.coverage.editorAdapters).toBeGreaterThanOrEqual(5);
    expect(report.coverage.packageCommands).toBeGreaterThanOrEqual(6);
    expect(report.dependencyPolicy.externalEditorsAreOptionalAdapters).toBe(true);
  });
});
