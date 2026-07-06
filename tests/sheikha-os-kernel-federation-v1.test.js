'use strict';

const {
  inspectOsKernelFederation
} = require('../core/os-kernel-federation/sheikha-os-kernel-federation-v1');

describe('Sheikha Universal OS Kernel Federation Fabric V1', () => {
  test('maps Linux Windows Apple BSD containers and hypervisors safely', () => {
    const report = inspectOsKernelFederation();

    expect(report.system).toBe('SHEIKHA_UNIVERSAL_OS_KERNEL_FEDERATION_FABRIC_V1');
    expect(report.mode).toBe('READ_ONLY_OS_KERNEL_FEDERATION_MAPPING');
    expect(report.safety.noHarm).toBe(true);
    expect(report.safety.noKernelModification).toBe(true);
    expect(report.families.map((f) => f.id)).toContain('linux-family');
    expect(report.families.map((f) => f.id)).toContain('windows-nt-family');
    expect(report.families.map((f) => f.id)).toContain('apple-xnu-family');
    expect(report.families.map((f) => f.id)).toContain('container-runtime-family');
    expect(report.families.map((f) => f.id)).toContain('hypervisor-vm-family');
    expect(report.relations.length).toBeGreaterThanOrEqual(10);
  });
});
