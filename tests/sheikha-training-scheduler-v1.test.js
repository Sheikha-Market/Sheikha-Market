'use strict';

const { decideTrainingCycle } = require(
  '../runtime/sheikha-ai-governor/v1/sheikha-training-scheduler-v1'
);

describe('Sheikha training scheduler V1', () => {
  const ready = {
    nowMs: 30_000_000, lastTrainingAtMs: 0, cooldownMs: 1_000_000,
    gpuAvailable: true, freeGpuMiB: 7000, gpuTemperatureC: 55,
    availableRamGiB: 32, datasetRecords: 2000, minimumDatasetRecords: 1000,
    datasetLicenseApproved: true, datasetProvenanceVerified: true,
    piiReviewPassed: true, datasetSha256: 'a'.repeat(64),
    lastTrainedDatasetSha256: 'b'.repeat(64), humanTrainingApproval: true
  };

  test('admits a changed licensed dataset when resources and approval are ready', () => {
    const decision = decideTrainingCycle(ready);
    expect(decision.status).toBe('TRAINING_CYCLE_ADMITTED');
    expect(decision.automaticCommercialPromotion).toBe(false);
  });

  test('does not train continuously or repeat the same dataset revision', () => {
    const decision = decideTrainingCycle({
      ...ready, lastTrainedDatasetSha256: ready.datasetSha256
    });
    expect(decision.action).toBe('HOLD_AND_RECHECK');
    expect(decision.blockers).toContain('NO_NEW_DATASET_REVISION');
    expect(decision.trainingRunsContinuously).toBe(false);
  });

  test('blocks small or unlicensed datasets even when GPU and RAM are available', () => {
    const decision = decideTrainingCycle({
      ...ready, datasetRecords: 24, datasetLicenseApproved: false
    });
    expect(decision.blockers).toContain('DATASET_BELOW_MINIMUM_RECORDS');
    expect(decision.blockers).toContain('COMMERCIAL_DATASET_LICENSE_REQUIRED');
  });

  test('quarantines a dataset revision whose independent quality evaluation regressed', () => {
    const decision = decideTrainingCycle({
      ...ready, datasetQualityQuarantined: true
    });
    expect(decision.action).toBe('HOLD_AND_RECHECK');
    expect(decision.blockers).toContain('QUALITY_REGRESSION_QUARANTINED');
  });
});
