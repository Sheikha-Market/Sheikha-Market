'use strict';

const {
  SheikhaAdaptiveRuntimeCompositionFabric,
  ADAPTIVE_KERNEL_MODES,
  COMPOSITION_INPUTS,
  RESOURCE_SCHEDULER_TYPES,
  HEALTH_MATRIX
} = require('../runtime/sheikha-platform/adaptive-runtime/sheikha-adaptive-runtime-composition-fabric');

test('activates adaptive runtime composition fabric', () => {
  const fabric = new SheikhaAdaptiveRuntimeCompositionFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ACTIVE_ADAPTIVE_RUNTIME_COMPOSITION');
  expect(status.layerRank).toBe('ABOVE_DYNAMIC_CAPABILITY_ACTIVATION');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.adaptiveKernelModes).toEqual(ADAPTIVE_KERNEL_MODES);
  expect(status.compositionInputs).toEqual(COMPOSITION_INPUTS);
  expect(status.resourceSchedulerTypes).toEqual(RESOURCE_SCHEDULER_TYPES);
  expect(status.healthMatrix).toEqual(HEALTH_MATRIX);

  expect(status.sampleRuntime.status).toBe('ADAPTIVE_RUNTIME_COMPOSED');
  expect(status.sampleRuntime.kernelMode).toBe('development-mode');
  expect(status.sampleRuntime.boundaries.activateOnlyNeededCapabilities).toBe(true);

  expect(status.boundaries.adaptiveKernelEnabled).toBe(true);
  expect(status.boundaries.runtimeComposerEnabled).toBe(true);
});

test('selects adaptive kernel mode by role domain load and importance', () => {
  const fabric = new SheikhaAdaptiveRuntimeCompositionFabric();

  expect(fabric.selectKernelMode({ load: 'high-availability' }))
    .toBe('high-availability-mode');

  expect(fabric.selectKernelMode({ userRole: 'researcher' }))
    .toBe('research-mode');

  expect(fabric.selectKernelMode({ domain: 'marketplace' }))
    .toBe('marketplace-mode');

  expect(fabric.selectKernelMode({ importance: 'critical' }))
    .toBe('enterprise-mode');

  expect(fabric.selectKernelMode({ userRole: 'developer' }))
    .toBe('development-mode');
});

test('composes runtime with health matrix and resource scheduler', () => {
  const fabric = new SheikhaAdaptiveRuntimeCompositionFabric();

  const runtime = fabric.composeRuntime({
    userRole: 'merchant',
    domain: 'marketplace',
    requestedPacks: ['core-runtime', 'marketplace', 'observability']
  });

  expect(runtime.status).toBe('ADAPTIVE_RUNTIME_COMPOSED');
  expect(runtime.kernelMode).toBe('marketplace-mode');
  expect(runtime.resourceSchedule).toHaveLength(RESOURCE_SCHEDULER_TYPES.length);
  expect(runtime.healthMatrix).toHaveLength(HEALTH_MATRIX.length);
  expect(runtime.boundaries.noEverythingAtOnceByDefault).toBe(true);
});

test('evaluates capability lifecycle with promotion rules', () => {
  const fabric = new SheikhaAdaptiveRuntimeCompositionFabric();
  const lifecycle = fabric.evaluateCapabilityLifecycle('git-lab');

  expect(lifecycle.status).toBe('CAPABILITY_LIFECYCLE_EVALUATED');
  expect(lifecycle.lifecycle).toContain('promote');
  expect(lifecycle.promotionRules).toContain('tests-pass');
  expect(lifecycle.promotionRules).toContain('master-log-written');
});
