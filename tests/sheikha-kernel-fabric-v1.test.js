'use strict';

const { inspectKernelFabric } = require('../core/kernel-fabric/sheikha-kernel-fabric-v1');

describe('Sheikha Kernel Fabric V1', () => {
  test('inspects OS kernel and runtime safely', () => {
    const report = inspectKernelFabric();

    expect(report.system).toBe('SHEIKHA_KERNEL_FABRIC_V1');
    expect(report.mode).toBe('READ_ONLY_MEASUREMENT');
    expect(report.safety.noKernelModification).toBe(true);
    expect(report.safety.noBootModification).toBe(true);
    expect(report.safety.noSysctlModification).toBe(true);
    expect(report.compute.cpus).toBeGreaterThan(0);
  });
});
