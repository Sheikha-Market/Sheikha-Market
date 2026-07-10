'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  BOOT_MARKER,
  POST_HANDOFF_MARKER,
  parsePeArtifact
} = require('../bare-metal/build/sheikha-bare-metal-pipeline-v1');

const ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(ROOT, 'runtime/bare-metal/v1/sheikha-bare-metal-seed-v1-report.json');
const EFI_PATH = path.join(ROOT, 'bare-metal/images/esp/EFI/BOOT/BOOTX64.EFI');
const IMAGE_PATH = path.join(ROOT, 'bare-metal/images/sheikha-bare-metal-seed-v1.img');
const SERIAL_PATH = path.join(ROOT, 'runtime/bare-metal/v1/evidence/qemu-serial.log');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function hash(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

describe('Sheikha Native Bare-Metal Seed V1', () => {
  test('defines the five governed boot contracts', () => {
    const contracts = [
      readJson('bare-metal/contracts/SHEIKHA-BOOT-CONTRACT-V1.json'),
      readJson('bare-metal/contracts/SHEIKHA-KERNEL-CONTRACT-V1.json'),
      readJson('bare-metal/contracts/SHEIKHA-HAL-CONTRACT-V1.json'),
      readJson('bare-metal/contracts/SHEIKHA-LANGUAGE-BOOT-CONTRACT-V1.json'),
      readJson('bare-metal/contracts/SHEIKHA-BARE-METAL-GOVERNANCE-CONTRACT-V1.json')
    ];

    expect(contracts.map((contract) => contract.id)).toEqual([
      'SHEIKHA_BOOT_CONTRACT_V1',
      'SHEIKHA_KERNEL_CONTRACT_V1',
      'SHEIKHA_HAL_CONTRACT_V1',
      'SHEIKHA_LANGUAGE_BOOT_CONTRACT_V1',
      'SHEIKHA_BARE_METAL_GOVERNANCE_CONTRACT_V1'
    ]);
    expect(contracts.every((contract) => contract.hostRuntimeDependencies?.length === 0 || contract.controls)).toBe(true);
  });

  test('produces a valid import-free PE32+ UEFI artifact', () => {
    const report = readJson('runtime/bare-metal/v1/sheikha-bare-metal-seed-v1-report.json');
    const pe = parsePeArtifact(EFI_PATH);

    expect(report.bootArtifactCreated).toBe(true);
    expect(pe.valid).toBe(true);
    expect(pe.machineName).toBe('x86_64');
    expect(pe.subsystemName).toBe('EFI_APPLICATION');
    expect(pe.importRva).toBe(0);
    expect(pe.importSize).toBe(0);
    expect(pe.relocationRva).toBeGreaterThan(0);
    expect(pe.relocationSize).toBeGreaterThan(0);
    expect(hash(EFI_PATH)).toBe(report.artifact.efi.sha256);
  });

  test('embeds the EFI artifact in the deterministic FAT image', () => {
    const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    const image = fs.readFileSync(IMAGE_PATH);
    const artifact = fs.readFileSync(EFI_PATH);

    expect(report.artifact.image.filesystem).toBe('FAT12');
    expect(report.artifact.image.fallbackPath).toBe('EFI/BOOT/BOOTX64.EFI');
    expect(hash(IMAGE_PATH)).toBe(report.artifact.image.sha256);
    expect(image.indexOf(artifact)).toBeGreaterThanOrEqual(0);
  });

  test('guards the success marker behind ExitBootServices', () => {
    const uefiSource = fs.readFileSync(
      path.join(ROOT, 'bare-metal/boot/uefi/sheikha_uefi_entry.c'),
      'utf8'
    );
    const kernelSource = fs.readFileSync(
      path.join(ROOT, 'bare-metal/kernel/entry/sheikha_kernel.c'),
      'utf8'
    );

    expect(uefiSource).toContain('exit_boot_services');
    expect(uefiSource).not.toContain(BOOT_MARKER);
    expect(kernelSource).toContain('boot_info->boot_services_exited');
    expect(kernelSource).toContain(BOOT_MARKER);
    expect(kernelSource).toContain(POST_HANDOFF_MARKER);
  });

  test('accepts bare-metal independence only with QEMU serial evidence', () => {
    const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    const verification = readJson('runtime/bare-metal/v1/evidence/boot-verification.json');
    const serial = fs.readFileSync(SERIAL_PATH, 'utf8');

    expect(report.status).toBe('VERIFIED_BARE_METAL_BOOT');
    expect(report.qemuBootExecuted).toBe(true);
    expect(report.serialBootMarkerVerified).toBe(true);
    expect(report.postFirmwareHandoffVerified).toBe(true);
    expect(report.bareMetalFullyIndependentToday).toBe(true);
    expect(verification.bootVerified).toBe(true);
    expect(verification.claimGuardPassed).toBe(true);
    expect(serial).toContain(BOOT_MARKER);
    expect(serial).toContain(POST_HANDOFF_MARKER);
  });

  test('keeps AI and unsupported religious claims outside the boot path', () => {
    const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
    const governance = readJson(
      'bare-metal/contracts/SHEIKHA-BARE-METAL-GOVERNANCE-CONTRACT-V1.json'
    );

    expect(report.aiInCriticalBootPath).toBe(false);
    expect(report.javascriptInBootChain).toBe(false);
    expect(report.linuxRequiredAtKernelRuntime).toBe(false);
    expect(report.nodeRequiredAtKernelRuntime).toBe(false);
    expect(governance.blockedClaims).toEqual(expect.arrayContaining([
      'revelation',
      'infallibility',
      'independent_fatwa'
    ]));
    expect(governance.controls.aiRuntimeKernelMutationAllowed).toBe(false);
    expect(governance.controls.humanReviewForHighImpactDecisions).toBe(true);
  });
});
