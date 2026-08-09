'use strict';

const {
  DEFAULT_MODEL_MAX_TOKENS,
  chooseModelFromList,
  executeAsync
} = require(
  '../runtime/model-cluster/sheikha-model-executor-v1'
);
const {
  executePipelineAsync
} = require(
  '../runtime/execution/sheikha-execution-pipeline-v1'
);

describe('Sheikha asynchronous model execution V1', () => {
  test('selects a governed local model from discovered models', () => {
    expect(chooseModelFromList('general', [
      'tinyllama:latest',
      'Sheikha-Core:latest'
    ])).toBe('Sheikha-Core:latest');
  });

  test('uses asynchronous Ollama JSON transport with bounded generation', async () => {
    const calls = [];
    const result = await executeAsync('اشرح فائدة الاختبار', {
      audit: false,
      models: ['Sheikha-Core:latest'],
      requestJson: async (pathname, options) => {
        calls.push({ pathname, options });
        await new Promise((resolve) => setTimeout(resolve, 5));
        return { response: 'الاختبار يكشف الخلل قبل وصوله إلى المستخدم.' };
      }
    });

    expect(result).toMatchObject({
      success: true,
      executor: 'SHEIKHA_MODEL_EXECUTOR_ASYNC_V1',
      model: 'Sheikha-Core:latest'
    });
    expect(result.answer).toContain('يكشف الخلل');
    expect(calls).toHaveLength(1);
    expect(calls[0].pathname).toBe('/api/generate');
    expect(calls[0].options.payload.stream).toBe(false);
    expect(calls[0].options.payload.options.num_predict)
      .toBe(DEFAULT_MODEL_MAX_TOKENS);
  });

  test('returns an honest bounded fallback on model timeout', async () => {
    const result = await executeAsync('سؤال عام', {
      audit: false,
      models: ['Sheikha-Core:latest'],
      requestJson: async () => {
        throw new Error('OLLAMA_MODEL_TIMEOUT_50MS');
      }
    });

    expect(result).toMatchObject({
      success: true,
      fallback: true,
      executor: 'SHEIKHA_MODEL_EXECUTOR_ASYNC_V1'
    });
    expect(result.answer).toContain('بقي الخادم مستجيبًا');
  });

  test('keeps the event loop responsive while a model request is pending', async () => {
    let timerObserved = false;
    const pending = executePipelineAsync({
      message: 'سؤال عام غير متخصص',
      mode: 'smart'
    }, {
      executeModel: async () => {
        await new Promise((resolve) => setTimeout(resolve, 20));
        return { success: true, answer: 'إجابة محكومة.' };
      }
    });

    await new Promise((resolve) => {
      setTimeout(() => {
        timerObserved = true;
        resolve();
      }, 1);
    });

    expect(timerObserved).toBe(true);
    await expect(pending).resolves.toMatchObject({
      success: true,
      answer: 'إجابة محكومة.'
    });
  });
});
