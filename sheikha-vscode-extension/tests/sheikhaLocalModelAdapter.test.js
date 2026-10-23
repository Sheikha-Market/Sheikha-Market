'use strict';
const { LocalModelAdapter, requestOllama } = require('../src/chat/sheikhaLocalModelAdapter');
const http = require('node:http');
const { EventEmitter } = require('node:events');
const digest = 'a'.repeat(64);
function fixture() {
  const responses = { '/api/tags': { models: [{ name: 'local:4b', size: 2000, digest, details: { parameter_size: '4B' } }] },
    '/api/show': { model_info: { 'general.parameter_count': 4000000000 } },
    '/api/chat': { model: 'local:4b', done: true, message: { content: JSON.stringify({ points: ['A bounded draft'] }) }, eval_count: 4, prompt_eval_count: 30, total_duration: 1000 } };
  const request = jest.fn(async route => responses[route]);
  return { adapter: new LocalModelAdapter(request), request, responses,
    input: { model: 'local:4b', digest, goal: 'Synthetic task only', role: 'design', consent: true } };
}
describe('explicit local model adapter', () => {
  test('returns validated final points without provider thinking metadata', async () => {
    const { adapter, input, responses } = fixture();
    responses['/api/chat'].message.thinking = 'PRIVATE_THINKING';
    const result = await adapter.draft(input);
    expect(result.text).toBe('- A bounded draft');
    expect(JSON.stringify(result)).not.toContain('PRIVATE_THINKING');
    expect(result.outputValidated).toBe('BOUNDED_JSON_SCHEMA_NOT_SEMANTIC_PROOF');
  });
  test('reports exhausted final-answer budget without exposing thinking or retrying', async () => {
    const { adapter, input, responses, request } = fixture();
    responses['/api/chat'] = { model: input.model, done: true, done_reason: 'length', message: { content: '', thinking: 'PRIVATE_THINKING' } };
    await expect(adapter.draft(input)).rejects.toThrow('LOCAL_MODEL_NO_FINAL_ANSWER_WITHIN_BUDGET');
    expect(request.mock.calls.filter(([route]) => route === '/api/chat')).toHaveLength(1);
  });
  test('filters cloud tags and remote metadata from the selectable inventory', async () => {
    const { adapter, responses } = fixture();
    responses['/api/tags'].models.push({ name: 'remote:cloud', size: 100, digest },{ name: 'disguised:4b', size: 100, digest, remote_host: 'external' });
    const result = await adapter.inspect(); expect(result.models).toHaveLength(1); expect(result.inferenceTested).toBe(false);
  });
  test.each(['not JSON', '{"points":[],"thinking":"hidden"}', '{"points":[3]}', '{"points":["ok"],"extra":true}'])('rejects unstructured or extra output fields', async content => {
    const { adapter, input, responses } = fixture(); responses['/api/chat'].message.content = content;
    await expect(adapter.draft(input)).rejects.toThrow('LOCAL_MODEL_RESULT_INVALID');
  });
  test('rejects even parseable responses stopped by the token budget', async () => {
    const { adapter, input, responses } = fixture(); responses['/api/chat'].done_reason = 'length';
    await expect(adapter.draft(input)).rejects.toThrow('LOCAL_MODEL_NO_FINAL_ANSWER_WITHIN_BUDGET');
  });
  test('requires consent and a matching current digest before inference', async () => {
    const { adapter, input, request } = fixture();
    await expect(adapter.draft({ ...input, consent: false })).rejects.toThrow('EXPLICIT_LOCAL_MODEL_TASK_REQUIRED');
    expect(request).not.toHaveBeenCalled();
    await expect(adapter.draft({ ...input, digest: 'b'.repeat(64) })).rejects.toThrow('LOCAL_MODEL_BINDING_CHANGED');
    expect(request.mock.calls.some(([route]) => route === '/api/chat')).toBe(false);
  });
  test.each([{ remote_host: 'external' }, { model_info: {} }, { remote_model: 'model' }])('rejects nonlocal show metadata', async info => {
    const { adapter, input, responses, request } = fixture(); responses['/api/show'] = info;
    await expect(adapter.draft(input)).rejects.toThrow('LOCAL_WEIGHTS_NOT_CONFIRMED');
    expect(request.mock.calls.some(([route]) => route === '/api/chat')).toBe(false);
  });
  test('uses two explicit prompt messages only, fixed budgets, and never executes tool calls', async () => {
    const { adapter, input, responses, request } = fixture();
    const result = await adapter.draft(input);
    const body = request.mock.calls.find(([route]) => route === '/api/chat')[1].body;
    expect(body.messages).toHaveLength(2); expect(body.messages[1].content).toBe(input.goal);
    expect(body).toMatchObject({ stream: false, think: false, keep_alive: 0, options: { num_ctx: 4096, num_predict: 512 } });
    expect(body.tools).toBeUndefined(); expect(result.reviewRequired).toBe(true); expect(result.toolsExecuted).toBe(false);
    responses['/api/chat'].message.tool_calls = [{ function: { name: 'shell' } }];
    await expect(adapter.draft(input)).rejects.toThrow('LOCAL_MODEL_RESULT_INVALID');
  });
  test('rejects empty, incomplete, oversized, or wrong-model replies', async () => {
    const { adapter, input, responses } = fixture();
    for (const reply of [{ done: false }, { model: 'remote', done: true, message: { content: 'text' } }, { model: input.model, done: true, message: { content: '' } }]) {
      responses['/api/chat'] = reply; await expect(adapter.draft(input)).rejects.toThrow('LOCAL_MODEL_RESULT_INVALID');
    }
  });
});

describe('local inference transport', () => {
  afterEach(() => jest.restoreAllMocks());
  test('refuses other endpoints or an already cancelled request without connecting', async () => {
    const spy = jest.spyOn(http, 'request'); const controller = new AbortController(); controller.abort();
    await expect(requestOllama('/api/pull')).rejects.toThrow('LOCAL_MODEL_ROUTE_DENIED');
    await expect(requestOllama('/api/tags', { signal: controller.signal })).rejects.toThrow('CANCELLED');
    expect(spy).not.toHaveBeenCalled();
  });
  test('pins loopback and tears down in-flight transport on abort', async () => {
    const request = new EventEmitter(); request.end = jest.fn(); request.destroy = jest.fn();
    jest.spyOn(http, 'request').mockReturnValue(request);
    const controller = new AbortController(); const pending = requestOllama('/api/tags', { signal: controller.signal });
    const assertion = expect(pending).rejects.toThrow('CANCELLED'); controller.abort(); await assertion;
    expect(request.destroy).toHaveBeenCalled();
    expect(http.request).toHaveBeenCalledWith(expect.objectContaining({ hostname: '127.0.0.1', port: 11434, path: '/api/tags', agent: false }), expect.any(Function));
  });
  test('does not follow redirects or return error bodies', async () => {
    const req = new EventEmitter(); req.destroy = jest.fn();
    jest.spyOn(http, 'request').mockImplementation((options, callback) => {
      req.end = () => { const res = new EventEmitter(); res.statusCode = 302; res.headers = { location: 'https://external.invalid' }; callback(res); }; return req;
    });
    await expect(requestOllama('/api/tags')).rejects.toThrow('LOCAL_MODEL_RESPONSE_REJECTED');
    expect(http.request).toHaveBeenCalledTimes(1);
  });
});
