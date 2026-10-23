'use strict';
const { evaluate, grade, CASES } = require('../tools/training/evaluate-sheikha-local-model-readiness-v1');

describe('Local model evidence without external activation', () => {
  test('strict grading rejects prose, wrong types and extra fields', () => {
    expect(grade('{"answer":3973}', { answer: 3973 })).toBe(true);
    for (const value of ['3973', '```json\n{"answer":3973}\n```', '{"answer":"3973"}', '{"answer":3973,"x":1}']) {
      expect(grade(value, { answer: 3973 })).toBe(false);
    }
  });
  test('unknown or cloud models never reach the transport', async () => {
    const request = jest.fn();
    await expect(evaluate('glm-5.3-flash:cloud', request)).rejects.toThrow('LOCAL_REVIEWED');
    expect(request).not.toHaveBeenCalled();
  });
  test('missing local model cannot cause a download', async () => {
    const request = jest.fn(async () => ({ models: [] }));
    await expect(evaluate('qwen3:4b', request)).rejects.toThrow('NO_PULL');
    expect(request).toHaveBeenCalledTimes(1);
  });
  test('measures six fixed cases but does not approve production', async () => {
    let next = 0;
    const request = jest.fn(async (route, options) => {
      expect(options.baseUrl).toBe('http://127.0.0.1:11434');
      if (route === '/api/tags') return { models: [{ name: 'qwen3:4b', digest: 'a'.repeat(64) }] };
      if (route === '/api/show') return { license: 'Apache License', model_info: { 'general.parameter_count': 4e9 } };
      expect(route).toBe('/api/generate');
      expect(options.payload.options.num_predict).toBe(96);
      return { model: 'qwen3:4b', response: JSON.stringify(CASES[next++].expected),
        done: true, done_reason: 'stop', eval_count: 10, eval_duration: 1e9, prompt_eval_count: 30 };
    });
    const result = await evaluate('qwen3:4b', request);
    expect(result.passed).toBe(6);
    expect(result.boundedSmokeSuitePassed).toBe(true);
    expect(result.commercialProductionApproved).toBe(false);
    expect(result.worldwideSuperiorityProven).toBe(false);
    expect(result.weightsOwnershipTransferred).toBe(false);
  });
  test('empty or truncated output is never certified even if JSON matches', async () => {
    const request = async (route) => {
      if (route === '/api/tags') return { models: [{ name: 'qwen3:4b', digest: 'a'.repeat(64) }] };
      if (route === '/api/show') return { license: 'Apache License', model_info: { 'general.parameter_count': 4e9 } };
      return { model: 'qwen3:4b', response: '{"answer":3973}', done: true, done_reason: 'length',
        eval_count: 5, eval_duration: 1e9, prompt_eval_count: 10 };
    };
    const result = await evaluate('qwen3:4b', request);
    expect(result.passed).toBe(0);
    expect(result.boundedSmokeSuitePassed).toBe(false);
  });
});
