#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..', '..');
const PHYSICAL = path.join(ROOT, 'runtime/bare-metal/v2/evidence/physical-hardware-boot-verification.json');
const OUTPUT = path.join(ROOT, 'runtime/governance/platform-trust/v1/sheikha-physical-platform-trust-v1-report.json');

function secureBootProbe() {
  const dir = '/sys/firmware/efi/efivars';
  try {
    const name = fs.readdirSync(dir).find((entry) => entry.startsWith('SecureBoot-'));
    if (!name) return {variablePresent: false, enabled: false};
    const value = fs.readFileSync(path.join(dir, name));
    return {variablePresent: true, enabled: value.length >= 5 && value[4] === 1};
  } catch { return {variablePresent: false, enabled: false}; }
}

function inspectLocalProbes() {
  const secureBoot = secureBootProbe();
  let tpmVersion = null;
  try { tpmVersion = fs.readFileSync('/sys/class/tpm/tpm0/tpm_version_major', 'utf8').trim(); } catch {}
  let measuredBootEventLogReadable = false;
  try { fs.accessSync('/sys/kernel/security/tpm0/binary_bios_measurements', fs.constants.R_OK); measuredBootEventLogReadable = true; } catch {}
  return {
    uefiRuntimePresent: fs.existsSync('/sys/firmware/efi'),
    secureBootVariablePresent: secureBoot.variablePresent,
    secureBootEnabled: secureBoot.enabled,
    tpmPresent: fs.existsSync('/sys/class/tpm/tpm0'),
    tpmVersion,
    measuredBootEventLogReadable,
    bmcIpmiPresent: fs.existsSync('/sys/class/ipmi')
  };
}

function evaluateTrust({physical, probes}) {
  const checks = {
    platformIdentityBound: physical.verified === true && Boolean(physical.platform?.vendor && physical.platform?.model && physical.artifact?.sha256),
    physicalBootEvidenceVerified: physical.verified === true,
    uefiRuntimePresent: probes.uefiRuntimePresent === true,
    secureBootEnabled: probes.secureBootEnabled === true,
    tpm2Present: probes.tpmPresent === true && probes.tpmVersion === '2',
    measuredBootEvidenceAvailable: probes.measuredBootEventLogReadable === true,
    cryptographicAttestationVerified: false,
    bmcIdentityAndAttestationVerified: false
  };
  const report = {
    schemaVersion: '1.0.0', system: 'SHEIKHA_PHYSICAL_PLATFORM_TRUST_AND_ATTESTATION_V1',
    status: Object.values(checks).every(Boolean) ? 'PLATFORM_TRUST_ATTESTATION_VERIFIED' : 'PARTIAL_LOCAL_PLATFORM_TRUST_EVIDENCE',
    checkedAt: new Date().toISOString(), platform: physical.platform, artifact: physical.artifact,
    probes, checks, blockers: Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name),
    claimBoundary: {
      localObservationOnly: true, remoteAttestationClaimed: false,
      secureBootClaimed: probes.secureBootEnabled === true,
      measuredBootClaimed: probes.measuredBootEventLogReadable === true,
      productionReadinessClaimed: false
    }
  };
  report.reportSha256 = crypto.createHash('sha256').update(JSON.stringify(report)).digest('hex');
  return report;
}

function generate() {
  const report = evaluateTrust({physical: JSON.parse(fs.readFileSync(PHYSICAL, 'utf8')), probes: inspectLocalProbes()});
  fs.mkdirSync(path.dirname(OUTPUT), {recursive: true });
  fs.writeFileSync(OUTPUT, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}

if (require.main === module) process.stdout.write(`${JSON.stringify(generate(), null, 2)}\n`);
module.exports = {evaluateTrust, generate, inspectLocalProbes, OUTPUT};
