'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const g = require('../core/security/sheikha-sdk-mcp-governance.cjs');
test('unknown and mutation tools cannot execute even with client approval', async () => {
  let calls = 0; const receipts = [];
  const gate = g.createToolGate({ audit: r => receipts.push(r) });
  for (const name of ['sheikha_scaffold', 'sheikha_learn', 'toString', '__proto__', 'unknown']) {
    const result = await gate({ params: { name, arguments: { humanApproved: true, token: 'private' } } }, () => { calls++; });
    assert.equal(result.isError, true);
  }
  assert.equal(calls, 0); assert.equal(JSON.stringify(receipts).includes('private'), false);
});
test('read result strips nested credentials and audit contains no input', async () => {
  const receipts = []; const gate = g.createToolGate({ audit: r => receipts.push(r) });
  const result = await gate({ params: { name: 'sheikha_status', arguments: { password: 'private' } } },
    () => ({ content: [{ type: 'text', text: JSON.stringify({ nested: { token: 'private' }, email: 'a@example.org', status: 'ok' }) }] }));
  assert.equal(result.isError, undefined); assert.equal(JSON.stringify(result).includes('private'), false);
  assert.equal(JSON.stringify(result).includes('a@example.org'), false);
  assert.equal(JSON.stringify(receipts).includes('password'), false);
});
test('request bounds and rate limit prevent execution', async () => {
  let calls = 0; const gate = g.createToolGate({ now: () => 1000 });
  const request = { params: { name: 'sheikha_status', arguments: {} } };
  for (let i = 0; i < 120; i++) await gate(request, () => { calls++; return {}; });
  assert.equal((await gate(request, () => { calls++; })).isError, true);
  assert.equal(calls, 120);
  assert.equal(g.decision('sheikha_status', { payload: 'x'.repeat(262144) }).allowed, false);
});
test('identity and approval headers cannot replace a scoped key', () => {
  assert.equal(g.authenticateRequest({ headers: { 'x-sheikha-role': 'ADMIN', 'x-sheikha-human-approved': 'true' } }), null);
  const req = { headers: { authorization: 'Sheikha skh_v2_test', 'x-sheikha-human-approved': 'true' } };
  assert.equal(g.authenticateRequest(req, 'runtime:read', () => ({ trusted: true, scopes: [] })), null);
  const actor = g.authenticateRequest(req, 'runtime:read', () => ({ trusted: true, scopes: ['runtime:read'], humanApproved: true }));
  assert.equal(actor.humanApproved, false);
});
test('catalog only exposes admitted read tools with annotations', () => {
  const tools = g.toolCatalog([{ name: 'sheikha_status' }, { name: 'sheikha_scaffold' }]);
  assert.equal(tools.length, 1); assert.equal(tools[0].annotations.readOnlyHint, true);
  assert.equal(tools[0].annotations.destructiveHint, false);
});
test('audit failure blocks dispatch', async () => {
  let called = false; const gate = g.createToolGate({ audit: () => { throw new Error('disk'); } });
  const result = await gate({ params: { name: 'sheikha_status' } }, () => { called = true; });
  assert.equal(result.isError, true); assert.equal(called, false);
});

test('resource response JSON is redacted and private resources are not admitted', () => {
  const result = g.sanitizeResult({ contents: [{ uri: 'sheikha://system/status', text: '{"password":"private"}' }] });
  assert.equal(JSON.stringify(result).includes('private'), false);
  assert.equal(g.resourceAllowed('sheikha://learning/memory'), false);
  assert.equal(g.resourceAllowed('sheikha://dev/vscode-config'), false);
});
test('real MCP dispatch and catalog use governance before tool execution', async () => {
  const vm = require('node:vm'); const fs = require('node:fs'); const path = require('node:path');
  const handlers = new Map();
  class Server { setRequestHandler(schema, handler) { handlers.set(schema, handler); } async connect() {} }
  const schemas = Object.fromEntries(['CallToolRequestSchema', 'ListToolsRequestSchema', 'ListResourcesRequestSchema', 'ReadResourceRequestSchema'].map(k => [k, k]));
  const root = path.resolve(__dirname, '../mcp-servers');
  vm.runInNewContext(fs.readFileSync(path.join(root, 'sheikha-mcp-server.js'), 'utf8'), {
    require(name) {
      if (name === '@modelcontextprotocol/sdk/server/index.js') return { Server };
      if (name === '@modelcontextprotocol/sdk/server/stdio.js') return { StdioServerTransport: class {} };
      if (name === '@modelcontextprotocol/sdk/types.js') return schemas;
      if (name.endsWith('sheikha-sdk-mcp-governance.cjs')) return g;
      if (name === 'fs') return { readFileSync() { throw new Error('No private data access in test'); } };
      return require(name);
    }, __dirname: root, process: { env: {} }, console: { error() {} }, Buffer, URL, setTimeout, clearTimeout
  });
  const catalog = await handlers.get(schemas.ListToolsRequestSchema)();
  assert.equal(catalog.tools.length, Object.keys(g.policy().allowlist.tools).length);
  assert.equal(catalog.tools.every(t => t.annotations.readOnlyHint && !t.annotations.destructiveHint), true);
  const denied = await handlers.get(schemas.CallToolRequestSchema)({ params: { name: 'sheikha_scaffold', arguments: { humanApproved: true } } });
  assert.equal(denied.isError, true);
  await assert.rejects(handlers.get(schemas.ReadResourceRequestSchema)({ params: { uri: 'sheikha://learning/memory' } }), /RESOURCE_NOT_ADMITTED/);
});

test('standalone SDK HTTP handler rejects forged identity and accepts scoped key', async () => {
  const vm = require('node:vm'); const fs = require('node:fs'); const path = require('node:path');
  let handler; let binding; let authUnavailable = false;
  const server = { listen(port, host) { binding = { port, host }; }, on() {} };
  const root = path.resolve(__dirname, '../mcp-servers');
  vm.runInNewContext(fs.readFileSync(path.join(root, 'sheikha-sdk-server.js'), 'utf8'), {
    require(name) {
      if (name === 'http') return { createServer(fn) { handler = fn; return server; } };
      if (name.endsWith('sheikha-sdk-mcp-governance.cjs')) return {
        ...g, authenticateRequest(req) {
          if (authUnavailable) throw new Error('Unavailable');
          return g.authenticateRequest(req, 'runtime:read', secret => secret === 'skh_v2_valid'
            ? { trusted: true, scopes: ['runtime:read'] } : null);
        }
      };
      return require(name);
    }, __dirname: root, process: { env: {}, exit() { throw new Error('Unexpected exit'); } },
    console: { log() {}, error() {} }, module: { exports: {} }, URL, Buffer
  });
  async function call(headers) {
    let code; let body;
    await handler({ method: 'GET', url: '/sdk/docs', headers }, {
      writeHead(status) { code = status; }, end(value) { body = JSON.parse(value); }
    });
    return { code, body };
  }
  assert.equal(binding.host, '127.0.0.1');
  assert.equal((await call({ 'x-sheikha-role': 'ADMIN', 'x-sheikha-human-approved': 'true' })).code, 401);
  assert.equal((await call({ authorization: 'Sheikha skh_v2_invalid' })).code, 401);
  const admitted = await call({ authorization: 'Sheikha skh_v2_valid' });
  assert.equal(admitted.code, 200); assert.equal(admitted.body.success, true);
  authUnavailable = true;
  assert.equal((await call({ authorization: 'Sheikha skh_v2_valid' })).code, 503);
});
