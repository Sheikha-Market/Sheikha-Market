'use strict';

const fs = require('fs');
const path = require('path');

describe('Sheikha Studio LSP Package MCP V2', () => {
  const root = process.cwd();

  test('activation summary is active and complete', () => {
    const reportPath = path.join(root, 'runtime/sheikha-studio-v2/v1/sheikha-studio-lsp-package-mcp-v2-summary.json');
    expect(fs.existsSync(reportPath)).toBe(true);
    const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    expect(report.system).toBe('SHEIKHA_STUDIO_LSP_PACKAGE_MCP_ACTIVATION_V2');
    expect(report.decision).toBe('STUDIO_LSP_PACKAGE_MCP_ACTIVE_100');
    expect(report.reports.length).toBe(4);
    for (const r of report.reports) {
      expect(r.score).toBe(100);
      expect(r.missing).toEqual([]);
    }
  });
});
