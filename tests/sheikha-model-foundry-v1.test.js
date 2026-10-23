'use strict';

const {
  LIFECYCLE,
  assessArtifact,
  buildFoundryStatus
} = require('../runtime/sheikha-ai-governor/v1/sheikha-model-foundry-v1');

describe('Sheikha model foundry V1', () => {
  test('defines a non-skippable commercial lifecycle', () => {
    expect(LIFECYCLE).toEqual([
      'DESIGN', 'DATA_APPROVED', 'TRAINED', 'EVALUATED',
      'CANARY', 'COMMERCIAL_APPROVED', 'RETIRED'
    ]);
  });

  test('does not commercially promote an artifact that failed quality', () => {
    const result = assessArtifact({
      modelId: 'pilot', artifactSha256: 'a'.repeat(64),
      nativeInferencePassed: true, qualityGatePassed: false
    });
    expect(result.lifecycleStage).toBe('TRAINED');
    expect(result.commercialProductionApproved).toBe(false);
    expect(result.blockers).toContain('QUALITY_GATE_REQUIRED');
  });

  test('keeps local pilots active while large distributed training is blocked', () => {
    const result = buildFoundryStatus({
      nodes: [
        { id: 'local', location: 'local', reachable: true, gpuCount: 1 },
        { id: 'cpu-server', location: 'external', reachable: true, gpuCount: 0 }
      ],
      pilot: { modelId: 'pilot' }
    });
    expect(result.status).toBe('ACTIVE_WITH_GOVERNED_LIMITS');
    expect(result.environments.local.status).toBe('PILOT_TRAINING_AVAILABLE');
    expect(result.environments.external.status).toBe('LARGE_MODEL_FROM_SCRATCH_BLOCKED');
    expect(result.commercialValue.automaticCommercialApproval).toBe(false);
  });

  test('blocks local pilots when the GPU runtime is unavailable', () => {
    const result = buildFoundryStatus({
      nodes: [{ id: 'local', location: 'local', reachable: true, gpuCount: 0 }],
      pilot: { modelId: 'pilot' }
    });
    expect(result.environments.local.status).toBe('LOCAL_GPU_RUNTIME_BLOCKED');
    expect(result.environments.local.gpuRuntimeAvailable).toBe(false);
  });
});
