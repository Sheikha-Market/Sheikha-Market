'use strict';

const { buildSheikhaFoundryStatus } = require('../runtime/sheikha-studio/core/sheikha-foundry-v1');

describe('Sheikha Foundry V1', () => {
  test('keeps Sheikha surfaces primary and external providers optional', () => {
    const status = buildSheikhaFoundryStatus();
    expect(status.core.sheikhaCliIsPrimary).toBe(true);
    expect(status.core.sheikhaLanguageIsPrimary).toBe(true);
    expect(status.core.microsoftOrAzureIsCore).toBe(false);
    expect(status.optionalProviders.every((provider) => provider.optional)).toBe(true);
    expect(status.providerPolicy.providerOutputsDoNotBecomeTrainingDataByDefault).toBe(true);
    expect(status.executionStarted).toBe(false);
    expect(status.trainingCells.automaticPromotion).toBe(false);
    expect(status.trainingCells.distributedWorkerActivated).toBe(false);
    expect(status.trainingCells.maxConcurrentSmokeWorkers).toBe(1);
    expect(status.sha256).toMatch(/^[a-f0-9]{64}$/);
  });
});
