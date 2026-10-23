'use strict';

const crypto = require('node:crypto');
const {quoteCosts, PURPOSES} = require('./sheikha-foundry-commercial-v1');

const PARTIES = Object.freeze(['SHEIKHA', 'CUSTOMER', 'THIRD_PARTY']);
const EXECUTION = Object.freeze(['SHEIKHA_MANAGED', 'CUSTOMER_SELF', 'THIRD_PARTY_MANAGED']);
const RESOURCE_CATALOG = Object.freeze({
  knowledge: ['DOMAIN_EXPERTISE', 'DATA_RIGHTS_AND_QUALITY', 'MODEL_LICENSE_AND_LINEAGE', 'TRAINING_ENGINEERING', 'INDEPENDENT_EVALUATION', 'LEGAL_AND_FINANCIAL_REVIEW'],
  technical: ['CPU', 'CUDA', 'ROCM', 'TPU', 'TRAINIUM', 'CEREBRAS', 'RAM_AND_STORAGE', 'POWER_AND_COOLING', 'NETWORK_AND_REGION', 'ENCRYPTED_BACKUP_AND_KEY_RECOVERY'],
  skills: ['BEGINNER', 'PRACTITIONER', 'EXPERT'],
  execution: EXECUTION,
});

function obj(value, allowed) {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).some(k => !allowed.includes(k))) throw new Error('INVALID_SOURCING_FIELDS');
}
function ref(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9._:/-]{0,159}$/.test(value)) throw new Error('INVALID_SOURCING_REFERENCE');
  return value;
}
function uint(value, max = 10000000000, min = 0) {
  if (!Number.isSafeInteger(value) || value < min || value > max) throw new Error('INVALID_SOURCING_AMOUNT_OR_LIMIT');
  return value;
}
function choice(value, allowed) {
  if (!allowed.includes(value)) throw new Error('INVALID_SOURCING_CHOICE');
  return value;
}
function sum(values) { return uint(values.reduce((a, b) => a + b, 0)); }
function ceil(n, d) { return Number((n + d - 1n) / d); }
function digest(value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); }

function modelProfile(input) {
  obj(input, ['supplier', 'modelRef', 'licenseRef', 'baseSha256', 'rightsBasis', 'parameterCount', 'weightBits', 'storedWeightBytes', 'newArtifactKind']);
  if (typeof input.baseSha256 !== 'string' || !/^[a-f0-9]{64}$/.test(input.baseSha256)) throw new Error('INVALID_BASE_SHA256');
  const parameterCount = uint(input.parameterCount, 1000000000000, 1);
  const weightBits = choice(input.weightBits, [2, 4, 8, 16, 32]);
  return {
    supplier: choice(input.supplier, PARTIES), modelRef: ref(input.modelRef), licenseRef: ref(input.licenseRef), baseSha256: input.baseSha256,
    rightsBasis: choice(input.rightsBasis, ['ORIGINAL_TITLE_CLAIM', 'UPSTREAM_LICENSE', 'CLOSED_API']),
    parameterCount, weightBits, storedWeightBytes: uint(input.storedWeightBytes, 32 * 1024 ** 4, 1),
    theoreticalWeightBytes: ceil(BigInt(parameterCount) * BigInt(weightBits), 8n),
    newArtifactKind: choice(input.newArtifactKind, ['ADAPTER', 'FULL_WEIGHTS']),
    measurementsVerified: false, trainingMemoryInferredFromWeightBytes: false, upstreamOwnershipTransferred: false,
  };
}

function economics(input) {
  obj(input, ['purpose', 'customerBudgetHalala', 'availableProjectCashHalala', 'dedicatedBenefitBudgetHalala', 'minimumMarginBps', 'costStressBps', 'maximumDeliveryDays']);
  return {
    purpose: choice(input.purpose, PURPOSES), customerBudgetHalala: uint(input.customerBudgetHalala),
    availableProjectCashHalala: uint(input.availableProjectCashHalala), dedicatedBenefitBudgetHalala: uint(input.dedicatedBenefitBudgetHalala),
    minimumMarginBps: uint(input.minimumMarginBps, 9999), costStressBps: uint(input.costStressBps, 10000),
    maximumDeliveryDays: uint(input.maximumDeliveryDays, 365, 1),
  };
}

function evaluateOption(input, model, e) {
  obj(input, ['id', 'execution', 'computeOwner', 'hardware', 'memoryGiB', 'requiredMemoryGiB', 'operatorSkill', 'recipeRef', 'deliveryDays', 'priceExTaxHalala', 'customerOtherCostHalala', 'thirdPartyFeeHalala', 'exitReserveHalala', 'rightsFeeHalala', 'royaltyBps', 'pricing']);
  const id = ref(input.id);
  const execution = choice(input.execution, EXECUTION);
  const computeOwner = choice(input.computeOwner, [...PARTIES, 'UNASSIGNED']);
  const hardware = choice(input.hardware, ['CPU', 'CUDA', 'ROCM', 'TPU', 'TRAINIUM', 'CEREBRAS', 'UNASSIGNED']);
  if ((hardware === 'UNASSIGNED') !== (computeOwner === 'UNASSIGNED')) throw new Error('UNASSIGNED_RESOURCE_MISMATCH');
  const memoryGiB = uint(input.memoryGiB, 1048576);
  const requiredMemoryGiB = uint(input.requiredMemoryGiB, 1048576, 1);
  const operatorSkill = choice(input.operatorSkill, RESOURCE_CATALOG.skills);
  const deliveryDays = uint(input.deliveryDays, 365, 1);
  const recipeRef = ref(input.recipeRef);
  const priceExTaxHalala = uint(input.priceExTaxHalala);
  const customerOtherCostHalala = uint(input.customerOtherCostHalala);
  const thirdPartyFeeHalala = uint(input.thirdPartyFeeHalala);
  const exitReserveHalala = uint(input.exitReserveHalala);
  const rightsFeeHalala = uint(input.rightsFeeHalala);
  const royaltyBps = uint(input.royaltyBps, 10000);
  const commercial = ['COMMERCIAL', 'COMMERCIAL_RESALE'].includes(e.purpose);
  if (!commercial && (priceExTaxHalala || royaltyBps)) throw new Error('NONCOMMERCIAL_CASE_MUST_USE_ZERO_SALES_AND_ROYALTY');
  const originalCosts = quoteCosts(input.pricing);
  if (originalCosts.assumptions.marginBps !== e.minimumMarginBps) throw new Error('OPTION_MARGIN_MUST_MATCH_COMPARISON');
  const pricing = quoteCosts({...input.pricing, deliveryHalala: sum([input.pricing.deliveryHalala, thirdPartyFeeHalala, exitReserveHalala, rightsFeeHalala])});
  const royaltyHalala = ceil(BigInt(priceExTaxHalala) * BigInt(royaltyBps), 10000n);
  const contributionHalala = priceExTaxHalala - pricing.reservedCostHalala - royaltyHalala;
  const stressedCostHalala = ceil(BigInt(pricing.reservedCostHalala) * BigInt(10000 + e.costStressBps), 10000n);
  const stressedContributionHalala = priceExTaxHalala - stressedCostHalala - royaltyHalala;
  const denominator = 10000 - e.minimumMarginBps - royaltyBps;
  // The suggested price conservatively covers upward royalty rounding; acceptance uses the exact margin below.
  const minimumPriceExTaxHalala = denominator > 0 ? ceil(BigInt(pricing.reservedCostHalala + (royaltyBps ? 1 : 0)) * 10000n, BigInt(denominator)) : null;
  const customerTotalCostHalala = sum([priceExTaxHalala, customerOtherCostHalala]);
  const financialBlockers = [];
  if (commercial) {
    if (!priceExTaxHalala || minimumPriceExTaxHalala === null || BigInt(contributionHalala) * 10000n < BigInt(priceExTaxHalala) * BigInt(e.minimumMarginBps)) financialBlockers.push('MINIMUM_MARGIN_NOT_MET');
    if (stressedContributionHalala < 0) financialBlockers.push('LOSS_UNDER_COST_STRESS');
    if (customerTotalCostHalala > e.customerBudgetHalala) financialBlockers.push('CUSTOMER_TOTAL_BUDGET_EXCEEDED');
  } else if (pricing.reservedCostHalala > e.dedicatedBenefitBudgetHalala) financialBlockers.push('DEDICATED_BENEFIT_BUDGET_INSUFFICIENT');
  if (pricing.reservedCostHalala > e.availableProjectCashHalala) financialBlockers.push('PROJECT_CASH_INSUFFICIENT');
  const technicalBlockers = [];
  if (hardware === 'UNASSIGNED') technicalBlockers.push('COMPUTE_NOT_ASSIGNED');
  if (memoryGiB < requiredMemoryGiB) technicalBlockers.push('DECLARED_MEMORY_INSUFFICIENT');
  if (operatorSkill === 'BEGINNER') technicalBlockers.push('TRAINING_SKILL_OR_SUPERVISION_REQUIRED');
  if (deliveryDays > e.maximumDeliveryDays) technicalBlockers.push('DELIVERY_DEADLINE_EXCEEDED');
  if (model.rightsBasis === 'CLOSED_API') technicalBlockers.push('CLOSED_API_DOES_NOT_EXPORT_BASE_WEIGHTS');
  const comparisonEligible = !financialBlockers.length && !technicalBlockers.length;
  const operatorParty = {SHEIKHA_MANAGED: 'SHEIKHA', CUSTOMER_SELF: 'CUSTOMER', THIRD_PARTY_MANAGED: 'THIRD_PARTY'}[execution];
  return {
    id, execution, operatorParty, resourceProfile: {computeOwner, hardware, memoryGiB, requiredMemoryGiB, operatorSkill, recipeRef, deliveryDays, benchmarkVerified: false},
    financials: {
      currency: 'SAR', unit: 'HALALA', baseServiceCostHalala: originalCosts.directCostHalala,
      thirdPartyFeeHalala, exitReserveHalala, rightsFeeHalala, royaltyBps, royaltyHalala,
      reservedCostHalala: pricing.reservedCostHalala, stressedCostHalala, priceExTaxHalala, customerOtherCostHalala, customerTotalCostHalala,
      contributionHalala, stressedContributionHalala, minimumPriceExTaxHalala,
      marginBps: priceExTaxHalala ? Number(BigInt(contributionHalala) * 10000n / BigInt(priceExTaxHalala)) : null,
      inputsAndCashUnverified: true, sameCostMustNotAppearInMultipleBuckets: true,
    },
    financialBlockers, technicalBlockers, comparisonEligible,
    decision: financialBlockers.length ? 'DO_NOT_CONTRACT_AT_PROPOSED_TERMS' : technicalBlockers.length ? 'HOLD_RESOURCE_OR_RIGHTS_REVIEW' : 'CANDIDATE_FOR_DUE_DILIGENCE_ONLY',
    contract: {
      firstParty: 'SHEIKHA_PLATFORM_AND_INTEGRATION', secondParty: 'CUSTOMER_BENEFICIARY_OR_LICENSEE',
      thirdPartyRole: model.supplier === 'THIRD_PARTY' ? 'MODEL_RIGHTSHOLDER_OR_INVESTOR_WITH_SEPARATE_EXECUTION_SCOPE' : 'OPTIONAL_SCOPED_TRAINER_OR_COMPUTE_SUPPLIER',
      baseRightsholder: 'UNVERIFIED_CHAIN_OF_TITLE_NOT_DETERMINED_BY_SUPPLIER_NAME',
      proposedNewWeightsOwner: 'SHEIKHA_SUBJECT_TO_ORIGINAL_TITLE_OR_SIGNED_ASSIGNMENT_OF_OWNABLE_NEW_ARTIFACTS',
      platformOwnershipTransferred: false, existingBaseOwnershipTransferred: false, custodyIsAssignment: false,
      toolsAndAccessScope: ['PINNED_RECIPE_ONLY', 'NAMED_DEVICE_AND_REGION', 'SELECTED_TENANT_FILES_ONLY', 'CAPPED_COMPUTE_AND_TIME', 'APPROVED_ARTIFACT_EXPORT_ONLY'],
      subcontractingAuthorized: false, customerDataReuseAuthorized: false, weightsAssigned: false,
      requiredEvidence: ['SIGNED_STATEMENT_OF_WORK', 'UPSTREAM_AND_DATA_RIGHTS', 'NEW_ARTIFACT_ASSIGNMENT_AND_CONSIDERATION_IF_REQUIRED', 'CUSTODY_AND_RETENTION_SCOPE', 'INDEPENDENT_EVALUATION_AND_RESTORE', 'RESOURCE_BENCHMARK', 'VERIFIED_FUNDS_AND_BUDGET', 'PREAGREED_EXIT_AND_ACCEPTED_WORK_SETTLEMENT'],
      exitPolicy: 'OMIT_BEFORE_SIGNATURE_OR_REVIEW_NEGOTIATED_TERMINATION_AFTER_SIGNATURE',
    },
    trainingExecuted: false, externalTransferAuthorized: false, contractActivated: false, productionReady: false,
  };
}

function compareTrainingSourcing(input) {
  obj(input, ['projectRef', 'objectiveRef', 'evaluationRef', 'parties', 'model', 'economics', 'options']);
  const projectRef = ref(input.projectRef), objectiveRef = ref(input.objectiveRef), evaluationRef = ref(input.evaluationRef);
  obj(input.parties, ['sheikhaRef', 'customerRef', 'thirdPartyRef']);
  const parties = {sheikhaRef: ref(input.parties.sheikhaRef), customerRef: ref(input.parties.customerRef)};
  if (input.parties.thirdPartyRef !== undefined) parties.thirdPartyRef = ref(input.parties.thirdPartyRef);
  if (new Set(Object.values(parties)).size !== Object.values(parties).length) throw new Error('PARTY_REFERENCES_MUST_BE_DISTINCT');
  const model = modelProfile(input.model);
  const economicAssumptions = economics(input.economics);
  if (!Array.isArray(input.options) || input.options.length < 1 || input.options.length > 12) throw new Error('OPTIONS_MUST_NUMBER_1_TO_12');
  const options = input.options.map(o => evaluateOption(o, model, economicAssumptions));
  if (new Set(options.map(o => o.id)).size !== options.length) throw new Error('DUPLICATE_OPTION_ID');
  if (!parties.thirdPartyRef && (model.supplier === 'THIRD_PARTY' || options.some(o => o.operatorParty === 'THIRD_PARTY' || o.resourceProfile.computeOwner === 'THIRD_PARTY' || o.financials.thirdPartyFeeHalala || o.financials.royaltyBps))) throw new Error('NAMED_THIRD_PARTY_REQUIRED');
  const commercial = ['COMMERCIAL', 'COMMERCIAL_RESALE'].includes(economicAssumptions.purpose);
  const score = o => commercial ? o.financials.customerTotalCostHalala : o.financials.reservedCostHalala;
  const candidates = options.filter(o => o.comparisonEligible).sort((a, b) => score(a) - score(b) || a.resourceProfile.deliveryDays - b.resourceProfile.deliveryDays || a.id.localeCompare(b.id));
  const result = {
    system: 'SHEIKHA_TRAINING_SOURCING_FEASIBILITY_V1', classification: 'CONFIDENTIAL_STUDY_ONLY',
    projectRef, objectiveRef, evaluationRef, parties, model, economicAssumptions, resourceCatalog: RESOURCE_CATALOG,
    options, proposedEconomicSelection: candidates[0]?.id || null,
    selectionRule: commercial ? 'LOWEST_CUSTOMER_TOTAL_COST_AMONG_DECLARED_FIT_AND_MARGIN_CANDIDATES_THEN_DELIVERY_DAYS' : 'LOWEST_FUNDED_COST_PENDING_BENEFIT_REVIEW',
    equalQualityAndRightsVerified: false, contractsSigned: false,
    governanceOrder: ['ECONOMIC_AND_RESOURCE_SCREEN', 'RIGHTS_AND_CONTRACT_REVIEW', 'SECURITY_AND_DATA_REVIEW', 'RESOURCE_BENCHMARK', 'BUDGET_AND_EXECUTION_APPROVAL', 'TRAIN_AND_EVALUATE', 'CUSTODY_AND_ACCEPTANCE', 'REALIZED_PROFIT_REINVESTMENT_REVIEW'],
    status: candidates.length ? 'STUDY_CANDIDATES_EXIST_NOT_AUTHORIZED' : 'NO_FEASIBLE_OPTION_AT_DECLARED_TERMS',
    executionAuthorized: false, providerActivated: false, contractTerminationExecuted: false,
  };
  return {...result, studySha256: digest(result), digestIsSignature: false};
}

function reviewTrainingExit(input) {
  obj(input, ['projectRef', 'contractRef', 'stage', 'exitClauseRef', 'remainingRevenueHalala', 'avoidableRemainingCostHalala', 'acceptedWorkPayableHalala', 'otherUnavoidableLiabilitiesHalala', 'customerRefundDueHalala', 'estimatedExitFeeHalala', 'approvedExitCapHalala']);
  const projectRef = ref(input.projectRef), contractRef = ref(input.contractRef);
  const stage = choice(input.stage, ['DRAFT', 'SIGNED_NOT_STARTED', 'RUNNING']);
  const amounts = Object.fromEntries(['remainingRevenueHalala', 'avoidableRemainingCostHalala', 'acceptedWorkPayableHalala', 'otherUnavoidableLiabilitiesHalala', 'customerRefundDueHalala', 'estimatedExitFeeHalala', 'approvedExitCapHalala'].map(k => [k, uint(input[k])]));
  if (stage === 'DRAFT' && (input.exitClauseRef !== undefined || amounts.acceptedWorkPayableHalala || amounts.otherUnavoidableLiabilitiesHalala || amounts.customerRefundDueHalala || amounts.estimatedExitFeeHalala)) throw new Error('DRAFT_CANNOT_HIDE_EXISTING_CONTRACT_OBLIGATIONS');
  const exitClauseRef = stage === 'DRAFT' ? null : ref(input.exitClauseRef);
  const commonLiabilities = sum([amounts.acceptedWorkPayableHalala, amounts.otherUnavoidableLiabilitiesHalala]);
  const exitSpecificCostHalala = sum([amounts.estimatedExitFeeHalala, amounts.customerRefundDueHalala]);
  const continuationNetHalala = amounts.remainingRevenueHalala - amounts.avoidableRemainingCostHalala - commonLiabilities;
  const exitNetHalala = -exitSpecificCostHalala - commonLiabilities;
  const exitAdvantageHalala = exitNetHalala - continuationNetHalala;
  const result = {
    system: 'SHEIKHA_TRAINING_EXIT_ECONOMIC_REVIEW_V1', classification: 'CONFIDENTIAL_REVIEW_ONLY', projectRef, contractRef, stage, exitClauseRef,
    inputs: amounts, continuationNetHalala, exitNetHalala, exitAdvantageHalala, exitSpecificCostHalala,
    exitTotalCashObligationHalala: commonLiabilities + exitSpecificCostHalala,
    recommendation: exitAdvantageHalala <= 0 ? 'NO_ECONOMIC_EXIT_ADVANTAGE_AT_DECLARED_TERMS' : stage === 'DRAFT' ? 'OMIT_OPTION_BEFORE_SIGNATURE' : commonLiabilities + exitSpecificCostHalala > amounts.approvedExitCapHalala ? 'HOLD_EXIT_CAP_AND_CONTRACT_REVIEW' : 'CONSIDER_NEGOTIATED_EXIT_AFTER_LEGAL_REVIEW',
    signatureVerified: false, exitClauseEnforceabilityVerified: false, acceptedWorkWaived: false,
    cancellationAuthorized: false, contractTerminationExecuted: false, paymentExecuted: false,
    nextRequirements: ['VERIFY_NONOVERLAPPING_FUTURE_CASH_FLOWS', 'VERIFY_COUNTERPARTY_AND_SIGNED_EXIT_CLAUSE', 'SETTLE_ACCEPTED_WORK_AND_REFUNDS', 'RECOVER_WEIGHTS_AND_KEYS_WITHIN_RIGHTS', 'APPROVE_AND_RECORD_ANY_TERMINATION_SEPARATELY'],
  };
  return {...result, reviewSha256: digest(result), digestIsSignature: false};
}

module.exports = {RESOURCE_CATALOG, EXECUTION, compareTrainingSourcing, reviewTrainingExit};
