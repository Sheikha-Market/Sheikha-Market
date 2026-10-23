'use strict';
const { EventEmitter } = require('node:events');
const { LocalChat, streamOllama } = require('../src/chat/sheikhaLocalChat');
const entry = { name: 'fixture:8b', digest: 'a'.repeat(64), parameters: '8B' };
const event = (content, done = false, extra = {}) => ({ model: entry.name, done, message: { role: 'assistant', content }, ...extra });
function transport(chunks, { status = 200, type = 'application/x-ndjson', end = true } = {}) {
  const response = new EventEmitter(); response.statusCode = status; response.headers = { 'content-type': type };
  const req = new EventEmitter(); req.destroy = jest.fn();
  const request = jest.fn((options, callback) => {
    req.end = jest.fn(() => queueMicrotask(() => { callback(response); for (const chunk of chunks) response.emit('data', chunk); if (end) response.emit('end'); }));
    return req;
  });
  return { request, req, response };
}
const json = data => Buffer.from(JSON.stringify(data) + '\n');
function session() {
  const adapter = { inspect: jest.fn(async () => ({ models: [entry] })) };
  const request = jest.fn(async () => ({ model_info: { 'general.parameter_count': 8000000000 } }));
  const stream = jest.fn(async (body, { onToken }) => { onToken('جواب'); return { answer: 'جواب', truncated: false, metrics: {} }; });
  const chat = new LocalChat({ adapter, request, stream }); chat.selection = entry;
  return { chat, adapter, request, stream };
}

test('NDJSON streaming preserves Arabic across every UTF8 byte boundary and measures first output', async () => {
  const chunks = [...Buffer.concat([json(event('مرحبا')), json(event(' بك')), json(event('', true, { eval_count: 7 }))])].map(byte => Buffer.from([byte]));
  const { request, req } = transport(chunks); const onToken = jest.fn();
  const result = await streamOllama({ model: entry.name }, { request, onToken });
  expect(result.answer).toBe('مرحبا بك'); expect(result.metrics.generatedTokens).toBe(7);
  expect(result.metrics.firstTokenMs).toBeGreaterThanOrEqual(0); expect(onToken).toHaveBeenCalledTimes(2);
  expect(request.mock.calls[0][0]).toMatchObject({ hostname: '127.0.0.1', port: 11434, path: '/api/chat', agent: false });
  expect(req.destroy).toHaveBeenCalled();
});
test.each([
  [[event('partial')], 'LOCAL_CHAT_INCOMPLETE'],
  [[event('bad', false, { model: 'cloud' })], 'LOCAL_CHAT_RESPONSE_REJECTED'],
  [[event('', true, { message: { role: 'assistant', content: '', tool_calls: [{}] } })], 'LOCAL_CHAT_RESPONSE_REJECTED'],
  [[event('a', true), event('b')], 'LOCAL_CHAT_TRAILING_DATA'],
  [[event('', true)], 'LOCAL_CHAT_INCOMPLETE'],
  [[event('x'.repeat(65537))], 'LOCAL_CHAT_OUTPUT_LIMIT']
])('rejects malformed or incomplete stream %#', async (events, error) => {
  const t = transport(events.map(json)); await expect(streamOllama({ model: entry.name }, t)).rejects.toThrow(error);
});
test.each([{ status: 302 }, { status: 500 }, { type: 'text/html' }])('does not follow redirects or accept wrong content %j', async options => {
  await expect(streamOllama({ model: entry.name }, transport([], options))).rejects.toThrow('LOCAL_CHAT_RESPONSE_REJECTED');
});
test('cancellation destroys the local request and ignores late tokens', async () => {
  const controller = new AbortController(); const onToken = jest.fn();
  const t = transport([], { end: false });
  const promise = streamOllama({ model: entry.name }, { ...t, signal: controller.signal, onToken });
  await Promise.resolve(); controller.abort();
  await expect(promise).rejects.toThrow('CANCELLED');
  t.response.emit('data', json(event('late'))); expect(onToken).not.toHaveBeenCalled(); expect(t.req.destroy).toHaveBeenCalled();
});
test('absolute timeout stops an unfinished stream', async () => {
  await expect(streamOllama({ model: entry.name }, { ...transport([], { end: false }), timeoutMs: 10 })).rejects.toThrow('TIMED_OUT');
});
test('pre-aborted and oversized input do not connect', async () => {
  const t = transport([]); const controller = new AbortController(); controller.abort();
  await expect(streamOllama({}, { ...t, signal: controller.signal })).rejects.toThrow('CANCELLED');
  await expect(streamOllama({ content: 'x'.repeat(32769) }, t)).rejects.toThrow('LOCAL_CHAT_INPUT_LIMIT');
  expect(t.request).not.toHaveBeenCalled();
});
test('local dialogue contains only entered messages and has no tools, persistence or training', async () => {
  const { chat, stream } = session();
  const result = await chat.reply('اشرح الفرز', { allow: () => true });
  expect(result).toMatchObject({ toolsExecuted: false, webResearchExecuted: false, trainingExecuted: false, workspaceFilesSent: false, memoryPersisted: false, modelOwnershipProven: false });
  const body = stream.mock.calls[0][0]; expect(body.messages.map(m => m.role)).toEqual(['system', 'user']);
  expect(body).not.toHaveProperty('tools'); expect(body).toMatchObject({ stream: true, keep_alive: 0 });
  await chat.reply('اعطني مثالا', { allow: () => true });
  expect(stream.mock.calls[1][0].messages.map(m => m.role)).toEqual(['system', 'user', 'assistant', 'user']);
  chat.clear(); expect(chat.history).toEqual([]);
});
test('trust denied before connection', async () => {
  const { chat, adapter, stream } = session();
  await expect(chat.reply('test')).rejects.toThrow('WORKSPACE_TRUST_REQUIRED');
  expect(adapter.inspect).not.toHaveBeenCalled(); expect(stream).not.toHaveBeenCalled();
});
test('changed model binding prevents generation', async () => {
  const { chat, adapter, stream } = session(); adapter.inspect.mockResolvedValue({ models: [{ ...entry, digest: 'b'.repeat(64) }] });
  await expect(chat.reply('test', { allow: () => true })).rejects.toThrow('LOCAL_MODEL_BINDING_CHANGED');
  expect(stream).not.toHaveBeenCalled();
});
test.each([{ remote_host: 'cloud' }, { remote_model: 'cloud' }, { model_info: {} }])('renamed remote/missing weights rejected %j', async info => {
  const { chat, request, stream } = session(); request.mockResolvedValue(info);
  await expect(chat.reply('test', { allow: () => true })).rejects.toThrow('LOCAL_WEIGHTS_NOT_CONFIRMED'); expect(stream).not.toHaveBeenCalled();
});
test('revoked trust is checked on tokens and no successful history is committed', async () => {
  const { chat, stream } = session(); let trusted = true;
  stream.mockImplementation(async (body, { onToken }) => { trusted = false; onToken('secret'); });
  const onToken = jest.fn(); await expect(chat.reply('test', { allow: () => trusted, onToken })).rejects.toThrow('WORKSPACE_TRUST_REQUIRED');
  expect(onToken).not.toHaveBeenCalled(); expect(chat.history).toEqual([]);
});
test('truncated result is marked incomplete and excluded from future dialogue', async () => {
  const { chat, stream } = session(); stream.mockResolvedValue({ answer: 'partial', truncated: true, metrics: {} });
  expect((await chat.reply('test', { allow: () => true })).truncated).toBe(true); expect(chat.history).toEqual([]);
});
test('native model selection resets only local dialogue and requires trust', async () => {
  const { chat } = session(); chat.history = [{ role: 'user', content: 'old' }];
  const api = { workspace: { isTrusted: true }, window: { showQuickPick: jest.fn(async choices => choices[0]) } };
  expect(await chat.choose(api)).toBe(true); expect(chat.history).toEqual([]);
  api.workspace.isTrusted = false; await expect(chat.choose(api)).rejects.toThrow('WORKSPACE_TRUST_REQUIRED');
});
