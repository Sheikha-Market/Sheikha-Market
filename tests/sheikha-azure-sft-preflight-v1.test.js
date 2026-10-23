'use strict';

const { buildAzureSftPreflight } = require(
  '../runtime/sheikha-ai-governor/v1/sheikha-azure-sft-preflight-v1'
);

describe('Sheikha Azure SFT preflight', () => {
  test('recognizes an authenticated subscription but retains paid and data gates', () => {
    const report = buildAzureSftPreflight({
      azureCliAuthenticated: true,
      subscriptionEnabled: true,
      resources: [{ name: 'portal', type: 'Microsoft.App/containerApps' }],
      datasetFormatValid: true,
      datasetQualityQuarantined: true,
    });
    expect(report.status).toBe('PREFLIGHT_BLOCKED_NO_PAID_ACTION');
    expect(report.blockers).toContain('FOUNDRY_OR_AZURE_ML_RESOURCE_REQUIRED');
    expect(report.blockers).toContain('QUALITY_REGRESSION_QUARANTINED');
    expect(report.execution.costIncurredByThisRun).toBe(false);
  });

  test('admits submission only when every training gate passes', () => {
    const report = buildAzureSftPreflight({
      azureCliAuthenticated: true,
      subscriptionEnabled: true,
      resources: [{
        name: 'sheikha-foundry', type: 'Microsoft.CognitiveServices/accounts',
        resourceGroup: 'sheikha-rg', location: 'uaenorth',
      }],
      datasetFormatValid: true,
      datasetLicenseApproved: true,
      piiAndSecretReviewPassed: true,
      externalProcessorApproved: true,
      datasetQualityQuarantined: false,
      baselineEvaluationPresent: true,
      budgetApproved: true,
      paidTrainingAuthorized: true,
    });
    expect(report.status).toBe('READY_TO_SUBMIT_SFT_JOB');
    expect(report.blockers).toEqual([]);
    expect(report.execution.trainingJobSubmitted).toBe(false);
  });
});
