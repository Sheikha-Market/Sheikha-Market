'use strict';

const {
  assessDistributedTraining,
  estimateFromScratch
} = require('../runtime/sheikha-ai-governor/v1/sheikha-distributed-llm-training-v1');

describe('Sheikha distributed LLM training V1', () => {
  test('estimates a 7B from-scratch run without claiming exact capacity', () => {
    const estimate = estimateFromScratch({ parametersB: 7 });
    expect(estimate.targetTrainingTokens).toBe(140_000_000_000);
    expect(estimate.minimumAggregateGpuMemoryGiB).toBeGreaterThan(100);
    expect(estimate.estimatePolicy).toBe('PLANNING_HEURISTIC_NOT_A_HARDWARE_QUOTE');
  });

  test('blocks the current local and CPU-only external cluster', () => {
    const result = assessDistributedTraining({
      parametersB: 7,
      nodes: [
        { id: 'local', location: 'local', reachable: true, gpuCount: 1, gpuMemoryGiBEach: 7.62 },
        { id: 'server', location: 'external', reachable: true, gpuCount: 0 }
      ]
    });
    expect(result.status).toBe('LARGE_MODEL_FROM_SCRATCH_BLOCKED');
    expect(result.trainingExecuted).toBe(false);
    expect(result.commercialProductionApproved).toBe(false);
    expect(result.blockers).toContain('PRODUCTION_GPU_WORKER_REQUIRED');
    expect(result.execution.command).toBeNull();
  });

  test('generates a launch plan only when every gate is evidenced', () => {
    const digest = 'a'.repeat(64);
    const result = assessDistributedTraining({
      parametersB: 1,
      datasetManifestSha256: digest,
      datasetTokenCount: 20_000_000_000,
      datasetLicenseVerified: true,
      externalTrainingLicenseVerified: true,
      datasetProvenanceVerified: true,
      piiReviewPassed: true,
      tokenizerManifestSha256: digest,
      evalPlanSha256: digest,
      rollbackPlanSha256: digest,
      humanApproval: true,
      nodes: [{
        id: 'approved-external', location: 'external', reachable: true,
        productionApproved: true, gpuCount: 4, gpuMemoryGiBEach: 24
      }]
    });
    expect(result.status).toBe('READY_FOR_GOVERNED_DISTRIBUTED_RUN');
    expect(result.trainingExecuted).toBe(false);
    expect(result.execution.command).toContain('torchrun');
  });
});
