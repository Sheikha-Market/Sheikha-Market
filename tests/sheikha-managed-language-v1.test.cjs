'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const language = require('../core/language/sheikha-managed-language-v1.cjs');
const { runIR } = require('../sheikha-language/compiler/vm');
const source = 'بسم_الله\nإجراء تحقق:\n  اعرض "LOCAL_OK"\n';
test('activation evidence comes from actual local compilation and VM output', () => {
  assert.equal(language.compile(source).status, 'COMPILED_LOCAL');
  const result = language.run(source);
  assert.equal(result.success, true);
  assert.ok(result.output.some(s => s.includes('LOCAL_OK')));
  assert.equal(result.evidence.adapterDryRun, true);
  assert.equal(result.evidence.strictIsolation, true);
  assert.equal(language.status().status, 'LOCAL_RUNTIME_VERIFIED');
});
test('SDK local language binding executes compiler rather than returning source', () => {
  const client = require('../sdk/sheikha-js').createSheikhaClient();
  assert.equal(client.compile(source).bytecode.type, language.compile(source).bytecode.type);
  assert.equal(client.run(source).status, 'VERIFIED_DRY_RUN');
});
test('source bounds and caller execution overrides are rejected', () => {
  assert.throws(() => language.compile(''), /SOURCE_REQUIRED/);
  assert.throws(() => language.compile('x'.repeat(65537)), /SOURCE_TOO_LARGE/);
  assert.throws(() => language.run(source, { live: true }), /RUNTIME_OPTIONS_NOT_ADMITTED/);
  assert.throws(() => language.run(source, { strictIsolation: false }), /RUNTIME_OPTIONS_NOT_ADMITTED/);
});
test('top-level policy violation prevents adapters and subsequent output', () => {
  const result = runIR({ steps: [
    { op: 'COMMAND', command: 'DOCKER', argument: 'prune' },
    { op: 'COMMAND', command: 'اعرض', argument: '"MUST_NOT_RUN"' }
  ] });
  assert.equal(result.ok, false);
  assert.equal(result.state.adapters.calls.length, 0);
  assert.equal(result.state.output.some(s => s.includes('MUST_NOT_RUN')), false);
});
test('nested policy violation stops the branch and the outer program', () => {
  const result = runIR({ steps: [
    { op: 'IF', condition: 'test', thenSteps: [
      { op: 'COMMAND', command: 'DOCKER', argument: 'prune' },
      { op: 'COMMAND', command: 'اعرض', argument: '"NESTED_NOT_RUN"' }
    ], elseSteps: [] },
    { op: 'COMMAND', command: 'اعرض', argument: '"OUTER_NOT_RUN"' }
  ] }, { forceConditionTrue: true });
  assert.equal(result.ok, false);
  assert.equal(result.state.adapters.calls.length, 0);
  assert.equal(result.state.output.length, 0);
});
test('type errors block bytecode generation', () => {
  const result = language.compile('كيان صفقة:\n  الوزن: غير_رقمي طن\n');
  assert.equal(result.success, false);
  assert.equal(result.bytecode, undefined);
});

test('managed HTTP routes require authentication and reject client runtime flags', () => {
  const vm = require('node:vm'); const fs = require('node:fs'); const path = require('node:path');
  const middlewares = []; const handlers = new Map();
  const router = { use(fn) { middlewares.push(fn); }, get(path, fn) { handlers.set('GET ' + path, fn); }, post(path, fn) { handlers.set('POST ' + path, fn); } };
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../routes/sheikha-managed-language-v1.cjs'), 'utf8'), {
    require(name) {
      if (name === 'express') return { Router: () => router, json: () => (_req, _res, next) => next() };
      if (name.includes('managed-language')) return language;
      if (name.includes('sdk-mcp-governance')) return { redact: value => value, authenticateRequest: req => req.headers.authorization === 'test-scoped-key' ? { trusted: true } : null };
      throw new Error('Unexpected dependency');
    }, module: { exports: {} }
  });
  function response() { return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } }; }
  let next = false; const denied = response();
  middlewares[1]({ headers: {} }, denied, () => { next = true; });
  assert.equal(denied.code, 401); assert.equal(next, false);
  middlewares[1]({ headers: { authorization: 'test-scoped-key' } }, response(), () => { next = true; });
  assert.equal(next, true);
  const invalid = response(); handlers.get('POST /run')({ body: { source, live: true } }, invalid);
  assert.equal(invalid.code, 400);
  const valid = response(); handlers.get('POST /run')({ body: { source } }, valid);
  assert.equal(valid.code, 200); assert.equal(valid.body.status, 'VERIFIED_DRY_RUN');
});
test('API SDK connects language actions to the managed endpoint', async () => {
  const calls = [];
  const client = require('../sdk/sheikha-api').createSheikhaApiClient({
    apiKey: 'test-only', fetchImpl: async (url, options) => {
      calls.push({ url, options }); return { ok: true, json: async () => ({ success: true }) };
    }
  });
  await client.language.status(); await client.language.compile(source); await client.language.run(source);
  assert.equal(calls[0].url.endsWith('/managed/v1/status'), true);
  assert.equal(calls[1].options.method, 'POST');
  assert.deepEqual(JSON.parse(calls[2].options.body), { source });
});

test('compiler CLI does not write executable artifacts after a type error', () => {
  const vm = require('node:vm'); const fs = require('node:fs'); const path = require('node:path');
  const { lex } = require('../sheikha-language/compiler/lexer');
  const { parse } = require('../sheikha-language/compiler/parser');
  let writes = 0;
  const compilerDir = path.resolve(__dirname, '../sheikha-language/compiler');
  assert.throws(() => vm.runInNewContext(fs.readFileSync(path.join(compilerDir, 'sheikha-compiler.js'), 'utf8'), {
    require(name) {
      if (name === 'node:fs') return { mkdirSync() {}, writeFileSync() { writes++; } };
      if (name === './source-loader') return { loadSourceProgram: () => ({ ast: parse(lex('كيان صفقة:\n  الوزن: غير_رقمي طن\n')) }) };
      if (name.startsWith('./')) return require(path.join(compilerDir, name));
      return require(name);
    }, process: { argv: ['node', 'compiler', 'test.shk'], exit(code) { throw new Error('EXIT_' + code); } },
    console: { error() {}, log() {} }
  }), /EXIT_2/);
  assert.equal(writes, 0);
});
