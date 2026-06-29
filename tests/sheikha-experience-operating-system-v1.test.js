'use strict';

const {
  SheikhaExperienceOperatingSystem,
  EXPERIENCE_SUBSYSTEMS,
  COMPONENT_FACTORIES,
  CONTEXT_DIMENSIONS,
  BRAND_ASSETS
} = require('../runtime/sheikha-experience-os/sheikha-experience-operating-system');

test('activates Sheikha experience operating system', () => {
  const os = new SheikhaExperienceOperatingSystem();
  const status = os.getStatus();

  expect(status.status).toBe('ACTIVE_EXPERIENCE_OPERATING_SYSTEM');
  expect(status.layerRank).toBe('ABOVE_EVIDENCE_MEASUREMENT_FEDERATION');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.subsystems).toHaveLength(EXPERIENCE_SUBSYSTEMS.length);
  expect(status.componentFactories).toHaveLength(COMPONENT_FACTORIES.length);

  expect(status.operationalContext.dimensions).toHaveLength(CONTEXT_DIMENSIONS.length);
  expect(status.brandSystem.assets).toHaveLength(BRAND_ASSETS.length);

  expect(status.visualGovernance.noLivingBeingImages).toBe(true);
  expect(status.visualGovernance.arabicFirst).toBe(true);
  expect(status.visualGovernance.rtlReady).toBe(true);

  expect(status.boundaries.allSubsystemsGoverned).toBe(true);
  expect(status.boundaries.allFactoriesAudited).toBe(true);
  expect(status.boundaries.inspectorRequired).toBe(true);
});

test('creates governed component factories without living-being images', () => {
  const os = new SheikhaExperienceOperatingSystem();
  const factory = os.createComponentFactory('dashboard-factory');

  expect(factory.status).toBe('COMPONENT_FACTORY_READY');
  expect(factory.noLivingBeingImages).toBe(true);
  expect(factory.arabicFirst).toBe(true);
  expect(factory.outputs).toContain('dashboard-component');
});

test('rejects unsupported experience subsystem and component factory', () => {
  const os = new SheikhaExperienceOperatingSystem();

  expect(() => os.activateSubsystem('unknown-subsystem'))
    .toThrow('Unsupported Sheikha experience subsystem');

  expect(() => os.createComponentFactory('unknown-factory'))
    .toThrow('Unsupported Sheikha component factory');
});
