'use strict';

const { buildRapidIndependentModelProgram } = require(
  '../runtime/sheikha-ai-governor/v1/sheikha-rapid-independent-model-program-v1'
);

describe('Sheikha rapid independent model program', () => {
  test('keeps hybrid serving active without falsifying from-scratch completion', () => {
    const report = buildRapidIndependentModelProgram({
      baseModelId: 'Llama-Sheikha-Governed:8b',
      baseModelLicenseAllowsTraining: true,
      ownedLicensedTokens: 1_000_000,
      piiReviewPassed: true,
    });
    expect(report.servingNow.model).toBe('Llama-Sheikha-Governed:8b');
    expect(report.accelerationTracks.governedHybrid.active).toBe(true);
    expect(report.accelerationTracks.independentFromScratch.admitted).toBe(false);
    expect(report.competitiveClaimGate.betterThanGptOrCopilotClaimed).toBe(false);
  });

  test('prohibits using OpenAI output to train a competing model', () => {
    const report = buildRapidIndependentModelProgram();
    expect(report.teacherPolicy.openAiOutputForCompetingModelTrainingAllowed).toBe(false);
    expect(report.teacherPolicy.proprietaryOutputExtractionAllowed).toBe(false);
  });

  test('does not retrain a quarantined dataset even when rights are present', () => {
    const report = buildRapidIndependentModelProgram({
      baseModelId: 'licensed-base', baseModelLicenseAllowsTraining: true,
      ownedLicensedTokens: 1000, piiReviewPassed: true, datasetQualityQuarantined: true,
    });
    expect(report.accelerationTracks.continuedPretraining.admitted).toBe(false);
    expect(report.accelerationTracks.continuedPretraining.blockers)
      .toContain('QUALITY_REGRESSION_QUARANTINED');
  });
});
