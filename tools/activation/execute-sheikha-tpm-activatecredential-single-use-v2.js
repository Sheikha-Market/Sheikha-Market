#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const EXECUTION_DIR = path.join(ROOT, 'runtime/governance/platform-trust/v2/executions/ek-ak-recreation-20260902T044629229Z');
const CONTRACT_PATH = path.join(EXECUTION_DIR, 'activatecredential-single-use-contract-v2.json');
const MANIFEST_PATH = path.join(EXECUTION_DIR, 'execution-manifest.json');
const OUTPUT_DIR = path.join(EXECUTION_DIR, 'activatecredential-v2');
const CONSUMPTION_PATH = path.join(OUTPUT_DIR, 'authorization-consumed.json');
const RESULT_PATH = path.join(OUTPUT_DIR, 'activation-result.json');
const SESSION_PATH = path.join(OUTPUT_DIR, 'policy-session.ctx');
const RECOVERED_PATH = path.join(OUTPUT_DIR, 'recovered-credential.bin');
const DEVICE = 'device:/dev/tpmrm0';
const AUTH = 'SHEIKHA_AUTHORIZE_SINGLE_USE_ACTIVATECREDENTIAL_V2';
const EXPECTED_CONTRACT = '1735d6e61122bbaf2245442168cd806ffd0cb7faec0cf401a2adad004b0325c4';
const EXPECTED_EK_POLICY = '837197674484b3f81a90cc8d46a5d724fd52d76e06520b64f2a1da1b331469aa';

const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');
const now = () => new Date().toISOString();

function fail(message) {
  throw new Error(message);
}

if (process.env[AUTH] !== 'YES') fail(`${AUTH}_REQUIRED`);
const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, 'utf8'));
const { contractSha256, ...contractBody } = contract;
if (contractSha256 !== EXPECTED_CONTRACT || sha256(JSON.stringify(contractBody)) !== EXPECTED_CONTRACT) {
  fail('AUTHORIZED_CONTRACT_DIGEST_MISMATCH');
}
if (contract.device !== '/dev/tpmrm0') fail('DEVICE_SCOPE_MISMATCH');
if (Date.now() >= Date.parse(contract.expiresAt)) fail('AUTHORIZATION_EXPIRED');
if (contract.maximumActivateCredentialCalls !== 1) fail('SINGLE_USE_LIMIT_MISMATCH');
if (sha256(fs.readFileSync(MANIFEST_PATH)) !== contract.executionManifestFileSha256) fail('EXECUTION_MANIFEST_BINDING_MISMATCH');
for (const [name, binding] of Object.entries(contract.artifactBindings)) {
  if (!path.resolve(binding.path).startsWith(`${EXECUTION_DIR}${path.sep}`)) fail(`ARTIFACT_SCOPE_MISMATCH:${name}`);
  if (sha256(fs.readFileSync(binding.path)) !== binding.sha256) fail(`ARTIFACT_DIGEST_MISMATCH:${name}`);
}

fs.mkdirSync(OUTPUT_DIR, { recursive: true, mode: 0o700 });
const consumedAt = now();
const consumption = {
  system: contract.system,
  contractSha256,
  nonce: contract.nonce,
  consumedAt,
  maximumActivateCredentialCalls: 1,
};
const marker = fs.openSync(CONSUMPTION_PATH, 'wx', 0o600);
fs.writeFileSync(marker, `${JSON.stringify(consumption, null, 2)}\n`);
fs.closeSync(marker);

const calls = [];
let activateCredentialCalls = 0;
let sessionStarted = false;
let resultStatus = 'ACTIVATION_FAILED_NO_RETRY_ALLOWED';
let failure = null;

function run(stage, command, args, { allowFailure = false } = {}) {
  if (!contract.allowedCommands.includes(command)) fail(`COMMAND_NOT_AUTHORIZED:${command}`);
  if (command === 'tpm2_activatecredential' && ++activateCredentialCalls > 1) fail('SECOND_ACTIVATION_ATTEMPT_DENIED');
  const result = spawnSync(command, ['-T', DEVICE, ...args], { encoding: 'utf8', timeout: 30000 });
  fs.writeFileSync(path.join(OUTPUT_DIR, `${stage}.stdout`), result.stdout || '', { mode: 0o600 });
  fs.writeFileSync(path.join(OUTPUT_DIR, `${stage}.stderr`), result.stderr || '', { mode: 0o600 });
  calls.push({ stage, command, exitCode: result.status, stdoutSha256: sha256(result.stdout || ''), stderrSha256: sha256(result.stderr || '') });
  if (result.status !== 0 && !allowFailure) fail(`${stage}_FAILED:${result.status}`);
  return result;
}

try {
  run('start-policy-session', 'tpm2_startauthsession', ['--policy-session', '-S', SESSION_PATH]);
  sessionStarted = true;
  const policy = run('authorize-endorsement-policy', 'tpm2_policysecret', ['-S', SESSION_PATH, '-c', 'e']);
  const policyText = `${policy.stdout || ''}\n${policy.stderr || ''}`.toLowerCase();
  const printedDigests = policyText.match(/[a-f0-9]{64}/g) || [];
  if (printedDigests.length && !printedDigests.includes(EXPECTED_EK_POLICY)) fail('ENDORSEMENT_POLICY_DIGEST_MISMATCH');

  run('activate-credential-single-use', 'tpm2_activatecredential', [
    '-c', contract.artifactBindings.akContext.path,
    '-C', contract.artifactBindings.ekContext.path,
    '-i', contract.artifactBindings.packedCredential.path,
    '-o', RECOVERED_PATH,
    '-p', `file:${contract.artifactBindings.akAuth.path}`,
    '-P', `session:${SESSION_PATH}`,
  ]);
  fs.chmodSync(RECOVERED_PATH, 0o600);
  const recoveredSha256 = sha256(fs.readFileSync(RECOVERED_PATH));
  if (recoveredSha256 !== contract.artifactBindings.expectedCredential.sha256) fail('RECOVERED_CREDENTIAL_DIGEST_MISMATCH');
  resultStatus = 'ACTIVATECREDENTIAL_V2_VERIFIED_SINGLE_USE_COMPLETE';
} catch (error) {
  failure = error.message;
} finally {
  if (sessionStarted) {
    const flushed = run('flush-policy-session', 'tpm2_flushcontext', [SESSION_PATH], { allowFailure: true });
    if (flushed.status !== 0) failure = failure ? `${failure};SESSION_FLUSH_FAILED:${flushed.status}` : `SESSION_FLUSH_FAILED:${flushed.status}`;
  }
  const resultBase = {
    system: 'SHEIKHA_SINGLE_USE_ACTIVATECREDENTIAL_EXECUTION_V2',
    status: failure ? 'ACTIVATION_FAILED_NO_RETRY_ALLOWED' : resultStatus,
    contractSha256,
    nonce: contract.nonce,
    device: '/dev/tpmrm0',
    consumedAt,
    completedAt: now(),
    activateCredentialCalls,
    recoveredCredentialMatches: !failure && resultStatus === 'ACTIVATECREDENTIAL_V2_VERIFIED_SINGLE_USE_COMPLETE',
    sessionFlushAttempted: sessionStarted,
    failure,
    calls,
    controls: {
      authorizationConsumedBeforeTpmAccess: true,
      retryAllowed: false,
      networkUsed: false,
      persistentHandleCreated: false,
      firmwareOrSecureBootModified: false,
    },
  };
  const result = { ...resultBase, resultSha256: sha256(JSON.stringify(resultBase)) };
  fs.writeFileSync(RESULT_PATH, `${JSON.stringify(result, null, 2)}\n`, { mode: 0o600 });
  process.stdout.write(`${JSON.stringify({ ...result, resultPath: RESULT_PATH }, null, 2)}\n`);
  if (failure) process.exitCode = 1;
}
