'use strict';

const ALLOCATION = Object.freeze({commerce: 2000, productDevelopment: 2500, modelTraining: 2000, securityAndRenewal: 1500, publicBenefit: 500, retainedReserve: 1500});
const FIELDS = ['cashHalala', 'customerObligationsHalala', 'taxAndStatutoryLiabilitiesHalala', 'otherPayablesHalala', 'restrictedCashHalala', 'monthlyOperatingCashHalala', 'runwayMonths', 'unallocatedRealizedProfitAfterTaxHalala', 'allocationBps'];

function object(value, fields) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k => !fields.includes(k))) throw new Error('INVALID_REINVESTMENT_FIELDS');
}
function amount(value, signed = false) {
  if (!Number.isSafeInteger(value) || Math.abs(value) > 10000000000 || (!signed && value < 0)) throw new Error('INVALID_REINVESTMENT_AMOUNT');
  return value;
}

function planReinvestment(input) {
  object(input, FIELDS);
  const values = Object.fromEntries(FIELDS.filter(k => !['allocationBps', 'runwayMonths'].includes(k)).map(k => [k, amount(input[k], k === 'unallocatedRealizedProfitAfterTaxHalala')]));
  if (!Number.isSafeInteger(input.runwayMonths) || input.runwayMonths < 3 || input.runwayMonths > 24) throw new Error('RUNWAY_MUST_BE_3_TO_24_MONTHS');
  const allocation = input.allocationBps === undefined ? {...ALLOCATION} : input.allocationBps;
  object(allocation, Object.keys(ALLOCATION));
  if (Object.keys(ALLOCATION).some(k => !Number.isSafeInteger(allocation[k]) || allocation[k] < 0 || allocation[k] > 10000) || Object.values(allocation).reduce((a, b) => a + b, 0) !== 10000) throw new Error('ALLOCATION_MUST_TOTAL_10000_BPS');
  // These are disjoint accounting buckets. Customer advances and their remaining delivery obligation are not counted twice.
  const operatingReserveHalala = values.monthlyOperatingCashHalala * input.runwayMonths;
  const protectedCashHalala = values.customerObligationsHalala + values.taxAndStatutoryLiabilitiesHalala + values.otherPayablesHalala + values.restrictedCashHalala + operatingReserveHalala;
  const freeCashHalala = Math.max(0, values.cashHalala - protectedCashHalala);
  const distributableHalala = Math.min(freeCashHalala, Math.max(0, values.unallocatedRealizedProfitAfterTaxHalala));
  const allocations = Object.fromEntries(Object.entries(allocation).map(([key, bps]) => [key, Number(BigInt(distributableHalala) * BigInt(bps) / 10000n)]));
  const remainder = distributableHalala - Object.values(allocations).reduce((a, b) => a + b, 0);
  const fractions = Object.keys(allocation).sort((a, b) => {
    const x = BigInt(distributableHalala) * BigInt(allocation[a]) % 10000n;
    const y = BigInt(distributableHalala) * BigInt(allocation[b]) % 10000n;
    return x === y ? 0 : x > y ? -1 : 1;
  });
  for (let i = 0; i < remainder; i++) allocations[fractions[i]]++;
  return {
    system: 'SHEIKHA_PROFIT_AND_CASH_REINVESTMENT_V1', classification: 'CONFIDENTIAL_FINANCIAL_SCENARIO', currency: 'SAR', unit: 'HALALA',
    inputs: values, runwayMonths: input.runwayMonths, allocationBps: {...allocation}, operatingReserveHalala, protectedCashHalala,
    fundingGapHalala: Math.max(0, protectedCashHalala - values.cashHalala), freeCashHalala, distributableHalala, allocations,
    status: distributableHalala ? 'DRAFT_ALLOCATION_PENDING_LEDGER_AND_OWNER_REVIEW' : 'HOLD_NO_DISTRIBUTABLE_PROFIT_AND_CASH',
    liabilitiesMustNotOverlap: true, cashIsNotRevenueOrProfit: true, ledgerVerified: false,
    publicBenefitIsZakatAssessment: false, spendingAuthorized: false, paymentExecuted: false,
    requiredEvidence: ['RECONCILED_BANK_AND_LEDGER', 'NONOVERLAPPING_LIABILITIES', 'REALIZED_PROFIT_AFTER_LOSSES_TAX_AND_PRIOR_ALLOCATIONS', 'OWNER_APPROVED_PURPOSE_AND_BUDGET'],
  };
}

module.exports = {ALLOCATION, planReinvestment};
