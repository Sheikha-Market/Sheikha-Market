'use strict';

const {
  SheikhaEvidenceMeasurementFederationFabric,
  EVIDENCE_SOURCES,
  MEASUREMENT_PROPERTIES,
  QUALITY_DIMENSIONS
} = require('../runtime/sheikha-evidence-measurement-federation/sheikha-evidence-measurement-federation-fabric');

test('activates evidence and measurement federation fabric', () => {
  const fabric = new SheikhaEvidenceMeasurementFederationFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ACTIVE_EVIDENCE_MEASUREMENT_FEDERATION');
  expect(status.layerRank).toBe('ABOVE_IDE_CONNECTION_ORCHESTRATOR');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.evidenceSources).toHaveLength(EVIDENCE_SOURCES.length);
  expect(status.measurementProperties).toHaveLength(MEASUREMENT_PROPERTIES.length);
  expect(status.evidenceQuality.dimensions).toHaveLength(QUALITY_DIMENSIONS.length);

  expect(status.sourceComparison.status).toBe('SOURCES_COMPARED');
  expect(status.sourceComparison.comparison.conflictDetected).toBe(false);
  expect(status.sourceComparison.comparison.confidenceScore).toBe(100);

  expect(status.capabilityGapSample.status).toBe('CAPABILITY_GAP_RECOMMENDATION_READY');
  expect(status.boundaries.noSingleSourceBlindTrust).toBe(true);
  expect(status.boundaries.evidenceRegistryRequired).toBe(true);
});

test('registers trusted and alternative evidence sources', () => {
  const fabric = new SheikhaEvidenceMeasurementFederationFabric();

  const lab = fabric.registerSource('laboratory');
  const alternative = fabric.registerSource('alternative-source');

  expect(lab.status).toBe('SOURCE_REGISTERED');
  expect(lab.trusted).toBe(true);

  expect(alternative.alternative).toBe(true);
  expect(alternative.requiresValidation).toBe(true);
});

test('rejects invalid evidence source measurement and comparison', () => {
  const fabric = new SheikhaEvidenceMeasurementFederationFabric();

  expect(() => fabric.registerSource('unknown-source'))
    .toThrow('Unsupported Sheikha evidence source');

  expect(() => fabric.defineMeasurement('unknown-property'))
    .toThrow('Unsupported Sheikha measurement property');

  expect(() => fabric.compareSources(['laboratory']))
    .toThrow('Sheikha source comparison requires at least two sources');
});
