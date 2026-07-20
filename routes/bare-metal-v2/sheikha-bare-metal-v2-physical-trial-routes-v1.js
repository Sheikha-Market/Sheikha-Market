'use strict';

const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const router = express.Router();
const ROOT = path.resolve(__dirname, '..', '..');
const EVIDENCE_DIR = path.join(
  ROOT,
  'runtime/bare-metal/v2/physical-trial/v1'
);
const PHYSICAL_REPORT = path.join(
  EVIDENCE_DIR,
  'sheikha-v2-physical-boot-trial-v1-report.json'
);
const USB_REPORT = path.join(
  EVIDENCE_DIR,
  'sheikha-v2-msi-usb-gpt-v1-report.json'
);
const USB_MANIFEST = path.join(
  EVIDENCE_DIR,
  'sheikha-v2-msi-usb-gpt-v1-manifest.json'
);
const VISUAL_EVIDENCE = path.join(
  EVIDENCE_DIR,
  'sheikha-v2-msi-usb-gpt-v1-visual-evidence.json'
);
const IMAGE = path.join(
  ROOT,
  'bare-metal/images/v2/' +
    'sheikha-sovereign-bare-metal-v2-msi-usb-gpt-v1.img'
);
const EFI_ARTIFACT = path.join(
  ROOT,
  'bare-metal/images/v2/esp/EFI/BOOT/BOOTX64.EFI'
);
const VISUAL_SCREENSHOT = path.join(
  EVIDENCE_DIR,
  'sheikha-v2-msi-usb-gpt-v1-boot-screen.png'
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function sha256(filePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}

function visualEvidenceIsBound(visual) {
  const screenshot = visual.artifacts?.find(
    (item) => item.role === 'BOOT_SCREEN'
  );
  return Boolean(
    visual.status === 'QEMU_BOOT_UI_VISUALLY_VERIFIED' &&
    visual.artifactBinding?.verified === true &&
    visual.artifactBinding.msiUsbImageSha256 === sha256(IMAGE) &&
    visual.artifactBinding.efiArtifactSha256 === sha256(EFI_ARTIFACT) &&
    screenshot?.sha256 === sha256(VISUAL_SCREENSHOT)
  );
}

function unavailable(res, error) {
  res.status(503).json({
    ok: false,
    error: 'BOOT_TRIAL_EVIDENCE_UNAVAILABLE',
    message: error.message,
  });
}

router.get('/status', (_req, res) => {
  try {
    const physical = readJson(PHYSICAL_REPORT);
    const usb = readJson(USB_REPORT);
    const visual = readJson(VISUAL_EVIDENCE);
    res.json({
      ok: true,
      data: {
        system: 'SHEIKHA_V2_MSI_PHYSICAL_BOOT_TRIAL_V1',
        status: usb.status,
        host: {
          architectureCompatible: physical.hostArchitectureCompatible,
          firmwareCompatible: physical.hostFirmwareCompatible,
          secureBootAllowsUnsignedArtifact:
            physical.secureBootAllowsUnsignedArtifact,
          removableMediaAttached: physical.removableMediaAttached,
        },
        image: usb.artifact,
        verification: {
          structurallyVerified: usb.imageStructurallyVerified,
          qemuBootVerified: usb.qemuBootVerified,
          visualBootUiVerified: visualEvidenceIsBound(visual),
          physicalMediaWritten: usb.physicalMediaWritten,
          physicalBootVerified: usb.physicalBootVerified,
        },
        installation: {
          diskInstallerImplemented: usb.diskInstallerImplemented,
          installableToInternalDisk: usb.installableToInternalDisk,
          mode: 'READ_ONLY_CONTROLLED_HALT',
        },
        safetyBoundary: usb.safetyBoundary,
        nextAction: usb.nextAction,
      },
    });
  } catch (error) {
    unavailable(res, error);
  }
});

router.get('/manifest', (_req, res) => {
  try {
    res.json({ ok: true, data: readJson(USB_MANIFEST) });
  } catch (error) {
    unavailable(res, error);
  }
});

router.get('/download', (_req, res) => {
  try {
    const manifest = readJson(USB_MANIFEST);
    const artifact = manifest.artifacts.find(
      (item) => item.role === 'MSI_USB_GPT_IMAGE'
    );
    if (!artifact || !fs.existsSync(IMAGE)) {
      throw new Error('Verified MSI USB image is not available');
    }
    res.set({
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Sheikha-Artifact-Sha256': artifact.sha256,
      'X-Sheikha-Installable': 'false',
    });
    res.download(IMAGE, path.basename(IMAGE));
  } catch (error) {
    unavailable(res, error);
  }
});

module.exports = router;
