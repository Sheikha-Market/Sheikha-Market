'use strict';

const {REQUIRED_BOUNDARIES, reviewAndProposeContractRepair} = require('../core/governance/sheikha-contract-harm-repair-v1');

describe('Sheikha contract harm repair V1', () => {
  test('creates a bounded repair draft without mutating or accepting the original', () => {
    const original = {id: 'UNSAFE', boundaries: {failClosed: false, automaticFirmwareMutationAllowed: true}};
    const snapshot = JSON.parse(JSON.stringify(original));
    const review = reviewAndProposeContractRepair(original);
    expect(review.decision).toBe('REPAIR_DRAFT_REQUIRES_HUMAN_REVIEW');
    expect(review.violations.map((entry) => entry.key)).toEqual(expect.arrayContaining([
      'failClosed', 'automaticFirmwareMutationAllowed', 'highImpactHumanApprovalRequired'
    ]));
    expect(review.repairedDraft.boundaries).toEqual(expect.objectContaining(REQUIRED_BOUNDARIES));
    expect(review.repairedDraft.repairMetadata).toMatchObject({draftOnly: true, humanReviewRequired: true});
    expect(original).toEqual(snapshot);
    expect(review.automaticallyAccepted).toBe(false);
    expect(review.automaticallyExecuted).toBe(false);
  });

  test('accepts already bounded technical boundaries without granting execution', () => {
    const review = reviewAndProposeContractRepair({id: 'SAFE', boundaries: {...REQUIRED_BOUNDARIES}});
    expect(review.decision).toBe('CONTRACT_BOUNDARIES_ACCEPTABLE');
    expect(review.violations).toEqual([]);
    expect(review.automaticallyExecuted).toBe(false);
  });

  test('rejects unstructured contracts', () => {
    expect(() => reviewAndProposeContractRepair(null)).toThrow('STRUCTURED_CONTRACT_OBJECT_REQUIRED');
    expect(() => reviewAndProposeContractRepair('terms')).toThrow('STRUCTURED_CONTRACT_OBJECT_REQUIRED');
  });
});
