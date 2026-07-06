'use strict';

const {
  SheikhaResourceMeasurementCapabilityScoringFabric,
  RESOURCE_DIMENSIONS
} = require('../runtime/sheikha-universal-production-integration/measurement/sheikha-resource-measurement-capability-scoring-fabric');

test('activates resource measurement and capability scoring fabric', () => {
  const fabric = new SheikhaResourceMeasurementCapabilityScoringFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ACTIVE_RESOURCE_MEASUREMENT_CAPABILITY_SCORING');
  expect(status.layerRank).toBe('ABOVE_CAPABILITY_GRAPH_DECISION');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.measurements).toHaveLength(RESOURCE_DIMENSIONS.length);
  expect(status.measurements.every((x) => x.status === 'MEASURED')).toBe(true);
  expect(status.measurements.every((x) => x.available)).toBe(true);

  expect(status.scoring.score).toBe(100);
  expect(status.scoring.grade).toBe('EXCELLENT');
  expect(status.scoring.decision).toBe('ALLOW');

  expect(status.boundaries.allMeasurementsAudited).toBe(true);
  expect(status.boundaries.allMeasurementsGoverned).toBe(true);
});

test('rejects unsupported resource dimensions', () => {
  const fabric = new SheikhaResourceMeasurementCapabilityScoringFabric();

  expect(() => fabric.measureResource('unknown-resource'))
    .toThrow('Unsupported resource dimension');
});
