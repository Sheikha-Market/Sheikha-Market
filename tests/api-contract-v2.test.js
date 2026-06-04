'use strict';

const fs = require('fs');
const path = require('path');
const { ok, fail } = require('../lib/api-contracts/sheikha-api-response');

const ROOT = path.join(__dirname, '..');

function readText(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(readText(relativePath));
}

describe('Sheikha API Contract V2', () => {
  test('success response must include success, data, and meta', () => {
    const response = ok({ name: 'Sheikha Root' });
    expect(response.success).toBe(true);
    expect(response).toHaveProperty('data');
    expect(response).toHaveProperty('meta');
    expect(response.meta.contract).toBe('SHEIKHA_API_CONTRACT_V2');
  });

  test('failure response must include success false, error, data null, and meta', () => {
    const response = fail('Missing prompt', 'MISSING_PROMPT', 400);
    expect(response.success).toBe(false);
    expect(response).toHaveProperty('error');
    expect(response.data).toBe(null);
    expect(response).toHaveProperty('meta');
    expect(response.error.status).toBe(400);
  });

  test('live VS Code extension integration tests require an explicit runtime gate', () => {
    const packageJson = readJson('package.json');
    const integrationTest = readText('sheikha-vscode-extension/tests/integration.test.js');
    const script = packageJson.scripts['test:extension:integration'];

    expect(integrationTest).toContain('SHEIKHA_RUN_LIVE_EXTENSION_TESTS');
    expect(integrationTest).toContain('describe.skip');
    expect(script).toContain('SHEIKHA_RUN_LIVE_EXTENSION_TESTS=true');
    expect(script).toContain('sheikha-vscode-extension/tests/integration.test.js');
  });

  test('extension compatibility v2 documents default and live test governance', () => {
    const compatibility = readJson('runtime/extension-compatibility/v2/sheikha-extension-compatibility-v2.json');

    expect(compatibility.status).toBe('ACTIVE');
    expect(compatibility.test_governance.default_jest_behavior).toBe(
      'SKIP_LIVE_SERVER_EXTENSION_TESTS'
    );
    expect(compatibility.test_governance.live_test_gate).toBe(
      'SHEIKHA_RUN_LIVE_EXTENSION_TESTS=true'
    );
  });

  test('api contract v2 generated report is active with all checks passing', () => {
    const report = readJson(
      'runtime/api-contract-registry/v2/sheikha-api-contract-check-report-v2.json'
    );

    expect(report.status).toBe('ACTIVE');
    expect(report.decision).toBe('API_CONTRACT_V2_READY');
    expect(Object.values(report.checks).every(Boolean)).toBe(true);
    expect(report.liveTestGate.environment).toBe('SHEIKHA_RUN_LIVE_EXTENSION_TESTS=true');
  });
});
