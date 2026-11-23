'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  EFI_ARTIFACT,
  IMAGE,
  MANIFEST,
  QEMU_REPORT,
  REPORT,
  calculateFat32Geometry,
  crc32,
  inspectImage,
} = require(
  '../bare-metal/build/sheikha-bare-metal-v2-msi-usb-v1'
);

function sha256(filePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}

describe('Sheikha V2 MSI USB GPT boot trial', () => {
  const writer = path.resolve(
    __dirname,
    '../scripts/bare-metal/v2/write-msi-usb-v1.sh'
  );

  test('uses a FAT32 geometry valid for UEFI removable media', () => {
    const geometry = calculateFat32Geometry();
    expect(geometry.clusters).toBeGreaterThanOrEqual(65525);
    expect(geometry.sectorsPerCluster).toBe(1);
  });

  test('implements the standard CRC-32 check value', () => {
    expect(crc32(Buffer.from('123456789'))).toBe(0xcbf43926);
  });

  test('contains a verified GPT ESP and exact UEFI fallback artifact', () => {
    const image = fs.readFileSync(IMAGE);
    const efi = fs.readFileSync(EFI_ARTIFACT);
    const inspection = inspectImage(image, efi);
    expect(inspection.verified).toBe(true);
    expect(inspection.checks.protectiveMbr).toBe(true);
    expect(inspection.checks.primaryGptHeaderCrc).toBe(true);
    expect(inspection.checks.partitionArrayCrc).toBe(true);
    expect(inspection.checks.fat32Signature).toBe(true);
    expect(inspection.checks.fallbackArtifactContent).toBe(true);
  });

  test('binds the image and EFI hashes without installation claims', () => {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
    const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
    expect(manifest.artifacts[0].sha256).toBe(sha256(IMAGE));
    expect(manifest.artifacts[1].sha256).toBe(sha256(EFI_ARTIFACT));
    expect(report.diskInstallerImplemented).toBe(false);
    expect(report.installableToInternalDisk).toBe(false);
    expect(report.physicalMediaWritten).toBe(false);
    expect(report.physicalBootVerified).toBe(false);
    const qemu = JSON.parse(fs.readFileSync(QEMU_REPORT, 'utf8'));
    expect(qemu.imageSha256).toBe(sha256(IMAGE));
    expect(qemu.efiArtifactSha256).toBe(sha256(EFI_ARTIFACT));
    expect(qemu.networkEnabled).toBe(false);
  });

  test('keeps system-disk rejection and post-write readback mandatory', () => {
    const source = fs.readFileSync(writer, 'utf8');
    expect(source).toContain('ERROR=SYSTEM_DISK_REJECTED');
    expect(source).toContain('ERROR=TARGET_OR_CHILD_PARTITION_IS_MOUNTED');
    expect(source).toContain('POST_WRITE_READBACK_HASH_MISMATCH');
    expect(source).toContain('POST_WRITE_READBACK_VERIFIED=true');
    expect(source).toContain('READBACK_SHA256');
  });
});
