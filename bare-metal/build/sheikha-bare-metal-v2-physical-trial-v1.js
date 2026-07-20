#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const EFI_ARTIFACT = path.join(
  ROOT,
  'bare-metal/images/v2/esp/EFI/BOOT/BOOTX64.EFI'
);
const BOOT_IMAGE = path.join(
  ROOT,
  'bare-metal/images/v2/' +
    'sheikha-sovereign-bare-metal-v2-phase2b.img'
);
const PHASE_REPORT = path.join(
  ROOT,
  'runtime/bare-metal/v2/' +
    'sheikha-sovereign-bare-metal-os-v2-phase2b-report.json'
);
const SERIAL_EVIDENCE = path.join(
  ROOT,
  'runtime/bare-metal/v2/evidence/' +
    'sheikha-v2-uefi-paging-runtime-phase2b-serial.log'
);
const ACCREDITATION_REPORT = path.join(
  ROOT,
  'reports/SHEIKHA-EXTERNAL-ACCREDITATION-LATEST.json'
);
const LICENSE_REGISTRY = path.join(
  ROOT,
  'runtime/licensing-engine/v1/registries/licenses.json'
);
const OUTPUT_DIR = path.join(
  ROOT,
  'runtime/bare-metal/v2/physical-trial/v1'
);
const HARDWARE_REPORT = path.join(
  OUTPUT_DIR,
  'sheikha-v2-host-hardware-preflight-v1.json'
);
const DEVICE_MATRIX = path.join(
  OUTPUT_DIR,
  'sheikha-v2-device-support-matrix-v1.json'
);
const MANIFEST = path.join(
  OUTPUT_DIR,
  'sheikha-v2-physical-boot-trial-manifest-v1.json'
);
const SHA256SUMS = path.join(OUTPUT_DIR, 'SHA256SUMS');
const REPORT = path.join(
  OUTPUT_DIR,
  'sheikha-v2-physical-boot-trial-v1-report.json'
);

function relative(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    `${JSON.stringify(value, null, 2)}\n`,
    'utf8'
  );
}

function sha256(filePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 10000,
  });
  if (result.error || result.status !== 0) {
    return {
      ok: false,
      output: `${result.stdout || ''}${result.stderr || ''}`.trim(),
    };
  }
  return { ok: true, output: result.stdout.trim() };
}

function readSecureBootState(uefiBooted) {
  if (!uefiBooted) {
    return { state: 'NOT_APPLICABLE', source: null };
  }

  const directory = '/sys/firmware/efi/efivars';
  try {
    const entry = fs.readdirSync(directory).find((name) =>
      name.startsWith('SecureBoot-')
    );
    if (entry) {
      const filePath = path.join(directory, entry);
      const value = fs.readFileSync(filePath);
      if (value.length >= 5) {
        return {
          state: value[4] === 1 ? 'ENABLED' : 'DISABLED',
          source: filePath,
        };
      }
    }
  } catch {
    // Report an unknown state when efivars cannot be read.
  }
  return { state: 'UNKNOWN', source: null };
}

function collectMountpoints(device) {
  const own = Array.isArray(device.mountpoints)
    ? device.mountpoints.filter(Boolean)
    : [];
  const childMounts = (device.children || []).flatMap(collectMountpoints);
  return [...new Set([...own, ...childMounts])];
}

function classifyDevice(device, imageBytes) {
  const mountpoints = collectMountpoints(device);
  const isVirtual = device.path?.startsWith('/dev/zram') ||
    device.type !== 'disk';
  const removableSignal = device.rm === true || device.tran === 'usb';
  const systemRelated = mountpoints.some((mountpoint) =>
    ['/', '/boot', '/boot/efi', '/recovery'].includes(mountpoint)
  );
  const reviewEligible = !isVirtual &&
    removableSignal &&
    device.ro !== true &&
    !systemRelated &&
    mountpoints.length === 0 &&
    Number(device.size || 0) >= imageBytes;
  const rejectionReasons = [];

  if (isVirtual) rejectionReasons.push('NOT_A_PHYSICAL_DISK');
  if (!removableSignal) rejectionReasons.push('NOT_REMOVABLE_OR_USB');
  if (device.ro === true) rejectionReasons.push('READ_ONLY_DEVICE');
  if (systemRelated) rejectionReasons.push('SYSTEM_DISK_OR_BOOT_MEDIA');
  if (mountpoints.length > 0) rejectionReasons.push('DEVICE_IS_MOUNTED');
  if (Number(device.size || 0) < imageBytes) {
    rejectionReasons.push('DEVICE_TOO_SMALL');
  }

  return {
    name: device.name,
    path: device.path,
    type: device.type,
    sizeBytes: Number(device.size || 0),
    removable: device.rm === true,
    readOnly: device.ro === true,
    transport: device.tran || null,
    model: device.model || null,
    mountpoints,
    systemRelated,
    reviewEligible,
    writeAuthorized: false,
    rejectionReasons,
  };
}

function inspectCpu() {
  const result = run('lscpu', ['-J']);
  if (!result.ok) {
    return {
      architecture: normalizeArchitecture(process.arch),
      model: null,
      logicalCpus: null,
    };
  }
  const fields = Object.fromEntries(
    JSON.parse(result.output).lscpu.map((entry) => [
      entry.field.replace(/:$/, ''),
      entry.data,
    ])
  );
  return {
    architecture: normalizeArchitecture(
      fields.Architecture || process.arch
    ),
    model: fields['Model name'] || null,
    vendor: fields['Vendor ID'] || null,
    logicalCpus: Number(fields['CPU(s)']) || null,
    virtualization: fields.Virtualization || null,
  };
}

function normalizeArchitecture(architecture) {
  if (architecture === 'x64' || architecture === 'amd64') {
    return 'x86_64';
  }
  if (architecture === 'arm64') {
    return 'aarch64';
  }
  return architecture;
}

function inspectHost(imageBytes) {
  const uefiBooted = fs.existsSync('/sys/firmware/efi');
  const blockResult = run('lsblk', [
    '--json',
    '--bytes',
    '--output',
    'NAME,PATH,TYPE,SIZE,RM,RO,MOUNTPOINTS,MODEL,TRAN,PKNAME',
  ]);
  const devices = blockResult.ok
    ? JSON.parse(blockResult.output).blockdevices || []
    : [];
  const classifiedDevices = devices.map((device) =>
    classifyDevice(device, imageBytes)
  );
  const rootResult = run('findmnt', ['-n', '-o', 'SOURCE', '/']);

  return {
    inspectedAt: new Date().toISOString(),
    inspectionMode: 'READ_ONLY',
    cpu: inspectCpu(),
    firmware: {
      bootMode: uefiBooted ? 'UEFI' : 'LEGACY_OR_UNKNOWN',
      secureBoot: readSecureBootState(uefiBooted),
    },
    rootSource: rootResult.ok ? rootResult.output : null,
    blockInspectionAvailable: blockResult.ok,
    devices: classifiedDevices,
    removableCandidatesForHumanReview: classifiedDevices
      .filter((device) => device.reviewEligible)
      .map((device) => device.path),
    writesPerformed: false,
    partitionsModified: false,
    firmwareModified: false,
  };
}

function buildDeviceMatrix(host) {
  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_V2_DEVICE_SUPPORT_MATRIX_V1',
    generatedAt: new Date().toISOString(),
    claimPolicy:
      'One verified x86_64 QEMU artifact does not establish universal device support.',
    targets: [
      {
        family: 'x86_64 UEFI QEMU',
        status: 'BOOT_VERIFIED',
        evidence: relative(SERIAL_EVIDENCE),
      },
      {
        family: 'Current x86_64 UEFI laptop',
        status: 'HOST_PRECHECK_COMPATIBLE_PHYSICAL_TRIAL_PENDING',
        evidence: relative(HARDWARE_REPORT),
      },
      {
        family: 'Other x86_64 UEFI computers and servers',
        status: 'HARDWARE_MATRIX_AND_DRIVER_VERIFICATION_REQUIRED',
      },
      {
        family: 'ARM64 UEFI computers, servers, and phones',
        status: 'ARCHITECTURE_PORT_AND_VENDOR_BOOT_CHAIN_REQUIRED',
      },
      {
        family: 'RISC-V systems',
        status: 'ARCHITECTURE_PORT_AND_FIRMWARE_ADAPTER_REQUIRED',
      },
      {
        family: 'Legacy BIOS systems',
        status: 'SEPARATE_BOOT_PROTOCOL_REQUIRED',
      },
      {
        family: 'Automotive controllers and vehicles',
        status: 'HAL_DRIVERS_REAL_TIME_SAFETY_CASE_AND_EXTERNAL_APPROVAL_REQUIRED',
      },
      {
        family: 'Industrial equipment and factories',
        status: 'DEVICE_HAL_FUNCTIONAL_SAFETY_AND_SITE_ACCEPTANCE_REQUIRED',
      },
      {
        family: 'Data centers and cloud fleets',
        status: 'DEPLOYMENT_CONTROL_PLANE_AND_HARDWARE_QUALIFICATION_REQUIRED',
      },
      {
        family: 'HPC and supercomputers',
        status: 'INTERCONNECT_ACCELERATOR_SCHEDULER_AND_SCALE_TESTS_REQUIRED',
      },
      {
        family: 'Semiconductor, FPGA, and custom silicon targets',
        status: 'ISA_HDL_TOOLCHAIN_AND_SILICON_VALIDATION_REQUIRED',
      },
    ],
    currentHost: {
      architecture: host.cpu.architecture,
      bootMode: host.firmware.bootMode,
      secureBoot: host.firmware.secureBoot.state,
    },
    universalDeviceSupportClaimed: false,
  };
}

function generate() {
  const phase = readJson(PHASE_REPORT, {});
  const accreditation = readJson(ACCREDITATION_REPORT, {});
  const efiExists = fs.existsSync(EFI_ARTIFACT);
  const imageExists = fs.existsSync(BOOT_IMAGE);
  const efiBytes = efiExists ? fs.statSync(EFI_ARTIFACT).size : 0;
  const imageBytes = imageExists ? fs.statSync(BOOT_IMAGE).size : 0;
  const host = inspectHost(imageBytes);
  const deviceMatrix = buildDeviceMatrix(host);
  const externalCertificatesIssued = Number(
    accreditation.methodologyReadiness?.externalCertificatesIssued || 0
  );
  const internalAttestations =
    accreditation.methodologyReadiness?.internalAttestations || [];
  const methodologyFamilies =
    accreditation.methodologyReadiness?.methodologyFamilies || [];
  const artifacts = [
    {
      role: 'UEFI_APPLICATION',
      path: relative(EFI_ARTIFACT),
      exists: efiExists,
      bytes: efiBytes,
      sha256: efiExists ? sha256(EFI_ARTIFACT) : null,
    },
    {
      role: 'BOOTABLE_FAT12_IMAGE',
      path: relative(BOOT_IMAGE),
      exists: imageExists,
      bytes: imageBytes,
      sha256: imageExists ? sha256(BOOT_IMAGE) : null,
    },
  ];
  const hashesMatchPhaseReport = artifacts.every((artifact) => {
    const expected = artifact.role === 'UEFI_APPLICATION'
      ? phase.artifact?.efi
      : phase.artifact?.image;
    return artifact.exists &&
      artifact.bytes === expected?.bytes &&
      artifact.sha256 === expected?.sha256;
  });
  const serial = fs.existsSync(SERIAL_EVIDENCE)
    ? fs.readFileSync(SERIAL_EVIDENCE, 'utf8')
    : '';
  const visibleBootIndicatorImplemented = Buffer.from(
    'physical_display_indicator=GREEN_STATUS_BAR',
    'ascii'
  );
  const visualIndicatorInArtifact = efiExists &&
    fs.readFileSync(EFI_ARTIFACT).includes(visibleBootIndicatorImplemented);
  const hostArchitectureCompatible =
    host.cpu.architecture === 'x86_64';
  const hostFirmwareCompatible =
    host.firmware.bootMode === 'UEFI';
  const secureBootAllowsUnsignedArtifact =
    host.firmware.secureBoot.state === 'DISABLED';
  const removableCandidates =
    host.removableCandidatesForHumanReview;

  let status = 'TRIAL_KIT_NOT_READY';
  if (
    phase.phase2bVerified === true &&
    hashesMatchPhaseReport &&
    visualIndicatorInArtifact
  ) {
    if (!hostArchitectureCompatible || !hostFirmwareCompatible) {
      status = 'HOST_FIRMWARE_OR_ARCHITECTURE_NOT_COMPATIBLE';
    } else if (!secureBootAllowsUnsignedArtifact) {
      status = 'SECURE_BOOT_REVIEW_REQUIRED_FOR_UNSIGNED_ARTIFACT';
    } else if (removableCandidates.length === 0) {
      status = 'TRIAL_KIT_READY_REMOVABLE_MEDIA_NOT_ATTACHED';
    } else {
      status = 'TRIAL_KIT_READY_EXPLICIT_TARGET_APPROVAL_REQUIRED';
    }
  }

  const manifest = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_V2_PHYSICAL_BOOT_TRIAL_MANIFEST_V1',
    generatedAt: new Date().toISOString(),
    architecture: 'x86_64',
    bootProtocol: 'UEFI removable-media fallback',
    filesystem: 'FAT12',
    fallbackPath: 'EFI/BOOT/BOOTX64.EFI',
    artifacts,
    hashesMatchPhaseReport,
    expectedObservation: {
      preExitText: [
        'Sheikha Sovereign Native Kernel V2',
        'Paging prepared; entering native kernel...',
      ],
      postKernelVisualIndicator:
        'GREEN_STATUS_BAR_WHEN_GOP_FRAMEBUFFER_IS_IDENTITY_MAPPED',
      serialSuccessMarker: 'SHEIKHA_BARE_METAL_BOOT_OK',
    },
    writePolicy: {
      automaticWrite: false,
      targetDeviceSelected: null,
      explicitHumanApprovalRequired: true,
      internalSystemDiskAllowed: false,
    },
  };

  const report = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_V2_PHYSICAL_BOOT_TRIAL_V1',
    generatedAt: new Date().toISOString(),
    status,
    hostArchitectureCompatible,
    hostFirmwareCompatible,
    secureBootAllowsUnsignedArtifact,
    trialKitPrepared: status.startsWith('TRIAL_KIT_READY'),
    removableMediaAttached: removableCandidates.length > 0,
    removableCandidatesForHumanReview: removableCandidates,
    targetDeviceSelected: null,
    physicalMediaWritten: false,
    physicalBootExecuted: false,
    physicalBootVerified: false,
    qemuBootVerified: phase.qemuBootExecuted === true &&
      phase.phase2bVerified === true,
    visualIndicatorImplemented: visualIndicatorInArtifact,
    serialEvidenceContainsDisplayOutcome:
      serial.includes('physical_display_indicator='),
    artifacts,
    evidence: {
      phaseReport: relative(PHASE_REPORT),
      serial: relative(SERIAL_EVIDENCE),
      hardwarePreflight: relative(HARDWARE_REPORT),
      deviceMatrix: relative(DEVICE_MATRIX),
      manifest: relative(MANIFEST),
      sha256: relative(SHA256SUMS),
    },
    methodologyAndAccreditation: {
      source: relative(ACCREDITATION_REPORT),
      methodologyFamilyCount: methodologyFamilies.length,
      methodologyFamilies,
      internalAttestationCount: internalAttestations.length,
      externalCertificatesIssued,
      officialExternalCertificationClaimed: false,
      externalAuthorityApprovalRequired: true,
      licenseRegistry: fs.existsSync(LICENSE_REGISTRY)
        ? relative(LICENSE_REGISTRY)
        : null,
    },
    safetyBoundary: {
      diskWritePerformed: false,
      firmwareWritePerformed: false,
      bootOrderModified: false,
      sudoUsed: false,
      networkUsed: false,
      internalDiskRejectedByDefault: true,
      humanApprovalRequiredBeforePhysicalWrite: true,
    },
    nextAction:
      'Attach one dedicated disposable USB device, rerun the preflight, then provide its exact device path and explicit write approval.',
    claimPolicy:
      'Physical boot remains unverified until a selected removable target is written and observed on hardware.',
  };

  writeJson(HARDWARE_REPORT, host);
  writeJson(DEVICE_MATRIX, deviceMatrix);
  writeJson(MANIFEST, manifest);
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(
    SHA256SUMS,
    artifacts
      .filter((artifact) => artifact.exists)
      .map((artifact) => `${artifact.sha256}  ${artifact.path}`)
      .join('\n') + '\n',
    'ascii'
  );
  writeJson(REPORT, report);
  return report;
}

if (require.main === module) {
  try {
    console.log(JSON.stringify(generate(), null, 2));
  } catch (error) {
    console.error(`[SHEIKHA_V2_PHYSICAL_TRIAL] ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  DEVICE_MATRIX,
  HARDWARE_REPORT,
  MANIFEST,
  REPORT,
  SHA256SUMS,
  buildDeviceMatrix,
  classifyDevice,
  generate,
  normalizeArchitecture,
};
