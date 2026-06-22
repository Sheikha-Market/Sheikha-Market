const {
  analyzeRootCause
} = require('../../runtime/root-cause-v2/sheikha-root-cause-intelligence-v2');

describe('Sheikha Root Cause Intelligence V2', () => {
  test('classifies CommonJS modernization warning', () => {
    const result = analyzeRootCause({
      source: 'vscode-diagnostics',
      message: 'File is a CommonJS module; it may be converted to an ES module'
    });

    expect(result.status).toBe('ACTIVE');
    expect(result.category).toBe('MODULE_SYSTEM_MODERNIZATION');
    expect(result.suppressWarning).toBe(false);
    expect(result.requiresVerification).toBe(true);
  });
});
