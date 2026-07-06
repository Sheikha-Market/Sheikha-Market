'use strict';

const {
  SheikhaUniversalDataPipelineFabric,
  DATA_PIPELINE_STAGES
} = require('../runtime/sheikha-universal-production-integration/data-pipeline/sheikha-universal-data-pipeline-fabric');

test('activates universal data pipeline across all integrated data formats', () => {
  const fabric = new SheikhaUniversalDataPipelineFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ACTIVE_UNIVERSAL_DATA_PIPELINE');
  expect(status.layerRank).toBe('ABOVE_UNIVERSAL_DATA_INTEGRATION_PLUGIN_FABRIC');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.stages).toEqual(DATA_PIPELINE_STAGES);
  expect(status.coverage.score).toBe(100);
  expect(status.pipelines.length).toBeGreaterThanOrEqual(10);
  expect(status.pipelines.every((x) => x.status === 'PIPELINE_READY')).toBe(true);

  expect(status.pipelines.every((x) => x.outputs.normalized)).toBe(true);
  expect(status.pipelines.every((x) => x.outputs.validated)).toBe(true);
  expect(status.pipelines.every((x) => x.outputs.registered)).toBe(true);
  expect(status.pipelines.every((x) => x.outputs.decisionReady)).toBe(true);

  expect(status.boundaries.allPipelinesGoverned).toBe(true);
  expect(status.boundaries.allPipelinesAudited).toBe(true);
});

test('data pipeline supports structured semi structured and unstructured formats', () => {
  const fabric = new SheikhaUniversalDataPipelineFabric();

  expect(fabric.runPipelineForFormat('sql').dataClass).toBe('structured');
  expect(fabric.runPipelineForFormat('json').dataClass).toBe('semi-structured');
  expect(fabric.runPipelineForFormat('document').dataClass).toBe('unstructured');

  expect(() => fabric.runPipelineForFormat('unknown-format'))
    .toThrow('Unsupported Sheikha data format');
});
