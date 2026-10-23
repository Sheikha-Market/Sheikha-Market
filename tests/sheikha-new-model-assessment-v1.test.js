'use strict';
const { estimateModelCost, weightMemoryFloor, assessGlmCandidate } = require('../runtime/sheikha-ai-governor/v1/sheikha-new-model-assessment-v1');
const { buildInventory, isCloudModel } = require('../runtime/sheikha-ai-governor/v1/sheikha-model-inventory-v1');
describe('new model economics and admission boundaries', () => {
  test('prices input and cached subset only once', () => {
    expect(estimateModelCost({ model: 'glm-5.3-flash', inputTokens: 1000000, cachedInputTokens: 0, outputTokens: 1000000 }).estimatedUsd).toBe(0.65);
    expect(estimateModelCost({ model: 'glm-5.3-flash', inputTokens: 1000000, cachedInputTokens: 1000000, outputTokens: 1000000 }).estimatedUsd).toBe(0.53);
  });
  test('compares previous model at identical token counts', () => {
    expect(estimateModelCost({ model: 'glm-5.2', inputTokens: 1000000, cachedInputTokens: 0, outputTokens: 1000000 }).estimatedUsd).toBe(5.8);
  });
  test.each([-1, 0.5, '10', NaN, 1e13])('rejects invalid counts %s', value => {
    expect(() => estimateModelCost({ model: 'glm-5.3-flash', inputTokens: value, cachedInputTokens: 0, outputTokens: 10 })).toThrow('INVALID_BILLED_TOKEN_COUNTS');
  });
  test('rejects double counted cache and unknown pricing', () => {
    expect(() => estimateModelCost({ model: 'glm-5.3-flash', inputTokens: 1, cachedInputTokens: 2, outputTokens: 10 })).toThrow();
    expect(() => estimateModelCost({ model: 'unpriced' })).toThrow('UNKNOWN_PRICE_MODEL');
  });
  test('uses total, not active parameters for the lower memory bound', () => {
    expect(weightMemoryFloor(320000000000, 8)).toMatchObject({ bytes: '320000000000', excludesRuntimeKvCacheAndTrainingState: true });
    expect(weightMemoryFloor(320000000000, 16).gib).toBeCloseTo(596.046, 2);
  });
  test.each(['CONFIDENTIAL', 'CUSTOMER'])('does not authorize cloud transfer of %s', dataClass => {
    const result = assessGlmCandidate({ provider: 'OLLAMA_CLOUD', purpose: 'DISTILLATION', dataClass, authorized: true });
    expect(result.blockers).toEqual(expect.arrayContaining(['PRIVATE_DATA_EGRESS_DENIED', 'COMPETING_PRODUCT_TERMS_REVIEW_REQUIRED']));
    expect(result).toMatchObject({ submissionAllowed: false, modelInvoked: false, trainingExecuted: false });
  });
  test('does not confuse inference APIs, training and weight ownership', () => {
    const result = assessGlmCandidate({ provider: 'OLLAMA_CLOUD', purpose: 'PRETRAIN_FROM_SCRATCH', dataClass: 'SYNTHETIC' });
    expect(result.blockers).toContain('INFERENCE_ENDPOINT_IS_NOT_TRAINING_OR_WEIGHT_EXPORT');
    expect(result.apiOutputsConferBaseWeightOwnership).toBe(false);
    expect(result.capabilities.every(c => !c.enabled)).toBe(true);
  });
  test('self-hosting still needs weights, resources and conformance', () => {
    expect(assessGlmCandidate({ provider: 'SELF_HOSTED', purpose: 'FINE_TUNE', dataClass: 'SYNTHETIC' }).blockers).toContain('HARDWARE_AND_ADAPTER_CONFORMANCE_REQUIRED');
  });
  test.each(['glm-5.3-flash:cloud', 'glm-5.3-flash:cloud-v1', 'GLM-5.3-Flash-cloud'])('does not classify %s as local even with an MIT license', name => {
    const inv = buildInventory({ run: args => args[0] === 'list' ? 'NAME  ID  SIZE  MODIFIED\n'+name+'  abc  -  today\n' : 'MIT License' });
    expect(isCloudModel(name)).toBe(true);
    expect(inv.models[0]).toMatchObject({ provider: 'ollama-cloud', governorState: 'QUARANTINED_EXTERNAL_SERVICE_REVIEW_REQUIRED' });
    expect(inv.summary.eligibleForEvaluation).toBe(0);
    expect(inv.summary.quarantined).toBe(1);
  });
});
