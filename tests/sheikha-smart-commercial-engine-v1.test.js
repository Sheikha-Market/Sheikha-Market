'use strict';

const {
  assessCommercialCase,
  recommendChannels
} = require('../runtime/commercial-economics/v1/sheikha-smart-commercial-engine-v1');

const base = {
  channel: 'HYBRID',
  monthlyUnits: 20,
  pricePerUnitSar: 299,
  variableCostPerUnitSar: 45,
  monthlyFixedCostSar: 2000,
  setupRevenueSar: 3000,
  setupCostSar: 1000,
  taxAndStatutoryReserveRate: 0.15,
  commercialUseRights: true,
  serviceResaleRights: true
};

describe('Sheikha smart commercial engine V1', () => {
  test('calculates auditable hybrid unit economics', () => {
    const result = assessCommercialCase(base);
    expect(result.status).toBe('SCENARIO_CALCULATED_NOT_SALE_AUTHORIZATION');
    expect(result.economics.recurringRevenueSar).toBe(5980);
    expect(result.economics.grossRevenueSar).toBe(8980);
    expect(result.economics.totalCostSar).toBe(3900);
    expect(result.economics.operatingProfitBeforeReserveSar).toBe(5080);
    expect(result.economics.breakEvenUnits).toBe(8);
    expect(result.economics.firstPeriodBreakEvenUnits).toBe(0);
    expect(result.economics.projectedSurplusAfterReserveSar).toBe(4318);
    expect(result.economics.distributableCashSar).toBe(0);
    expect(result.economics.grossMarginRate).toBeCloseTo(7080 / 8980, 4);
    expect(result.paymentCaptured).toBe(false);
  });

  test('blocks sale of weights that are not owned and transferable', () => {
    const result = assessCommercialCase({
      ...base,
      channel: 'WEIGHT_SALE',
      ownedWeights: false,
      redistributionRights: false
    });
    expect(result.status).toBe('COMMERCIAL_CASE_BLOCKED');
    expect(result.blockers).toContain('OWNED_WEIGHTS_REQUIRED_FOR_SALE');
    expect(result.blockers).toContain('WEIGHT_TRANSFER_RIGHT_REQUIRED');
  });

  test('requires resale rights for an external model service', () => {
    const result = assessCommercialCase({
      ...base,
      externalBaseModel: true,
      serviceResaleRights: false
    });
    expect(result.blockers).toContain('EXTERNAL_MODEL_SERVICE_RESALE_RIGHT_REQUIRED');
  });

  test('rejects forged payment and contract assertions', () => {
    const result = assessCommercialCase({ ...base, signedContract: true, paymentVerified: true });
    expect(result.blockers).toContain('HTTP_INPUT_CANNOT_SELF_ASSERT_SIGNED_CONTRACT');
    expect(result.blockers).toContain('HTTP_INPUT_CANNOT_SELF_ASSERT_VERIFIED_PAYMENT');
  });

  test('recommends hybrid recurring revenue before a one-time weight sale', () => {
    const result = recommendChannels({ ownedWeights: true, recurringDemand: true });
    expect(result.primary).toBe('HYBRID');
    expect(result.recommended.at(-1).channel).toBe('WEIGHT_SALE');
  });

  test('rejects invalid financial inputs', () => {
    expect(() => assessCommercialCase({ ...base, monthlyFixedCostSar: -1 })).toThrow();
    expect(() => assessCommercialCase({ ...base, revenueShareRate: 2 })).toThrow();
    for (const value of [true, '', '20', {}, [], NaN, Infinity]) {
      expect(() => assessCommercialCase({ ...base, monthlyUnits: value })).toThrow();
      expect(() => assessCommercialCase({ ...base, pricePerUnitSar: value })).toThrow();
    }
    expect(() => assessCommercialCase({ ...base, monthlyUnits: 1e9, pricePerUnitSar: 1e9 })).toThrow();
  });

  test('keeps one-time sales separate from recurring revenue and reconciles cents', () => {
    const result = assessCommercialCase({ ...base, channel: 'WEIGHT_SALE',
      monthlyUnits: 3, pricePerUnitSar: 0.1, variableCostPerUnitSar: 0,
      setupRevenueSar: 0, setupCostSar: 0, monthlyFixedCostSar: 0,
      taxAndStatutoryReserveRate: 0, ownedWeights: true, redistributionRights: true,
      customerDataTrainingConsent: true });
    expect(result.economics.unitRevenueSar).toBe(0.3);
    expect(result.economics.recurringRevenueSar).toBe(0);
    expect(result.rights.ownedWeights).toBe(false);
    expect(result.rights.customerDataTrainingAllowed).toBe(false);
    const allocation = result.reinvestmentPreview;
    const sum = Object.entries(allocation).filter(([key]) => key.endsWith('Sar'))
      .reduce((total, [, value]) => total + Math.round(value * 100), 0);
    expect(sum).toBe(30);
    expect(allocation.spendingAuthorized).toBe(false);
  });

  test('does not silently add revenue-share income to other channels', () => {
    expect(() => assessCommercialCase({ ...base, channel: 'SUBSCRIPTION',
      customerRevenueSar: 1000, revenueShareRate: .1 })).toThrow();
  });
});
