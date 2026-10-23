'use strict';

const crypto = require('node:crypto');
const offers = require('../../../commercial/revenue/v1/sheikha-first-revenue-offers-v1.json');
const { buildCustomerExperience5DStatus } = require('./sheikha-customer-experience-5d-v1');

const METHODOLOGIES = Object.freeze([
  { id: 'SCIENTIFIC_METHOD', use: 'HYPOTHESIS_EXPERIMENT_MEASUREMENT_REPLICATION' },
  { id: 'SYSTEMS_ENGINEERING', use: 'REQUIREMENTS_ARCHITECTURE_VERIFICATION_VALIDATION' },
  { id: 'PDCA', use: 'PLAN_DO_CHECK_ACT_WITH_EVIDENCE' },
  { id: 'UNIT_ECONOMICS', use: 'PRICE_VARIABLE_COST_CONTRIBUTION_BREAK_EVEN' },
  { id: 'RISK_MANAGEMENT', use: 'IDENTIFY_SCORE_TREAT_MONITOR' },
]);

const CONTROL_REGISTRY = Object.freeze([
  { id: 'ISO_9001_2015', domain: 'QUALITY', state: 'ALIGNMENT_TARGET_NOT_CERTIFIED', reviewBy: '2027-03-01' },
  { id: 'ISO_IEC_27001_2022', domain: 'INFORMATION_SECURITY', state: 'ALIGNMENT_TARGET_NOT_CERTIFIED', reviewBy: '2027-03-01' },
  { id: 'ISO_IEC_42001_2023', domain: 'AI_MANAGEMENT', state: 'ALIGNMENT_TARGET_NOT_CERTIFIED', reviewBy: '2027-03-01' },
  { id: 'SAUDI_PDPL', domain: 'PRIVACY', state: 'LEGAL_APPLICABILITY_REVIEW_REQUIRED', reviewBy: '2026-12-01' },
  { id: 'SDAIA_AI_ETHICS', domain: 'RESPONSIBLE_AI', state: 'INTERNAL_ALIGNMENT_REVIEW_REQUIRED', reviewBy: '2026-12-01' },
  { id: 'ZATCA_VAT', domain: 'TAX', state: '15_PERCENT_WHEN_LEGALLY_APPLICABLE', reviewBy: '2026-12-01' },
]);

const SEGMENTS = Object.freeze([
  { id: 'SAUDI_INDUSTRIAL_SME', priority: 1, need: 'SUPPLY_CHAIN_VISIBILITY', entryOffer: 'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1' },
  { id: 'SAUDI_LOGISTICS_OPERATOR', priority: 2, need: 'BOTTLENECK_AND_ROUTE_EVIDENCE', entryOffer: 'SHEIKHA_SUPPLY_CHAIN_DIAGNOSTIC_V1' },
  { id: 'SAUDI_AGRICULTURAL_OPERATOR', priority: 3, need: 'MEASURED_RESOURCE_AND_SITE_TWIN', entryOffer: 'SHEIKHA_360_MEASURED_TWIN_PILOT_V1' },
  { id: 'SAUDI_REAL_ESTATE_OPERATOR', priority: 4, need: 'MEASURED_ASSET_AND_SPATIAL_REVIEW', entryOffer: 'SHEIKHA_INTERACTIVE_3D_PILOT_V1' },
]);

function sha256(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function number(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildFeasibilityScenario(input = {}) {
  const offer = offers.offers.find((candidate) => candidate.id === input.offerId);
  if (!offer || offer.pricing?.type !== 'FIXED') {
    return { system: 'SHEIKHA_COMMERCIAL_FEASIBILITY_V1', status: 'FIXED_PRICE_OFFER_REQUIRED' };
  }
  const customers = Math.max(0, Math.floor(number(input.customers)));
  const variableCostPerCustomerSar = Math.max(0, number(input.variableCostPerCustomerSar));
  const monthlyFixedCostSar = Math.max(0, number(input.monthlyFixedCostSar));
  const vatRate = Math.min(1, Math.max(0, number(input.vatRate, 0.15)));
  const priceExcludingVatSar = offer.pricing.amountSar;
  const revenueExcludingVatSar = customers * priceExcludingVatSar;
  const vatSar = Number((revenueExcludingVatSar * vatRate).toFixed(2));
  const contributionPerCustomerSar = priceExcludingVatSar - variableCostPerCustomerSar;
  const contributionMarginPercent = priceExcludingVatSar
    ? Number(((contributionPerCustomerSar / priceExcludingVatSar) * 100).toFixed(2)) : null;
  const operatingResultSar = revenueExcludingVatSar
    - (customers * variableCostPerCustomerSar) - monthlyFixedCostSar;
  const breakEvenCustomers = contributionPerCustomerSar > 0
    ? Math.ceil(monthlyFixedCostSar / contributionPerCustomerSar) : null;
  const scenario = {
    offerId: offer.id,
    assumptions: { customers, variableCostPerCustomerSar, monthlyFixedCostSar, vatRate },
    priceExcludingVatSar,
    revenueExcludingVatSar,
    vatSar,
    invoiceTotalSar: Number((revenueExcludingVatSar + vatSar).toFixed(2)),
    contributionPerCustomerSar,
    contributionMarginPercent,
    operatingResultSar,
    breakEvenCustomers,
  };
  return {
    system: 'SHEIKHA_COMMERCIAL_FEASIBILITY_V1',
    status: contributionPerCustomerSar > 0 ? 'SCENARIO_CALCULATED' : 'NEGATIVE_UNIT_ECONOMICS',
    scenario,
    decision: operatingResultSar >= 0 ? 'ECONOMICALLY_POSITIVE_UNDER_ASSUMPTIONS' : 'NOT_YET_BREAK_EVEN',
    limitations: ['SCENARIO_NOT_FORECAST', 'VAT_APPLIES_ONLY_WHEN_LEGALLY_REQUIRED', 'INPUT_COSTS_REQUIRE_OWNER_EVIDENCE'],
    sha256: sha256(scenario),
  };
}

function evaluateExperiment(input = {}) {
  const baseline = number(input.baseline, NaN);
  const candidate = number(input.candidate, NaN);
  const direction = String(input.direction || 'HIGHER_IS_BETTER').toUpperCase();
  const minimumImprovementPercent = Math.max(0, number(input.minimumImprovementPercent));
  const sampleSize = Math.max(0, Math.floor(number(input.sampleSize)));
  const regressions = Math.max(0, Math.floor(number(input.regressions)));
  if (!Number.isFinite(baseline) || !Number.isFinite(candidate) || baseline === 0 || sampleSize < 1) {
    return { system: 'SHEIKHA_CONTINUOUS_EXPERIMENT_V1', status: 'EXPERIMENT_EVIDENCE_REQUIRED', promote: false };
  }
  const raw = direction === 'LOWER_IS_BETTER' ? baseline - candidate : candidate - baseline;
  const improvementPercent = Number(((raw / Math.abs(baseline)) * 100).toFixed(3));
  const promote = improvementPercent >= minimumImprovementPercent && regressions === 0;
  const result = { baseline, candidate, direction, minimumImprovementPercent, improvementPercent, sampleSize, regressions };
  return {
    system: 'SHEIKHA_CONTINUOUS_EXPERIMENT_V1',
    status: promote ? 'CANDIDATE_ELIGIBLE_FOR_HUMAN_REVIEW' : 'HOLD_OR_REJECT',
    promote: false,
    humanApprovalRequired: promote,
    result,
    rule: 'A_NEW_EXPERIMENT_MUST_BE_MEASURABLY_BETTER_AND_NON_REGRESSIVE_NEVER_ASSUMED_BETTER',
    sha256: sha256(result),
  };
}

function buildCommercialOperatingStatus() {
  const base = {
    system: 'SHEIKHA_COMMERCIAL_OPERATING_SYSTEM_V1',
    status: 'CONTROLLED_SAUDI_PILOT_OPERATING_MODEL_ACTIVE',
    marketScope: 'SAUDI_ARABIA_B2B_FIRST',
    segments: SEGMENTS,
    methodologies: METHODOLOGIES,
    controlRegistry: CONTROL_REGISTRY,
    offerCount: offers.offers.length,
    automation: {
      periodicControlReviewDatesMachineReadable: true,
      automaticExternalCertificationOrLicenseIssuance: false,
      customerSpecificPolicyVersioningRequired: true,
      experimentPromotionRequiresHumanReview: true,
    },
    releaseGates: ['LEGAL', 'SECURITY', 'PRIVACY', 'QUALITY', 'FINANCE', 'OPERATIONS', 'CUSTOMER_ACCEPTANCE'],
    customerExperience5D: buildCustomerExperience5DStatus(),
  };
  return { ...base, sha256: sha256(base) };
}

module.exports = { CONTROL_REGISTRY, METHODOLOGIES, SEGMENTS, buildCommercialOperatingStatus, buildFeasibilityScenario, evaluateExperiment };
