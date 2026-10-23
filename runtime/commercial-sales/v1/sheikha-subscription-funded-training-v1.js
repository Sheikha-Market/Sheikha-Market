'use strict';

const DEFAULT_ALLOCATION = Object.freeze({
  operationsBasisPoints: 3500,
  productAndSalesBasisPoints: 2500,
  trainingBasisPoints: 2000,
  reserveBasisPoints: 1000,
  operatingProfitBasisPoints: 1000
});

function roundCurrency(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

function validateAllocation(allocation) {
  const entries = Object.entries(allocation);
  const valid = entries.every(([, value]) =>
    Number.isInteger(value) && value >= 0
  );
  const totalBasisPoints = entries.reduce(
    (sum, [, value]) => sum + value,
    0
  );

  if (!valid || totalBasisPoints !== 10000) {
    throw new Error('INVALID_CASH_ALLOCATION_POLICY');
  }
}

function allocateCollectedCash(input = {}) {
  const collectedCashSar = Number(input.collectedCashSar || 0);
  const existingTrainingFundSar = Number(
    input.existingTrainingFundSar || 0
  );
  const plannedTrainingRunSar = Number(
    input.plannedTrainingRunSar || 0
  );
  const contingencyRate = Number(
    input.contingencyRate === undefined
      ? 0.2
      : input.contingencyRate
  );
  const allocation = input.allocation || DEFAULT_ALLOCATION;

  if (
    !Number.isFinite(collectedCashSar) ||
    collectedCashSar < 0 ||
    !Number.isFinite(existingTrainingFundSar) ||
    existingTrainingFundSar < 0 ||
    !Number.isFinite(plannedTrainingRunSar) ||
    plannedTrainingRunSar < 0 ||
    !Number.isFinite(contingencyRate) ||
    contingencyRate < 0 ||
    contingencyRate > 1
  ) {
    throw new Error('INVALID_CASHFLOW_INPUT');
  }

  validateAllocation(allocation);

  const amountFor = (basisPoints) => roundCurrency(
    collectedCashSar * (basisPoints / 10000)
  );
  const allocations = {
    operationsSar: amountFor(allocation.operationsBasisPoints),
    productAndSalesSar: amountFor(
      allocation.productAndSalesBasisPoints
    ),
    trainingSar: amountFor(allocation.trainingBasisPoints),
    reserveSar: amountFor(allocation.reserveBasisPoints),
    operatingProfitSar: amountFor(
      allocation.operatingProfitBasisPoints
    )
  };
  const trainingFundAfterCollectionSar = roundCurrency(
    existingTrainingFundSar + allocations.trainingSar
  );
  const requiredTrainingBudgetSar = roundCurrency(
    plannedTrainingRunSar * (1 + contingencyRate)
  );
  const budgetSufficient =
    plannedTrainingRunSar > 0 &&
    trainingFundAfterCollectionSar >= requiredTrainingBudgetSar;

  return {
    system: 'SHEIKHA_SUBSCRIPTION_FUNDED_TRAINING_V1',
    collectedCashSar,
    recognitionBoundary:
      'COLLECTED_CASH_IS_NOT_REVENUE_UNTIL_DELIVERY_AND_ACCEPTANCE',
    allocationBasisPoints: allocation,
    allocations,
    trainingFundAfterCollectionSar,
    plannedTrainingRunSar,
    contingencyRate,
    requiredTrainingBudgetSar,
    paidTrainingDecision: budgetSufficient
      ? 'FUNDED_PENDING_EXECUTION_APPROVAL'
      : 'HOLD_UNTIL_FULLY_FUNDED',
    budgetSufficient,
    fundingEvidenceVerified: false,
    paidTrainingAuthorized: false,
    executionApprovalRequired: true,
    freeLocalImprovementAllowed: true,
    automaticTopUpAllowed: false,
    borrowingForTrainingAllowed: false,
    customerDataTrainingDefault: 'DENY',
    customerDataTrainingRequirement:
      'EXPLICIT_CONSENT_LICENSE_PRIVACY_REVIEW_AND_DEIDENTIFICATION'
  };
}

function fundingPolicy() {
  return allocateCollectedCash({});
}

module.exports = {
  DEFAULT_ALLOCATION,
  allocateCollectedCash,
  fundingPolicy
};
