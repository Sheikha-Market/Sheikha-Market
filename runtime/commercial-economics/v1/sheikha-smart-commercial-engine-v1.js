'use strict';

const crypto = require('node:crypto');

const CHANNELS = Object.freeze([
  'WEIGHT_SALE',
  'TERM_WEIGHT_LICENSE',
  'SUBSCRIPTION',
  'USAGE_BASED',
  'PRIVATE_DEPLOYMENT',
  'TRAINING_AS_A_SERVICE',
  'REVENUE_SHARE',
  'HYBRID'
]);

function sha256(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function money(value, field) {
  const number = value ?? 0;
  if (typeof number !== 'number' || !Number.isFinite(number) || number < 0 || number > 1_000_000_000) {
    throw new RangeError(`${field}_MUST_BE_FINITE_NON_NEGATIVE_SAR`);
  }
  return Math.round((number + Number.EPSILON) * 100) / 100;
}

function positiveInteger(value, field) {
  const number = value;
  if (typeof number !== 'number' || !Number.isSafeInteger(number) || number < 0 || number > 1_000_000_000) {
    throw new RangeError(`${field}_MUST_BE_NON_NEGATIVE_INTEGER`);
  }
  return number;
}

function ratio(value, field) {
  const number = value ?? 0;
  if (typeof number !== 'number' || !Number.isFinite(number) || number < 0 || number > 1) {
    throw new RangeError(`${field}_MUST_BE_BETWEEN_ZERO_AND_ONE`);
  }
  return number;
}

const cents = value => BigInt(Math.round(value * 100));
function sar(value) {
  if (value > 100_000_000_000n || value < -100_000_000_000n) {
    throw new RangeError('PROJECTION_EXCEEDS_SUPPORTED_SAR_RANGE');
  }
  return Number(value) / 100;
}
const nonNegative = value => value > 0n ? value : 0n;
const portion = (value, rate) => (value * BigInt(Math.round(rate * 1_000_000)) + 500_000n) / 1_000_000n;

function assessCommercialCase(input = {}) {
  const channel = String(input.channel || '').toUpperCase();
  if (!CHANNELS.includes(channel)) throw new RangeError('SUPPORTED_CHANNEL_REQUIRED');

  const units = positiveInteger(input.monthlyUnits, 'MONTHLY_UNITS');
  const pricePerUnitSar = money(input.pricePerUnitSar, 'PRICE_PER_UNIT');
  const variableCostPerUnitSar = money(input.variableCostPerUnitSar, 'VARIABLE_COST_PER_UNIT');
  const monthlyFixedCostSar = money(input.monthlyFixedCostSar, 'MONTHLY_FIXED_COST');
  const setupRevenueSar = money(input.setupRevenueSar, 'SETUP_REVENUE');
  const setupCostSar = money(input.setupCostSar, 'SETUP_COST');
  const customerRevenueSar = money(input.customerRevenueSar, 'CUSTOMER_REVENUE');
  const revenueShareRate = ratio(input.revenueShareRate, 'REVENUE_SHARE_RATE');
  const taxAndStatutoryReserveRate = ratio(
    input.taxAndStatutoryReserveRate,
    'TAX_AND_STATUTORY_RESERVE_RATE'
  );

  const blockers = [];
  const warnings = [];
  const ownedWeights = input.ownedWeights === true;
  const commercialUseRights = input.commercialUseRights === true;
  const redistributionRights = input.redistributionRights === true;
  const serviceResaleRights = input.serviceResaleRights === true;

  if (!commercialUseRights) blockers.push('COMMERCIAL_USE_RIGHTS_REQUIRED');
  if (channel === 'WEIGHT_SALE') {
    if (!ownedWeights) blockers.push('OWNED_WEIGHTS_REQUIRED_FOR_SALE');
    if (!redistributionRights) blockers.push('WEIGHT_TRANSFER_RIGHT_REQUIRED');
    warnings.push('ONE_TIME_WEIGHT_SALE_REDUCES_RECURRING_REVENUE_AND_CONTROL');
  }
  if (channel === 'TERM_WEIGHT_LICENSE' && !redistributionRights) {
    blockers.push('WEIGHT_LICENSE_RIGHT_REQUIRED');
  }
  if (['USAGE_BASED', 'SUBSCRIPTION', 'HYBRID', 'PRIVATE_DEPLOYMENT'].includes(channel) &&
      input.externalBaseModel === true && !serviceResaleRights) {
    blockers.push('EXTERNAL_MODEL_SERVICE_RESALE_RIGHT_REQUIRED');
  }
  if (channel === 'REVENUE_SHARE' && revenueShareRate === 0) {
    blockers.push('POSITIVE_REVENUE_SHARE_RATE_REQUIRED');
  }
  warnings.push('CUSTOMER_DATA_EXCLUDED_FROM_MODEL_TRAINING');
  warnings.push('DECLARATIONS_ARE_NOT_VERIFIED_RIGHTS_OR_MARKET_DEMAND');
  warnings.push('RESERVE_RATE_IS_A_SCENARIO_NOT_A_TAX_CALCULATION');
  const shareChannel = ['REVENUE_SHARE', 'HYBRID'].includes(channel);
  if (!shareChannel && (customerRevenueSar !== 0 || revenueShareRate !== 0)) {
    throw new RangeError('REVENUE_SHARE_ONLY_FOR_SHARE_OR_HYBRID_CHANNEL');
  }
  if (channel === 'REVENUE_SHARE' && (pricePerUnitSar !== 0 || variableCostPerUnitSar !== 0 || units !== 0)) {
    throw new RangeError('USE_HYBRID_FOR_UNIT_AND_REVENUE_SHARE_COMBINATION');
  }

  const sales = cents(pricePerUnitSar) * BigInt(units);
  const share = portion(cents(customerRevenueSar), revenueShareRate);
  const variable = cents(variableCostPerUnitSar) * BigInt(units);
  const revenue = sales + cents(setupRevenueSar) + share;
  const cost = variable + cents(monthlyFixedCostSar) + cents(setupCostSar);
  const profit = revenue - cost;
  const reserve = portion(nonNegative(profit), taxAndStatutoryReserveRate);
  const projectedSurplus = nonNegative(profit - reserve);
  const contribution = cents(pricePerUnitSar) - cents(variableCostPerUnitSar);
  const unitRevenueSar = sar(sales);
  const recurringRevenueSar = ['SUBSCRIPTION', 'TERM_WEIGHT_LICENSE', 'HYBRID'].includes(channel)
    ? unitRevenueSar : 0;
  const revenueShareSar = sar(share);
  const grossRevenueSar = sar(revenue);
  const variableCostSar = sar(variable);
  const totalCostSar = sar(cost);
  const contributionPerUnitSar = sar(contribution);
  const operatingProfitBeforeReserveSar = sar(profit);
  const statutoryReserveSar = sar(reserve);
  const projectedSurplusAfterReserveSar = sar(projectedSurplus);
  const grossMarginRate = grossRevenueSar > 0
    ? Math.round(((grossRevenueSar - variableCostSar - setupCostSar) / grossRevenueSar) * 10000) / 10000
    : 0;
  const breakEven = fixed => contribution > 0n
    ? Number((nonNegative(fixed) + contribution - 1n) / contribution) : null;
  const breakEvenUnits = breakEven(cents(monthlyFixedCostSar));
  const firstPeriodBreakEvenUnits = breakEven(cents(monthlyFixedCostSar) + cents(setupCostSar)
    - cents(setupRevenueSar) - share);

  if (contributionPerUnitSar <= 0 && units > 0) blockers.push('NON_POSITIVE_UNIT_CONTRIBUTION');
  if (grossMarginRate < 0.4) warnings.push('GROSS_MARGIN_BELOW_RECOMMENDED_FORTY_PERCENT');
  if (input.signedContract === true) blockers.push('HTTP_INPUT_CANNOT_SELF_ASSERT_SIGNED_CONTRACT');
  if (input.paymentVerified === true) blockers.push('HTTP_INPUT_CANNOT_SELF_ASSERT_VERIFIED_PAYMENT');

  const result = {
    system: 'SHEIKHA_SMART_COMMERCIAL_ENGINE_V1',
    channel,
    status: blockers.length ? 'COMMERCIAL_CASE_BLOCKED' : 'SCENARIO_CALCULATED_NOT_SALE_AUTHORIZATION',
    forecastOnly: true,
    marketDemandVerified: false,
    rightsVerified: false,
    saleAutomaticallyExecuted: false,
    paymentCaptured: false,
    economics: {
      monthlyUnits: units,
      unitRevenueSar,
      recurringRevenueSar,
      setupRevenueSar,
      revenueShareSar,
      grossRevenueSar,
      variableCostSar,
      monthlyFixedCostSar,
      setupCostSar,
      totalCostSar,
      contributionPerUnitSar,
      grossMarginRate,
      operatingProfitBeforeReserveSar,
      statutoryReserveSar,
      projectedSurplusAfterReserveSar,
      distributableCashSar: 0,
      cashEvidenceAvailable: false,
      breakEvenUnits,
      firstPeriodBreakEvenUnits
    },
    reinvestmentPreview: {
      forecastOnly: true,
      productAndModelDevelopmentSar: sar(projectedSurplus * 40n / 100n),
      securityAndReliabilitySar: sar(projectedSurplus * 20n / 100n),
      salesAndCustomerSuccessSar: sar(projectedSurplus * 20n / 100n),
      liquidityReserveSar: sar(projectedSurplus * 15n / 100n),
      publicBenefitSar: sar(projectedSurplus - projectedSurplus * 40n / 100n
        - projectedSurplus * 20n / 100n - projectedSurplus * 20n / 100n - projectedSurplus * 15n / 100n),
      spendingAuthorized: false,
      condition: 'ONLY_AFTER_REALIZED_CASH_TAX_LIABILITIES_AND_HUMAN_APPROVAL'
    },
    rightsDeclarations: {
      ownedWeights,
      commercialUseRights,
      redistributionRights,
      serviceResaleRights,
    },
    rights: {
      ownedWeights: false,
      verificationStatus: 'NOT_VERIFIED_BY_PREVIEW',
      customerDataTrainingAllowed: false
    },
    blockers,
    warnings
  };

  return { ...result, decisionSha256: sha256(result) };
}

function recommendChannels(input = {}) {
  const ownedWeights = input.ownedWeights === true;
  const recurringDemand = input.recurringDemand === true;
  const customerRequiresCustody = input.customerRequiresCustody === true;
  const outcomeMeasurable = input.outcomeMeasurable === true;

  const ranked = [
    { channel: 'HYBRID', score: recurringDemand ? 95 : 82, reason: 'SETUP_PLUS_SUBSCRIPTION_PLUS_GOVERNED_USAGE' },
    { channel: 'PRIVATE_DEPLOYMENT', score: customerRequiresCustody ? 92 : 76, reason: 'HIGH_VALUE_PRIVACY_AND_INTEGRATION' },
    { channel: 'SUBSCRIPTION', score: recurringDemand ? 90 : 70, reason: 'PREDICTABLE_RECURRING_REVENUE' },
    { channel: 'TRAINING_AS_A_SERVICE', score: 78, reason: 'CUSTOMER_SPECIFIC_VALUE_WITH_SEPARATE_COMPUTE' },
    { channel: 'USAGE_BASED', score: 75, reason: 'LOW_ENTRY_FRICTION_AND_COST_ALIGNMENT' },
    { channel: 'REVENUE_SHARE', score: outcomeMeasurable ? 74 : 42, reason: 'ONLY_WITH_AUDITABLE_OUTCOME_AND_BASE_FEE' },
    { channel: 'TERM_WEIGHT_LICENSE', score: ownedWeights ? 68 : 0, reason: 'RETAINS_OWNERSHIP_WITH_BOUNDED_RIGHTS' },
    { channel: 'WEIGHT_SALE', score: ownedWeights ? 35 : 0, reason: 'EXCEPTIONAL_HIGH_PRICE_EXIT_ONLY' }
  ].sort((a, b) => b.score - a.score);

  return {
    system: 'SHEIKHA_COMMERCIAL_CHANNEL_RECOMMENDER_V1',
    method: 'STATIC_HEURISTIC_NOT_MEASURED_RETURN_OR_DEMAND',
    recommended: ranked,
    primary: ranked[0].channel,
    automaticContractSignatureAllowed: false,
    automaticPaymentClaimAllowed: false,
    decisionSha256: sha256(ranked)
  };
}

module.exports = { CHANNELS, assessCommercialCase, recommendChannels };
