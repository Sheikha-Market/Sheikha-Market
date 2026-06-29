'use strict';

const {
  SheikhaUniversalDataIntegrationPluginFabric,
  DATA_CLASSES,
  DATA_FORMATS
} = require('../runtime/sheikha-universal-production-integration/data/sheikha-universal-data-integration-plugin-fabric');

test('activates universal data integration plugin fabric for all data classes', () => {
  const fabric = new SheikhaUniversalDataIntegrationPluginFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ACTIVE_DATA_INTEGRATION_PLUGIN_FABRIC');
  expect(status.layerRank).toBe('ABOVE_PLUGIN_PLATFORM');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.dataClasses).toEqual(DATA_CLASSES);
  expect(status.dataFormats).toEqual(DATA_FORMATS);
  expect(status.coverage.score).toBe(100);

  expect(status.coverage.structured).toBeGreaterThanOrEqual(3);
  expect(status.coverage.semiStructured).toBeGreaterThanOrEqual(4);
  expect(status.coverage.unstructured).toBeGreaterThanOrEqual(3);

  expect(status.integrations.every((x) => x.pluginBindings.pluginSDK)).toBe(true);
  expect(status.integrations.every((x) => x.pluginBindings.adapterPluginRuntime)).toBe(true);
  expect(status.integrations.every((x) => x.pluginBindings.connectorFederation)).toBe(true);

  expect(status.boundaries.allDataIntegrationsGoverned).toBe(true);
  expect(status.boundaries.noUnsafeParsing).toBe(true);
});

test('classifies structured semi structured and unstructured formats', () => {
  const fabric = new SheikhaUniversalDataIntegrationPluginFabric();

  expect(fabric.classifyData('sql')).toBe('structured');
  expect(fabric.classifyData('json')).toBe('semi-structured');
  expect(fabric.classifyData('document')).toBe('unstructured');

  expect(() => fabric.classifyData('unknown-format'))
    .toThrow('Unsupported Sheikha data format');
});
