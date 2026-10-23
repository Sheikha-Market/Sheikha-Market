#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { analyzeTpmInventory } = require('../../core/governance/sheikha-tpm-read-only-inventory-v2');

const AUTH = 'SHEIKHA_AUTHORIZE_TPM_READ_ONLY_INVENTORY_V2';
if (process.env[AUTH] !== 'YES') {
  process.stderr.write(`ERROR=${AUTH}_REQUIRED\n`);
  process.exit(2);
}

const tcti = process.env.SHEIKHA_TPM_TCTI || 'device:/dev/tpmrm0';
if (tcti !== 'device:/dev/tpmrm0') {
  process.stderr.write('ERROR=ONLY_DEVICE_TPMRM0_ALLOWED\n');
  process.exit(2);
}

function getCapability(capability) {
  const result = spawnSync('tpm2_getcap', ['-T', tcti, capability], {
    encoding: 'utf8',
    timeout: 10000,
    env: { ...process.env, TPM2TOOLS_TCTI: tcti },
  });
  return {
    capability,
    exitCode: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

function readClock() {
  const result = spawnSync('tpm2_readclock', ['-T', tcti], {
    encoding: 'utf8',
    timeout: 10000,
    env: { ...process.env, TPM2TOOLS_TCTI: tcti },
  });
  return {
    capability: 'clock-info',
    exitCode: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  };
}

const calls = {
  clockInfo: readClock(),
  propertiesFixed: getCapability('properties-fixed'),
  propertiesVariable: getCapability('properties-variable'),
  persistent: getCapability('handles-persistent'),
  transient: getCapability('handles-transient'),
  loadedSessions: getCapability('handles-loaded-session'),
  savedSessions: getCapability('handles-saved-session'),
};
const failed = Object.values(calls).filter((call) => call.exitCode !== 0);
const analysis = analyzeTpmInventory(Object.fromEntries(
  Object.entries(calls).map(([name, call]) => [name, call.stdout]),
));
const base = {
  system: 'SHEIKHA_TPM_READ_ONLY_RESET_COUNT_AND_HANDLE_INVENTORY_V2',
  status: failed.length || !analysis.countersObserved
    ? 'READ_ONLY_INVENTORY_INCOMPLETE'
    : 'READ_ONLY_INVENTORY_COMPLETE',
  checkedAt: new Date().toISOString(),
  device: '/dev/tpmrm0',
  allowedExecutables: ['tpm2_readclock', 'tpm2_getcap'],
  capabilities: Object.values(calls).map((call) => ({
    capability: call.capability,
    exitCode: call.exitCode,
    stdoutSha256: crypto.createHash('sha256').update(call.stdout).digest('hex'),
    stderr: call.stderr.trim() || null,
  })),
  ...analysis,
  controls: {
    tpmMutationExecuted: false,
    keyOrSessionCreated: false,
    activateCredentialExecuted: false,
    firmwareOrSecureBootModified: false,
    networkUsed: false,
    authorizationSinglePurpose: true,
  },
};
const report = { ...base, reportSha256: crypto.createHash('sha256').update(JSON.stringify(base)).digest('hex') };
const output = path.resolve(
  process.cwd(),
  'runtime/governance/platform-trust/v2/evidence/tpm-read-only-inventory-v2.json',
);
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exit(failed.length || !analysis.countersObserved ? 1 : 0);
