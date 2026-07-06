'use strict';

const {
  SheikhaMetaOperatingSystem,
  META_KERNELS,
  META_REGISTRIES,
  META_INSPECTORS,
  META_TWIN_LEVELS
} = require('../runtime/sheikha-meta-os/sheikha-meta-operating-system');

test('activates Sheikha meta operating system above architecture catalog digital twin', () => {
  const os = new SheikhaMetaOperatingSystem();
  const status = os.getStatus();

  expect(status.status).toBe('ACTIVE_META_OPERATING_SYSTEM');
  expect(status.layerRank).toBe('ABOVE_ARCHITECTURE_CATALOG_DIGITAL_TWIN');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.kernels).toHaveLength(META_KERNELS.length);
  expect(status.registries).toHaveLength(META_REGISTRIES.length);
  expect(status.inspectors).toHaveLength(META_INSPECTORS.length);
  expect(status.metaDigitalTwin.levels).toHaveLength(META_TWIN_LEVELS.length);

  expect(status.metaDigitalTwin.status).toBe('META_DIGITAL_TWIN_READY');
  expect(status.metaAnalysis.status).toBe('META_SYSTEM_ANALYSIS_READY');

  expect(status.boundaries.allKernelsGoverned).toBe(true);
  expect(status.boundaries.allRegistriesUnified).toBe(true);
  expect(status.boundaries.allInspectorsReportToUniversalInspector).toBe(true);
});

test('activates governed meta kernel registry and inspector', () => {
  const os = new SheikhaMetaOperatingSystem();

  const kernel = os.activateKernel('architecture-kernel');
  const registry = os.activateRegistry('component-registry');
  const inspector = os.activateInspector('quality-inspector');

  expect(kernel.status).toBe('META_KERNEL_ACTIVE');
  expect(kernel.bindings.digitalTwin).toBe(true);

  expect(registry.status).toBe('META_REGISTRY_ACTIVE');
  expect(registry.unified).toBe(true);

  expect(inspector.status).toBe('META_INSPECTOR_ACTIVE');
  expect(inspector.reportsTo).toBe('universal-inspector');
});

test('rejects unsupported meta operating system elements', () => {
  const os = new SheikhaMetaOperatingSystem();

  expect(() => os.activateKernel('unknown-kernel'))
    .toThrow('Unsupported Sheikha meta kernel');

  expect(() => os.activateRegistry('unknown-registry'))
    .toThrow('Unsupported Sheikha meta registry');

  expect(() => os.activateInspector('unknown-inspector'))
    .toThrow('Unsupported Sheikha meta inspector');
});
