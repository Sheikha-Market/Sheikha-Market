'use strict';
const {compareTrainingSourcing, reviewTrainingExit} = require('../core/foundry/sheikha-training-sourcing-v1');
const {sourcingInput, exitInput} = require('./fixtures/sheikha-foundry-sourcing-v1');

test('compares true customer cost, screens vendor costs, and does not execute', () => {
  const p = compareTrainingSourcing(sourcingInput());
  expect(p.proposedEconomicSelection).toBe('CUSTOMER_SELF_EXAMPLE');
  expect(p.options[0].financials.reservedCostHalala).toBe(298320);
  expect(p.options[1].financials.customerTotalCostHalala).toBe(310000);
  expect(p.options[2].financials.reservedCostHalala).toBe(561000);
  expect(p.options[2].decision).toBe('DO_NOT_CONTRACT_AT_PROPOSED_TERMS');
  expect(p.executionAuthorized).toBe(false); expect(p.contractsSigned).toBe(false);
});
test.each(['SHEIKHA', 'CUSTOMER', 'THIRD_PARTY'])('base supplier %s cannot imply transfer of existing weights', supplier => {
  const input = sourcingInput(); input.model.supplier = supplier;
  const p = compareTrainingSourcing(input);
  for (const o of p.options) {
    expect(o.contract.proposedNewWeightsOwner).toContain('SHEIKHA');
    expect(o.contract.existingBaseOwnershipTransferred).toBe(false);
    expect(o.contract.weightsAssigned).toBe(false);
    expect(o.contract.customerDataReuseAuthorized).toBe(false);
  }
});
test('a customer without a GPU can study managed training; self-service remains unfit', () => {
  const input = sourcingInput(); Object.assign(input.options[1], {computeOwner: 'UNASSIGNED', hardware: 'UNASSIGNED', memoryGiB: 0});
  const p = compareTrainingSourcing(input);
  expect(p.proposedEconomicSelection).toBe('SHEIKHA_MANAGED_EXAMPLE');
  expect(p.options[1].technicalBlockers).toContain('COMPUTE_NOT_ASSIGNED');
});
test('a GPU alone does not establish training expertise', () => {
  const input = sourcingInput(); input.options[1].operatorSkill = 'BEGINNER';
  expect(compareTrainingSourcing(input).options[1].technicalBlockers).toContain('TRAINING_SKILL_OR_SUPERVISION_REQUIRED');
});
test('deadline, memory and closed API rights are independent blockers', () => {
  const input = sourcingInput(); input.model.rightsBasis = 'CLOSED_API'; input.options[0].deliveryDays = 20; input.options[0].memoryGiB = 8;
  const p = compareTrainingSourcing(input);
  expect(p.proposedEconomicSelection).toBe(null);
  expect(p.options[0].technicalBlockers).toEqual(expect.arrayContaining(['DELIVERY_DEADLINE_EXCEEDED', 'DECLARED_MEMORY_INSUFFICIENT', 'CLOSED_API_DOES_NOT_EXPORT_BASE_WEIGHTS']));
});
test('royalty reduces margin rather than being hidden in model ownership', () => {
  const input = sourcingInput(); input.options[0].royaltyBps = 2000;
  const p = compareTrainingSourcing(input).options[0];
  expect(p.financials.royaltyHalala).toBe(90000);
  expect(p.financials.contributionHalala).toBe(61680);
  expect(p.financialBlockers).toContain('MINIMUM_MARGIN_NOT_MET');
});
test('noncommercial use needs a dedicated budget, not fabricated sales', () => {
  const input = sourcingInput(); input.economics.purpose = 'NONCOMMERCIAL'; input.economics.dedicatedBenefitBudgetHalala = 200000;
  input.options.forEach(o => { o.priceExTaxHalala = 0; });
  const p = compareTrainingSourcing(input);
  expect(p.proposedEconomicSelection).toBe('CUSTOMER_SELF_EXAMPLE');
  expect(p.selectionRule).toContain('BENEFIT_REVIEW');
  expect(p.options[0].financialBlockers).toContain('DEDICATED_BENEFIT_BUDGET_INSUFFICIENT');
});
test('no cash cannot be replaced by a declared future model valuation', () => {
  const input = sourcingInput(); input.economics.availableProjectCashHalala = 0;
  expect(compareTrainingSourcing(input).proposedEconomicSelection).toBe(null);
  input.economics.speculativeModelValue = 100000000;
  expect(() => compareTrainingSourcing(input)).toThrow('INVALID_SOURCING_FIELDS');
});
test('size arithmetic stays exact and does not claim physical measurement', () => {
  const input = sourcingInput(); input.model.parameterCount = 7; input.model.weightBits = 4;
  const p = compareTrainingSourcing(input).model;
  expect(p.theoreticalWeightBytes).toBe(4);
  expect(p.measurementsVerified).toBe(false);
  expect(p.trainingMemoryInferredFromWeightBytes).toBe(false);
});
test.each(['customerOtherCostHalala', 'thirdPartyFeeHalala', 'exitReserveHalala', 'rightsFeeHalala', 'priceExTaxHalala'])('rejects negative %s', key => {
  const input = sourcingInput(); input.options[0][key] = -1;
  expect(() => compareTrainingSourcing(input)).toThrow();
});
test('rejects duplicate options, unnamed third parties and forged signature fields', () => {
  const input = sourcingInput(); input.options[1].id = input.options[0].id;
  expect(() => compareTrainingSourcing(input)).toThrow('DUPLICATE_OPTION_ID');
  const other = sourcingInput(); delete other.parties.thirdPartyRef;
  expect(() => compareTrainingSourcing(other)).toThrow('NAMED_THIRD_PARTY_REQUIRED');
  expect(() => compareTrainingSourcing({...sourcingInput(), signatureVerified: true})).toThrow();
});
test('indefensible royalty and margin do not yield an invented profitable price', () => {
  const input = sourcingInput(); input.options[0].royaltyBps = 9000;
  const p = compareTrainingSourcing(input).options[0];
  expect(p.financials.minimumPriceExTaxHalala).toBe(null);
  expect(p.comparisonEligible).toBe(false);
});
test('exact margin comparison includes upward rounding of royalties', () => {
  const input = sourcingInput(); const o = input.options[0];
  input.economics.minimumMarginBps = 0;
  input.options = [o]; o.pricing = {gpuMinutes: 0, gpuRateHalalaPerHour: 0, laborMinutes: 0, laborRateHalalaPerHour: 0, storageHalala: 1, evaluationHalala: 0, rightsReviewHalala: 0, deliveryHalala: 0, reserveBps: 0, marginBps: 0};
  o.priceExTaxHalala = 1; o.royaltyBps = 1;
  expect(compareTrainingSourcing(input).options[0].financialBlockers).toContain('MINIMUM_MARGIN_NOT_MET');
});
test('exit includes accepted work and refunds, without terminating a contract', () => {
  const p = reviewTrainingExit(exitInput());
  expect(p.continuationNetHalala).toBe(-230000);
  expect(p.exitNetHalala).toBe(-130000);
  expect(p.exitAdvantageHalala).toBe(100000);
  expect(p.recommendation).toBe('CONSIDER_NEGOTIATED_EXIT_AFTER_LEGAL_REVIEW');
  expect(p.contractTerminationExecuted).toBe(false); expect(p.acceptedWorkWaived).toBe(false);
});
test('the exit cap covers the total cash obligation, not only penalty fees', () => {
  expect(reviewTrainingExit({...exitInput(), approvedExitCapHalala: 50000}).recommendation).toBe('HOLD_EXIT_CAP_AND_CONTRACT_REVIEW');
});
test('a cheap continuation does not recommend cancellation', () => {
  expect(reviewTrainingExit({...exitInput(), avoidableRemainingCostHalala: 100000}).recommendation).toBe('NO_ECONOMIC_EXIT_ADVANTAGE_AT_DECLARED_TERMS');
});
test('draft omission is not unilateral cancellation of an existing contract', () => {
  const input = {...exitInput(), stage: 'DRAFT', acceptedWorkPayableHalala: 0, otherUnavoidableLiabilitiesHalala: 0, customerRefundDueHalala: 0, estimatedExitFeeHalala: 0}; delete input.exitClauseRef;
  expect(reviewTrainingExit(input).recommendation).toBe('OMIT_OPTION_BEFORE_SIGNATURE');
  expect(() => reviewTrainingExit({...input, acceptedWorkPayableHalala: 1})).toThrow('DRAFT_CANNOT_HIDE_EXISTING_CONTRACT_OBLIGATIONS');
});
test('signed exit requires a clause reference but a reference never verifies a signature', () => {
  const input = exitInput(); delete input.exitClauseRef;
  expect(() => reviewTrainingExit(input)).toThrow();
  expect(reviewTrainingExit(exitInput()).signatureVerified).toBe(false);
});
