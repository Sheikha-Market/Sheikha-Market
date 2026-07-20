#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const OUTPUT_DIR = path.join(
  ROOT,
  'runtime/bare-metal/v2/uefi-integration/v1'
);
const REGISTRY_PATH = path.join(
  OUTPUT_DIR,
  'sheikha-uefi-capability-registry-v1.json'
);
const REPORT_PATH = path.join(
  OUTPUT_DIR,
  'sheikha-uefi-integration-v1-report.json'
);
const GRAPH_PATH = path.join(
  OUTPUT_DIR,
  'sheikha-uefi-architecture-graph-v1.json'
);
const CONTRACT_PATH = path.join(
  ROOT,
  'runtime/bare-metal/v2/contracts/' +
    'sheikha-uefi-integration-fabric-v1-contract.json'
);
const QEMU_REPORT_PATH = path.join(
  ROOT,
  'runtime/bare-metal/v2/evidence/' +
    'sheikha-v2-uefi-paging-runtime-phase2b-qemu.json'
);
const SERIAL_PATH = path.join(
  ROOT,
  'runtime/bare-metal/v2/evidence/' +
    'sheikha-v2-uefi-paging-runtime-phase2b-serial.log'
);
const MSI_REPORT_PATH = path.join(
  ROOT,
  'runtime/bare-metal/v2/physical-trial/v1/' +
    'sheikha-v2-msi-usb-gpt-v1-report.json'
);
const MSI_MANIFEST_PATH = path.join(
  ROOT,
  'runtime/bare-metal/v2/physical-trial/v1/' +
    'sheikha-v2-msi-usb-gpt-v1-manifest.json'
);
const ENTRY_SOURCE_PATH = path.join(
  ROOT,
  'bare-metal/boot/uefi/sheikha_v2_uefi_entry.c'
);
const UEFI_HEADER_PATH = path.join(
  ROOT,
  'bare-metal/include/sheikha_uefi.h'
);
const EFI_ARTIFACT_PATH = path.join(
  ROOT,
  'bare-metal/images/v2/esp/EFI/BOOT/BOOTX64.EFI'
);
const MSI_IMAGE_PATH = path.join(
  ROOT,
  'bare-metal/images/v2/' +
    'sheikha-sovereign-bare-metal-v2-msi-usb-gpt-v1.img'
);

const FOUNDATION_MARKERS = [
  'SHEIKHA_UEFI_SYSTEM_TABLE_VALIDATED',
  'SHEIKHA_UEFI_BOOT_SERVICES_ACTIVE',
  'SHEIKHA_UEFI_RUNTIME_SERVICES_PRESENT',
  'SHEIKHA_UEFI_CONSOLE_OUTPUT_OK',
  'SHEIKHA_UEFI_WATCHDOG_DISABLED',
  'SHEIKHA_UEFI_LOADED_IMAGE_PROTOCOL_OK',
  'SHEIKHA_UEFI_DEVICE_PATH_PROTOCOL_OK',
  'SHEIKHA_UEFI_GOP_DISCOVERY_ATTEMPTED',
];

const SPECIFICATION = {
  name: 'UEFI Specification',
  revision: '2.11',
  publisher: 'UEFI Forum',
  reference: 'https://uefi.org/specs/UEFI/2.11/',
};

const CHAPTER_TITLES = [
  'Introduction',
  'Overview',
  'Boot Manager',
  'EFI System Table',
  'GUID Partition Table (GPT) Disk Layout',
  'Block Translation Table (BTT) Layout',
  'Services - Boot Services',
  'Services - Runtime Services',
  'Protocols - EFI Loaded Image',
  'Protocols - Device Path Protocol',
  'Protocols - UEFI Driver Model',
  'Protocols - Console Support',
  'Protocols - Media Access',
  'Protocols - PCI Bus Support',
  'Protocols - SCSI Driver Models and Bus Support',
  'Protocols - iSCSI Boot',
  'Protocols - USB Support',
  'Protocols - Debugger Support',
  'Protocols - Compression Algorithm Specification',
  'Protocols - ACPI Protocols',
  'Protocols - String Services',
  'EFI Byte Code Virtual Machine',
  'Firmware Update and Reporting',
  'Network Protocols - SNP, PXE, BIS and HTTP Boot',
  'Network Protocols - Managed Network',
  'Network Protocols - Bluetooth',
  'Network Protocols - VLAN, EAP, Wi-Fi and Supplicant',
  'Network Protocols - TCP, IP, IPsec, FTP, TLS and Configurations',
  'Network Protocols - ARP, DHCP, DNS, HTTP and REST',
  'Network Protocols - UDP and MTFTP',
  'EFI Redfish Service Support',
  'Secure Boot and Driver Signing',
  'Human Interface Infrastructure Overview',
  'HII Protocols',
  'HII Configuration Processing and Browser Protocol',
  'User Identification',
  'Secure Technologies',
  'Confidential Computing',
  'Miscellaneous Protocols',
];

const APPENDIX_TITLES = [
  ['A', 'GUID and Time Formats'],
  ['B', 'Console'],
  ['C', 'Device Path Examples'],
  ['D', 'Status Codes'],
  ['E', 'Universal Network Driver Interfaces'],
  ['F', 'Using the Simple Pointer Protocol'],
  ['G', 'Using the EFI Extended SCSI Pass Thru Protocol'],
  ['H', 'Compression Source Code'],
  ['I', 'Decompression Source Code'],
  ['J', 'EFI Byte Code Virtual Machine Opcode List'],
  ['K', 'Alphabetic Function Lists'],
  ['L', 'EFI 1.10 Protocol Changes'],
  ['M', 'Formats - Language Codes and Language Code Arrays'],
  ['N', 'Common Platform Error Record (CPER)'],
  ['O', 'UEFI ACPI Data Table'],
  ['P', 'Hardware Error Record Persistence Usage'],
  ['Q', 'References'],
  ['R', 'Glossary'],
];

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

function sha256(filePath) {
  try {
    return crypto
      .createHash('sha256')
      .update(fs.readFileSync(filePath))
      .digest('hex');
  } catch {
    return null;
  }
}

function relative(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function evidence(filePath, claim, verified) {
  return {
    path: relative(filePath),
    claim,
    exists: fs.existsSync(filePath),
    verified: Boolean(verified && fs.existsSync(filePath)),
  };
}

function loadState() {
  const qemu = readJson(QEMU_REPORT_PATH, {});
  const msi = readJson(MSI_REPORT_PATH, {});
  const msiManifest = readJson(MSI_MANIFEST_PATH, {});
  const serial = readText(SERIAL_PATH);
  const entrySource = readText(ENTRY_SOURCE_PATH);
  const uefiHeader = readText(UEFI_HEADER_PATH);
  const currentEfiSha256 = sha256(EFI_ARTIFACT_PATH);
  const currentMsiImageSha256 = sha256(MSI_IMAGE_PATH);
  const qemuArtifactBound =
    currentEfiSha256 !== null &&
    qemu.artifactSha256 === currentEfiSha256;
  const manifestMsiArtifact = msiManifest.artifacts?.find(
    (item) => item.role === 'MSI_USB_GPT_IMAGE'
  );
  const msiArtifactBound =
    currentMsiImageSha256 !== null &&
    msi.artifact?.sha256 === currentMsiImageSha256 &&
    manifestMsiArtifact?.sha256 === currentMsiImageSha256;
  const qemuVerified =
    qemu.executed === true &&
    qemu.markerVerified === true &&
    qemuArtifactBound;
  const marker = (name) =>
    qemuVerified &&
    qemu.markerChecks?.[name] === true &&
    serial.includes(name) &&
    entrySource.includes(name);

  return {
    qemu,
    msi,
    msiManifest,
    serial,
    entrySource,
    uefiHeader,
    marker,
    qemuVerified,
    foundationVerified: FOUNDATION_MARKERS.every(marker),
    gptVerified:
      msiArtifactBound &&
      msi.imageStructurallyVerified === true &&
      msiManifest.structuralVerification?.verified === true,
    msiQemuVerified:
      msiArtifactBound &&
      msi.qemuBootVerified === true,
  };
}

function genericChapter(number, title) {
  let category = 'PLATFORM_PROTOCOLS';
  if (number <= 2) category = 'SPECIFICATION_FOUNDATION';
  else if (number === 3) category = 'BOOT_MANAGER';
  else if (number === 4) category = 'SYSTEM_TABLE';
  else if (number <= 6) category = 'STORAGE_LAYOUT';
  else if (number <= 8) category = 'UEFI_SERVICES';
  else if (number <= 13) category = 'BOOT_PROTOCOLS';
  else if (number <= 23) category = 'PLATFORM_PROTOCOLS';
  else if (number <= 31) category = 'NETWORK_AND_MANAGEMENT';
  else if (number <= 38) category = 'SECURITY_AND_HUMAN_INTERFACE';

  return {
    id: `UEFI-C${String(number).padStart(2, '0')}`,
    kind: 'CHAPTER',
    ordinal: number,
    title,
    category,
    provider: 'NOT_SELECTED',
    responsibility: 'Registered for staged implementation and verification.',
    implementationLevel: 'REGISTERED_NOT_IMPLEMENTED',
    verificationStatus: 'NOT_VERIFIED',
    activation: 'REGISTERED_DEFAULT_DENY',
    evidence: [],
    nextRequirements: [
      'CAPABILITY_CONTRACT',
      'FREESTANDING_IMPLEMENTATION',
      'QEMU_EVIDENCE',
      'TARGET_HARDWARE_EVIDENCE',
    ],
    safetyBoundary: 'No runtime access is granted by registry presence.',
    officialReference: SPECIFICATION.reference,
  };
}

function verifiedChapter(base, options) {
  const verified = options.verified;
  return {
    ...base,
    provider: options.provider,
    responsibility: options.responsibility,
    implementationLevel: options.implementationLevel,
    verificationStatus: verified
      ? options.verificationStatus
      : 'EVIDENCE_PENDING',
    activation: verified
      ? options.activation
      : 'BLOCKED_PENDING_EVIDENCE',
    evidence: options.evidence,
    nextRequirements: options.nextRequirements || [],
    safetyBoundary: options.safetyBoundary,
  };
}

function chapterFor(number, title, state) {
  const base = genericChapter(number, title);
  const markerEvidence = (name, claim) => [
    evidence(ENTRY_SOURCE_PATH, `${claim} implementation`, state.marker(name)),
    evidence(QEMU_REPORT_PATH, `${claim} QEMU marker`, state.marker(name)),
    evidence(SERIAL_PATH, `${claim} serial marker`, state.marker(name)),
  ];

  if (number <= 2) {
    return {
      ...base,
      provider: 'UEFI_FORUM_SPECIFICATION',
      responsibility: 'Canonical terminology and architectural scope.',
      implementationLevel: 'REFERENCE_MAPPED',
      verificationStatus: 'REFERENCE_REGISTERED',
      activation: 'REFERENCE_ONLY',
      nextRequirements: [],
      safetyBoundary: 'Reference mapping is not an implementation claim.',
    };
  }

  if (number === 3) {
    const verified = state.msiQemuVerified;
    return verifiedChapter(base, {
      verified,
      provider: 'PLATFORM_FIRMWARE_WITH_SHEIKHA_FALLBACK_IMAGE',
      responsibility:
        'Firmware selects the removable-media fallback path; Sheikha supplies BOOTX64.EFI.',
      implementationLevel: 'FIRMWARE_INTEGRATED_SUBSET',
      verificationStatus: 'QEMU_VERIFIED',
      activation: 'ACTIVE_READ_ONLY',
      evidence: [
        evidence(MSI_MANIFEST_PATH, 'EFI/BOOT/BOOTX64.EFI fallback path', verified),
        evidence(MSI_REPORT_PATH, 'Firmware boot of GPT/FAT32 image', verified),
      ],
      nextRequirements: ['PHYSICAL_MSI_BOOT_EVIDENCE'],
      safetyBoundary: 'No BootOrder or NVRAM variables are modified.',
    });
  }

  const markerChapters = {
    4: {
      marker: 'SHEIKHA_UEFI_SYSTEM_TABLE_VALIDATED',
      provider: 'SHEIKHA_UEFI_BOOT_APPLICATION',
      responsibility: 'Validate table signatures, revision, size, and required pointers.',
      level: 'IMPLEMENTED_SUBSET',
      boundary: 'Read-only table inspection; configuration tables are not modified.',
    },
    7: {
      marker: 'SHEIKHA_UEFI_BOOT_SERVICES_ACTIVE',
      provider: 'PLATFORM_FIRMWARE_AND_SHEIKHA_ADAPTER',
      responsibility:
        'Consume GetMemoryMap, ExitBootServices, protocol lookup, and watchdog services.',
      level: 'IMPLEMENTED_SUBSET',
      boundary: 'Boot Services are exited before native kernel control.',
    },
    8: {
      marker: 'SHEIKHA_UEFI_RUNTIME_SERVICES_PRESENT',
      provider: 'PLATFORM_FIRMWARE',
      responsibility: 'Validate presence of the Runtime Services table.',
      level: 'DISCOVERY_ONLY',
      boundary: 'No Runtime Services call or NVRAM write is performed.',
    },
    9: {
      marker: 'SHEIKHA_UEFI_LOADED_IMAGE_PROTOCOL_OK',
      provider: 'PLATFORM_FIRMWARE_AND_SHEIKHA_ADAPTER',
      responsibility: 'Discover and validate the current EFI loaded image context.',
      level: 'IMPLEMENTED_DISCOVERY_SUBSET',
      boundary: 'The image context is read only and is not unloaded or replaced.',
    },
    10: {
      marker: 'SHEIKHA_UEFI_DEVICE_PATH_PROTOCOL_OK',
      provider: 'PLATFORM_FIRMWARE_AND_SHEIKHA_ADAPTER',
      responsibility: 'Discover and structurally validate the first device-path node.',
      level: 'IMPLEMENTED_DISCOVERY_SUBSET',
      boundary: 'No controller connection or device-path mutation is permitted.',
    },
    12: {
      marker: 'SHEIKHA_UEFI_CONSOLE_OUTPUT_OK',
      provider: 'PLATFORM_FIRMWARE_AND_SHEIKHA_ADAPTER',
      responsibility: 'Render the bounded native boot status through Simple Text Output.',
      level: 'IMPLEMENTED_SUBSET',
      boundary: 'Output only; keyboard and pointer protocols remain unconsumed.',
    },
  };

  if (markerChapters[number]) {
    const item = markerChapters[number];
    const verified = state.marker(item.marker);
    return verifiedChapter(base, {
      verified,
      provider: item.provider,
      responsibility: item.responsibility,
      implementationLevel: item.level,
      verificationStatus: 'QEMU_VERIFIED',
      activation: item.level === 'DISCOVERY_ONLY'
        ? 'ACTIVE_DISCOVERY_ONLY'
        : 'ACTIVE_READ_ONLY',
      evidence: markerEvidence(item.marker, title),
      nextRequirements: ['PHYSICAL_MSI_BOOT_EVIDENCE'],
      safetyBoundary: item.boundary,
    });
  }

  if (number === 5) {
    const verified = state.gptVerified && state.msiQemuVerified;
    return verifiedChapter(base, {
      verified,
      provider: 'SHEIKHA_DETERMINISTIC_IMAGE_BUILDER',
      responsibility: 'Create and verify protective MBR, primary/backup GPT, and EFI System Partition.',
      implementationLevel: 'IMPLEMENTED_ARTIFACT_SUBSET',
      verificationStatus: 'STRUCTURAL_AND_QEMU_VERIFIED',
      activation: 'ACTIVE_BUILD_TIME_ONLY',
      evidence: [
        evidence(MSI_MANIFEST_PATH, 'GPT CRC and partition structure', state.gptVerified),
        evidence(MSI_REPORT_PATH, 'GPT image QEMU boot', state.msiQemuVerified),
      ],
      nextRequirements: ['PHYSICAL_MSI_BOOT_EVIDENCE'],
      safetyBoundary: 'Image creation writes only a project artifact, never a physical disk.',
    });
  }

  if (number === 13) {
    const verified = state.gptVerified && state.msiQemuVerified;
    return verifiedChapter(base, {
      verified,
      provider: 'PLATFORM_FIRMWARE_WITH_SHEIKHA_FAT32_ARTIFACT',
      responsibility: 'Provide a firmware-readable FAT32 EFI System Partition image.',
      implementationLevel: 'FIRMWARE_INTEGRATED_SUBSET',
      verificationStatus: 'STRUCTURAL_AND_QEMU_VERIFIED',
      activation: 'ACTIVE_READ_ONLY_BOOT_TRANSPORT',
      evidence: [
        evidence(MSI_MANIFEST_PATH, 'FAT32 and embedded EFI verification', state.gptVerified),
        evidence(MSI_REPORT_PATH, 'Firmware media boot', state.msiQemuVerified),
      ],
      nextRequirements: ['NATIVE_BLOCK_IO_READ_ONLY_ADAPTER'],
      safetyBoundary: 'No native Block I/O write path is implemented.',
    });
  }

  if (number === 17) {
    const verified = state.msiQemuVerified;
    return verifiedChapter(base, {
      verified,
      provider: 'PLATFORM_FIRMWARE',
      responsibility: 'Transport the fallback EFI image from removable media.',
      implementationLevel: 'FIRMWARE_BOOT_TRANSPORT_ONLY',
      verificationStatus: 'QEMU_VERIFIED',
      activation: 'FIRMWARE_PROVIDED_ONLY',
      evidence: [
        evidence(MSI_REPORT_PATH, 'Firmware removable-media boot path', verified),
      ],
      nextRequirements: [
        'NATIVE_USB_HOST_CONTROLLER_DRIVER',
        'NATIVE_USB_MASS_STORAGE_DRIVER',
        'PHYSICAL_USB_HARDWARE_EVIDENCE',
      ],
      safetyBoundary: 'No Sheikha-native USB stack or runtime USB control is claimed.',
    });
  }

  if (number >= 24 && number <= 31) {
    return {
      ...base,
      provider: 'NONE',
      responsibility: 'Registered network or management protocol family.',
      nextRequirements: [
        'NATIVE_NETWORK_DRIVER',
        'BOUNDED_NETWORK_CAPABILITY_CONTRACT',
        'TLS_IDENTITY_AND_TRUST_POLICY',
        'NETWORK_ISOLATION_TESTS',
      ],
      safetyBoundary: 'Network is disabled in the verified QEMU boot path.',
    };
  }

  if (number === 23) {
    return {
      ...base,
      provider: 'NONE',
      responsibility: 'Registered high-impact firmware lifecycle capability.',
      nextRequirements: [
        'VENDOR_FIRMWARE_CONTRACT',
        'SIGNED_CAPSULE',
        'HUMAN_APPROVAL',
        'RECOVERY_AND_ROLLBACK_EVIDENCE',
      ],
      safetyBoundary: 'Firmware update and variable writes are explicitly denied.',
    };
  }

  if (number === 32) {
    return {
      ...base,
      provider: 'NONE',
      responsibility: 'Registered image-authentication and platform-key capability.',
      verificationStatus: 'REQUIRES_EXTERNAL_KEYS_AND_SIGNING',
      nextRequirements: [
        'OWNER_CONTROLLED_SIGNING_KEY',
        'SIGNED_EFI_ARTIFACT',
        'PLATFORM_KEY_ENROLLMENT_APPROVAL',
        'SECURE_BOOT_HARDWARE_EVIDENCE',
      ],
      safetyBoundary: 'No keys are generated, enrolled, or accessed automatically.',
    };
  }

  return base;
}

function appendixFor(letter, title, state) {
  const base = {
    id: `UEFI-APP-${letter}`,
    kind: 'APPENDIX',
    ordinal: letter,
    title,
    category: 'SPECIFICATION_APPENDIX',
    provider: 'UEFI_FORUM_SPECIFICATION',
    responsibility: 'Registered reference material for implementation review.',
    implementationLevel: 'REFERENCE_MAPPED',
    verificationStatus: 'REFERENCE_REGISTERED',
    activation: 'REFERENCE_ONLY',
    evidence: [],
    nextRequirements: [],
    safetyBoundary: 'Reference mapping is not an implementation claim.',
    officialReference: SPECIFICATION.reference,
  };

  if (letter === 'A') {
    const verified = state.uefiHeader.includes('EFI_GUID');
    return {
      ...base,
      provider: 'SHEIKHA_UEFI_HEADER_SUBSET',
      responsibility: 'Represent EFI GUIDs; EFI time formats remain pending.',
      implementationLevel: 'IMPLEMENTED_GUID_SUBSET',
      verificationStatus: verified ? 'SOURCE_VERIFIED' : 'EVIDENCE_PENDING',
      activation: verified ? 'ACTIVE_BUILD_TIME_ONLY' : 'BLOCKED_PENDING_EVIDENCE',
      evidence: [evidence(UEFI_HEADER_PATH, 'EFI_GUID representation', verified)],
      nextRequirements: ['EFI_TIME_REPRESENTATION_AND_TESTS'],
    };
  }

  if (letter === 'B') {
    const verified = state.marker('SHEIKHA_UEFI_CONSOLE_OUTPUT_OK');
    return {
      ...base,
      provider: 'PLATFORM_FIRMWARE_AND_SHEIKHA_ADAPTER',
      responsibility: 'Use bounded text output during the native boot handoff.',
      implementationLevel: 'IMPLEMENTED_OUTPUT_SUBSET',
      verificationStatus: verified ? 'QEMU_VERIFIED' : 'EVIDENCE_PENDING',
      activation: verified ? 'ACTIVE_OUTPUT_ONLY' : 'BLOCKED_PENDING_EVIDENCE',
      evidence: [
        evidence(QEMU_REPORT_PATH, 'Console output QEMU marker', verified),
        evidence(SERIAL_PATH, 'Console output serial marker', verified),
      ],
      nextRequirements: ['CONSOLE_INPUT_TESTS'],
    };
  }

  if (letter === 'D') {
    const verified =
      state.uefiHeader.includes('EFI_ERROR(status)') &&
      state.entrySource.includes('EFI_ERROR(status)');
    return {
      ...base,
      provider: 'SHEIKHA_UEFI_HEADER_SUBSET',
      responsibility: 'Handle EFI_SUCCESS and the architecture error bit.',
      implementationLevel: 'IMPLEMENTED_STATUS_SUBSET',
      verificationStatus: verified ? 'SOURCE_VERIFIED' : 'EVIDENCE_PENDING',
      activation: verified ? 'ACTIVE_BUILD_TIME_ONLY' : 'BLOCKED_PENDING_EVIDENCE',
      evidence: [evidence(UEFI_HEADER_PATH, 'EFI status handling subset', verified)],
      nextRequirements: ['COMPLETE_NAMED_STATUS_CODE_MAP'],
    };
  }

  return base;
}

function buildRegistry() {
  const state = loadState();
  const chapters = CHAPTER_TITLES.map((title, index) =>
    chapterFor(index + 1, title, state)
  );
  const appendices = APPENDIX_TITLES.map(([letter, title]) =>
    appendixFor(letter, title, state)
  );
  const capabilities = [...chapters, ...appendices];
  const counts = {
    chapters: chapters.length,
    appendices: appendices.length,
    total: capabilities.length,
    fullyImplemented: capabilities.filter(
      (item) => item.implementationLevel === 'FULLY_IMPLEMENTED'
    ).length,
    qemuVerifiedSubsets: capabilities.filter(
      (item) => item.verificationStatus.includes('QEMU_VERIFIED')
    ).length,
    sourceVerifiedSubsets: capabilities.filter(
      (item) => item.verificationStatus === 'SOURCE_VERIFIED'
    ).length,
    referenceMapped: capabilities.filter(
      (item) => item.implementationLevel === 'REFERENCE_MAPPED'
    ).length,
    defaultDeny: capabilities.filter(
      (item) => item.activation === 'REGISTERED_DEFAULT_DENY'
    ).length,
    evidencePending: capabilities.filter(
      (item) => item.verificationStatus === 'EVIDENCE_PENDING'
    ).length,
  };

  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_UEFI_CAPABILITY_REGISTRY_V1',
    status: state.foundationVerified
      ? 'ACTIVE_WITH_VERIFIED_FOUNDATION_SUBSETS'
      : 'REGISTERED_WITH_RUNTIME_EVIDENCE_PENDING',
    specification: SPECIFICATION,
    counts,
    claimBoundary: {
      fullUefiImplementationClaimed: false,
      uefiConformanceCertified: false,
      physicalMsiBootVerified: false,
      secureBootVerified: false,
      nativeUsbStackImplemented: false,
      nativeNetworkStackImplemented: false,
      firmwareUpdateEnabled: false,
      diskWriteEnabled: false,
    },
    capabilities,
  };
}

function buildGraph(registry) {
  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_UEFI_ARCHITECTURE_GRAPH_V1',
    status: 'ACTIVE_GOVERNED_GRAPH',
    nodes: [
      { id: 'PLATFORM_FIRMWARE', type: 'FIRMWARE', state: 'EXTERNAL' },
      { id: 'UEFI_BOOT_MANAGER', type: 'FIRMWARE_SERVICE', state: 'USED' },
      { id: 'GPT_ESP_FAT32', type: 'BOOT_ARTIFACT', state: 'VERIFIED' },
      { id: 'BOOTX64_EFI', type: 'EFI_APPLICATION', state: 'VERIFIED' },
      { id: 'UEFI_CAPABILITY_GATE', type: 'GOVERNANCE_GATE', state: 'ACTIVE' },
      { id: 'BOOT_SERVICES_HANDOFF', type: 'HANDOFF', state: 'VERIFIED' },
      { id: 'SHEIKHA_NATIVE_KERNEL_V2', type: 'NATIVE_KERNEL', state: 'CONTROLLED_HALT' },
      { id: 'DEFAULT_DENY_BOUNDARY', type: 'SECURITY_BOUNDARY', state: 'ACTIVE' },
    ],
    edges: [
      ['PLATFORM_FIRMWARE', 'UEFI_BOOT_MANAGER', 'PROVIDES'],
      ['UEFI_BOOT_MANAGER', 'GPT_ESP_FAT32', 'DISCOVERS'],
      ['GPT_ESP_FAT32', 'BOOTX64_EFI', 'CONTAINS'],
      ['BOOTX64_EFI', 'UEFI_CAPABILITY_GATE', 'ENTERS'],
      ['UEFI_CAPABILITY_GATE', 'BOOT_SERVICES_HANDOFF', 'AUTHORIZES_SUBSET'],
      ['BOOT_SERVICES_HANDOFF', 'SHEIKHA_NATIVE_KERNEL_V2', 'TRANSFERS_CONTROL'],
      ['DEFAULT_DENY_BOUNDARY', 'UEFI_CAPABILITY_GATE', 'GOVERNS'],
    ].map(([from, to, relation]) => ({ from, to, relation })),
    capabilityRegistry: relative(REGISTRY_PATH),
    registeredCapabilityCount: registry.counts.total,
  };
}

function buildReport(registry, graph) {
  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_UEFI_INTEGRATION_FABRIC_V1',
    status: registry.status,
    specification: registry.specification,
    coverage: registry.counts,
    activeFoundation: registry.capabilities
      .filter((item) => item.activation.startsWith('ACTIVE'))
      .map((item) => ({
        id: item.id,
        title: item.title,
        implementationLevel: item.implementationLevel,
        verificationStatus: item.verificationStatus,
      })),
    controls: {
      defaultAuthorization: 'DENY',
      physicalDiskWrite: 'DENY',
      nvramMutation: 'DENY',
      firmwareUpdate: 'DENY',
      networkDuringVerifiedBoot: 'DENY',
      unsignedSecureBootClaim: 'DENY',
      automatedKeyEnrollment: 'DENY',
      automatedReligiousRuling: 'DENY',
      highImpactHumanApproval: 'REQUIRED',
    },
    roadmap: [
      {
        stage: 'U0',
        title: 'Verified UEFI foundation',
        status: registry.status,
      },
      {
        stage: 'U1',
        title: 'Read-only Block I/O and filesystem inspection',
        status: 'PLANNED_DEFAULT_DENY',
      },
      {
        stage: 'U2',
        title: 'ACPI and PCI read-only enumeration',
        status: 'PLANNED_DEFAULT_DENY',
      },
      {
        stage: 'U3',
        title: 'Native input and bounded HII',
        status: 'PLANNED_DEFAULT_DENY',
      },
      {
        stage: 'U4',
        title: 'Owner-controlled Secure Boot signing',
        status: 'REQUIRES_KEYS_SIGNING_AND_HARDWARE',
      },
      {
        stage: 'U5',
        title: 'Opt-in isolated native network stack',
        status: 'REQUIRES_DRIVERS_TLS_AND_ISOLATION',
      },
      {
        stage: 'U6',
        title: 'Firmware lifecycle',
        status: 'SEPARATE_HIGH_IMPACT_APPROVAL_REQUIRED',
      },
    ],
    artifacts: {
      registry: relative(REGISTRY_PATH),
      architectureGraph: relative(GRAPH_PATH),
      contract: relative(CONTRACT_PATH),
    },
    graphNodeCount: graph.nodes.length,
    claimPolicy:
      'Registration is not implementation. Verification requires local source plus artifact or runtime evidence.',
  };
}

function generate() {
  const contract = readJson(CONTRACT_PATH);
  if (!contract || contract.id !== 'SHEIKHA_UEFI_INTEGRATION_FABRIC_V1') {
    throw new Error('UEFI integration contract is missing or invalid');
  }
  const registry = buildRegistry();
  const graph = buildGraph(registry);
  const report = buildReport(registry, graph);
  writeJson(REGISTRY_PATH, registry);
  writeJson(GRAPH_PATH, graph);
  writeJson(REPORT_PATH, report);
  return { registry, graph, report };
}

if (require.main === module) {
  const output = generate();
  process.stdout.write(`${JSON.stringify({
    system: output.report.system,
    status: output.report.status,
    coverage: output.report.coverage,
    output: {
      registry: relative(REGISTRY_PATH),
      report: relative(REPORT_PATH),
      architectureGraph: relative(GRAPH_PATH),
    },
  }, null, 2)}\n`);
}

module.exports = {
  APPENDIX_TITLES,
  CHAPTER_TITLES,
  GRAPH_PATH,
  REGISTRY_PATH,
  REPORT_PATH,
  buildRegistry,
  generate,
};
