'use strict';

const fs = require('fs');
const path = require('path');
const {
  enforce,
  enforceSuccess,
  enforceFailure
} = require('../../lib/runtime-contract-enforcer/sheikha-runtime-contract-enforcer');

const ROOT = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function validSuccess(x) {
  return x && x.success === true && Object.prototype.hasOwnProperty.call(x, 'data') && x.meta;
}

function validFailure(x) {
  return x && x.success === false && x.error && Object.prototype.hasOwnProperty.call(x, 'data') && x.meta;
}

const legacyStatus = {
  success: true,
  name: 'Sheikha',
  status: 'active'
};

const alreadyValid = {
  success: true,
  data: { name: 'Sheikha Root' },
  meta: { contract: 'SHEIKHA_API_CONTRACT_V2' }
};

const legacyFailure = {
  success: false,
  message: 'Missing prompt',
  code: 'MISSING_PROMPT',
  status: 400
};

const samples = {
  legacyStatusWrapped: enforce(legacyStatus),
  alreadyValidPreserved: enforce(alreadyValid),
  legacyFailureWrapped: enforceFailure(legacyFailure),
  rawStringWrapped: enforceSuccess('ok')
};

const checks = {
  enforcerLibrary: exists('lib/runtime-contract-enforcer/sheikha-runtime-contract-enforcer.js'),
  enforcerRegistry: exists('runtime/runtime-contract-enforcer/v1/sheikha-runtime-contract-enforcer-v1.json'),
  apiContractV2: exists('runtime/api-contract-registry/v2/sheikha-api-contract-registry-v2.json'),
  extensionCompatibilityV2: exists('runtime/extension-compatibility/v2/sheikha-extension-compatibility-v2.json'),
  heartCore: exists('runtime/heart-core/v1/sheikha-heart-core-report.json'),
  successWraps: validSuccess(samples.legacyStatusWrapped),
  validPreserved: validSuccess(samples.alreadyValidPreserved),
  failureWraps: validFailure(samples.legacyFailureWrapped),
  stringWraps: validSuccess(samples.rawStringWrapped)
};

const missing = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);

const report = {
  system: 'SHEIKHA_RUNTIME_CONTRACT_ENFORCER_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 10) : 100,
  decision: missing.length ? 'REVIEW_RUNTIME_CONTRACT_GAPS' : 'RUNTIME_CONTRACT_ENFORCER_ACTIVE_100',
  checks,
  missing,
  samples,
  nextActions: [
    'Use sendOk/sendFail in routes that currently return flat legacy responses.',
    'Patch /api/sheikha/status to return enforced { success, data, meta }.',
    'Patch VS Code extension routes gradually behind compatibility adapters.',
    'Keep legacy route semantics stable while enforcing response shape.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

const outDir = path.join(ROOT, 'runtime/runtime-contract-enforcer/v1');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'sheikha-runtime-contract-enforcer-report.json'),
  JSON.stringify(report, null, 2)
);

console.log(JSON.stringify(report, null, 2));
