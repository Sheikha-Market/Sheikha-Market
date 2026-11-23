'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const readJson = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

describe('Sheikha Sovereign Bare-Metal OS V2 activation V3', () => {
  const program = readJson('runtime/bare-metal/v2/sheikha-sovereign-bare-metal-os-v2-program.json');

  test('activates every V2 workstream', () => {
    expect(program.programOpen).toBe(true);
    expect(program.activationBaselineClosed).toBe(true);
    expect(program.status).toBe('IMPLEMENTATION_ACTIVE');
    expect(program.claimComplete).toBe(false);
    expect(program.completionGate).toEqual({
      generalPurposeOperatingSystemComplete: false,
      allDriversComplete: false,
      physicalHardwareBootVerified: true,
      secureBootVerified: false
    });
    expect(Object.values(program.activationFlags).every(Boolean)).toBe(true);
  });

  test('keeps unsupported completion claims fail-closed', () => {
    expect(program.completionFlags.PHYSICAL_HARDWARE_BOOT_VERIFIED).toBe(true);
    expect(program.completionFlags.GENERAL_PURPOSE_OPERATING_SYSTEM_COMPLETE).toBe(false);
    expect(program.completionFlags.ALL_DRIVERS_COMPLETE).toBe(false);
    expect(program.completionFlags.SECURE_BOOT_VERIFIED).toBe(false);
    expect(program.remainingCompletionGates).toBe(3);
    expect(program.truthPolicy.neverSetCompletionTrueWithoutEvidence).toBe(true);
  });

  test('ships the ordered architecture', () => {
    const ids = new Set(program.workstreams.map((item) => item.id));
    for (const id of [
      'MEMORY_AND_PAGING','INTERRUPTS_IDT_APIC','TIMER_AND_SCHEDULER',
      'PROCESSES_AND_USERSPACE','SYSTEM_CALLS','PCI_STORAGE_FILESYSTEM',
      'NETWORK_STACK','PHYSICAL_HARDWARE_MATRIX','SECURE_BOOT_AND_TPM'
    ]) expect(ids).toContain(id);
  });

  test('evaluates evidence gates fail-closed', () => {
    const output = JSON.parse(execFileSync(process.execPath, [
      path.join(root, 'tools/bare-metal/v2/evaluate-v2-completion-gates.js')
    ], {cwd: root, encoding: 'utf8'}));
    expect(output.completionFlags.PHYSICAL_HARDWARE_BOOT_VERIFIED).toBe(true);
    expect(output.remainingCompletionGates).toBe(3);
    expect(output.allCompletionGatesPassed).toBe(false);
  });

  test('limits physical verification to one named MSI machine', () => {
    const matrix = readJson('runtime/bare-metal/v2/hardware/sheikha-v2-hardware-verification-matrix.json');
    expect(matrix.verifiedPhysicalMachines).toBe(1);
    expect(matrix.physicalHardwareBootVerified).toBe(true);
    expect(matrix.verifiedDevices[0].model).toBe('Pulse 16 AI C1VFKG');
    expect(matrix.universalHardwareSupportClaimed).toBe(false);
  });
});
