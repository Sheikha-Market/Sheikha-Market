'use strict';

const {
  inspectKernelIndustrialFabric
} = require('../core/kernel-industrial-fabric/sheikha-kernel-industrial-fabric-v1');

describe('Sheikha Kernel Industrial Fabric V1', () => {
  test('maps industrial kernels above below and at kernel layer', () => {
    const report = inspectKernelIndustrialFabric();

    expect(report.system).toBe('SHEIKHA_KERNEL_INDUSTRIAL_FABRIC_V1');
    expect(report.mode).toBe('READ_ONLY_INDUSTRIAL_KERNEL_CLUSTER_MAPPING');
    expect(report.safety.noHarm).toBe(true);
    expect(report.industrialKernels.some((k) => k.layer === 'below-kernel')).toBe(true);
    expect(report.industrialKernels.some((k) => k.layer === 'kernel')).toBe(true);
    expect(report.industrialKernels.some((k) => k.layer === 'above-kernel')).toBe(true);
    expect(report.relations.length).toBeGreaterThanOrEqual(6);
  });
});
