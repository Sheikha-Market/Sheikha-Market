#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {
  REQUIRED_TOOLS,
  evaluateTpmQuoteReadiness
} = require('../../core/governance/sheikha-tpm-quote-readiness-v1');

const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT = path.join(ROOT, 'runtime/governance/platform-trust/v1/sheikha-tpm-quote-readiness-v1-report.json');
const TRUSTED_COMMAND_DIRECTORIES = Object.freeze([
  '/usr/local/sbin', '/usr/local/bin', '/usr/sbin', '/usr/bin', '/sbin', '/bin'
]);

function commandPath(command) {
  const executable = String(command || '');
  if (!/^[a-z0-9_-]+$/iu.test(executable)) return null;

  for (const directory of TRUSTED_COMMAND_DIRECTORIES) {
    const candidate = path.join(directory, executable);
    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      if (fs.statSync(candidate).isFile()) return candidate;
    } catch {
      continue;
    }
  }
  return null;
}

function secureBootEnabled() {
  const directory = '/sys/firmware/efi/efivars';
  try {
    const variable = fs.readdirSync(directory).find((name) => name.startsWith('SecureBoot-'));
    if (!variable) return false;
    const data = fs.readFileSync(path.join(directory, variable));
    return data.length >= 5 && data[4] === 1;
  } catch { return false; }
}

function inspect() {
  const eventLog = '/sys/kernel/security/tpm0/binary_bios_measurements';
  const tools = Object.fromEntries(REQUIRED_TOOLS.map((tool) => [tool, commandPath(tool)]));
  const probes = {
    tpm2SysfsPresent: fs.existsSync('/sys/class/tpm/tpm0') &&
      (() => { try { return fs.readFileSync('/sys/class/tpm/tpm0/tpm_version_major', 'utf8').trim() === '2'; } catch { return false; } })(),
    tpmResourceManagerPresent: fs.existsSync('/dev/tpmrm0'),
    eventLogPresent: fs.existsSync(eventLog),
    eventLogReadable: (() => { try { fs.accessSync(eventLog, fs.constants.R_OK); return true; } catch { return false; } })(),
    secureBootEnabled: secureBootEnabled(),
    akEnrollmentRecordConfigured: Boolean(process.env.SHEIKHA_AK_ENROLLMENT_RECORD),
    tools
  };
  const report = {...evaluateTpmQuoteReadiness(probes), checkedAt: new Date().toISOString()};
  report.reportSha256 = crypto.createHash('sha256').update(JSON.stringify(report)).digest('hex');
  fs.mkdirSync(path.dirname(OUTPUT), {recursive: true});
  fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return report;
}

if (require.main === module) process.stdout.write(`${JSON.stringify(inspect(), null, 2)}\n`);
module.exports = {
  OUTPUT,
  TRUSTED_COMMAND_DIRECTORIES,
  commandPath,
  inspect,
  secureBootEnabled
};
