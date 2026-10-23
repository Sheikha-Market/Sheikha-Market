'use strict';

const fs = require('node:fs');
const {evaluateTrust, generate, OUTPUT} = require('../tools/activation/activate-sheikha-physical-platform-trust-v1');
const physical = require('../runtime/bare-metal/v2/evidence/physical-hardware-boot-verification.json');

describe('Sheikha physical platform trust V1', () => {
  test('keeps local state separate from cryptographic attestation', () => {
    const report = evaluateTrust({physical, probes: {
      uefiRuntimePresent: true, secureBootVariablePresent: true, secureBootEnabled: true,
      tpmPresent: true, tpmVersion: '2', measuredBootEventLogReadable: true, bmcIpmiPresent: true
    }});
    expect(report.checks.platformIdentityBound).toBe(true);
    expect(report.checks.cryptographicAttestationVerified).toBe(false);
    expect(report.checks.bmcIdentityAndAttestationVerified).toBe(false);
    expect(report.status).toBe('PARTIAL_LOCAL_PLATFORM_TRUST_EVIDENCE');
    expect(report.claimBoundary.remoteAttestationClaimed).toBe(false);
    expect(report.claimBoundary.productionReadinessClaimed).toBe(false);
  });

  test('does not claim Secure Boot or measured boot when disabled or unreadable', () => {
    const report = evaluateTrust({physical, probes: {
      uefiRuntimePresent: true, secureBootVariablePresent: true, secureBootEnabled: false,
      tpmPresent: true, tpmVersion: '2', measuredBootEventLogReadable: false, bmcIpmiPresent: false
    }});
    expect(report.claimBoundary.secureBootClaimed).toBe(false);
    expect(report.claimBoundary.measuredBootClaimed).toBe(false);
    expect(report.blockers).toEqual(expect.arrayContaining(['secureBootEnabled', 'measuredBootEvidenceAvailable', 'cryptographicAttestationVerified']));
  });

  test('writes a content-addressed local trust report', () => {
    const report = generate();
    expect(fs.existsSync(OUTPUT)).toBe(true);
    expect(report.reportSha256).toMatch(/^[a-f0-9]{64}$/);
  });
});
