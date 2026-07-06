'use strict';

const {
  SheikhaPluginPlatform,
  PLUGIN_CERTIFICATION_STAGES
} = require('../runtime/sheikha-universal-production-integration/connectors/plugin-platform/sheikha-plugin-platform');

test('activates Sheikha plugin platform with SDK registry loader and certification', () => {
  const platform = new SheikhaPluginPlatform();
  const status = platform.getStatus();

  expect(status.status).toBe('ACTIVE_PLUGIN_PLATFORM_READY');
  expect(status.layerRank).toBe('ABOVE_ADAPTER_PLUGIN_RUNTIME');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.sdk.status).toBe('ACTIVE');
  expect(status.registry.status).toBe('ACTIVE');
  expect(status.loader.status).toBe('ACTIVE');
  expect(status.loader.loaded).toBeGreaterThanOrEqual(1);

  expect(status.certification.stages).toEqual(PLUGIN_CERTIFICATION_STAGES);
  expect(status.plugins[0].certification.status).toBe('PRODUCTION_READY');
  expect(status.plugins[0].health.status).toBe('HEALTHY');
  expect(status.plugins[0].telemetry.status).toBe('TELEMETRY_READY');

  expect(status.boundaries.allPluginsGoverned).toBe(true);
  expect(status.boundaries.allPluginsAudited).toBe(true);
});

test('plugin platform keeps Linux host plugin registered and certified', () => {
  const platform = new SheikhaPluginPlatform();
  const status = platform.getStatus();
  const linux = status.plugins.find((x) => x.target === 'linux-host');

  expect(linux).toBeTruthy();
  expect(linux.registration.status).toBe('PLUGIN_REGISTERED');
  expect(linux.certification.status).toBe('PRODUCTION_READY');
});
