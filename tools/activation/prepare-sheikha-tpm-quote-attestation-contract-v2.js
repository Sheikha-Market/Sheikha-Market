#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { buildQuoteAttestationContract } = require('../../core/governance/sheikha-tpm-quote-attestation-contract-v2');

const ROOT = path.resolve(__dirname, '..', '..');
const EXECUTION_DIR = path.join(ROOT, 'runtime/governance/platform-trust/v2/executions/ek-ak-recreation-20260902T044629229Z');
const ACTIVATION_RESULT = path.join(EXECUTION_DIR, 'activatecredential-v2/activation-result.json');
const OUTPUT = path.join(EXECUTION_DIR, 'quote-attestation-single-use-contract-v2.json');
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

const activationRaw = fs.readFileSync(ACTIVATION_RESULT);
const activation = JSON.parse(activationRaw);
if (activation.status !== 'ACTIVATECREDENTIAL_V2_VERIFIED_SINGLE_USE_COMPLETE'
  || activation.recoveredCredentialMatches !== true
  || activation.activateCredentialCalls !== 1) {
  throw new Error('VERIFIED_ACTIVATECREDENTIAL_V2_REQUIRED');
}

const paths = {
  akContext: path.join(EXECUTION_DIR, 'ak.ctx'),
  akPublicPem: path.join(EXECUTION_DIR, 'ak.pem'),
  akName: path.join(EXECUTION_DIR, 'ak.name'),
  akAuth: path.join(EXECUTION_DIR, 'secrets/ak.auth.bin'),
};
const artifactBindings = Object.fromEntries(Object.entries(paths).map(([name, file]) => [name, {
  path: file,
  sha256: sha256(fs.readFileSync(file)),
}]));
const contract = buildQuoteAttestationContract({
  activationResultSha256: sha256(activationRaw),
  artifactBindings,
  nonce: crypto.randomBytes(32).toString('hex'),
  expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
});
fs.writeFileSync(OUTPUT, `${JSON.stringify(contract, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`${JSON.stringify({ ...contract, output: OUTPUT }, null, 2)}\n`);
