'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const funding = require(
  '../runtime/commercial-sales/v1/' +
  'sheikha-subscription-funded-training-v1'
);

test('allocates collected cash and funds training at twenty percent', () => {
  const result = funding.allocateCollectedCash({
    collectedCashSar: 10000,
    plannedTrainingRunSar: 2000
  });

  assert.equal(result.allocations.trainingSar, 2000);
  assert.equal(result.allocations.operationsSar, 3500);
  assert.equal(result.requiredTrainingBudgetSar, 2400);
  assert.equal(result.paidTrainingAuthorized, false);
});

test('financial sufficiency never authorizes a paid run', () => {
  const result = funding.allocateCollectedCash({
    collectedCashSar: 10000,
    existingTrainingFundSar: 400,
    plannedTrainingRunSar: 2000
  });

  assert.equal(result.trainingFundAfterCollectionSar, 2400);
  assert.equal(result.paidTrainingDecision, 'FUNDED_PENDING_EXECUTION_APPROVAL');
  assert.equal(result.budgetSufficient, true);
  assert.equal(result.paidTrainingAuthorized, false);
  assert.equal(result.fundingEvidenceVerified, false);
  assert.equal(result.automaticTopUpAllowed, false);
  assert.equal(result.customerDataTrainingDefault, 'DENY');
});

test('rejects allocations that do not conserve all collected cash', () => {
  assert.throws(
    () => funding.allocateCollectedCash({
      collectedCashSar: 100,
      allocation: {
        operationsBasisPoints: 5000,
        trainingBasisPoints: 1000
      }
    }),
    /INVALID_CASH_ALLOCATION_POLICY/
  );
});
