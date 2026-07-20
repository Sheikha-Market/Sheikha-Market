#!/usr/bin/env node
'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const {
  createFat12Image,
  parsePeArtifact,
} = require('./sheikha-bare-metal-pipeline-v1');

const ROOT = path.resolve(__dirname, '..', '..');
const BARE_METAL_ROOT = path.join(ROOT, 'bare-metal');
const OUT_DIR = path.join(
  BARE_METAL_ROOT,
  'kernel',
  'v2',
  'build',
  'uefi-paging-runtime-phase2b'
);
const GENERATED_DIR = path.join(OUT_DIR, 'generated');
const IMAGE_ROOT = path.join(BARE_METAL_ROOT, 'images', 'v2');
const EFI_ARTIFACT = path.join(
  IMAGE_ROOT,
  'esp',
  'EFI',
  'BOOT',
  'BOOTX64.EFI'
);
const FAT_IMAGE = path.join(
  IMAGE_ROOT,
  'sheikha-sovereign-bare-metal-v2-phase2b.img'
);
const EVIDENCE_DIR = path.join(
  ROOT,
  'runtime',
  'bare-metal',
  'v2',
  'evidence'
);
const REPORT_PATH = path.join(
  ROOT,
  'runtime',
  'bare-metal',
  'v2',
  'sheikha-sovereign-bare-metal-os-v2-phase2b-report.json'
);
const TOOLCHAIN_PATH = path.join(
  EVIDENCE_DIR,
  'sheikha-v2-uefi-paging-runtime-phase2b-toolchain.json'
);
const BUILD_PATH = path.join(
  EVIDENCE_DIR,
  'sheikha-v2-uefi-paging-runtime-phase2b-build.json'
);
const SHA_PATH = path.join(
  EVIDENCE_DIR,
  'sheikha-v2-uefi-paging-runtime-phase2b-sha256.txt'
);
const ELF_INSPECTION_PATH = path.join(
  EVIDENCE_DIR,
  'sheikha-v2-uefi-paging-runtime-phase2b-elf-inspection.txt'
);
const CR3_DISASSEMBLY_PATH = path.join(
  EVIDENCE_DIR,
  'sheikha-v2-uefi-paging-runtime-phase2b-cr3-disassembly.txt'
);
const QEMU_COMMAND_PATH = path.join(
  EVIDENCE_DIR,
  'sheikha-v2-uefi-paging-runtime-phase2b-qemu-command.txt'
);
const SERIAL_PATH = path.join(
  EVIDENCE_DIR,
  'sheikha-v2-uefi-paging-runtime-phase2b-serial.log'
);
const QEMU_PATH = path.join(
  EVIDENCE_DIR,
  'sheikha-v2-uefi-paging-runtime-phase2b-qemu.json'
);
const VERIFICATION_PATH = path.join(
  EVIDENCE_DIR,
  'sheikha-v2-uefi-paging-runtime-phase2b-verification.json'
);
const PHASE_EVIDENCE_PATH = path.join(
  EVIDENCE_DIR,
  'sheikha-v2-uefi-paging-runtime-phase2b.json'
);

const REQUIRED_BUILD_TOOLS = [
  'gcc',
  'ld',
  'objcopy',
  'readelf',
  'objdump',
];
const REQUIRED_MARKERS = [
  'SHEIKHA_UEFI_SYSTEM_TABLE_VALIDATED',
  'SHEIKHA_UEFI_BOOT_SERVICES_ACTIVE',
  'SHEIKHA_UEFI_RUNTIME_SERVICES_PRESENT',
  'SHEIKHA_UEFI_CONSOLE_OUTPUT_OK',
  'SHEIKHA_UEFI_WATCHDOG_DISABLED',
  'SHEIKHA_UEFI_LOADED_IMAGE_PROTOCOL_OK',
  'SHEIKHA_UEFI_DEVICE_PATH_PROTOCOL_OK',
  'SHEIKHA_UEFI_GOP_DISCOVERY_ATTEMPTED',
  'SHEIKHA_V2_PAGING_PREPARED',
  'SHEIKHA_V2_CR3_LOAD_OK',
  'SHEIKHA_V2_INVLPG_OK',
  'SHEIKHA_V2_PAGING_BOOT_OK',
  'SHEIKHA_BARE_METAL_BOOT_OK',
  'boot_services=EXITED',
  'physical_display_indicator=',
];
const CONTRACTS = [
  ['SHEIKHA_BOOT_CONTRACT_ID', 'contracts/SHEIKHA-BOOT-CONTRACT-V1.json'],
  ['SHEIKHA_KERNEL_CONTRACT_ID', 'contracts/SHEIKHA-KERNEL-CONTRACT-V1.json'],
  ['SHEIKHA_HAL_CONTRACT_ID', 'contracts/SHEIKHA-HAL-CONTRACT-V1.json'],
  [
    'SHEIKHA_LANGUAGE_BOOT_CONTRACT_ID',
    'contracts/SHEIKHA-LANGUAGE-BOOT-CONTRACT-V1.json',
  ],
  [
    'SHEIKHA_GOVERNANCE_CONTRACT_ID',
    'contracts/SHEIKHA-BARE-METAL-GOVERNANCE-CONTRACT-V1.json',
  ],
];

const FIRMWARE_CODE_CANDIDATES = [
  process.env.SHEIKHA_OVMF_CODE,
  '/usr/share/OVMF/OVMF_CODE.fd',
  '/usr/share/OVMF/OVMF_CODE_4M.fd',
  '/usr/share/edk2/ovmf/OVMF_CODE.fd',
  '/usr/share/edk2/x64/OVMF_CODE.fd',
  '/usr/share/qemu/OVMF_CODE.fd',
].filter(Boolean);
const FIRMWARE_VARS_CANDIDATES = [
  process.env.SHEIKHA_OVMF_VARS,
  '/usr/share/OVMF/OVMF_VARS.fd',
  '/usr/share/OVMF/OVMF_VARS_4M.fd',
  '/usr/share/edk2/ovmf/OVMF_VARS.fd',
  '/usr/share/edk2/x64/OVMF_VARS.fd',
  '/usr/share/qemu/OVMF_VARS.fd',
].filter(Boolean);

function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function relative(filePath) {
  return path.relative(ROOT, filePath).split(path.sep).join('/');
}

function writeJson(filePath, value) {
  ensureDirectory(path.dirname(filePath));
  fs.writeFileSync(
    filePath,
    `${JSON.stringify(value, null, 2)}\n`,
    'utf8'
  );
}

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function sha256(filePath) {
  return crypto
    .createHash('sha256')
    .update(fs.readFileSync(filePath))
    .digest('hex');
}

function normalizeToolOutput(value) {
  return `${String(value || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n*$/g, '')}\n`;
}

function findExecutable(name) {
  if (name.includes(path.sep)) {
    try {
      fs.accessSync(name, fs.constants.X_OK);
      return fs.statSync(name).isFile() ? name : null;
    } catch {
      return null;
    }
  }

  for (const entry of (process.env.PATH || '').split(path.delimiter)) {
    if (!entry) {
      continue;
    }
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

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    timeout: 30000,
    env: {
      ...process.env,
      LC_ALL: 'C',
      SOURCE_DATE_EPOCH: '0',
    },
    ...options,
  });

  if (result.error || result.status !== 0) {
    const output = `${result.stdout || ''}${result.stderr || ''}`.trim();
    const reason = result.error
      ? result.error.message
      : `exit ${result.status}`;
    throw new Error(
      `${path.basename(command)} failed (${reason})${
        output ? `:\n${output}` : ''
      }`
    );
  }
  return result;
}

function commandVersion(executable, environment = process.env) {
  if (!executable) {
    return null;
  }
  const result = spawnSync(executable, ['--version'], {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 5000,
    env: environment,
  });
  return `${result.stdout || ''}${result.stderr || ''}`
    .trim()
    .split(/\r?\n/, 1)[0] || null;
}

function inspectToolchain() {
  const tools = {};
  for (const name of REQUIRED_BUILD_TOOLS) {
    const executable = findExecutable(name);
    tools[name] = {
      available: Boolean(executable),
      path: executable,
      version: commandVersion(executable),
    };
  }

  const configuredQemu = process.env.SHEIKHA_QEMU_X86_64 ||
    'qemu-system-x86_64';
  const qemu = findExecutable(configuredQemu);
  tools['qemu-system-x86_64'] = {
    available: Boolean(qemu),
    path: qemu,
    version: commandVersion(
      qemu,
      qemu ? resolveQemuEnvironment(qemu) : process.env
    ),
  };

  const ovmfCode = firstExisting(FIRMWARE_CODE_CANDIDATES);
  const ovmfVars = firstExisting(FIRMWARE_VARS_CANDIDATES);
  const missingBuildRequirements = REQUIRED_BUILD_TOOLS.filter(
    (name) => !tools[name].available
  );
  const missingBootRequirements = [];
  if (!qemu) {
    missingBootRequirements.push('qemu-system-x86_64');
  }
  if (!ovmfCode) {
    missingBootRequirements.push('OVMF_CODE.fd');
  }

  const report = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_V2_PHASE2B_TOOLCHAIN',
    architecture: 'x86_64',
    tools,
    firmware: { ovmfCode, ovmfVars },
    buildReady: missingBuildRequirements.length === 0,
    qemuBootReady: missingBootRequirements.length === 0,
    missingBuildRequirements,
    missingBootRequirements,
    packageInstallationPerformed: false,
  };
  writeJson(TOOLCHAIN_PATH, report);
  return report;
}

function generateContractHeader() {
  const definitions = [];
  for (const [macro, contractPath] of CONTRACTS) {
    const absolutePath = path.join(BARE_METAL_ROOT, contractPath);
    const contract = readJson(absolutePath);
    if (!contract || !/^[A-Z0-9_]+$/.test(contract.id || '')) {
      throw new Error(`Invalid contract id in ${relative(absolutePath)}`);
    }
    definitions.push(`#define ${macro} "${contract.id}"`);
  }
  const headerPath = path.join(GENERATED_DIR, 'sheikha_contracts.h');
  ensureDirectory(GENERATED_DIR);
  fs.writeFileSync(
    headerPath,
    [
      '#ifndef SHEIKHA_CONTRACTS_H',
      '#define SHEIKHA_CONTRACTS_H',
      '',
      ...definitions,
      '',
      '#endif',
      '',
    ].join('\n'),
    'ascii'
  );
  return headerPath;
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
  const alignedHeaders =
    Math.ceil(sizeOfHeaders / fileAlignment) * fileAlignment;

  data.writeUInt16LE(
    data.readUInt16LE(characteristicsOffset) & ~0x0001,
    characteristicsOffset
  );
  data.writeUInt16LE(
    data.readUInt16LE(dllCharacteristicsOffset) | 0x0140,
    dllCharacteristicsOffset
  );
  data.writeUInt16LE(2, optionalOffset + 48);
  data.writeUInt32LE(alignedHeaders, optionalOffset + 60);
  data.writeBigUInt64LE(BigInt(2 * 1024 * 1024), optionalOffset + 72);
  data.writeBigUInt64LE(BigInt(64 * 1024), optionalOffset + 80);
  fs.writeFileSync(filePath, data);
}

function buildArtifact() {
  const toolchain = inspectToolchain();
  if (!toolchain.buildReady) {
    throw new Error(
      `Missing build requirements: ${
        toolchain.missingBuildRequirements.join(', ')
      }`
    );
  }

  ensureDirectory(OUT_DIR);
  ensureDirectory(path.dirname(EFI_ARTIFACT));
  ensureDirectory(EVIDENCE_DIR);
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
    `-I${path.join(BARE_METAL_ROOT, 'include')}`,
    `-I${path.join(BARE_METAL_ROOT, 'drivers', 'serial')}`,
    `-I${path.join(BARE_METAL_ROOT, 'kernel', 'v2', 'include')}`,
    `-I${path.join(BARE_METAL_ROOT, 'boot', 'uefi')}`,
    `-I${GENERATED_DIR}`,
  ];
  const sourcePath = path.join(
    BARE_METAL_ROOT,
    'kernel',
    'sheikha_native_v2_seed.c'
  );
  const cObject = path.join(OUT_DIR, 'sheikha_native_v2_seed.o');
  const cr3Object = path.join(OUT_DIR, 'sheikha_cr3.o');
  run(toolchain.tools.gcc.path, [
    ...compileFlags,
    '-c',
    sourcePath,
    '-o',
    cObject,
  ]);
  run(toolchain.tools.gcc.path, [
    '-Wall',
    '-Wextra',
    '-Werror',
    '-ffreestanding',
    '-fno-stack-protector',
    '-fpie',
    '-mno-red-zone',
    '-c',
    path.join(
      BARE_METAL_ROOT,
      'kernel',
      'v2',
      'arch',
      'x86_64',
      'sheikha_cr3.S'
    ),
    '-o',
    cr3Object,
  ]);

  const linkedElf = path.join(
    OUT_DIR,
    'sheikha-sovereign-kernel-v2-phase2b.elf'
  );
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
    cObject,
    cr3Object,
  ];
  run(toolchain.tools.ld.path, linkFlags);

  const relocations = run(
    toolchain.tools.readelf.path,
    ['-r', linkedElf]
  ).stdout;
  if (!relocations.includes('There are no relocations in this file')) {
    throw new Error('Final V2 ELF contains runtime relocations');
  }

  const basePe = path.join(OUT_DIR, 'BOOTX64.base.EFI');
  run(toolchain.tools.objcopy.path, [
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
    basePe,
  ]);

  const relocationBlock = path.join(OUT_DIR, 'sheikha-pe-reloc.bin');
  const relocationData = Buffer.alloc(12, 0);
  relocationData.writeUInt32LE(0, 0);
  relocationData.writeUInt32LE(12, 4);
  fs.writeFileSync(relocationBlock, relocationData);

  const linkedArtifact = path.join(OUT_DIR, 'BOOTX64.EFI');
  run(toolchain.tools.objcopy.path, [
    '--add-section',
    `.reloc=${relocationBlock}`,
    '--set-section-flags',
    '.reloc=alloc,load,readonly,data',
    '--change-section-vma',
    '.reloc=0x460000',
    basePe,
    linkedArtifact,
  ]);
  hardenPeHeader(linkedArtifact);

  const pe = parsePeArtifact(linkedArtifact);
  if (!pe.valid) {
    throw new Error(`PE verification failed: ${JSON.stringify(pe)}`);
  }

  fs.copyFileSync(linkedArtifact, EFI_ARTIFACT);
  const artifactBytes = fs.readFileSync(EFI_ARTIFACT);
  const missingMarkers = REQUIRED_MARKERS.filter(
    (marker) => !artifactBytes.includes(Buffer.from(marker, 'ascii'))
  );
  if (missingMarkers.length > 0) {
    throw new Error(
      `Compiled V2 artifact is missing markers: ${missingMarkers.join(', ')}`
    );
  }

  const elfInspection = normalizeToolOutput([
    run(toolchain.tools.readelf.path, ['-h', linkedElf]).stdout,
    run(toolchain.tools.readelf.path, ['-l', linkedElf]).stdout,
    run(toolchain.tools.readelf.path, ['-S', linkedElf]).stdout,
  ].join('\n'));
  fs.writeFileSync(ELF_INSPECTION_PATH, elfInspection, 'utf8');

  const cr3Disassembly = normalizeToolOutput(run(
    toolchain.tools.objdump.path,
    ['-d', cr3Object]
  ).stdout);
  if (!/mov.*%cr3|mov.*cr3/.test(cr3Disassembly)) {
    throw new Error('CR3 instruction was not found in the linked interface');
  }
  if (!/invlpg/.test(cr3Disassembly)) {
    throw new Error('INVLPG instruction was not found in the linked interface');
  }
  fs.writeFileSync(CR3_DISASSEMBLY_PATH, cr3Disassembly, 'utf8');

  const buildReport = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_V2_UEFI_PAGING_RUNTIME_PHASE2B_BUILD',
    status: 'BOOT_ARTIFACT_CREATED',
    architecture: 'x86_64',
    format: 'PE32+ EFI application',
    sourceDateEpoch: 0,
    freestanding: true,
    hostUsedForBuildOnly: true,
    linuxRequiredAtKernelRuntime: false,
    nodeRequiredAtKernelRuntime: false,
    aiInCriticalBootPath: false,
    contractHeader: relative(contractHeader),
    sources: [
      'bare-metal/kernel/sheikha_native_v2_seed.c',
      'bare-metal/boot/uefi/sheikha_v2_uefi_entry.c',
      'bare-metal/boot/uefi/sheikha_v2_paging_boot_adapter.c',
      'bare-metal/kernel/v2/memory/sheikha_x86_64_paging.c',
      'bare-metal/kernel/v2/arch/x86_64/sheikha_cr3.S',
      'bare-metal/kernel/v2/entry/sheikha_v2_kernel_entry.c',
    ],
    compileFlags,
    linkFlags,
    runtimeRelocations: 0,
    bootstrapMap: {
      topology: 'x86_64 four-level page tables',
      leafSizeBytes: 2 * 1024 * 1024,
      identityBytes: 4 * 1024 * 1024 * 1024,
      maximumTableCount: 8,
      expectedTableCount: 6,
      executableBootstrapMapping: true,
      nxDataMappingPreservedInPhase2AApi: true,
      permissionsTightenedByMemoryType: false,
    },
    artifactCreated: true,
    artifact: {
      path: relative(EFI_ARTIFACT),
      bytes: fs.statSync(EFI_ARTIFACT).size,
      sha256: sha256(EFI_ARTIFACT),
      pe,
    },
  };
  writeJson(BUILD_PATH, buildReport);
  return buildReport;
}

function buildImage() {
  const buildReport = readJson(BUILD_PATH) || buildArtifact();
  if (!fs.existsSync(EFI_ARTIFACT)) {
    throw new Error('V2 EFI artifact is missing');
  }
  const image = createFat12Image(fs.readFileSync(EFI_ARTIFACT));
  ensureDirectory(path.dirname(FAT_IMAGE));
  fs.writeFileSync(FAT_IMAGE, image);
  buildReport.status = 'BOOT_IMAGE_CREATED';
  buildReport.image = {
    path: relative(FAT_IMAGE),
    bytes: fs.statSync(FAT_IMAGE).size,
    sha256: sha256(FAT_IMAGE),
    filesystem: 'FAT12',
    fallbackPath: 'EFI/BOOT/BOOTX64.EFI',
    deterministic: true,
  };
  writeJson(BUILD_PATH, buildReport);
  fs.writeFileSync(
    SHA_PATH,
    [
      `${buildReport.artifact.sha256}  ${buildReport.artifact.path}`,
      `${buildReport.image.sha256}  ${buildReport.image.path}`,
      '',
    ].join('\n'),
    'ascii'
  );
  return buildReport;
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'"'"'`)}'`;
}

function writeQemuBlocked(toolchain) {
  const reason =
    `missing requirements: ${toolchain.missingBootRequirements.join(', ')}`;
  const report = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_V2_PHASE2B_QEMU_BOOT',
    status: 'TOOLCHAIN_MISSING',
    executed: false,
    markerVerified: false,
    requiredMarkers: REQUIRED_MARKERS,
    artifactSha256: null,
    imageSha256: null,
    missingRequirements: toolchain.missingBootRequirements,
  };
  fs.writeFileSync(QEMU_COMMAND_PATH, `NOT_EXECUTED: ${reason}\n`, 'utf8');
  fs.writeFileSync(SERIAL_PATH, `QEMU_NOT_EXECUTED: ${reason}\n`, 'utf8');
  writeJson(QEMU_PATH, report);
  return report;
}

function resolveQemuEnvironment(qemu) {
  const environment = {
    ...process.env,
    LC_ALL: 'C',
  };
  const localRoot = path.resolve(
    path.dirname(qemu),
    '..',
    '..'
  );
  const localData = path.join(
    localRoot,
    'usr',
    'share',
    'qemu'
  );
  const localModules = path.join(
    localRoot,
    'usr',
    'lib',
    'x86_64-linux-gnu',
    'qemu'
  );
  const localLibraries = path.join(
    localRoot,
    'usr',
    'lib',
    'x86_64-linux-gnu'
  );

  if (!environment.QEMU_DATADIR && fs.existsSync(localData)) {
    environment.QEMU_DATADIR = localData;
  }
  if (!environment.QEMU_MODULE_DIR && fs.existsSync(localModules)) {
    environment.QEMU_MODULE_DIR = localModules;
  }
  if (fs.existsSync(localLibraries)) {
    environment.LD_LIBRARY_PATH = [
      localLibraries,
      environment.LD_LIBRARY_PATH,
    ].filter(Boolean).join(path.delimiter);
  }

  return environment;
}

function runQemu() {
  const buildReport = readJson(BUILD_PATH) || buildImage();
  if (!buildReport.image || !fs.existsSync(FAT_IMAGE)) {
    buildImage();
  }
  const toolchain = inspectToolchain();
  if (!toolchain.qemuBootReady) {
    return writeQemuBlocked(toolchain);
  }

  const qemu = toolchain.tools['qemu-system-x86_64'].path;
  const qemuEnvironment = resolveQemuEnvironment(qemu);
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
    '-no-shutdown',
  ];
  if (
    qemuEnvironment.QEMU_DATADIR &&
    fs.existsSync(qemuEnvironment.QEMU_DATADIR)
  ) {
    args.push('-L', qemuEnvironment.QEMU_DATADIR);
  }
  if (toolchain.firmware.ovmfVars) {
    const runtimeVars = path.join(OUT_DIR, 'OVMF_VARS.runtime.fd');
    fs.copyFileSync(toolchain.firmware.ovmfVars, runtimeVars);
    fs.chmodSync(runtimeVars, 0o600);
    args.push(
      '-drive',
      `if=pflash,format=raw,unit=0,readonly=on,file=${
        toolchain.firmware.ovmfCode
      }`,
      '-drive',
      `if=pflash,format=raw,unit=1,file=${runtimeVars}`
    );
  } else {
    args.push('-bios', toolchain.firmware.ovmfCode);
  }
  const runtimeImage = path.join(OUT_DIR, 'phase2b.runtime.img');
  fs.copyFileSync(FAT_IMAGE, runtimeImage);
  fs.chmodSync(runtimeImage, 0o600);
  args.push('-drive', `if=ide,format=raw,file=${runtimeImage}`);

  const command = [qemu, ...args].map(shellQuote).join(' ');
  fs.writeFileSync(QEMU_COMMAND_PATH, `${command}\n`, 'utf8');
  const startedAt = Date.now();
  const result = spawnSync(qemu, args, {
    cwd: ROOT,
    encoding: 'utf8',
    timeout: 15000,
    killSignal: 'SIGTERM',
    maxBuffer: 16 * 1024 * 1024,
    env: qemuEnvironment,
  });
  const serial = `${result.stdout || ''}${result.stderr || ''}`
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '');
  fs.writeFileSync(
    SERIAL_PATH,
    serial || 'QEMU_EXECUTED_WITHOUT_SERIAL_OUTPUT\n',
    'utf8'
  );
  const markerChecks = Object.fromEntries(
    REQUIRED_MARKERS.map((marker) => [marker, serial.includes(marker)])
  );
  const markerVerified = Object.values(markerChecks).every(Boolean);
  const report = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_V2_PHASE2B_QEMU_BOOT',
    status: markerVerified ? 'VERIFIED' : 'MARKER_VERIFICATION_FAILED',
    executed: true,
    durationMs: Date.now() - startedAt,
    timedOutAfterControlledHalt: result.error?.code === 'ETIMEDOUT',
    exitStatus: result.status,
    signal: result.signal,
    error: result.error
      ? { code: result.error.code, message: result.error.message }
      : null,
    markerVerified,
    markerChecks,
    artifactSha256: buildReport.artifact.sha256,
    imageSha256: buildReport.image.sha256,
    executionSubstrate: {
      accelerator: 'tcg',
      networkEnabled: false,
      qemuVersion: toolchain.tools['qemu-system-x86_64'].version,
      qemuSha256: sha256(qemu),
      ovmfCodeSha256: sha256(toolchain.firmware.ovmfCode),
      ovmfVarsSha256: toolchain.firmware.ovmfVars
        ? sha256(toolchain.firmware.ovmfVars)
        : null,
      systemPackageInstallationPerformed: false,
    },
    command,
    environment: {
      qemuDataDir: qemuEnvironment.QEMU_DATADIR || null,
      qemuModuleDir: qemuEnvironment.QEMU_MODULE_DIR || null,
      localLibraryPathConfigured: Boolean(
        qemuEnvironment.LD_LIBRARY_PATH
      ),
    },
    firmware: toolchain.firmware,
    image: relative(FAT_IMAGE),
    serialEvidence: relative(SERIAL_PATH),
    missingRequirements: [],
  };
  writeJson(QEMU_PATH, report);
  return report;
}

function verify() {
  const toolchain = inspectToolchain();
  const buildReport = readJson(BUILD_PATH) || buildImage();
  const qemuReport = readJson(QEMU_PATH) || writeQemuBlocked(toolchain);
  const artifactExists = fs.existsSync(EFI_ARTIFACT);
  const imageExists = fs.existsSync(FAT_IMAGE);
  const pe = artifactExists ? parsePeArtifact(EFI_ARTIFACT) : null;
  const artifactShaMatches =
    artifactExists &&
    sha256(EFI_ARTIFACT) === buildReport.artifact?.sha256;
  const imageShaMatches =
    imageExists &&
    sha256(FAT_IMAGE) === buildReport.image?.sha256;
  const artifact = artifactExists
    ? fs.readFileSync(EFI_ARTIFACT)
    : Buffer.alloc(0);
  const markerPresence = Object.fromEntries(
    REQUIRED_MARKERS.map((marker) => [
      marker,
      artifact.includes(Buffer.from(marker, 'ascii')),
    ])
  );
  const artifactMarkersPresent = Object.values(markerPresence).every(Boolean);
  const imageContainsArtifact =
    imageExists &&
    artifactExists &&
    fs.readFileSync(FAT_IMAGE).indexOf(artifact) >= 0;
  const artifactVerified = [
    artifactExists,
    imageExists,
    pe?.valid === true,
    artifactShaMatches,
    imageShaMatches,
    artifactMarkersPresent,
    imageContainsArtifact,
  ].every(Boolean);
  const qemuArtifactBindingVerified =
    qemuReport.artifactSha256 === buildReport.artifact?.sha256 &&
    qemuReport.imageSha256 === buildReport.image?.sha256;
  const phase2bVerified =
    artifactVerified &&
    qemuReport.executed === true &&
    qemuReport.markerVerified === true &&
    qemuArtifactBindingVerified;
  const status = phase2bVerified
    ? 'PHASE2B_VERIFIED'
    : artifactVerified && !toolchain.qemuBootReady
      ? 'BUILD_VERIFIED_QEMU_TOOLCHAIN_MISSING'
      : artifactVerified
        ? 'BUILT_NOT_QEMU_VERIFIED'
        : 'ARTIFACT_VERIFICATION_FAILED';

  const verification = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_V2_UEFI_PAGING_RUNTIME_PHASE2B_VERIFICATION',
    status,
    artifactVerified,
    phase2bVerified,
    checks: {
      artifactExists,
      imageExists,
      peValid: pe?.valid === true,
      artifactShaMatches,
      imageShaMatches,
      artifactMarkersPresent,
      imageContainsArtifact,
      qemuExecuted: qemuReport.executed === true,
      qemuMarkersVerified: qemuReport.markerVerified === true,
      qemuArtifactBindingVerified,
    },
    markerPresence,
    pe,
    missingRequirements: phase2bVerified
      ? []
      : toolchain.missingBootRequirements,
  };
  writeJson(VERIFICATION_PATH, verification);

  const phaseEvidence = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_V2_UEFI_PAGING_RUNTIME_PHASE2B',
    status,
    verified: phase2bVerified,
    scope: {
      twoMegabyteMappingModelVerified: true,
      fourGiBBootstrapIdentityMapBuilt: true,
      expectedSixTableTopologyVerified: true,
      uefiBootPathWired: true,
      cr3InterfaceLinked: true,
      invlpgInterfaceLinked: true,
      efiArtifactBuilt: artifactVerified,
      qemuBootExecuted: qemuReport.executed === true,
      cr3LoadedAtRuntime: phase2bVerified,
      invlpgExecutedAtRuntime: phase2bVerified,
    },
    truthBoundary: {
      qemuBootWithNewPageTablesVerified: phase2bVerified,
      physicalHardwareVerified: false,
      secureBootVerified: false,
      generalPurposeOperatingSystemComplete: false,
      allDriversComplete: false,
      bootstrapIdentityMapPermissionsTightened: false,
    },
    artifacts: {
      efi: buildReport.artifact,
      image: buildReport.image,
    },
    missingRequirements: verification.missingRequirements,
    nextPhase: phase2bVerified
      ? 'INTERRUPTS_IDT_APIC_RUNTIME_VERIFICATION'
      : 'INSTALL_QEMU_AND_OVMF_THEN_EXECUTE_PHASE2B_BOOT_VERIFICATION',
  };
  writeJson(PHASE_EVIDENCE_PATH, phaseEvidence);

  const report = {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_SOVEREIGN_BARE_METAL_OS_V2_PHASE2B',
    status,
    architecture: 'x86_64',
    bootProtocol: 'UEFI',
    bootArtifactCreated: artifactExists,
    bootImageCreated: imageExists,
    qemuBootExecuted: qemuReport.executed === true,
    cr3LoadedAtRuntime: phase2bVerified,
    tlbInvalidationExecutedAtRuntime: phase2bVerified,
    phase2bVerified,
    physicalHardwareVerified: false,
    secureBootVerified: false,
    generalPurposeOperatingSystemComplete: false,
    allDriversComplete: false,
    artifact: {
      efi: buildReport.artifact,
      image: buildReport.image,
    },
    evidence: {
      toolchain: relative(TOOLCHAIN_PATH),
      build: relative(BUILD_PATH),
      sha256: relative(SHA_PATH),
      elfInspection: relative(ELF_INSPECTION_PATH),
      cr3Disassembly: relative(CR3_DISASSEMBLY_PATH),
      qemuCommand: relative(QEMU_COMMAND_PATH),
      serial: relative(SERIAL_PATH),
      qemu: relative(QEMU_PATH),
      verification: relative(VERIFICATION_PATH),
      phase: relative(PHASE_EVIDENCE_PATH),
    },
    missingRequirements: verification.missingRequirements,
    governanceBoundary: {
      defaultAuthorization: 'DENY',
      aiInCriticalBootPath: false,
      systemBuilderInCriticalBootPath: false,
      jannatGardensInCriticalBootPath: false,
      noRevelationClaim: true,
      noInfallibilityClaim: true,
      noIndependentFatwa: true,
      scholarReviewForReligiousQuestions: true,
      humanReviewForHighImpactDecisions: true,
    },
    claimPolicy:
      'No Phase 2B completion claim without CR3 and INVLPG serial evidence from QEMU.',
  };
  writeJson(REPORT_PATH, report);
  return report;
}

function printSummary(report) {
  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    bootArtifactCreated: report.bootArtifactCreated,
    bootImageCreated: report.bootImageCreated,
    qemuBootExecuted: report.qemuBootExecuted,
    cr3LoadedAtRuntime: report.cr3LoadedAtRuntime,
    tlbInvalidationExecutedAtRuntime:
      report.tlbInvalidationExecutedAtRuntime,
    phase2bVerified: report.phase2bVerified,
    artifact: report.artifact,
    missingRequirements: report.missingRequirements,
    evidence: report.evidence,
  }, null, 2));
}

function main() {
  ensureDirectory(EVIDENCE_DIR);
  const action = process.argv[2] || 'all';
  if (action === 'toolchain') {
    console.log(JSON.stringify(inspectToolchain(), null, 2));
    return;
  }
  if (action === 'build') {
    buildArtifact();
    buildImage();
  } else if (action === 'qemu') {
    runQemu();
    verify();
  } else if (action === 'verify') {
    verify();
  } else if (action === 'all') {
    buildArtifact();
    buildImage();
    runQemu();
    verify();
  } else {
    throw new Error(`Unknown action: ${action}`);
  }
  printSummary(readJson(REPORT_PATH) || verify());
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(`[SHEIKHA_V2_PHASE2B] ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  EFI_ARTIFACT,
  FAT_IMAGE,
  PHASE_EVIDENCE_PATH,
  REPORT_PATH,
  REQUIRED_MARKERS,
  buildArtifact,
  buildImage,
  inspectToolchain,
  normalizeToolOutput,
  runQemu,
  verify,
};
