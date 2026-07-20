'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEVICE_MATRIX,
  HARDWARE_REPORT,
  MANIFEST,
  REPORT,
  buildDeviceMatrix,
  classifyDevice,
  normalizeArchitecture,
} = require(
  '../bare-metal/build/' +
    'sheikha-bare-metal-v2-physical-trial-v1'
);

const ROOT = path.resolve(__dirname, '..');

function digest(relativePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(path.join(ROOT, relativePath)))
    .digest('hex');
}

describe('Sheikha V2 physical boot trial', () => {
  test('normalizes Node and Linux x86_64 architecture names', () => {
    expect(normalizeArchitecture('x64')).toBe('x86_64');
    expect(normalizeArchitecture('amd64')).toBe('x86_64');
    expect(normalizeArchitecture('x86_64')).toBe('x86_64');
  });

  test('rejects an internal mounted system disk', () => {
    const result = classifyDevice({
      name: 'nvme0n1',
      path: '/dev/nvme0n1',
      type: 'disk',
      size: 1000000000,
      rm: false,
      ro: false,
      tran: 'nvme',
      mountpoints: [null],
      children: [
        { mountpoints: ['/boot/efi'], children: [] },
      ],
    }, 1474560);

    expect(result.reviewEligible).toBe(false);
    expect(result.systemRelated).toBe(true);
    expect(result.rejectionReasons).toContain(
      'SYSTEM_DISK_OR_BOOT_MEDIA'
    );
  });

  test('allows only an unmounted removable disk for human review', () => {
    const result = classifyDevice({
      name: 'sdb',
      path: '/dev/sdb',
      type: 'disk',
      size: 8000000000,
      rm: true,
      ro: false,
      tran: 'usb',
      mountpoints: [null],
      children: [],
    }, 1474560);

    expect(result.reviewEligible).toBe(true);
    expect(result.writeAuthorized).toBe(false);
  });

  test('does not claim universal architecture or device support', () => {
    const matrix = buildDeviceMatrix({
      cpu: { architecture: 'x86_64' },
      firmware: {
        bootMode: 'UEFI',
        secureBoot: { state: 'DISABLED' },
      },
    });

    expect(matrix.universalDeviceSupportClaimed).toBe(false);
    expect(matrix.targets.find((target) =>
      target.family.startsWith('ARM64')
    ).status).toContain('PORT');
  });

  test('records a read-only host preflight and verified manifest', () => {
    const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    const hardware = JSON.parse(
      fs.readFileSync(HARDWARE_REPORT, 'utf8')
    );

    expect(report.qemuBootVerified).toBe(true);
    expect(report.physicalMediaWritten).toBe(false);
    expect(report.physicalBootVerified).toBe(false);
    expect(report.visualIndicatorImplemented).toBe(true);
    expect(manifest.hashesMatchPhaseReport).toBe(true);
    expect(hardware.inspectionMode).toBe('READ_ONLY');
    expect(hardware.writesPerformed).toBe(false);
    expect(fs.existsSync(DEVICE_MATRIX)).toBe(true);
    expect(fs.existsSync(REPORT)).toBe(true);
  });

  test('binds the manifest hashes to the actual boot artifacts', () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    for (const artifact of manifest.artifacts) {
      expect(artifact.sha256).toBe(digest(artifact.path));
    }
  });

  test('keeps external certificates at the evidenced count', () => {
    const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
    expect(
      report.methodologyAndAccreditation.externalCertificatesIssued
    ).toBe(0);
    expect(
      report.methodologyAndAccreditation
        .officialExternalCertificationClaimed
    ).toBe(false);
  });
});
