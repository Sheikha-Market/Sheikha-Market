'use strict';
const fs = require('node:fs'); const path = require('node:path'); const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const production = require('../../core/foundation/sheikha-language-production-v1.cjs');
const { createFat12Image, parsePeArtifact } = require('../../bare-metal/build/sheikha-bare-metal-pipeline-v1');
const ROOT = path.resolve(__dirname, '../..');
function hash(bytes) { return crypto.createHash('sha256').update(bytes).digest('hex'); }
function run(command, args) {
  const result = spawnSync(command, args, { cwd: ROOT, encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024 });
  if (result.error || result.status !== 0) throw new Error(command + ' failed: ' + (result.stderr || result.error?.message));
  return result;
}
function packageHeader(result) {
  const components = Object.entries(result.files).filter(([file]) => file.startsWith('contracts/')).map(([, text]) => JSON.parse(text));
  const index = new Map(components.map((component, i) => [component.component, i]));
  if (components.length > 30) throw new Error('COMPONENT_CAPACITY_EXCEEDED');
  const rows = components.map(c => {
    const contract = JSON.stringify(c);
    if (Buffer.byteLength(contract) >= 1536) throw new Error('CONTRACT_CAPACITY_EXCEEDED');
    const dependencies = c.dependencies.reduce((mask, dep) => {
      if (!index.has(dep)) throw new Error('UNREGISTERED_DEPENDENCY');
      return mask | (1 << index.get(dep));
    }, 0);
    return '{' + JSON.stringify(c.component) + ',UINT32_C(' + dependencies + '),' + JSON.stringify(contract) + '}';
  });
  const instructions = JSON.parse(result.files['program.bytecode.json']).instructions.filter(i => i.code === 'CALL_COMMAND').map(i => {
    const opcode = { 'تحقق_وحدة': 1, 'انتج_عقد': 2, 'اعرض': 3 }[i.command];
    if (!opcode) throw new Error('NATIVE_OPCODE_NOT_ADMITTED');
    const id = opcode === 3 ? 0 : index.get(JSON.parse(i.argument));
    if (id === undefined) throw new Error('UNKNOWN_NATIVE_COMPONENT');
    return '{' + opcode + ',' + id + '}';
  });
  if (instructions.length > 128 || !instructions.length) throw new Error('NATIVE_PROGRAM_CAPACITY_EXCEEDED');
  return '#ifndef SHEIKHA_NATIVE_PACKAGE_H\n#define SHEIKHA_NATIVE_PACKAGE_H\n#include <stdint.h>\n' +
    '#define SHEIKHA_COMPONENT_COUNT ' + components.length + 'U\n#define SHEIKHA_CONTRACT_BYTES 1536U\n' +
    '#define SHEIKHA_INSTRUCTION_COUNT ' + instructions.length + 'U\n#define SHEIKHA_SOURCE_SHA256 ' + JSON.stringify(result.manifest.sourceSha256) + '\n' +
    'static const struct { char id[16]; uint32_t dependencies; char contract[SHEIKHA_CONTRACT_BYTES]; } sheikha_components[] = {' + rows.join(',\n') + '};\n' +
    'static const struct { uint8_t opcode, component; } sheikha_instructions[] = {' + instructions.join(',') + '};\n#endif\n';
}
function build() {
  const result = production.build(); const header = packageHeader(result);
  const identity = hash(header + fs.readFileSync(path.join(ROOT, 'bare-metal/runtime/sheikha-native-runtime-v1.c')) + fs.readFileSync(__filename));
  const parent = path.join(ROOT, 'runtime/sheikha-native-environment/v1/builds'); fs.mkdirSync(parent, { recursive: true });
  const out = path.join(parent, identity);
  if (fs.existsSync(out)) throw new Error('BUILD_ALREADY_EXISTS; use its preserved evidence');
  fs.mkdirSync(out, { mode: 0o700 }); fs.writeFileSync(path.join(out, 'sheikha_native_package.h'), header);
  const includes = ['bare-metal/include', 'bare-metal/drivers/serial', 'bare-metal/kernel/entry'].map(p => '-I' + path.join(ROOT, p));
  const source = path.join(ROOT, 'bare-metal/runtime/sheikha-native-runtime-v1.c');
  const host = path.join(out, 'native-model-test');
  run('gcc', ['-std=c11', '-O2', '-Wall', '-Wextra', '-Werror', '-DSHEIKHA_HOST_TEST', '-I' + out, source, '-o', host]);
  run(host, []);
  const object = path.join(out, 'runtime.o'); const elf = path.join(out, 'runtime.elf');
  run('gcc', ['-std=c11', '-O2', '-Wall', '-Wextra', '-Werror', '-ffreestanding', '-fno-builtin', '-fno-stack-protector',
    '-fpie', '-fno-plt', '-fshort-wchar', '-fno-asynchronous-unwind-tables', '-fno-unwind-tables', '-fcf-protection=none',
    '-mno-red-zone', '-mno-mmx', '-mno-sse', '-mno-sse2', '-mcmodel=small', ...includes, '-I' + out,
    '-c', path.join(ROOT, 'bare-metal/runtime/sheikha-native-runtime-entry-v1.c'), '-o', object]);
  run('ld', ['-nostdlib', '-static', '--build-id=none', '-z', 'noexecstack', '-e', 'efi_main', '-Ttext=0x401000', '-o', elf, object]);
  const relocations = run('readelf', ['-r', elf]).stdout;
  if (!relocations.includes('There are no relocations')) throw new Error('UNRESOLVED_RUNTIME_RELOCATIONS');
  const imports = run('nm', ['-u', elf]).stdout.trim();
  if (imports) throw new Error('UNRESOLVED_RUNTIME_IMPORTS');
  const base = path.join(out, 'base.EFI'); const efi = path.join(out, 'BOOTX64.EFI');
  run('objcopy', ['-I', 'elf64-x86-64', '-O', 'pei-x86-64', '--remove-section=.comment', '--remove-section=.note.gnu.property',
    '--subsystem=10', '--image-base=0x400000', '--file-alignment=512', '--section-alignment=4096', elf, base]);
  const relocation = Buffer.alloc(12); relocation.writeUInt32LE(12, 4); const relocationFile = path.join(out, 'reloc.bin'); fs.writeFileSync(relocationFile, relocation);
  run('objcopy', ['--add-section', '.reloc=' + relocationFile, '--set-section-flags', '.reloc=alloc,load,readonly,data', '--change-section-vma', '.reloc=0x480000', base, efi]);
  const pe = fs.readFileSync(efi); const coff = pe.readUInt32LE(0x3c) + 4; const optional = coff + 20;
  const alignment = pe.readUInt32LE(optional + 36); const headers = pe.readUInt32LE(optional + 60);
  pe.writeUInt16LE(pe.readUInt16LE(coff + 18) & ~1, coff + 18);
  pe.writeUInt16LE(pe.readUInt16LE(optional + 70) | 0x140, optional + 70);
  pe.writeUInt16LE(2, optional + 48); pe.writeUInt32LE(Math.ceil(headers / alignment) * alignment, optional + 60);
  pe.writeBigUInt64LE(BigInt(2 * 1024 * 1024), optional + 72); pe.writeBigUInt64LE(BigInt(64 * 1024), optional + 80);
  fs.writeFileSync(efi, pe);
  const inspection = parsePeArtifact(efi); if (!inspection.valid) throw new Error('PE_ARTIFACT_INVALID');
  const image = path.join(out, 'sheikha-native-environment.img'); fs.writeFileSync(image, createFat12Image(pe));
  const vars = path.join(out, 'OVMF_VARS.fd'); fs.copyFileSync('/usr/share/OVMF/OVMF_VARS.fd', vars);
  const args = ['-machine', 'q35,accel=tcg', '-cpu', 'qemu64', '-m', '128M', '-display', 'none', '-vga', 'none',
    '-monitor', 'none', '-serial', 'stdio', '-net', 'none', '-no-reboot', '-device', 'isa-debug-exit,iobase=0xf4,iosize=0x04',
    '-drive', 'if=pflash,format=raw,unit=0,readonly=on,file=/usr/share/OVMF/OVMF_CODE.fd',
    '-drive', 'if=pflash,format=raw,unit=1,file=' + vars, '-snapshot', '-drive', 'if=ide,format=raw,file=' + image];
  const boot = spawnSync('qemu-system-x86_64', args, { cwd: ROOT, encoding: 'utf8', timeout: 30000, maxBuffer: 4 * 1024 * 1024 });
  fs.writeFileSync(path.join(out, 'qemu-stderr.log'), String(boot.stderr || ''));
  const serial = String(boot.stdout || ''); fs.writeFileSync(path.join(out, 'serial.log'), serial);
  fs.writeFileSync(path.join(out, 'qemu-arguments.json'), JSON.stringify(args, null, 2) + '\n');
  const contractCount = (serial.match(/^NATIVE_CONTRACT:/gm) || []).length;
  const verified = !boot.error && boot.status === 33 && serial.includes('SHEIKHA_NATIVE_RUNTIME_VERIFIED') &&
    serial.includes('boot_services=EXITED') && serial.includes('source_sha256=' + result.manifest.sourceSha256) && contractCount === 18;
  const report = { status: verified ? 'NATIVE_VM_RUNTIME_VERIFIED' : 'NATIVE_VM_RUNTIME_FAILED', buildId: identity,
    output: path.relative(ROOT, out), sourceSha256: result.manifest.sourceSha256, hostModelTestsPassed: true,
    nativeSupervisorChecks: 10, qemuExitCode: boot.status, qemuError: boot.error?.code ?? null,
    guestContractCount: contractCount, postFirmwareHandoffVerified: serial.includes('boot_services=EXITED'),
    unresolvedImports: false, peInspection: inspection,
    artifacts: ['BOOTX64.EFI', 'sheikha-native-environment.img', 'sheikha_native_package.h'].map(file => ({ file, sha256: hash(fs.readFileSync(path.join(out, file))) })),
    guestRuntimeDependencies: [], buildHostDependencies: ['Node.js', 'GCC', 'binutils', 'QEMU', 'OVMF'],
    deploymentMode: 'STATIC_DEVELOPMENT_PACKAGE_IN_RAM', generalPurposeOsReady: false, productionDeploymentAllowed: false,
    incomplete: ['NETWORK_STACK', 'PERSISTENT_FILESYSTEM', 'USER_MODE_ISOLATION', 'PREEMPTIVE_SCHEDULER', 'DYNAMIC_PACKAGE_LOADER', 'TLS_AND_HTTP', 'SECURE_BOOT_AND_SIGNED_RELEASES', 'FULL_SERVICE_MIGRATION'],
    physicalDeviceWritten: false, remoteDeploymentPerformed: false };
  fs.writeFileSync(path.join(out, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify({ status: report.status, output: report.output, guestContractCount: contractCount, qemuExitCode: boot.status }));
  if (!verified) throw new Error('NATIVE_GUEST_VERIFICATION_FAILED; preserved evidence at ' + report.output);
  return report;
}
if (require.main === module) build();
module.exports = { packageHeader, build };
