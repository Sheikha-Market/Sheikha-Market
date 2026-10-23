#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { buildActivateCredentialContract } = require('../../core/governance/sheikha-tpm-activatecredential-contract-v2');

const root = path.resolve(__dirname, '..', '..');
const executionRoot = path.join(root, 'runtime/governance/platform-trust/v2/executions');
const latest = fs.readdirSync(executionRoot)
  .filter((name) => name.startsWith('ek-ak-recreation-'))
  .sort()
  .at(-1);
if (!latest) throw new Error('EK_AK_RECREATION_EXECUTION_REQUIRED');
const dir = path.join(executionRoot, latest);
const manifestPath = path.join(dir, 'execution-manifest.json');
const manifestRaw = fs.readFileSync(manifestPath);
const manifest = JSON.parse(manifestRaw.toString('utf8'));
if (manifest.status !== 'EK_AK_RECREATED_AND_CREDENTIAL_V2_REBOUND_NOT_ACTIVATED') {
  throw new Error('UNACTIVATED_V2_EXECUTION_REQUIRED');
}
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');
const bind = (file) => ({ path: file, sha256: digest(fs.readFileSync(file)) });
const artifactBindings = {
  akContext: bind(path.join(dir, 'ak.ctx')),
  ekContext: bind(path.join(dir, 'ek.ctx')),
  packedCredential: bind(path.join(dir, 'tpm2-tools-credential.bin')),
  akAuth: bind(path.join(dir, 'secrets/ak.auth.bin')),
  expectedCredential: bind(path.join(dir, 'secrets/expected-credential.bin')),
};
const contract = buildActivateCredentialContract({
  executionManifestFileSha256: digest(manifestRaw),
  artifactBindings,
  nonce: crypto.randomBytes(16).toString('hex'),
  expiresAt: new Date(Date.now() + (60 * 60 * 1000)).toISOString(),
});
const output = path.join(dir, 'activatecredential-single-use-contract-v2.json');
fs.writeFileSync(output, `${JSON.stringify(contract, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`${JSON.stringify({ ...contract, contractPath: output }, null, 2)}\n`);
