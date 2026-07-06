'use strict';

const {
  SheikhaArchitectureCatalogDigitalTwin,
  ARCHITECTURE_COMPONENTS,
  DESCRIPTOR_FIELDS,
  ARCHITECTURE_GRAPHS
} = require('../runtime/sheikha-architecture-catalog/sheikha-architecture-catalog-digital-twin');

test('activates architecture catalog and digital twin above user journey federation', () => {
  const catalog = new SheikhaArchitectureCatalogDigitalTwin();
  const status = catalog.getStatus();

  expect(status.status).toBe('ACTIVE_ARCHITECTURE_CATALOG_DIGITAL_TWIN');
  expect(status.layerRank).toBe('ABOVE_USER_JOURNEY_FEDERATION');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.descriptorFields).toEqual(DESCRIPTOR_FIELDS);
  expect(status.graphs).toEqual(ARCHITECTURE_GRAPHS);
  expect(status.components).toHaveLength(ARCHITECTURE_COMPONENTS.length);

  expect(status.architectureGraph.status).toBe('ARCHITECTURE_GRAPH_READY');
  expect(status.digitalTwin.status).toBe('ARCHITECTURE_DIGITAL_TWIN_READY');
  expect(status.architectureAnalysis.status).toBe('ARCHITECTURE_ANALYSIS_READY');

  expect(status.boundaries.allComponentsCataloged).toBe(true);
  expect(status.boundaries.allComponentsGoverned).toBe(true);
  expect(status.boundaries.inspectorRequired).toBe(true);
});

test('describes architecture component with complete descriptor fields', () => {
  const catalog = new SheikhaArchitectureCatalogDigitalTwin();
  const descriptor = catalog.describeComponent('connector-federation');

  for (const field of DESCRIPTOR_FIELDS) {
    expect(Object.prototype.hasOwnProperty.call(descriptor, field)).toBe(true);
  }

  expect(descriptor.id).toBe('sheikha:connector-federation');
  expect(descriptor.governanceRules).toContain('inspector-required');
  expect(descriptor.lifecycle).toContain('improve');
});

test('rejects unsupported architecture component', () => {
  const catalog = new SheikhaArchitectureCatalogDigitalTwin();

  expect(() => catalog.describeComponent('unknown-component'))
    .toThrow('Unsupported Sheikha architecture component');
});
