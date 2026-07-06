'use strict';

const {
  validateAdapterPlugin
} = require('../runtime/sheikha-universal-production-integration/connectors/plugins/sheikha-adapter-plugin-contract');

const {
  LinuxHostAdapterPlugin
} = require('../runtime/sheikha-universal-production-integration/connectors/plugins/linux/linux-host-adapter-plugin');

const {
  SheikhaAdapterPluginRuntime
} = require('../runtime/sheikha-universal-production-integration/connectors/plugins/sheikha-adapter-plugin-runtime');

test('validates Linux host adapter plugin contract', () => {
  const contract = validateAdapterPlugin(LinuxHostAdapterPlugin);

  expect(contract.status).toBe('PLUGIN_CONTRACT_VALID');
  expect(contract.pluginId).toBe('sheikha-plugin:linux-host');
  expect(contract.target).toBe('linux-host');
  expect(contract.governed).toBe(true);
  expect(contract.audited).toBe(true);
});

test('activates adapter plugin runtime with Linux host plugin', () => {
  const runtime = new SheikhaAdapterPluginRuntime();
  const status = runtime.getStatus();

  expect(status.status).toBe('ACTIVE_PLUGIN_RUNTIME_READY');
  expect(status.layerRank).toBe('ABOVE_REAL_ADAPTER_RUNTIME');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.plugins.length).toBeGreaterThanOrEqual(1);
  expect(status.plugins[0].target).toBe('linux-host');
  expect(status.plugins[0].contract.status).toBe('PLUGIN_CONTRACT_VALID');
  expect(status.plugins[0].registration.status).toBe('REGISTERED_PLUGIN_ADAPTER');

  expect(status.boundaries.readOnlyDiscovery).toBe(true);
  expect(status.boundaries.noWriteOperation).toBe(true);
  expect(status.boundaries.allPluginsGoverned).toBe(true);
});

test('rejects adapter plugin missing required operation', () => {
  const broken = {
    id: 'broken',
    target: 'broken',
    discover() {},
    measure() {},
    validate() {},
    register() {}
  };

  expect(() => validateAdapterPlugin(broken))
    .toThrow('Adapter plugin missing operation: recover');
});
