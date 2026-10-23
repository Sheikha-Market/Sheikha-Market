'use strict';

const {
  buildCommercialOperatingStatus,
  buildFeasibilityScenario,
  evaluateExperiment,
} = require('../runtime/sheikha-studio/core/sheikha-commercial-operating-system-v1');

describe('Sheikha commercial operating system', () => {
  test('publishes machine-readable controls without claiming certification', () => {
    const status = buildCommercialOperatingStatus();
    expect(status.status).toBe('CONTROLLED_SAUDI_PILOT_OPERATING_MODEL_ACTIVE');
    expect(status.controlRegistry.every((item) => item.state !== 'CERTIFIED')).toBe(true);
    expect(status.automation.automaticExternalCertificationOrLicenseIssuance).toBe(false);
  });

  test('calculates transparent unit economics and VAT', () => {
    const result = buildFeasibilityScenario({
      offerId: 'SHEIKHA_360_MEASURED_TWIN_PILOT_V1', customers: 2,
      variableCostPerCustomerSar: 4000, monthlyFixedCostSar: 7000, vatRate: 0.15,
    });
    expect(result.status).toBe('SCENARIO_CALCULATED');
    expect(result.scenario).toMatchObject({ revenueExcludingVatSar: 30000, vatSar: 4500, operatingResultSar: 15000, breakEvenCustomers: 1 });
  });

  test('never auto-promotes experiments even when better', () => {
    const result = evaluateExperiment({ baseline: 100, candidate: 120, minimumImprovementPercent: 10, sampleSize: 30, regressions: 0 });
    expect(result.status).toBe('CANDIDATE_ELIGIBLE_FOR_HUMAN_REVIEW');
    expect(result.promote).toBe(false);
    expect(result.humanApprovalRequired).toBe(true);
  });
});
