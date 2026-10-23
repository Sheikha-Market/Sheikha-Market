'use strict';

const { evaluateModel } = require(
  '../runtime/sheikha-ai-governor/v1/sheikha-model-evaluator-v1'
);

describe('Sheikha model evaluator V1', () => {
  test('requires every targeted capability to pass', async () => {
    const responses = [
      'الأمانة حفظ الحقوق وأداء المسؤوليات بصدق وعدل.',
      '391، والتحقق: 17 × 20 + 17 × 3 = 340 + 51 = 391.',
      'function sum(a, b) { return a + b; }'
    ];
    const result = await evaluateModel('fixture', {
      generate: async () => ({ response: responses.shift(), done_reason: 'stop' })
    });
    expect(result.status).toBe('EVALUATION_PASSED');
    expect(result.passedCount).toBe(3);
    expect(result.productionCertified).toBe(false);
  });

  test('fails empty or incomplete model responses', async () => {
    const result = await evaluateModel('fixture', {
      generate: async () => ({ response: '' })
    });
    expect(result.status).toBe('EVALUATION_FAILED');
    expect(result.results.every((entry) => entry.visibleAnswer === false)).toBe(true);
  });
});
