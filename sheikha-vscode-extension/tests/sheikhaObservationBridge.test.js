'use strict';
const http = require('node:http');
const { EventEmitter } = require('node:events');
const { ObservationBridge, TOOLS, requestLocal } = require('../src/chat/sheikhaObservationBridge');
function fixture(overrides = {}) {
  const responses = {
    '/health': { ok: true, system: 'SHEIKHA_DATA_WORKSPACE_V1' },
    '/api/status': { system: 'SHEIKHA_DATA_WORKSPACE_V1', version: '1.1.0', domains: 79, liveRegistry: { matched: true } },
    '/api/chat/tools': { schema: 'SHEIKHA_CHAT_TOOL_REGISTRY_V1', execution: 'DETERMINISTIC_TOOL_NOT_LLM', tools: [...TOOLS.map(t => ({ id: t.id, status: 'AVAILABLE' })), { id: 'OFFICIAL_RELEASES', status: 'AVAILABLE' }] },
    '/api/session': { token: 'a'.repeat(64), scope: 'SINGLE_LOCAL_OS_USER_NOT_MULTI_TENANT_AUTH' },
    '/api/chat/tool': { toolId: 'EFFECT', execution: 'DETERMINISTIC_TOOL_NOT_LLM', network: 'NONE', writes: false,
      historyPersisted: false, modelInference: false, trainingExecuted: false, outputAsInstructions: false, externalUpload: false, result: { difference: -5 } },
    '/api/data/metrics': { total: 2, eligible: 1 }, '/api/news/inbox': { count: 3, unreadCount: 1, events: ['PRIVATE_EVENT'] }, ...overrides
  };
  const request = jest.fn(async route => responses[route]);
  return { request, bridge: new ObservationBridge(request), responses };
}
describe('observation adapter boundaries', () => {
  test('reports sixteen permitted tools, not external fetch or unconfigured capabilities', async () => {
    const { bridge } = fixture(); const result = await bridge.report();
    expect(result.tools).toHaveLength(16);
    expect(result.tools.map(t => t.id)).not.toContain('OFFICIAL_RELEASES');
    expect(result).toMatchObject({ domains: 79, productionReady: false, automaticSave: false, externalFetchEnabled: false,
      data: { total: 2, eligible: 1, held: null }, news: { count: 3, unreadCount: 1, contentsIncluded: false } });
    expect(JSON.stringify(result)).not.toContain('PRIVATE_EVENT');
  });
  test.each(['OFFICIAL_RELEASES','MEMORY_WRITE','CODE_EXECUTION','__proto__'])('rejects %s without requesting session', async id => {
    const { bridge, request } = fixture();
    await expect(bridge.execute(id)).rejects.toThrow('LOCAL_TOOL_DENIED');
    expect(request).not.toHaveBeenCalled();
  });
  test('explicit calculation sends input only to the local tool endpoint, never returns session token', async () => {
    const { bridge, request } = fixture(); const input = { baseline: 20, observed: 15 };
    const result = await bridge.execute('EFFECT', input);
    expect(request).toHaveBeenLastCalledWith('/api/chat/tool', { method: 'POST', body: { toolId: 'EFFECT', input }, token: 'a'.repeat(64) });
    expect(JSON.stringify(result)).not.toContain('a'.repeat(64));
  });
  test.each(['writes','externalUpload','modelInference','trainingExecuted','historyPersisted','outputAsInstructions'])('rejects an unexpected %s claim', async key => {
    const { bridge, responses } = fixture(); responses['/api/chat/tool'][key] = true;
    await expect(bridge.execute('EFFECT')).rejects.toThrow('LOCAL_RESULT_BOUNDARY_MISMATCH');
  });
  test('refuses identity mismatch, unavailable tools, and invalid session without execution', async () => {
    const { bridge, responses, request } = fixture(); responses['/health'].system = 'OTHER';
    await expect(bridge.inspect()).rejects.toThrow('LOCAL_IDENTITY_MISMATCH');
    responses['/health'].system = 'SHEIKHA_DATA_WORKSPACE_V1'; responses['/api/chat/tools'].tools = [];
    await expect(bridge.execute('EFFECT')).rejects.toThrow('LOCAL_TOOL_UNAVAILABLE');
    responses['/api/chat/tools'].tools = [{ id: 'EFFECT', status: 'AVAILABLE' }]; responses['/api/session'].token = 'private-invalid';
    await expect(bridge.execute('EFFECT')).rejects.toThrow('LOCAL_SESSION_REJECTED');
    expect(request.mock.calls.some(([route]) => route === '/api/chat/tool')).toBe(false);
  });
});

describe('fixed loopback HTTP transport', () => {
  afterEach(() => { jest.restoreAllMocks(); jest.useRealTimers(); });
  function mockHttp(status = 200, body = '{}', contentType = 'application/json') {
    const req = new EventEmitter(); req.destroy = jest.fn(); req.end = jest.fn();
    jest.spyOn(http, 'request').mockImplementation((options, callback) => {
      req.end.mockImplementation(() => {
        const response = new EventEmitter(); response.statusCode = status; response.headers = { 'content-type': contentType };
        callback(response); response.emit('data', Buffer.from(body)); response.emit('end');
      }); return req;
    });
    return req;
  }
  test('only connects to fixed IPv4 loopback with no proxy or redirects', async () => {
    mockHttp(); await requestLocal('/health');
    expect(http.request).toHaveBeenCalledWith(expect.objectContaining({ hostname: '127.0.0.1', port: 8142, path: '/health', agent: false }), expect.any(Function));
    await expect(requestLocal('https://external.test')).rejects.toThrow('LOCAL_ROUTE_DENIED');
    await expect(requestLocal('/api/news/commit', { method: 'POST' })).rejects.toThrow('LOCAL_ROUTE_DENIED');
    await expect(requestLocal('/api/chat/tool', { method: 'POST', token: 'a'.repeat(64), body: { toolId: 'OFFICIAL_RELEASES' } })).rejects.toThrow('LOCAL_TOOL_REQUEST_DENIED');
    expect(http.request).toHaveBeenCalledTimes(1);
  });
  test.each([302,403,500])('rejects HTTP %i and discards sensitive body', async status => {
    mockHttp(status, 'PRIVATE_SERVER_SECRET');
    await expect(requestLocal('/health')).rejects.toThrow('LOCAL_SERVICE_RESPONSE_REJECTED');
    expect(http.request).toHaveBeenCalledTimes(1);
  });
  test('caps bytes, rejects malformed JSON, and times out stalled transport', async () => {
    mockHttp(200, 'x'.repeat(1024 * 1024 + 1));
    await expect(requestLocal('/health')).rejects.toThrow('LOCAL_RESPONSE_LIMIT');
    mockHttp(200, '{'); await expect(requestLocal('/health')).rejects.toThrow('LOCAL_RESPONSE_INVALID_JSON');
    jest.useFakeTimers(); const req = new EventEmitter(); req.destroy = jest.fn(); req.end = jest.fn();
    http.request.mockReturnValue(req);
    const pending = requestLocal('/health'); const check = expect(pending).rejects.toThrow('LOCAL_SERVICE_TIMEOUT');
    jest.advanceTimersByTime(5000); await check; expect(req.destroy).toHaveBeenCalled();
  });
});
