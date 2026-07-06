'use strict';

const { inspectKernelStackFabric } = require('../core/kernel-stack-fabric/sheikha-kernel-stack-fabric-v1');

describe('Sheikha Kernel Stack Fabric V1', () => {
  test('maps layers above and below kernel safely', () => {
    const report = inspectKernelStackFabric();

    expect(report.system).toBe('SHEIKHA_KERNEL_STACK_FABRIC_V1');
    expect(report.mode).toBe('READ_ONLY_LAYER_MEASUREMENT');
    expect(report.safety.noKernelModification).toBe(true);
    expect(report.layers.some((layer) => layer.position === 'below-kernel')).toBe(true);
    expect(report.layers.some((layer) => layer.position === 'kernel')).toBe(true);
    expect(report.layers.some((layer) => layer.position === 'above-kernel')).toBe(true);
  });
});
