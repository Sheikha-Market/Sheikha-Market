#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SECTOR_BYTES = 512;
const DISK_BYTES = 64 * 1024 * 1024;
const DISK_SECTORS = DISK_BYTES / SECTOR_BYTES;
const PARTITION_START_LBA = 2048;
const GPT_ENTRY_COUNT = 128;
const GPT_ENTRY_BYTES = 128;
const GPT_ENTRY_SECTORS =
  (GPT_ENTRY_COUNT * GPT_ENTRY_BYTES) / SECTOR_BYTES;
const BACKUP_HEADER_LBA = DISK_SECTORS - 1;
const BACKUP_ENTRIES_LBA =
  BACKUP_HEADER_LBA - GPT_ENTRY_SECTORS;
const PARTITION_END_LBA = BACKUP_ENTRIES_LBA - 1;
const PARTITION_SECTORS =
  PARTITION_END_LBA - PARTITION_START_LBA + 1;
const FAT_RESERVED_SECTORS = 32;
const FAT_COUNT = 2;
const FAT_ROOT_CLUSTER = 2;
const FAT_EFI_CLUSTER = 3;
const FAT_BOOT_CLUSTER = 4;
const FAT_FILE_FIRST_CLUSTER = 5;
const FAT_END_OF_CHAIN = 0x0fffffff;
const IMAGE = path.join(
  ROOT,
  'bare-metal/images/v2/' +
    'sheikha-sovereign-bare-metal-v2-msi-usb-gpt-v1.img'
);
const EFI_ARTIFACT = path.join(
  ROOT,
  'bare-metal/images/v2/esp/EFI/BOOT/BOOTX64.EFI'
);
const OUTPUT_DIR = path.join(
  ROOT,
  'runtime/bare-metal/v2/physical-trial/v1'
);
const MANIFEST = path.join(
  OUTPUT_DIR,
  'sheikha-v2-msi-usb-gpt-v1-manifest.json'
);
const REPORT = path.join(
  OUTPUT_DIR,
  'sheikha-v2-msi-usb-gpt-v1-report.json'
);
const SERIAL_LOG = path.join(
  OUTPUT_DIR,
  'sheikha-v2-msi-usb-gpt-v1-qemu-serial.log'
);
const QEMU_REPORT = path.join(
  OUTPUT_DIR,
  'sheikha-v2-msi-usb-gpt-v1-qemu.json'
);

const ESP_TYPE_GUID = 'c12a7328-f81f-11d2-ba4b-00a0c93ec93b';
const DISK_GUID = '53014845-494b-4841-8100-000000000002';
const PARTITION_GUID = '53014845-494b-4841-8200-000000000002';
const REQUIRED_BOOT_MARKERS = [
  'SHEIKHA_V2_UEFI_BOOT_ENTRY',
  'SHEIKHA_V2_PAGING_PREPARED',
  'SHEIKHA_V2_CR3_LOAD_OK',
  'SHEIKHA_V2_INVLPG_OK',
  'SHEIKHA_BARE_METAL_BOOT_OK',
];

function relative(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function sha256Buffer(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function sha256File(filePath) {
  return sha256Buffer(fs.readFileSync(filePath));
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function guidToGptBytes(guid) {
  const match = guid.match(
    /^([0-9a-f]{8})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{4})-([0-9a-f]{12})$/i
  );
  if (!match) {
    throw new Error(`Invalid GUID: ${guid}`);
  }
  const bytes = Buffer.alloc(16);
  bytes.writeUInt32LE(Number.parseInt(match[1], 16), 0);
  bytes.writeUInt16LE(Number.parseInt(match[2], 16), 4);
  bytes.writeUInt16LE(Number.parseInt(match[3], 16), 6);
  Buffer.from(`${match[4]}${match[5]}`, 'hex').copy(bytes, 8);
  return bytes;
}

function writeProtectiveMbr(image) {
  const entry = 0x1be;
  image[entry] = 0x00;
  image.fill(0xff, entry + 1, entry + 4);
  image[entry + 4] = 0xee;
  image.fill(0xff, entry + 5, entry + 8);
  image.writeUInt32LE(1, entry + 8);
  image.writeUInt32LE(DISK_SECTORS - 1, entry + 12);
  image.writeUInt16LE(0xaa55, 510);
}

function createPartitionEntries() {
  const entries = Buffer.alloc(GPT_ENTRY_COUNT * GPT_ENTRY_BYTES);
  guidToGptBytes(ESP_TYPE_GUID).copy(entries, 0);
  guidToGptBytes(PARTITION_GUID).copy(entries, 16);
  entries.writeBigUInt64LE(BigInt(PARTITION_START_LBA), 32);
  entries.writeBigUInt64LE(BigInt(PARTITION_END_LBA), 40);
  entries.writeBigUInt64LE(0n, 48);
  Buffer.from('SHEIKHA V2 ESP', 'utf16le').copy(entries, 56);
  return entries;
}

function createGptHeader(currentLba, backupLba, entriesLba, entriesCrc) {
  const header = Buffer.alloc(SECTOR_BYTES);
  header.write('EFI PART', 0, 'ascii');
  header.writeUInt32LE(0x00010000, 8);
  header.writeUInt32LE(92, 12);
  header.writeUInt32LE(0, 16);
  header.writeBigUInt64LE(BigInt(currentLba), 24);
  header.writeBigUInt64LE(BigInt(backupLba), 32);
  header.writeBigUInt64LE(34n, 40);
  header.writeBigUInt64LE(BigInt(PARTITION_END_LBA), 48);
  guidToGptBytes(DISK_GUID).copy(header, 56);
  header.writeBigUInt64LE(BigInt(entriesLba), 72);
  header.writeUInt32LE(GPT_ENTRY_COUNT, 80);
  header.writeUInt32LE(GPT_ENTRY_BYTES, 84);
  header.writeUInt32LE(entriesCrc, 88);
  header.writeUInt32LE(crc32(header.subarray(0, 92)), 16);
  return header;
}

function calculateFat32Geometry() {
  const sectorsPerCluster = 1;
  for (let sectorsPerFat = 1; sectorsPerFat < 4096; sectorsPerFat += 1) {
    const dataSectors = PARTITION_SECTORS -
      FAT_RESERVED_SECTORS - FAT_COUNT * sectorsPerFat;
    const clusters = Math.floor(dataSectors / sectorsPerCluster);
    const required = Math.ceil((clusters + 2) * 4 / SECTOR_BYTES);
    if (sectorsPerFat >= required) {
      if (clusters < 65525) {
        throw new Error('Partition is too small for a valid FAT32 volume');
      }
      return { sectorsPerCluster, sectorsPerFat, clusters };
    }
  }
  throw new Error('FAT32 geometry did not converge');
}

function writeFat32BootSector(partition, geometry) {
  const boot = partition.subarray(0, SECTOR_BYTES);
  boot.set([0xeb, 0x58, 0x90], 0);
  boot.write('SHEIKHA ', 3, 'ascii');
  boot.writeUInt16LE(SECTOR_BYTES, 11);
  boot[13] = geometry.sectorsPerCluster;
  boot.writeUInt16LE(FAT_RESERVED_SECTORS, 14);
  boot[16] = FAT_COUNT;
  boot.writeUInt16LE(0, 17);
  boot.writeUInt16LE(0, 19);
  boot[21] = 0xf8;
  boot.writeUInt16LE(0, 22);
  boot.writeUInt16LE(63, 24);
  boot.writeUInt16LE(255, 26);
  boot.writeUInt32LE(PARTITION_START_LBA, 28);
  boot.writeUInt32LE(PARTITION_SECTORS, 32);
  boot.writeUInt32LE(geometry.sectorsPerFat, 36);
  boot.writeUInt16LE(0, 40);
  boot.writeUInt16LE(0, 42);
  boot.writeUInt32LE(FAT_ROOT_CLUSTER, 44);
  boot.writeUInt16LE(1, 48);
  boot.writeUInt16LE(6, 50);
  boot[64] = 0x80;
  boot[66] = 0x29;
  boot.writeUInt32LE(0x53485632, 67);
  boot.write('SHEIKHA V2 ', 71, 'ascii');
  boot.write('FAT32   ', 82, 'ascii');
  boot.writeUInt16LE(0xaa55, 510);
  boot.copy(partition, 6 * SECTOR_BYTES);
}

function writeFat32FsInfo(partition, geometry, allocatedClusters) {
  const fsInfo = partition.subarray(SECTOR_BYTES, 2 * SECTOR_BYTES);
  fsInfo.writeUInt32LE(0x41615252, 0);
  fsInfo.writeUInt32LE(0x61417272, 484);
  fsInfo.writeUInt32LE(geometry.clusters - allocatedClusters, 488);
  fsInfo.writeUInt32LE(FAT_FILE_FIRST_CLUSTER + allocatedClusters, 492);
  fsInfo.writeUInt32LE(0xaa550000, 508);
  fsInfo.copy(partition, 7 * SECTOR_BYTES);
}

function writeFatEntry(fat, cluster, value) {
  fat.writeUInt32LE(value >>> 0, cluster * 4);
}

function createShortEntry(name, extension, attributes, cluster, size) {
  const entry = Buffer.alloc(32);
  entry.write(name.padEnd(8, ' ').slice(0, 8), 0, 'ascii');
  entry.write(extension.padEnd(3, ' ').slice(0, 3), 8, 'ascii');
  entry[11] = attributes;
  entry.writeUInt16LE(0x0021, 16);
  entry.writeUInt16LE(0x0021, 18);
  entry.writeUInt16LE((cluster >>> 16) & 0xffff, 20);
  entry.writeUInt16LE(0x0021, 24);
  entry.writeUInt16LE(cluster & 0xffff, 26);
  entry.writeUInt32LE(size, 28);
  return entry;
}

function createDotEntry(doubleDot, cluster) {
  const entry = createShortEntry('', '', 0x10, cluster, 0);
  entry.fill(0x20, 0, 11);
  entry[0] = 0x2e;
  if (doubleDot) {
    entry[1] = 0x2e;
  }
  return entry;
}

function clusterOffset(geometry, cluster) {
  const dataStart = FAT_RESERVED_SECTORS +
    FAT_COUNT * geometry.sectorsPerFat;
  return (dataStart +
    (cluster - 2) * geometry.sectorsPerCluster) * SECTOR_BYTES;
}

function writeDirectory(partition, geometry, cluster, entries) {
  const offset = clusterOffset(geometry, cluster);
  entries.forEach((entry, index) => {
    entry.copy(partition, offset + index * 32);
  });
}

function writeFat32Partition(image, efiArtifact) {
  const geometry = calculateFat32Geometry();
  const partitionOffset = PARTITION_START_LBA * SECTOR_BYTES;
  const partition = image.subarray(
    partitionOffset,
    partitionOffset + PARTITION_SECTORS * SECTOR_BYTES
  );
  const clusterBytes = geometry.sectorsPerCluster * SECTOR_BYTES;
  const fileClusters = Math.ceil(efiArtifact.length / clusterBytes);
  const allocatedClusters = 3 + fileClusters;

  writeFat32BootSector(partition, geometry);
  writeFat32FsInfo(partition, geometry, allocatedClusters);

  const firstFatOffset = FAT_RESERVED_SECTORS * SECTOR_BYTES;
  const fatBytes = geometry.sectorsPerFat * SECTOR_BYTES;
  const fat = partition.subarray(firstFatOffset, firstFatOffset + fatBytes);
  writeFatEntry(fat, 0, 0x0ffffff8);
  writeFatEntry(fat, 1, FAT_END_OF_CHAIN);
  writeFatEntry(fat, FAT_ROOT_CLUSTER, FAT_END_OF_CHAIN);
  writeFatEntry(fat, FAT_EFI_CLUSTER, FAT_END_OF_CHAIN);
  writeFatEntry(fat, FAT_BOOT_CLUSTER, FAT_END_OF_CHAIN);
  for (let index = 0; index < fileClusters; index += 1) {
    const cluster = FAT_FILE_FIRST_CLUSTER + index;
    const next = index === fileClusters - 1
      ? FAT_END_OF_CHAIN
      : cluster + 1;
    writeFatEntry(fat, cluster, next);
  }
  fat.copy(partition, firstFatOffset + fatBytes);

  writeDirectory(partition, geometry, FAT_ROOT_CLUSTER, [
    createShortEntry('EFI', '', 0x10, FAT_EFI_CLUSTER, 0),
  ]);
  writeDirectory(partition, geometry, FAT_EFI_CLUSTER, [
    createDotEntry(false, FAT_EFI_CLUSTER),
    createDotEntry(true, FAT_ROOT_CLUSTER),
    createShortEntry('BOOT', '', 0x10, FAT_BOOT_CLUSTER, 0),
  ]);
  writeDirectory(partition, geometry, FAT_BOOT_CLUSTER, [
    createDotEntry(false, FAT_BOOT_CLUSTER),
    createDotEntry(true, FAT_EFI_CLUSTER),
    createShortEntry(
      'BOOTX64',
      'EFI',
      0x20,
      FAT_FILE_FIRST_CLUSTER,
      efiArtifact.length
    ),
  ]);

  for (let index = 0; index < fileClusters; index += 1) {
    const sourceStart = index * clusterBytes;
    const sourceEnd = Math.min(sourceStart + clusterBytes, efiArtifact.length);
    const targetOffset = clusterOffset(
      geometry,
      FAT_FILE_FIRST_CLUSTER + index
    );
    efiArtifact.copy(partition, targetOffset, sourceStart, sourceEnd);
  }

  return { ...geometry, fileClusters, allocatedClusters };
}

function writeGpt(image) {
  writeProtectiveMbr(image);
  const entries = createPartitionEntries();
  const entriesCrc = crc32(entries);
  entries.copy(image, 2 * SECTOR_BYTES);
  entries.copy(image, BACKUP_ENTRIES_LBA * SECTOR_BYTES);
  createGptHeader(1, BACKUP_HEADER_LBA, 2, entriesCrc)
    .copy(image, SECTOR_BYTES);
  createGptHeader(
    BACKUP_HEADER_LBA,
    1,
    BACKUP_ENTRIES_LBA,
    entriesCrc
  ).copy(image, BACKUP_HEADER_LBA * SECTOR_BYTES);
}

function inspectImage(image, expectedEfi) {
  const headerOffset = SECTOR_BYTES;
  const header = Buffer.from(image.subarray(headerOffset, headerOffset + 92));
  const storedHeaderCrc = header.readUInt32LE(16);
  header.writeUInt32LE(0, 16);
  const entries = image.subarray(
    2 * SECTOR_BYTES,
    (2 + GPT_ENTRY_SECTORS) * SECTOR_BYTES
  );
  const partition = image.subarray(
    PARTITION_START_LBA * SECTOR_BYTES,
    (PARTITION_END_LBA + 1) * SECTOR_BYTES
  );
  const geometry = calculateFat32Geometry();
  const fileEntryOffset =
    clusterOffset(geometry, FAT_BOOT_CLUSTER) + 2 * 32;
  const fileEntry = partition.subarray(fileEntryOffset, fileEntryOffset + 32);
  const fileCluster =
    (fileEntry.readUInt16LE(20) << 16) | fileEntry.readUInt16LE(26);
  const fileSize = fileEntry.readUInt32LE(28);
  const extracted = Buffer.alloc(fileSize);
  const clusterBytes = geometry.sectorsPerCluster * SECTOR_BYTES;
  const fatOffset = FAT_RESERVED_SECTORS * SECTOR_BYTES;
  let cluster = fileCluster;
  let written = 0;
  const visited = new Set();
  while (cluster < 0x0ffffff8 && written < fileSize) {
    if (visited.has(cluster) || cluster < 2) {
      throw new Error('Invalid FAT32 cluster chain');
    }
    visited.add(cluster);
    const available = Math.min(clusterBytes, fileSize - written);
    partition.copy(
      extracted,
      written,
      clusterOffset(geometry, cluster),
      clusterOffset(geometry, cluster) + available
    );
    written += available;
    cluster = partition.readUInt32LE(fatOffset + cluster * 4) & 0x0fffffff;
  }
  const checks = {
    protectiveMbr: image.readUInt16LE(510) === 0xaa55 &&
      image[0x1be + 4] === 0xee,
    primaryGptSignature:
      image.subarray(headerOffset, headerOffset + 8).toString('ascii') ===
        'EFI PART',
    primaryGptHeaderCrc: crc32(header) === storedHeaderCrc,
    partitionArrayCrc:
      crc32(entries) === image.readUInt32LE(headerOffset + 88),
    espTypeGuid:
      entries.subarray(0, 16).equals(guidToGptBytes(ESP_TYPE_GUID)),
    fat32Signature:
      partition.subarray(82, 90).toString('ascii') === 'FAT32   ',
    fat32BootSignature: partition.readUInt16LE(510) === 0xaa55,
    fallbackEntryName:
      fileEntry.subarray(0, 11).toString('ascii') === 'BOOTX64 EFI',
    fallbackArtifactSize: fileSize === expectedEfi.length,
    fallbackArtifactContent: extracted.equals(expectedEfi),
  };
  return {
    checks,
    verified: Object.values(checks).every(Boolean),
    extractedEfiSha256: sha256Buffer(extracted),
    fileSize,
    geometry,
  };
}

function build() {
  if (!fs.existsSync(EFI_ARTIFACT)) {
    throw new Error(`Missing EFI artifact: ${relative(EFI_ARTIFACT)}`);
  }
  const efiArtifact = fs.readFileSync(EFI_ARTIFACT);
  const image = Buffer.alloc(DISK_BYTES);
  writeGpt(image);
  const fat32 = writeFat32Partition(image, efiArtifact);
  const inspection = inspectImage(image, efiArtifact);
  if (!inspection.verified) {
    throw new Error('Generated MSI USB image failed structural verification');
  }
  fs.mkdirSync(path.dirname(IMAGE), { recursive: true });
  fs.writeFileSync(IMAGE, image);
  const imageSha256 = sha256Buffer(image);
  const efiSha256 = sha256Buffer(efiArtifact);
  const generatedAt = new Date().toISOString();
  const manifest = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_V2_MSI_USB_GPT_MANIFEST_V1',
    generatedAt,
    status: 'MSI_USB_IMAGE_READY_NOT_WRITTEN',
    platform: 'x86_64 UEFI',
    diskLayout: 'GPT',
    partition: {
      type: 'EFI_SYSTEM_PARTITION',
      filesystem: 'FAT32',
      startLba: PARTITION_START_LBA,
      endLba: PARTITION_END_LBA,
      sectors: PARTITION_SECTORS,
      fallbackPath: '\\EFI\\BOOT\\BOOTX64.EFI',
    },
    artifacts: [
      {
        role: 'MSI_USB_GPT_IMAGE',
        path: relative(IMAGE),
        bytes: image.length,
        sha256: imageSha256,
      },
      {
        role: 'UEFI_X86_64_APPLICATION',
        path: relative(EFI_ARTIFACT),
        bytes: efiArtifact.length,
        sha256: efiSha256,
      },
    ],
    fat32,
    structuralVerification: inspection,
    writeAuthorization: {
      granted: false,
      targetDevice: null,
      internalDiskAllowed: false,
      exactDeviceAndAcceptanceTokenRequired: true,
    },
  };
  const report = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_V2_MSI_USB_BOOT_TRIAL_V1',
    generatedAt,
    status: 'MSI_USB_IMAGE_READY_NOT_WRITTEN',
    imageBuilt: true,
    imageStructurallyVerified: true,
    qemuBootExecuted: false,
    qemuBootVerified: false,
    physicalMediaWritten: false,
    physicalBootExecuted: false,
    physicalBootVerified: false,
    diskInstallerImplemented: false,
    installableToInternalDisk: false,
    installerUiAvailable: false,
    safeTrialUiAvailable: true,
    secureBootSigningAvailable: false,
    artifact: manifest.artifacts[0],
    manifest: relative(MANIFEST),
    safetyBoundary: {
      usbWritePerformed: false,
      internalDiskWritePerformed: false,
      firmwareWritePerformed: false,
      bootOrderModified: false,
      humanApprovalRequiredBeforePhysicalWrite: true,
    },
    nextAction:
      'Attach a dedicated disposable USB, identify its exact device path, and provide explicit approval before running the guarded writer.',
    claimPolicy:
      'This artifact is a read-only boot trial that ends in a controlled halt; it is not an operating-system installer.',
  };
  writeJson(MANIFEST, manifest);
  writeJson(REPORT, report);
  return report;
}

function resolveQemuToolchain() {
  const phaseToolchain = path.join(
    ROOT,
    'runtime/bare-metal/v2/evidence/' +
      'sheikha-v2-uefi-paging-runtime-phase2b-toolchain.json'
  );
  let recorded = {};
  try {
    recorded = JSON.parse(fs.readFileSync(phaseToolchain, 'utf8'));
  } catch {
    recorded = {};
  }
  return {
    qemu: process.env.SHEIKHA_QEMU_X86_64 ||
      recorded.tools?.['qemu-system-x86_64']?.path ||
      'qemu-system-x86_64',
    code: process.env.SHEIKHA_OVMF_CODE ||
      recorded.firmware?.ovmfCode || null,
    vars: process.env.SHEIKHA_OVMF_VARS ||
      recorded.firmware?.ovmfVars || null,
  };
}

function qemuEnvironment(qemu) {
  const environment = { ...process.env, LC_ALL: 'C' };
  const localRoot = path.resolve(path.dirname(qemu), '..');
  const data = path.join(localRoot, 'share', 'qemu');
  const modules = path.join(localRoot, 'lib', 'x86_64-linux-gnu', 'qemu');
  const libraries = path.join(localRoot, 'lib', 'x86_64-linux-gnu');
  if (fs.existsSync(data)) environment.QEMU_DATADIR = data;
  if (fs.existsSync(modules)) environment.QEMU_MODULE_DIR = modules;
  if (fs.existsSync(libraries)) {
    environment.LD_LIBRARY_PATH = [
      libraries,
      environment.LD_LIBRARY_PATH,
    ].filter(Boolean).join(path.delimiter);
  }
  return environment;
}

function runQemu() {
  if (!fs.existsSync(IMAGE)) build();
  const tools = resolveQemuToolchain();
  if (!tools.code || !fs.existsSync(tools.code)) {
    throw new Error('OVMF firmware is unavailable');
  }
  const runtimeDir = path.join(
    ROOT,
    'bare-metal/kernel/v2/build/msi-usb-gpt-v1'
  );
  fs.mkdirSync(runtimeDir, { recursive: true });
  const runtimeImage = path.join(runtimeDir, 'msi-usb.runtime.img');
  fs.copyFileSync(IMAGE, runtimeImage);
  const args = [
    '-machine', 'q35,accel=tcg',
    '-cpu', 'qemu64',
    '-m', '128M',
    '-display', 'none',
    '-vga', 'none',
    '-monitor', 'none',
    '-serial', 'stdio',
    '-net', 'none',
    '-no-reboot',
    '-no-shutdown',
  ];
  if (tools.vars && fs.existsSync(tools.vars)) {
    const runtimeVars = path.join(runtimeDir, 'OVMF_VARS.runtime.fd');
    fs.copyFileSync(tools.vars, runtimeVars);
    args.push(
      '-drive', `if=pflash,format=raw,unit=0,readonly=on,file=${tools.code}`,
      '-drive', `if=pflash,format=raw,unit=1,file=${runtimeVars}`
    );
  } else {
    args.push('-bios', tools.code);
  }
  args.push('-drive', `if=ide,format=raw,file=${runtimeImage}`);
  const startedAt = Date.now();
  const result = spawnSync(tools.qemu, args, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 15000,
    killSignal: 'SIGTERM',
    maxBuffer: 16 * 1024 * 1024,
    env: qemuEnvironment(tools.qemu),
  });
  const serial = `${result.stdout || ''}${result.stderr || ''}`
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '');
  fs.writeFileSync(SERIAL_LOG, serial, 'utf8');
  const markerChecks = Object.fromEntries(
    REQUIRED_BOOT_MARKERS.map((marker) => [marker, serial.includes(marker)])
  );
  const verified = Object.values(markerChecks).every(Boolean);
  const qemuReport = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_V2_MSI_USB_GPT_QEMU_V1',
    generatedAt: new Date().toISOString(),
    status: verified ? 'VERIFIED' : 'FAILED',
    executed: true,
    verified,
    durationMs: Date.now() - startedAt,
    timedOutAfterControlledHalt: result.error?.code === 'ETIMEDOUT',
    markerChecks,
    imageSha256: sha256File(IMAGE),
    efiArtifactSha256: sha256File(EFI_ARTIFACT),
    networkEnabled: false,
    serialEvidence: relative(SERIAL_LOG),
  };
  writeJson(QEMU_REPORT, qemuReport);
  const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
  report.generatedAt = qemuReport.generatedAt;
  report.status = verified
    ? 'MSI_USB_IMAGE_QEMU_VERIFIED_NOT_WRITTEN'
    : 'MSI_USB_IMAGE_QEMU_FAILED';
  report.qemuBootExecuted = true;
  report.qemuBootVerified = verified;
  report.qemuEvidence = relative(QEMU_REPORT);
  writeJson(REPORT, report);
  if (!verified) {
    throw new Error('QEMU did not emit every required boot marker');
  }
  return report;
}

function verify() {
  if (!fs.existsSync(IMAGE)) return build();
  const image = fs.readFileSync(IMAGE);
  const efi = fs.readFileSync(EFI_ARTIFACT);
  const inspection = inspectImage(image, efi);
  if (!inspection.verified) {
    throw new Error('MSI USB image verification failed');
  }
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  if (
    manifest.artifacts[0].sha256 !== sha256File(IMAGE) ||
    manifest.artifacts[1].sha256 !== sha256File(EFI_ARTIFACT)
  ) {
    throw new Error('MSI USB artifact hash verification failed');
  }
  const qemuReport = JSON.parse(fs.readFileSync(QEMU_REPORT, 'utf8'));
  if (
    qemuReport.verified === true &&
    (
      qemuReport.imageSha256 !== sha256File(IMAGE) ||
      qemuReport.efiArtifactSha256 !== sha256File(EFI_ARTIFACT)
    )
  ) {
    throw new Error('MSI USB QEMU evidence is not bound to current artifacts');
  }
  return { verified: true, inspection, manifest };
}

function main() {
  const action = process.argv[2] || 'all';
  let result;
  if (action === 'build') result = build();
  else if (action === 'qemu') result = runQemu();
  else if (action === 'verify') result = verify();
  else if (action === 'all') {
    build();
    result = runQemu();
    verify();
  } else {
    throw new Error(`Unknown action: ${action}`);
  }
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`[SHEIKHA_V2_MSI_USB] ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  EFI_ARTIFACT,
  IMAGE,
  MANIFEST,
  REPORT,
  QEMU_REPORT,
  SERIAL_LOG,
  build,
  calculateFat32Geometry,
  crc32,
  guidToGptBytes,
  inspectImage,
  runQemu,
  verify,
};
