'use strict';

const fs = require('fs');
const path = require('path');
const { ok, fail } = require('../../lib/api-contracts/sheikha-api-response');

const ROOT = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function validSuccessShape(x) {
  return x && x.success === true && Object.prototype.hasOwnProperty.call(x, 'data') && x.meta;
}

function validFailureShape(x) {
  return x && x.success === false && x.error && Object.prototype.hasOwnProperty.call(x, 'data') && x.meta;
}

const successSample = ok({ name: 'Sheikha Root', status: 'active' });
const failureSample = fail('Missing required field', 'MISSING_FIELD', 400);

const checks = {
  responseLibrary: exists('lib/api-contracts/sheikha-api-response.js'),
  registryV2: exists('runtime/api-contract-registry/v2/sheikha-api-contract-registry-v2.json'),
  extensionCompatibilityV2: exists('runtime/extension-compatibility/v2/sheikha-extension-compatibility-v2.json'),
  successShape: validSuccessShape(successSample),
  failureShape: validFailureShape(failureSample),
  serverExists: exists('server.js'),
  vscodeExtensionTestsExist: exists('sheikha-vscode-extension/tests/integration.test.js')
};

const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);

const report = {
  system: 'SHEIKHA_API_CONTRACT_CHECK_V2',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 10) : 100,
  decision: missing.length ? 'REVIEW_API_CONTRACT_GAPS' : 'API_CONTRACT_V2_READY',
  checks,
  missing,
  samples: {
    successSample,
    failureSample
  },
  nextActions: [
    'Use ok(data, meta) for all new success responses.',
    'Use fail(message, code, status, meta) for validation failures.',
    'Keep legacy flat responses only behind compatibility adapters.',
    'Patch VS Code routes to return { success, data, meta }.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

const outDir = path.join(ROOT, 'runtime/api-contract-registry/v2');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, 'sheikha-api-contract-check-report-v2.json'),
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
