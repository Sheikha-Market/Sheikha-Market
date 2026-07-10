#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const BARE_METAL_ROOT = path.join(ROOT, 'bare-metal');
const OUT_DIR = path.join(BARE_METAL_ROOT, 'build', 'out');
const GENERATED_DIR = path.join(OUT_DIR, 'generated');
const IMAGE_DIR = path.join(BARE_METAL_ROOT, 'images');
const ESP_DIR = path.join(IMAGE_DIR, 'esp', 'EFI', 'BOOT');
const EFI_ARTIFACT = path.join(ESP_DIR, 'BOOTX64.EFI');
const FAT_IMAGE = path.join(IMAGE_DIR, 'sheikha-bare-metal-seed-v1.img');
const RUNTIME_DIR = path.join(ROOT, 'runtime', 'bare-metal', 'v1');
const EVIDENCE_DIR = path.join(RUNTIME_DIR, 'evidence');
const REPORT_PATH = path.join(RUNTIME_DIR, 'sheikha-bare-metal-seed-v1-report.json');
const TOOLCHAIN_REPORT_PATH = path.join(EVIDENCE_DIR, 'toolchain-report.json');
const BUILD_REPORT_PATH = path.join(EVIDENCE_DIR, 'build-report.json');
const SHA_PATH = path.join(EVIDENCE_DIR, 'artifact-sha256.txt');
const QEMU_COMMAND_PATH = path.join(EVIDENCE_DIR, 'qemu-command.txt');
const QEMU_SERIAL_PATH = path.join(EVIDENCE_DIR, 'qemu-serial.log');
const QEMU_RUN_REPORT_PATH = path.join(EVIDENCE_DIR, 'qemu-run-report.json');
const VERIFICATION_PATH = path.join(EVIDENCE_DIR, 'boot-verification.json');
const BOOT_MARKER = 'SHEIKHA_BARE_METAL_BOOT_OK';
const POST_HANDOFF_MARKER = 'boot_services=EXITED';

const CONTRACTS = [
  ['SHEIKHA_BOOT_CONTRACT_ID', 'contracts/SHEIKHA-BOOT-CONTRACT-V1.json'],
  ['SHEIKHA_KERNEL_CONTRACT_ID', 'contracts/SHEIKHA-KERNEL-CONTRACT-V1.json'],
  ['SHEIKHA_HAL_CONTRACT_ID', 'contracts/SHEIKHA-HAL-CONTRACT-V1.json'],
  ['SHEIKHA_LANGUAGE_BOOT_CONTRACT_ID', 'contracts/SHEIKHA-LANGUAGE-BOOT-CONTRACT-V1.json'],
  ['SHEIKHA_GOVERNANCE_CONTRACT_ID', 'contracts/SHEIKHA-BARE-METAL-GOVERNANCE-CONTRACT-V1.json']
];

const SOURCES = ['kernel/sheikha_native_seed.c'];

const REQUIRED_BUILD_TOOLS = ['gcc', 'ld', 'objcopy', 'readelf'];
const OPTIONAL_TOOLS = [
  'rustc',
  'cargo',
  'clang',
  'ld.lld',
  'lld',
  'nasm',
  'qemu-system-x86_64',
  'qemu-system-aarch64',
  'xorriso',
  'grub-mkrescue',
  'mkfs.fat'
];

const FIRMWARE_CODE_CANDIDATES = [
  process.env.SHEIKHA_OVMF_CODE,
  '/usr/share/OVMF/OVMF_CODE.fd',
  '/usr/share/OVMF/OVMF_CODE_4M.fd',
  '/usr/share/edk2/ovmf/OVMF_CODE.fd',
  '/usr/share/edk2/x64/OVMF_CODE.fd',
  '/usr/share/qemu/OVMF_CODE.fd',
  '/usr/share/qemu/OVMF.fd'
].filter(Boolean);

const FIRMWARE_VARS_CANDIDATES = [
  process.env.SHEIKHA_OVMF_VARS,
  '/usr/share/OVMF/OVMF_VARS.fd',
  '/usr/share/OVMF/OVMF_VARS_4M.fd',
  '/usr/share/edk2/ovmf/OVMF_VARS.fd',
  '/usr/share/edk2/x64/OVMF_VARS.fd',
  '/usr/share/qemu/OVMF_VARS.fd'
].filter(Boolean);

function relative(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJson(filePath, payload) {
  ensureDirectory(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
}

function findExecutable(name) {
  const pathEntries = (process.env.PATH || '').split(path.delimiter).filter(Boolean);
  for (const entry of pathEntries) {
    const candidate = path.join(entry, name);
    try {
      fs.accessSync(candidate, fs.constants.X_OK);
      if (fs.statSync(candidate).isFile()) {
        return candidate;
      }
    } catch {
      // Continue through PATH entries.
    }
  }
  return null;
}

function firstExisting(candidates) {
  return candidates.find((candidate) => fs.existsSync(candidate)) || null;
}

function commandVersion(executable) {
  if (!executable) {
    return null;
  }
  const result = spawnSync(executable, ['--version'], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 5000
  });
  const output = String(result.stdout || '') + String(result.stderr || '');
  return output.trim().split(/\r?\n/, 1)[0] || null;
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
    timeout: 30000,
    env: {
      ...process.env,
      LC_ALL: 'C',
      SOURCE_DATE_EPOCH: '0'
    },
    ...options
  });
  if (result.error || result.status !== 0) {
    const output = (String(result.stdout || '') + String(result.stderr || '')).trim();
    const reason = result.error ? result.error.message : 'exit ' + result.status;
    throw new Error(path.basename(command) + ' failed (' + reason + ')' + (output ? ':\n' + output : ''));
  }
  return result;
}

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function buildToolchainReport() {
  const toolNames = [...new Set([...REQUIRED_BUILD_TOOLS, ...OPTIONAL_TOOLS])];
  const tools = {};
  for (const name of toolNames) {
    const executable = findExecutable(name);
    tools[name] = {
      available: Boolean(executable),
      path: executable,
      version: commandVersion(executable)
    };
  }
  const ovmfCode = firstExisting(FIRMWARE_CODE_CANDIDATES);
  const ovmfVars = firstExisting(FIRMWARE_VARS_CANDIDATES);
  const missingBuildRequirements = REQUIRED_BUILD_TOOLS.filter((name) => !tools[name].available);
  const missingBootRequirements = [];
  if (!tools['qemu-system-x86_64'].available) {
    missingBootRequirements.push('qemu-system-x86_64');
  }
  if (!ovmfCode) {
    missingBootRequirements.push('OVMF_CODE.fd');
  }
  const report = {
    system: 'SHEIKHA_BARE_METAL_TOOLCHAIN_V1',
    generatedAt: new Date().toISOString(),
    architecture: 'x86_64',
    selectedBackend: missingBuildRequirements.length === 0 ? 'freestanding-c11-gnu-pe32plus' : null,
    rustPreferredButUnavailable: !tools.rustc.available || !tools.cargo.available,
    tools,
    firmware: { ovmfCode, ovmfVars },
    buildReady: missingBuildRequirements.length === 0,
    qemuBootReady: missingBootRequirements.length === 0,
    missingBuildRequirements,
    missingBootRequirements,
    packageInstallationPerformed: false
  };
  writeJson(TOOLCHAIN_REPORT_PATH, report);
  return report;
}

function cleanGeneratedArtifacts() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.rmSync(path.join(IMAGE_DIR, 'esp'), { recursive: true, force: true });
  fs.rmSync(FAT_IMAGE, { force: true });
  ensureDirectory(GENERATED_DIR);
  ensureDirectory(ESP_DIR);
  ensureDirectory(EVIDENCE_DIR);
}

function generateContractHeader() {
  const definitions = [];
  for (const item of CONTRACTS) {
    const macro = item[0];
    const contractPath = item[1];
    const absolutePath = path.join(BARE_METAL_ROOT, contractPath);
    const contract = readJson(absolutePath);
    if (!contract || !/^[A-Z0-9_]+$/.test(contract.id || '')) {
      throw new Error('Invalid contract id in ' + relative(absolutePath));
    }
    definitions.push('#define ' + macro + ' "' + contract.id + '"');
  }
  const headerPath = path.join(GENERATED_DIR, 'sheikha_contracts.h');
  const header = [
    '#ifndef SHEIKHA_CONTRACTS_H',
    '#define SHEIKHA_CONTRACTS_H',
    '',
    ...definitions,
    '',
    '#endif',
    ''
  ].join('\n');
  fs.writeFileSync(headerPath, header, 'ascii');
  return headerPath;
}

function parsePeArtifact(filePath) {
  const data = fs.readFileSync(filePath);
  if (data.length < 256 || data.toString('ascii', 0, 2) !== 'MZ') {
    throw new Error('Artifact does not have an MZ header');
  }
  const peOffset = data.readUInt32LE(0x3c);
  if (peOffset + 160 > data.length || data.toString('ascii', peOffset, peOffset + 4) !== 'PE\u0000\u0000') {
    throw new Error('Artifact does not have a valid PE signature');
  }
  const coffOffset = peOffset + 4;
  const optionalOffset = coffOffset + 20;
  const machine = data.readUInt16LE(coffOffset);
  const sections = data.readUInt16LE(coffOffset + 2);
  const optionalMagic = data.readUInt16LE(optionalOffset);
  const entryPointRva = data.readUInt32LE(optionalOffset + 16);
  const imageBase = Number(data.readBigUInt64LE(optionalOffset + 24));
  const sectionAlignment = data.readUInt32LE(optionalOffset + 32);
  const fileAlignment = data.readUInt32LE(optionalOffset + 36);
  const sizeOfImage = data.readUInt32LE(optionalOffset + 56);
  const sizeOfHeaders = data.readUInt32LE(optionalOffset + 60);
  const subsystem = data.readUInt16LE(optionalOffset + 68);
  const dllCharacteristics = data.readUInt16LE(optionalOffset + 70);
  const characteristics = data.readUInt16LE(coffOffset + 18);
  const importRva = data.readUInt32LE(optionalOffset + 120);
  const importSize = data.readUInt32LE(optionalOffset + 124);
  const relocationRva = data.readUInt32LE(optionalOffset + 152);
  const relocationSize = data.readUInt32LE(optionalOffset + 156);
  return {
    format: 'PE32+',
    machine,
    machineName: machine === 0x8664 ? 'x86_64' : 'unknown',
    sections,
    optionalMagic,
    entryPointRva,
    imageBase,
    sectionAlignment,
    fileAlignment,
    sizeOfImage,
    sizeOfHeaders,
    headersAligned: sizeOfHeaders % fileAlignment === 0,
    subsystem,
    subsystemName: subsystem === 10 ? 'EFI_APPLICATION' : 'unknown',
    characteristics,
    relocationsStripped: (characteristics & 0x0001) !== 0,
    dllCharacteristics,
    dynamicBase: (dllCharacteristics & 0x0040) !== 0,
    nxCompatible: (dllCharacteristics & 0x0100) !== 0,
    importRva,
    importSize,
    relocationRva,
    relocationSize,
    valid:
      machine === 0x8664 &&
      optionalMagic === 0x20b &&
      entryPointRva > 0 &&
      subsystem === 10 &&
      sizeOfHeaders % fileAlignment === 0 &&
      importRva === 0 &&
      importSize === 0 &&
      relocationRva > 0 &&
      relocationSize >= 8 &&
      (characteristics & 0x0001) === 0 &&
      (dllCharacteristics & 0x0100) !== 0
  };
}

function hardenPeHeader(filePath) {
  const data = fs.readFileSync(filePath);
  const peOffset = data.readUInt32LE(0x3c);
  const coffOffset = peOffset + 4;
  const optionalOffset = coffOffset + 20;
  const characteristicsOffset = coffOffset + 18;
  const dllCharacteristicsOffset = optionalOffset + 70;
  const fileAlignment = data.readUInt32LE(optionalOffset + 36);
  const sizeOfHeaders = data.readUInt32LE(optionalOffset + 60);
  const alignedHeaders = Math.ceil(sizeOfHeaders / fileAlignment) * fileAlignment;
  data.writeUInt16LE(data.readUInt16LE(characteristicsOffset) & ~0x0001, characteristicsOffset);
  data.writeUInt16LE(data.readUInt16LE(dllCharacteristicsOffset) | 0x0140, dllCharacteristicsOffset);
  data.writeUInt16LE(2, optionalOffset + 48);
  data.writeUInt32LE(alignedHeaders, optionalOffset + 60);
  data.writeBigUInt64LE(BigInt(2 * 1024 * 1024), optionalOffset + 72);
  data.writeBigUInt64LE(BigInt(64 * 1024), optionalOffset + 80);
  fs.writeFileSync(filePath, data);
}

function resetQemuEvidence(reason, toolchain) {
  const qemuReport = {
    system: 'SHEIKHA_BARE_METAL_QEMU_RUN_V1',
    generatedAt: new Date().toISOString(),
    executed: false,
    markerVerified: false,
    postFirmwareHandoffVerified: false,
    reason,
    missingRequirements: toolchain.missingBootRequirements
  };
  fs.writeFileSync(QEMU_COMMAND_PATH, 'NOT_EXECUTED: ' + reason + '\n', 'utf8');
  fs.writeFileSync(QEMU_SERIAL_PATH, 'QEMU_NOT_EXECUTED: ' + reason + '\n', 'utf8');
  writeJson(QEMU_RUN_REPORT_PATH, qemuReport);
  return qemuReport;
}

function buildNativeArtifact() {
  const toolchain = buildToolchainReport();
  if (!toolchain.buildReady) {
    const buildReport = {
      system: 'SHEIKHA_BARE_METAL_BUILD_V1',
      generatedAt: new Date().toISOString(),
      status: 'TOOLCHAIN_REQUIREMENTS_NOT_MET',
      missingRequirements: toolchain.missingBuildRequirements,
      artifactCreated: false
    };
    writeJson(BUILD_REPORT_PATH, buildReport);
    writeFinalReport(buildReport, resetQemuEvidence('native build requirements are missing', toolchain));
    throw new Error('Missing build requirements: ' + toolchain.missingBuildRequirements.join(', '));
  }
  cleanGeneratedArtifacts();
  const contractHeader = generateContractHeader();
  const compileFlags = [
    '-std=c11',
    '-O2',
    '-Wall',
    '-Wextra',
    '-Werror',
    '-ffreestanding',
    '-fno-builtin',
    '-fno-stack-protector',
    '-fpie',
    '-fno-plt',
    '-fshort-wchar',
    '-fno-asynchronous-unwind-tables',
    '-fno-unwind-tables',
    '-fcf-protection=none',
    '-mno-red-zone',
    '-mno-mmx',
    '-mno-sse',
    '-mno-sse2',
    '-mcmodel=small',
    '-I' + path.join(BARE_METAL_ROOT, 'include'),
    '-I' + path.join(BARE_METAL_ROOT, 'drivers', 'serial'),
    '-I' + path.join(BARE_METAL_ROOT, 'kernel', 'entry'),
    '-I' + GENERATED_DIR
  ];
  const sourcePath = path.join(BARE_METAL_ROOT, SOURCES[0]);
  const elfObject = path.join(OUT_DIR, 'sheikha_native_seed.elf.o');
  runCommand(toolchain.tools.gcc.path, [...compileFlags, '-c', sourcePath, '-o', elfObject]);
  const linkedElf = path.join(OUT_DIR, 'sheikha-native-kernel-seed-v1.elf');
  const linkFlags = [
    '-nostdlib',
    '-static',
    '--build-id=none',
    '-z',
    'noexecstack',
    '-e',
    'efi_main',
    '-Ttext=0x401000',
    '-o',
    linkedElf,
    elfObject
  ];
  runCommand(toolchain.tools.ld.path, linkFlags);
  const relocationInspection = runCommand(toolchain.tools.readelf.path, ['-r', linkedElf]).stdout;
  if (!relocationInspection.includes('There are no relocations in this file')) {
    throw new Error('Final position-independent ELF still contains runtime relocations');
  }
  const basePe = path.join(OUT_DIR, 'BOOTX64.base.EFI');
  runCommand(toolchain.tools.objcopy.path, [
    '-I',
    'elf64-x86-64',
    '-O',
    'pei-x86-64',
    '--remove-section=.comment',
    '--remove-section=.note.gnu.property',
    '--subsystem=10',
    '--image-base=0x400000',
    '--file-alignment=512',
    '--section-alignment=4096',
    linkedElf,
    basePe
  ]);
  const relocationBlock = path.join(OUT_DIR, 'sheikha-pe-reloc.bin');
  const relocationData = Buffer.alloc(12, 0);
  relocationData.writeUInt32LE(0, 0);
  relocationData.writeUInt32LE(12, 4);
  fs.writeFileSync(relocationBlock, relocationData);
  const linkedArtifact = path.join(OUT_DIR, 'BOOTX64.EFI');
  runCommand(toolchain.tools.objcopy.path, [
    '--add-section',
    '.reloc=' + relocationBlock,
    '--set-section-flags',
    '.reloc=alloc,load,readonly,data',
    '--change-section-vma',
    '.reloc=0x430000',
    basePe,
    linkedArtifact
  ]);
  hardenPeHeader(linkedArtifact);
  const pe = parsePeArtifact(linkedArtifact);
  if (!pe.valid) {
    throw new Error('PE verification failed: ' + JSON.stringify(pe));
  }
  ensureDirectory(ESP_DIR);
  fs.copyFileSync(linkedArtifact, EFI_ARTIFACT);
  const artifactBuffer = fs.readFileSync(EFI_ARTIFACT);
  if (
    !artifactBuffer.includes(Buffer.from(BOOT_MARKER, 'ascii')) ||
    !artifactBuffer.includes(Buffer.from(POST_HANDOFF_MARKER, 'ascii'))
  ) {
    throw new Error('Compiled artifact does not contain the required serial markers');
  }
  const buildReport = {
    system: 'SHEIKHA_BARE_METAL_BUILD_V1',
    generatedAt: new Date().toISOString(),
    status: 'BOOT_ARTIFACT_CREATED',
    architecture: 'x86_64',
    backend: toolchain.selectedBackend,
    freestanding: true,
    standardLibraryLinked: false,
    hostUsedForBuildOnly: true,
    sourceDateEpoch: 0,
    contractHeader: relative(contractHeader),
    sources: SOURCES.map((source) => 'bare-metal/' + source),
    sourceModules: [
      'bare-metal/boot/uefi/sheikha_uefi_entry.c',
      'bare-metal/drivers/serial/sheikha_serial.c',
      'bare-metal/kernel/entry/sheikha_kernel.c'
    ],
    positionIndependentElf: relative(linkedElf),
    runtimeRelocations: 0,
    peRelocationSection: 'ABSOLUTE-only relocation block; native code is position-independent',
    compileFlags,
    linkFlags,
    artifactCreated: true,
    artifact: {
      path: relative(EFI_ARTIFACT),
      bytes: fs.statSync(EFI_ARTIFACT).size,
      sha256: sha256(EFI_ARTIFACT),
      pe
    }
  };
  writeJson(BUILD_REPORT_PATH, buildReport);
  fs.writeFileSync(SHA_PATH, buildReport.artifact.sha256 + '  ' + buildReport.artifact.path + '\n', 'ascii');
  const qemuReport = resetQemuEvidence('current artifact has not been booted', toolchain);
  writeFinalReport(buildReport, qemuReport);
  return buildReport;
}

function setFat12Entry(fat, cluster, value) {
  const offset = Math.floor(cluster * 1.5);
  if ((cluster & 1) === 0) {
    fat[offset] = value & 0xff;
    fat[offset + 1] = (fat[offset + 1] & 0xf0) | ((value >> 8) & 0x0f);
  } else {
    fat[offset] = (fat[offset] & 0x0f) | ((value << 4) & 0xf0);
    fat[offset + 1] = (value >> 4) & 0xff;
  }
}

function writeDirectoryEntry(buffer, offset, name, attributes, cluster, size) {
  if (name.length !== 11) {
    throw new Error('FAT 8.3 name must be 11 characters: ' + name);
  }
  buffer.fill(0, offset, offset + 32);
  buffer.write(name, offset, 11, 'ascii');
  buffer[offset + 11] = attributes;
  const fixedDate = ((2026 - 1980) << 9) | (1 << 5) | 1;
  buffer.writeUInt16LE(fixedDate, offset + 16);
  buffer.writeUInt16LE(fixedDate, offset + 18);
  buffer.writeUInt16LE(fixedDate, offset + 24);
  buffer.writeUInt16LE(cluster, offset + 26);
  buffer.writeUInt32LE(size, offset + 28);
}

function createFat12Image(efiPayload) {
  const bytesPerSector = 512;
  const totalSectors = 2880;
  const sectorsPerFat = 9;
  const rootEntries = 224;
  const rootSectors = 14;
  const fat1Sector = 1;
  const fat2Sector = fat1Sector + sectorsPerFat;
  const rootSector = fat2Sector + sectorsPerFat;
  const dataSector = rootSector + rootSectors;
  const image = Buffer.alloc(bytesPerSector * totalSectors, 0);
  const boot = image.subarray(0, bytesPerSector);
  boot.set([0xeb, 0x3c, 0x90], 0);
  boot.write('SHEIKHA ', 3, 8, 'ascii');
  boot.writeUInt16LE(bytesPerSector, 11);
  boot[13] = 1;
  boot.writeUInt16LE(1, 14);
  boot[16] = 2;
  boot.writeUInt16LE(rootEntries, 17);
  boot.writeUInt16LE(totalSectors, 19);
  boot[21] = 0xf0;
  boot.writeUInt16LE(sectorsPerFat, 22);
  boot.writeUInt16LE(18, 24);
  boot.writeUInt16LE(2, 26);
  boot.writeUInt32LE(0, 28);
  boot.writeUInt32LE(0, 32);
  boot[36] = 0;
  boot[38] = 0x29;
  boot.writeUInt32LE(0x53484b31, 39);
  boot.write('SHEIKHABM  ', 43, 11, 'ascii');
  boot.write('FAT12   ', 54, 8, 'ascii');
  boot[510] = 0x55;
  boot[511] = 0xaa;
  const fat = Buffer.alloc(sectorsPerFat * bytesPerSector, 0);
  fat[0] = 0xf0;
  fat[1] = 0xff;
  fat[2] = 0xff;
  setFat12Entry(fat, 2, 0xfff);
  setFat12Entry(fat, 3, 0xfff);
  const payloadClusters = Math.ceil(efiPayload.length / bytesPerSector);
  const maxDataClusters = totalSectors - dataSector;
  if (payloadClusters + 2 > maxDataClusters) {
    throw new Error('EFI artifact is too large for the deterministic FAT12 image');
  }
  for (let index = 0; index < payloadClusters; ++index) {
    const cluster = 4 + index;
    setFat12Entry(fat, cluster, index === payloadClusters - 1 ? 0xfff : cluster + 1);
  }
  fat.copy(image, fat1Sector * bytesPerSector);
  fat.copy(image, fat2Sector * bytesPerSector);
  const rootOffset = rootSector * bytesPerSector;
  writeDirectoryEntry(image, rootOffset, 'EFI        ', 0x10, 2, 0);
  const clusterOffset = (cluster) => (dataSector + cluster - 2) * bytesPerSector;
  const efiDirectoryOffset = clusterOffset(2);
  writeDirectoryEntry(image, efiDirectoryOffset, '.          ', 0x10, 2, 0);
  writeDirectoryEntry(image, efiDirectoryOffset + 32, '..         ', 0x10, 0, 0);
  writeDirectoryEntry(image, efiDirectoryOffset + 64, 'BOOT       ', 0x10, 3, 0);
  const bootDirectoryOffset = clusterOffset(3);
  writeDirectoryEntry(image, bootDirectoryOffset, '.          ', 0x10, 3, 0);
  writeDirectoryEntry(image, bootDirectoryOffset + 32, '..         ', 0x10, 2, 0);
  writeDirectoryEntry(image, bootDirectoryOffset + 64, 'BOOTX64 EFI', 0x20, 4, efiPayload.length);
  efiPayload.copy(image, clusterOffset(4));
  return image;
}

function createBootImage() {
  let buildReport = readJson(BUILD_REPORT_PATH);
  if (!buildReport?.artifactCreated || !fs.existsSync(EFI_ARTIFACT)) {
    buildReport = buildNativeArtifact();
  }
  const image = createFat12Image(fs.readFileSync(EFI_ARTIFACT));
  ensureDirectory(IMAGE_DIR);
  fs.writeFileSync(FAT_IMAGE, image);
  buildReport.image = {
    path: relative(FAT_IMAGE),
    bytes: fs.statSync(FAT_IMAGE).size,
    sha256: sha256(FAT_IMAGE),
    filesystem: 'FAT12',
    fallbackPath: 'EFI/BOOT/BOOTX64.EFI',
    deterministic: true
  };
  buildReport.status = 'BOOT_IMAGE_CREATED';
  writeJson(BUILD_REPORT_PATH, buildReport);
  fs.writeFileSync(
    SHA_PATH,
    buildReport.artifact.sha256 + '  ' + buildReport.artifact.path + '\n' +
      buildReport.image.sha256 + '  ' + buildReport.image.path + '\n',
    'ascii'
  );
  const toolchain = readJson(TOOLCHAIN_REPORT_PATH) || buildToolchainReport();
  const qemuReport = resetQemuEvidence('current boot image has not been booted', toolchain);
  writeFinalReport(buildReport, qemuReport);
  return buildReport;
}

function shellQuote(value) {
  return "'" + String(value).replace(/'/g, "'\"'\"'") + "'";
}

function runQemuSmoke() {
  let buildReport = readJson(BUILD_REPORT_PATH);
  if (!buildReport?.image || !fs.existsSync(FAT_IMAGE)) {
    buildReport = createBootImage();
  }
  const toolchain = buildToolchainReport();
  if (!toolchain.qemuBootReady) {
    const reason = 'missing requirements: ' + toolchain.missingBootRequirements.join(', ');
    const qemuReport = resetQemuEvidence(reason, toolchain);
    writeFinalReport(buildReport, qemuReport);
    return qemuReport;
  }
  const qemu = toolchain.tools['qemu-system-x86_64'].path;
  const args = [
    '-machine',
    'q35,accel=tcg',
    '-cpu',
    'qemu64',
    '-m',
    '128M',
    '-display',
    'none',
    '-vga',
    'none',
    '-monitor',
    'none',
    '-serial',
    'stdio',
    '-net',
    'none',
    '-no-reboot',
    '-no-shutdown'
  ];
  if (process.env.QEMU_DATADIR && fs.existsSync(process.env.QEMU_DATADIR)) {
    args.push('-L', process.env.QEMU_DATADIR);
  }
  if (toolchain.firmware.ovmfVars) {
    const runtimeVars = path.join(OUT_DIR, 'OVMF_VARS.runtime.fd');
    fs.copyFileSync(toolchain.firmware.ovmfVars, runtimeVars);
    fs.chmodSync(runtimeVars, 0o600);
    args.push(
      '-drive',
      'if=pflash,format=raw,unit=0,readonly=on,file=' + toolchain.firmware.ovmfCode,
      '-drive',
      'if=pflash,format=raw,unit=1,file=' + runtimeVars
    );
  } else {
    args.push('-bios', toolchain.firmware.ovmfCode);
  }
  const runtimeImage = path.join(OUT_DIR, 'sheikha-bare-metal-seed-v1.runtime.img');
  fs.copyFileSync(FAT_IMAGE, runtimeImage);
  fs.chmodSync(runtimeImage, 0o600);
  args.push('-drive', 'if=ide,format=raw,file=' + runtimeImage);
  const commandText = [qemu, ...args].map(shellQuote).join(' ');
  fs.writeFileSync(QEMU_COMMAND_PATH, commandText + '\n', 'utf8');
  const startedAt = Date.now();
  const result = spawnSync(qemu, args, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 15000,
    killSignal: 'SIGTERM',
    maxBuffer: 8 * 1024 * 1024,
    env: { ...process.env, LC_ALL: 'C' }
  });
  const serial = (String(result.stdout || '') + String(result.stderr || ''))
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '');
  fs.writeFileSync(QEMU_SERIAL_PATH, serial || 'QEMU_EXECUTED_WITHOUT_SERIAL_OUTPUT\n', 'utf8');
  const markerVerified = serial.includes(BOOT_MARKER);
  const postFirmwareHandoffVerified = markerVerified && serial.includes(POST_HANDOFF_MARKER);
  const qemuReport = {
    system: 'SHEIKHA_BARE_METAL_QEMU_RUN_V1',
    generatedAt: new Date().toISOString(),
    executed: true,
    durationMs: Date.now() - startedAt,
    timedOutAfterControlledHalt: result.error?.code === 'ETIMEDOUT',
    exitStatus: result.status,
    signal: result.signal,
    error: result.error ? { code: result.error.code, message: result.error.message } : null,
    markerVerified,
    postFirmwareHandoffVerified,
    command: commandText,
    firmware: toolchain.firmware,
    image: relative(FAT_IMAGE),
    serialEvidence: relative(QEMU_SERIAL_PATH),
    missingRequirements: []
  };
  writeJson(QEMU_RUN_REPORT_PATH, qemuReport);
  writeFinalReport(buildReport, qemuReport);
  return qemuReport;
}

function verifyArtifacts() {
  const toolchain = readJson(TOOLCHAIN_REPORT_PATH) || buildToolchainReport();
  const buildReport = readJson(BUILD_REPORT_PATH, {});
  const qemuReport = readJson(QEMU_RUN_REPORT_PATH, {
    executed: false,
    markerVerified: false,
    postFirmwareHandoffVerified: false,
    missingRequirements: toolchain.missingBootRequirements
  });
  const contractChecks = {};
  for (const item of CONTRACTS) {
    const contractPath = item[1];
    const contract = readJson(path.join(BARE_METAL_ROOT, contractPath));
    contractChecks[contractPath] = Boolean(contract?.id && contract?.version);
  }
  let pe = null;
  let artifactShaMatches = false;
  let artifactContainsMarkers = false;
  if (fs.existsSync(EFI_ARTIFACT) && buildReport.artifact?.sha256) {
    pe = parsePeArtifact(EFI_ARTIFACT);
    artifactShaMatches = sha256(EFI_ARTIFACT) === buildReport.artifact.sha256;
    const artifact = fs.readFileSync(EFI_ARTIFACT);
    artifactContainsMarkers =
      artifact.includes(Buffer.from(BOOT_MARKER, 'ascii')) &&
      artifact.includes(Buffer.from(POST_HANDOFF_MARKER, 'ascii'));
  }
  let imageShaMatches = false;
  let imageContainsArtifact = false;
  if (fs.existsSync(FAT_IMAGE) && fs.existsSync(EFI_ARTIFACT) && buildReport.image?.sha256) {
    const image = fs.readFileSync(FAT_IMAGE);
    const artifact = fs.readFileSync(EFI_ARTIFACT);
    imageShaMatches = sha256(FAT_IMAGE) === buildReport.image.sha256;
    imageContainsArtifact = image.indexOf(artifact) >= 0;
  }
  const checks = {
    contractsValid: Object.values(contractChecks).every(Boolean),
    artifactExists: fs.existsSync(EFI_ARTIFACT),
    imageExists: fs.existsSync(FAT_IMAGE),
    peValid: pe?.valid === true,
    peHeadersAligned: pe?.headersAligned === true,
    peRelocationsPresent: pe?.relocationsStripped === false && pe?.relocationSize > 0,
    peNxCompatible: pe?.nxCompatible === true,
    noPeImports: pe?.importRva === 0 && pe?.importSize === 0,
    artifactShaMatches,
    imageShaMatches,
    imageContainsArtifact,
    artifactContainsMarkers,
    serialMarkerVerified: qemuReport.markerVerified === true,
    postFirmwareHandoffVerified: qemuReport.postFirmwareHandoffVerified === true
  };
  const artifactChecksPassed = [
    checks.contractsValid,
    checks.artifactExists,
    checks.imageExists,
    checks.peValid,
    checks.peHeadersAligned,
    checks.peRelocationsPresent,
    checks.peNxCompatible,
    checks.noPeImports,
    checks.artifactShaMatches,
    checks.imageShaMatches,
    checks.imageContainsArtifact,
    checks.artifactContainsMarkers
  ].every(Boolean);
  const bootVerified =
    artifactChecksPassed &&
    qemuReport.executed === true &&
    checks.serialMarkerVerified &&
    checks.postFirmwareHandoffVerified;
  const verification = {
    system: 'SHEIKHA_BARE_METAL_BOOT_VERIFICATION_V1',
    generatedAt: new Date().toISOString(),
    status: bootVerified ? 'VERIFIED_BARE_METAL_BOOT' : 'ARTIFACT_VERIFIED_BOOT_EVIDENCE_PENDING',
    checks,
    contractChecks,
    pe,
    artifactChecksPassed,
    qemuBootExecuted: qemuReport.executed === true,
    serialBootMarkerVerified: checks.serialMarkerVerified,
    postFirmwareHandoffVerified: checks.postFirmwareHandoffVerified,
    bootVerified,
    claimGuardPassed:
      !bootVerified ||
      (qemuReport.executed === true && checks.serialMarkerVerified && checks.postFirmwareHandoffVerified)
  };
  if (pe && buildReport.artifact) {
    buildReport.artifact.pe = pe;
    writeJson(BUILD_REPORT_PATH, buildReport);
  }
  writeJson(VERIFICATION_PATH, verification);
  writeFinalReport(buildReport, qemuReport, verification);
  if (!artifactChecksPassed) {
    throw new Error('Bare-metal artifact verification failed');
  }
  if (qemuReport.executed && !bootVerified) {
    throw new Error('QEMU executed but the post-firmware serial marker was not verified');
  }
  return verification;
}

function writeFinalReport(buildReport = {}, qemuReport = {}, verification = null) {
  const toolchain = readJson(TOOLCHAIN_REPORT_PATH, {
    missingBuildRequirements: REQUIRED_BUILD_TOOLS,
    missingBootRequirements: ['qemu-system-x86_64', 'OVMF_CODE.fd']
  });
  const artifactCreated = buildReport.artifactCreated === true && fs.existsSync(EFI_ARTIFACT);
  const qemuBootExecuted = qemuReport.executed === true;
  const serialBootMarkerVerified = qemuReport.markerVerified === true;
  const postFirmwareHandoffVerified = qemuReport.postFirmwareHandoffVerified === true;
  const bareMetalFullyIndependentToday =
    artifactCreated &&
    qemuBootExecuted &&
    serialBootMarkerVerified &&
    postFirmwareHandoffVerified &&
    verification?.artifactChecksPassed !== false;
  let status = 'TOOLCHAIN_REQUIREMENTS_NOT_MET';
  if (artifactCreated && !qemuBootExecuted) {
    status = 'BUILD_READY_BUT_BOOT_NOT_EXECUTED';
  } else if (artifactCreated && qemuBootExecuted && !bareMetalFullyIndependentToday) {
    status = 'BOOT_EXECUTED_BUT_NOT_VERIFIED';
  } else if (bareMetalFullyIndependentToday) {
    status = 'VERIFIED_BARE_METAL_BOOT';
  }
  const missingRequirements = !artifactCreated
    ? toolchain.missingBuildRequirements || []
    : !qemuBootExecuted
      ? toolchain.missingBootRequirements || []
      : [];
  const report = {
    system: 'SHEIKHA_BARE_METAL_SEED_V1',
    generatedAt: new Date().toISOString(),
    status,
    architecture: 'x86_64',
    bootProtocol: 'UEFI',
    kernel: 'SHEIKHA_NATIVE_KERNEL_SEED_V1',
    hostUsedForBuildOnly: true,
    linuxRequiredAtKernelRuntime: false,
    nodeRequiredAtKernelRuntime: false,
    libcRequiredAtKernelRuntime: false,
    javascriptInBootChain: false,
    aiInCriticalBootPath: false,
    bootArtifactCreated: artifactCreated,
    qemuBootExecuted,
    serialBootMarkerVerified,
    postFirmwareHandoffVerified,
    bareMetalFullyIndependentToday,
    artifact: artifactCreated ? { efi: buildReport.artifact, image: buildReport.image || null } : null,
    contracts: CONTRACTS.map((item) => 'bare-metal/' + item[1]),
    evidence: {
      toolchain: relative(TOOLCHAIN_REPORT_PATH),
      build: relative(BUILD_REPORT_PATH),
      sha256: relative(SHA_PATH),
      qemuCommand: relative(QEMU_COMMAND_PATH),
      qemuSerial: relative(QEMU_SERIAL_PATH),
      qemuRun: relative(QEMU_RUN_REPORT_PATH),
      bootVerification: relative(VERIFICATION_PATH)
    },
    missingRequirements,
    claimPolicy: 'No bare-metal completion claim without verified boot evidence.',
    governanceBoundary: {
      noRevelationClaim: true,
      noInfallibilityClaim: true,
      noIndependentFatwa: true,
      scholarReviewForReligiousQuestions: true,
      humanReviewForHighImpactDecisions: true,
      aiRuntimeKernelMutationAllowed: false
    }
  };
  writeJson(REPORT_PATH, report);
  return report;
}

function printSummary(report) {
  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    architecture: report.architecture,
    bootArtifactCreated: report.bootArtifactCreated,
    qemuBootExecuted: report.qemuBootExecuted,
    serialBootMarkerVerified: report.serialBootMarkerVerified,
    postFirmwareHandoffVerified: report.postFirmwareHandoffVerified,
    bareMetalFullyIndependentToday: report.bareMetalFullyIndependentToday,
    artifact: report.artifact,
    missingRequirements: report.missingRequirements,
    evidence: report.evidence
  }, null, 2));
}

function main() {
  ensureDirectory(EVIDENCE_DIR);
  const action = process.argv[2] || 'all';
  if (action === 'toolchain') {
    console.log(JSON.stringify(buildToolchainReport(), null, 2));
    return;
  }
  if (action === 'clean') {
    cleanGeneratedArtifacts();
    console.log(JSON.stringify({ system: 'SHEIKHA_BARE_METAL_CLEAN_V1', status: 'CLEAN' }, null, 2));
    return;
  }
  if (action === 'build') {
    buildNativeArtifact();
  } else if (action === 'image') {
    createBootImage();
  } else if (action === 'qemu') {
    const qemuReport = runQemuSmoke();
    if (qemuReport.executed && !qemuReport.postFirmwareHandoffVerified) {
      throw new Error('QEMU executed without the required post-firmware serial marker');
    }
  } else if (action === 'verify') {
    verifyArtifacts();
  } else if (action === 'all') {
    buildNativeArtifact();
    createBootImage();
    runQemuSmoke();
    verifyArtifacts();
  } else {
    throw new Error('Unknown action: ' + action);
  }
  printSummary(readJson(REPORT_PATH));
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('[SHEIKHA_BARE_METAL] ' + error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  BOOT_MARKER,
  POST_HANDOFF_MARKER,
  buildNativeArtifact,
  buildToolchainReport,
  createBootImage,
  createFat12Image,
  parsePeArtifact,
  runQemuSmoke,
  verifyArtifacts,
  writeFinalReport
};
