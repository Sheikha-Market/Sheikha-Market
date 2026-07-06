'use strict';

const {
  SheikhaDynamicCapabilityActivationFabric,
  KERNEL_PROFILES,
  ACTIVATION_PRIORITIES,
  CAPABILITY_PACKS
} = require('../runtime/sheikha-platform/dynamic-activation/sheikha-dynamic-capability-activation-fabric');

test('activates dynamic capability activation fabric', () => {
  const fabric = new SheikhaDynamicCapabilityActivationFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ACTIVE_DYNAMIC_CAPABILITY_ACTIVATION');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.kernelProfiles).toEqual(KERNEL_PROFILES);
  expect(status.activationPriorities).toEqual(ACTIVATION_PRIORITIES);
  expect(status.capabilityPacks).toEqual(CAPABILITY_PACKS);

  expect(status.samplePlan.status).toBe('DYNAMIC_ACTIVATION_PLAN_READY');
  expect(status.samplePlan.kernelProfile).toBe('medium-core');
  expect(status.boundaries.noOverActivation).toBe(true);
});

test('chooses small medium and large kernel profiles by context', () => {
  const fabric = new SheikhaDynamicCapabilityActivationFabric();

  expect(fabric.chooseKernelProfile({ importance: 'normal' })).toBe('small-core');
  expect(fabric.chooseKernelProfile({ importance: 'high' })).toBe('medium-core');
  expect(fabric.chooseKernelProfile({ importance: 'critical' })).toBe('large-core');
  expect(fabric.chooseKernelProfile({ load: 'enterprise' })).toBe('large-core');
});

test('activates capability pack safely with priority', () => {
  const fabric = new SheikhaDynamicCapabilityActivationFabric();

  const pack = fabric.activateCapabilityPack('studio', {
    importance: 'high',
    priority: 'high'
  });

  expect(pack.status).toBe('CAPABILITY_PACK_ACTIVATION_READY');
  expect(pack.kernelProfile).toBe('medium-core');
  expect(pack.dynamicActivation).toBe(true);
  expect(pack.boundaries.noOverActivation).toBe(true);
});

test('rejects unsupported pack and priority', () => {
  const fabric = new SheikhaDynamicCapabilityActivationFabric();

  expect(() => fabric.activateCapabilityPack('unknown-pack'))
    .toThrow('Unsupported Sheikha capability pack');

  expect(() => fabric.activateCapabilityPack('studio', { priority: 'unknown' }))
    .toThrow('Unsupported Sheikha activation priority');
});
