'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {build} = require('../tools/release/build-sheikha-native-object-v1');

describe('Sheikha native language object V1', () => {
  test('builds a freestanding relocatable object containing the Arabic source identity and boundaries', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-native-object-'));
    try {
      const manifest = build(directory);
      expect(manifest.status).toBe('NATIVE_RELOCATABLE_OBJECT_BUILT');
      expect(manifest.artifacts.object.sha256).toMatch(/^[a-f0-9]{64}$/);
      const symbols = execFileSync('strings', [path.join(directory, manifest.artifacts.object.path)], {encoding: 'utf8'});
      expect(symbols).toContain('SHEIKHA_LANGUAGE_BOOT_CONTRACT_V1');
      expect(symbols).toContain('VALUES_REFERENCE_NON_EXECUTABLE');
      expect(symbols).toContain('AUTOMATED_FATWA_DENIED');
      expect(manifest.boundaries).toMatchObject({selfHostedCompiler: false, completeKernel: false, bootableArtifact: false, firmwareImage: false});
      expect(manifest.kernelLogic).toMatchObject({
        uefiHandoffGuardGeneratedFromSheikha: true,
        controlledHaltModeGeneratedFromSheikha: true,
        completeKernelInSheikha: false
      });
    } finally { fs.rmSync(directory, {recursive: true, force: true}); }
  });

  test('links and calls the bounded native ABI without a host runtime dependency', () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-native-abi-'));
    try {
      const manifest = build(directory);
      const harnessPath = path.join(directory, 'abi-harness.c');
      const executablePath = path.join(directory, 'abi-harness');
      fs.writeFileSync(harnessPath, [
        '#include <stdint.h>',
        'uint32_t sheikha_native_contract_version(void);',
        'uint32_t sheikha_native_governance_ready(void);',
        'uint32_t sheikha_native_kernel_handoff_allowed(uint32_t);',
        'uint32_t sheikha_native_kernel_mode(void);',
        'int main(void) {',
        '  return sheikha_native_contract_version() == 1U &&',
        '    sheikha_native_governance_ready() == 1U &&',
        '    sheikha_native_kernel_handoff_allowed(1U) == 1U &&',
        '    sheikha_native_kernel_handoff_allowed(0U) == 0U &&',
        '    sheikha_native_kernel_mode() == 1U ? 0 : 1;',
        '}',
        ''
      ].join('\n'));
      execFileSync(process.env.CC || 'cc', [
        harnessPath,
        path.join(directory, manifest.artifacts.object.path),
        '-o', executablePath
      ]);
      execFileSync(executablePath);
    } finally { fs.rmSync(directory, {recursive: true, force: true}); }
  });
});
