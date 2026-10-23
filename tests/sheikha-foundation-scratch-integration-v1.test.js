'use strict';

const { reconcileEvidence } = require('../tools/training/inspect-sheikha-foundation-scratch-v1');

function fixture() {
  return {
    report: {
      system: 'SHEIKHA_FOUNDATION_FROM_SCRATCH_LOCAL_V1', modelId: 'synthetic-fixture',
      initialization: 'RANDOM', pretrainedWeightsLoaded: false, parameters: 1_850_496,
      stepsCompleted: 2, weightsSha256: 'b'.repeat(64), validationAfter: { crossEntropyPerByteToken: 2 },
    },
    checkpoint: { stepsCompleted: 2, initialWeightsSha256: 'a'.repeat(64), files: { 'model.safetensors': 'b'.repeat(64) } },
    verification: { status: 'LOCAL_CHECKPOINT_INTEGRITY_AND_RELOAD_VERIFIED', stepsCompleted: 2, parameters: 1_850_496,
      weightsSha256: 'b'.repeat(64), validation: { crossEntropyPerByteToken: 2 } },
  };
}

test('registers a trained engineering proof without approving serving or ownership', () => {
  const { report, checkpoint, verification } = fixture();
  const result = reconcileEvidence(report, checkpoint, verification);
  expect(result.lifecycleStage).toBe('TRAINED');
  expect(result.releaseGate.commercialProductionApproved).toBe(false);
  expect(result.releaseGate.servingAllowed).toBe(false);
  expect(result.releaseGate.blockers).toContain('QUALITY_GATE_REQUIRED');
  expect(result.legalOwnershipCertified).toBe(false);
  expect(result.largeLlmTrainingComplete).toBe(false);
});

test.each([
  ['initialization', 'PRETRAINED'], ['pretrainedWeightsLoaded', true],
  ['parameters', 7_000_000_000], ['stepsCompleted', 3], ['weightsSha256', 'c'.repeat(64)],
  ['validationAfter', { crossEntropyPerByteToken: 1 }],
])('rejects report mismatch or profile escape in %s', (key, value) => {
  const { report, checkpoint, verification } = fixture();
  report[key] = value;
  expect(() => reconcileEvidence(report, checkpoint, verification)).toThrow();
});

test('a zero-step checkpoint is not a trained model', () => {
  const { report, checkpoint, verification } = fixture();
  report.stepsCompleted = checkpoint.stepsCompleted = verification.stepsCompleted = 0;
  checkpoint.initialWeightsSha256 = verification.weightsSha256;
  expect(reconcileEvidence(report, checkpoint, verification).lifecycleStage).toBe('DESIGN');
});
