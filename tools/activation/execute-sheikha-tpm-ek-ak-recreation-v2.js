#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { packTpm2ToolsCredential } = require('../../core/governance/sheikha-tpm-id-object-framing-v2');

const ROOT = path.resolve(__dirname, '..', '..');
const CONTRACT_PATH = path.join(ROOT, 'runtime/governance/platform-trust/v2/evidence/tpm-ek-ak-recreation-contract-v2.json');
const INVENTORY_PATH = path.join(ROOT, 'runtime/governance/platform-trust/v2/evidence/tpm-read-only-inventory-v2.json');
const ENGINE_PATH = '/home/sheikha/Projects/sheikha/validation-execution/sheikha-ecc-ek-ak-create-20260901T191710Z/makecredential-v2-framing-repair/provenance/sheikha-ecc-makecredential-kdfe-v2.js';
const AUTH = 'SHEIKHA_AUTHORIZE_DEVICE_BOUND_EK_AK_RECREATION_V2';
const EXPECTED_CONTRACT = '6c1418edf568fb51dd49efbb44b3c8f60c1121de00f22dac5e0c18fe5b5f558e';
const EXPECTED_ENGINE = '17d294d55b38c13008f3aeb8bd24e2ad408754b16821595a55accde188e46c0b';
const DEVICE = 'device:/dev/tpmrm0';
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');

if (process.env[AUTH] !== 'YES') throw new Error(`${AUTH}_REQUIRED`);
const contract = JSON.parse(fs.readFileSync(CONTRACT_PATH, 'utf8'));
const { contractSha256, ...contractBase } = contract;
if (contractSha256 !== EXPECTED_CONTRACT || digest(JSON.stringify(contractBase)) !== EXPECTED_CONTRACT) {
  throw new Error('AUTHORIZED_CONTRACT_DIGEST_MISMATCH');
}
const inventoryRaw = fs.readFileSync(INVENTORY_PATH);
if (digest(inventoryRaw) !== contract.inventoryReportSha256) throw new Error('INVENTORY_BINDING_MISMATCH');
const engineRaw = fs.readFileSync(ENGINE_PATH);
if (digest(engineRaw) !== EXPECTED_ENGINE) throw new Error('MAKECREDENTIAL_ENGINE_DIGEST_MISMATCH');

const stamp = new Date().toISOString().replace(/[-:.]/g, '').replace('Z', 'Z');
const output = path.join(ROOT, 'runtime/governance/platform-trust/v2/executions', `ek-ak-recreation-${stamp}`);
const logs = path.join(output, 'logs');
const secrets = path.join(output, 'secrets');
fs.mkdirSync(logs, { recursive: true, mode: 0o700 });
fs.mkdirSync(secrets, { recursive: true, mode: 0o700 });

const files = {
  ekContext: path.join(output, 'ek.ctx'),
  ekPublic: path.join(output, 'ek.pub'),
  ekPem: path.join(output, 'ek.pem'),
  ekName: path.join(output, 'ek.name'),
  ekQname: path.join(output, 'ek.qname'),
  akContext: path.join(output, 'ak.ctx'),
  akPublic: path.join(output, 'ak.pub'),
  akPem: path.join(output, 'ak.pem'),
  akName: path.join(output, 'ak.name'),
  akCreateName: path.join(output, 'ak.create.name'),
  akCreateQname: path.join(output, 'ak.create.qname'),
  akQname: path.join(output, 'ak.qname'),
  akAuth: path.join(secrets, 'ak.auth.bin'),
  expectedCredential: path.join(secrets, 'expected-credential.bin'),
  credentialBlob: path.join(output, 'credentialBlob.tpm2b'),
  encryptedSecret: path.join(output, 'encryptedSecret.tpm2b'),
  packedCredential: path.join(output, 'tpm2-tools-credential.bin'),
};
fs.writeFileSync(files.akAuth, crypto.randomBytes(32), { mode: 0o600 });
fs.writeFileSync(files.expectedCredential, crypto.randomBytes(32), { mode: 0o600 });

const executed = [];
function run(stage, command, args) {
  if (!contract.allowedCommands.includes(command)) throw new Error(`COMMAND_NOT_AUTHORIZED:${command}`);
  const result = spawnSync(command, ['-T', DEVICE, ...args], { encoding: 'utf8', timeout: 30000 });
  fs.writeFileSync(path.join(logs, `${stage}.stdout`), result.stdout || '', { mode: 0o600 });
  fs.writeFileSync(path.join(logs, `${stage}.stderr`), result.stderr || '', { mode: 0o600 });
  executed.push({ stage, command, exitCode: result.status, stderrSha256: digest(result.stderr || '') });
  if (result.status !== 0) throw new Error(`${stage}_FAILED:${result.status}`);
}

let success = false;
try {
  run('create-ek', 'tpm2_createek', ['-G', 'ecc', '-c', files.ekContext, '-u', files.ekPublic]);
  run('read-ek', 'tpm2_readpublic', ['-c', files.ekContext, '-o', files.ekPem, '-f', 'pem', '-n', files.ekName, '-q', files.ekQname]);
  run('create-ak', 'tpm2_createak', [
    '-C', files.ekContext, '-G', 'ecc', '-g', 'sha256', '-s', 'ecdsa',
    '-p', `file:${files.akAuth}`, '-c', files.akContext, '-u', files.akPublic,
    '-n', files.akCreateName, '-q', files.akCreateQname,
  ]);
  run('read-ak', 'tpm2_readpublic', ['-c', files.akContext, '-o', files.akPem, '-f', 'pem', '-n', files.akName, '-q', files.akQname]);

  const { makeCredentialEcc } = require(ENGINE_PATH);
  const generated = makeCredentialEcc({
    ekPublicKeyPem: fs.readFileSync(files.ekPem),
    akName: fs.readFileSync(files.akName),
    credential: fs.readFileSync(files.expectedCredential),
  });
  const packed = packTpm2ToolsCredential(generated.credentialBlob, generated.encryptedSecret);
  fs.writeFileSync(files.credentialBlob, generated.credentialBlob, { mode: 0o600 });
  fs.writeFileSync(files.encryptedSecret, generated.encryptedSecret, { mode: 0o600 });
  fs.writeFileSync(files.packedCredential, packed, { mode: 0o600 });
  if (generated.credentialBlob.length !== 70 || packed.length !== 148) throw new Error('V2_FRAMING_LENGTH_INVALID');

  const manifestBase = {
    system: 'SHEIKHA_DEVICE_BOUND_EK_AK_RECREATION_EXECUTION_V2',
    status: 'EK_AK_RECREATED_AND_CREDENTIAL_V2_REBOUND_NOT_ACTIVATED',
    device: '/dev/tpmrm0',
    contractSha256,
    engineSha256: EXPECTED_ENGINE,
    executed,
    artifacts: Object.fromEntries([
      ['ekPublic', files.ekPublic], ['ekPem', files.ekPem], ['ekName', files.ekName],
      ['akPublic', files.akPublic], ['akPem', files.akPem], ['akName', files.akName],
      ['credentialBlob', files.credentialBlob], ['encryptedSecret', files.encryptedSecret],
      ['packedCredential', files.packedCredential], ['expectedCredential', files.expectedCredential],
    ].map(([name, file]) => [name, { path: file, sha256: digest(fs.readFileSync(file)), bytes: fs.statSync(file).size }])),
    controls: {
      persistentHandleCreated: false,
      activateCredentialExecuted: false,
      firmwareOrSecureBootModified: false,
      networkUsed: false,
      separateActivationAuthorizationRequired: true,
    },
    nextStage: 'REVIEW_AND_ISSUE_SINGLE_USE_ACTIVATECREDENTIAL_V2_AUTHORIZATION',
  };
  const manifest = { ...manifestBase, manifestSha256: digest(JSON.stringify(manifestBase)) };
  fs.writeFileSync(path.join(output, 'execution-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
  success = true;
  process.stdout.write(`${JSON.stringify({ ...manifest, output }, null, 2)}\n`);
} finally {
  if (!success) {
    for (const file of [files.akAuth, files.expectedCredential]) fs.rmSync(file, { force: true });
  }
}
