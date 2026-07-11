'use strict';

const fs = require('node:fs');
const path = require('node:path');

const {
  ROOT,
  fileMetadata,
  run,
  sha256File,
  writeJson
} = require('../../common/distribution-utils');

const SOURCES = Object.freeze([
  {
    id: 'bare-metal-uefi-x86_64',
    source: 'bare-metal/images/esp/EFI/BOOT/BOOTX64.EFI',
    format: 'efi',
    architecture: 'x86_64',
    name: (version) => `sheikha-bare-metal-${version}-x86_64.efi`
  },
  {
    id: 'bare-metal-fat-esp-image-x86_64',
    source: 'bare-metal/images/sheikha-bare-metal-seed-v1.img',
    format: 'img',
    architecture: 'x86_64',
    name: (version) => `sheikha-bare-metal-${version}-x86_64.img`
  }
]);

function stageAndInspectBareMetal(context) {
  const bootEvidencePath = path.join(ROOT, 'runtime/bare-metal/v1/evidence/boot-verification.json');
  const serialEvidencePath = path.join(ROOT, 'runtime/bare-metal/v1/evidence/qemu-serial.log');
  const bootEvidence = JSON.parse(fs.readFileSync(bootEvidencePath, 'utf8'));
  const serialEvidence = fs.readFileSync(serialEvidencePath, 'utf8');
  const qemuVerified = bootEvidence.qemuBootExecuted === true &&
    bootEvidence.serialBootMarkerVerified === true &&
    serialEvidence.includes('SHEIKHA_BARE_METAL_BOOT_OK');

  return SOURCES.map((definition) => {
    const sourcePath = path.join(ROOT, definition.source);
    const artifactName = definition.name(context.version);
    const artifactPath = path.join(context.artifactDir, artifactName);
    fs.copyFileSync(sourcePath, artifactPath);
    const fileInspection = run('file', [artifactPath], { allowFailure: true });
    const formatPassed = definition.format === 'efi'
      ? /PE32\+ executable \(EFI application\) x86-64/u.test(fileInspection.stdout)
      : /FAT \(12 bit\)/u.test(fileInspection.stdout);
    const artifact = fileMetadata(artifactPath);
    const sourceShaMatches = artifact.sha256 === sha256File(sourcePath);
    const verification = {
      system: 'SHEIKHA_BARE_METAL_DISTRIBUTION_VERIFICATION_V2',
      artifactId: definition.id,
      artifact,
      source: definition.source,
      architecture: definition.architecture,
      format: definition.format,
      artifactExists: artifact.bytes > 0,
      sourceShaMatches,
      formatInspectionPassed: formatPassed,
      fileInspection: fileInspection.stdout,
      qemuBootPreviouslyVerified: qemuVerified,
      qemuEvidence: [
        'runtime/bare-metal/v1/evidence/boot-verification.json',
        'runtime/bare-metal/v1/evidence/qemu-serial.log'
      ],
      physicalHardwareVerified: false,
      status: formatPassed && sourceShaMatches && qemuVerified ? 'INSPECTED' : 'FAILED',
      limitation: 'QEMU UEFI boot evidence is verified; physical hardware qualification has not been performed.'
    };
    const evidencePath = path.join(context.verificationDir, `${artifactName}.verification.json`);
    writeJson(evidencePath, verification);
    return {
      id: definition.id,
      product: 'sheikha-bare-metal-seed',
      version: context.version,
      status: verification.status,
      built: true,
      verified: false,
      nativeVerified: false,
      qemuVerified,
      signed: false,
      notarized: false,
      artifact,
      evidence: path.relative(ROOT, evidencePath),
      verification
    };
  });
}

module.exports = { SOURCES, stageAndInspectBareMetal };
