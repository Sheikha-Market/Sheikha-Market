'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const mcpRequire = require('node:module').createRequire(path.resolve(__dirname, '../mcp-servers/package.json'));
const { Client } = mcpRequire('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = mcpRequire('@modelcontextprotocol/sdk/client/stdio.js');
const f = require('../core/integrations/sheikha-provider-federation-v1.cjs');
const { probeGoogle, probeGithub, main, jsonResponse } = require('../tools/environment/sheikha-provider-federation-check.cjs');
const fixture = () => JSON.parse(fs.readFileSync(path.join(f.ROOT, f.REGISTRY), 'utf8'));

test('registry aligns eight providers without asserting activation or shared permissions', () => {
  const r = f.validateRegistry(fixture());
  assert.deepEqual(Object.keys(r.providers), f.IDS);
  assert.deepEqual(r.providers.firebase, r.providers['google-cloud']);
  assert.equal(r.providers.github.repository, r.providers['github-copilot'].repository);
  assert.equal(r.automaticSync, false);
  assert.equal(r.sharedCredentials, false);
});

test('unsafe registry fields and mismatched identities fail closed without disclosing values', () => {
  for (const mutate of [
    r => { r.secret = 'PRIVATE_SENTINEL'; },
    r => { r.providers.cloudflare.token = 'PRIVATE_SENTINEL'; },
    r => { r.providers.cloudflare.mcpUrl = 'https://untrusted.invalid/mcp'; },
    r => { r.providers.firebase.projectId = 'another-project'; },
    r => { r.providers.firebase.projectNumber = '123456789'; },
    r => { r.providers['github-copilot'].repository = 'other/repo'; },
    r => { r.providers['google-cloud'].projectId = '../secrets'; },
    r => { r.providers['google-workspace'].domain = 'example.org?token=PRIVATE_SENTINEL'; },
    r => { r.providers.codex.instructions = '../../auth.json'; },
    r => { r.automaticSync = true; },
    r => { r.sharedCredentials = true; },
    r => { r.productionAdmission = 'ACTIVE'; },
    r => { r.links[0].syncEnabled = true; },
    r => { r.links.push(r.links[0]); }
  ]) {
    const r = fixture(); mutate(r);
    assert.throws(() => f.validateRegistry(r), e => e.message === 'REGISTRY_INVALID');
  }
});

test('offline command never launches a CLI or network request', async () => {
  let calls = 0;
  const report = await main([], { execute: () => calls++, request: () => calls++ });
  assert.equal(calls, 0);
  assert.equal(report.remoteReadsAttempted, false);
  assert.equal(report.productionAdmission, 'HOLD');
  assert.equal(report.providers.length, 8);
  assert.ok(report.providers.every(p => p.liveVerified === false));
});

test('unsupported CLI modes do not run probes', async () => {
  for (const args of [['--deploy'], ['--probe-google', '--probe-google'], ['--url=https://example.org']]) {
    const r = await main(args, { execute: () => assert.fail('no execution') });
    assert.equal(r.status, 'BLOCKED');
  }
});

test('bounded input rejects symlinks, directories, oversized and malformed registries', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-providers-'));
  const file = path.join(root, f.REGISTRY);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  try {
    for (const contents of ['{', 'x'.repeat(1048577), '{"password":"PRIVATE_SENTINEL"}']) {
      fs.writeFileSync(file, contents);
      const r = f.inspect({ root });
      assert.equal(r.status, 'BLOCKED');
      assert.ok(!JSON.stringify(r).includes('PRIVATE_SENTINEL'));
    }
    fs.unlinkSync(file);
    fs.symlinkSync(path.join(f.ROOT, f.REGISTRY), file);
    assert.equal(f.inspect({ root }).status, 'BLOCKED');
    fs.unlinkSync(file);
    fs.mkdirSync(file);
    assert.equal(f.inspect({ root }).status, 'BLOCKED');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});

test('Google probe reads only project metadata and fixed Firebase origin without exposing token', async () => {
  const r = fixture(), expected = r.providers.firebase, calls = [];
  const results = await probeGoogle(r, {
    execute: (command, args) => {
      calls.push({ command, args });
      return args[0] === 'projects' ? JSON.stringify({ ...expected, lifecycleState: 'ACTIVE' }) : 'PRIVATE_SENTINEL';
    },
    request: async (url, options) => {
      assert.equal(url, `https://firebase.googleapis.com/v1beta1/projects/${expected.projectId}`);
      assert.equal(options.method, 'GET');
      assert.equal(options.redirect, 'error');
      assert.equal(options.headers.Authorization, 'Bearer PRIVATE_SENTINEL');
      return new Response(JSON.stringify({ ...expected, state: 'ACTIVE', secret: 'PRIVATE_SENTINEL' }));
    }
  });
  assert.equal(calls.length, 2);
  assert.ok(results.every(x => x.state === 'READ_VERIFIED' && x.operationalReadinessVerified === false));
  assert.ok(!JSON.stringify(results).includes('PRIVATE_SENTINEL'));
});

test('Google project mismatch stops token acquisition and remote read', async () => {
  let calls = 0;
  const results = await probeGoogle(fixture(), {
    execute: () => { calls++; return '{"projectId":"another-project","projectNumber":"111111","lifecycleState":"ACTIVE"}'; },
    request: () => assert.fail('no request allowed')
  });
  assert.equal(calls, 1);
  assert.equal(results[0].state, 'IDENTITY_MISMATCH');
  assert.equal(results[1].state, 'BLOCKED_BY_PROJECT_CHECK');
});

test('Firebase non-success responses are not activation and response errors are not disclosed', async () => {
  const r = fixture();
  for (const status of [401, 403, 404, 429, 500]) {
    const results = await probeGoogle(r, {
      execute: (_, args) => args[0] === 'projects' ? JSON.stringify({ ...r.providers.firebase, lifecycleState: 'ACTIVE' }) : 'PRIVATE_SENTINEL',
      request: async () => new Response('PRIVATE_SENTINEL', { status })
    });
    assert.equal(results[1].state, 'READ_NOT_VERIFIED');
    assert.equal(results[1].httpStatus, status);
    assert.ok(!JSON.stringify(results).includes('PRIVATE_SENTINEL'));
  }
  const results = await probeGoogle(r, { execute: () => { throw Error('PRIVATE_SENTINEL'); } });
  assert.equal(results[0].state, 'AUTH_OR_READ_CHECK_FAILED');
  assert.ok(!JSON.stringify(results).includes('PRIVATE_SENTINEL'));
});

test('only allowlisted structured API failure reasons are retained', async () => {
  const r = await jsonResponse(new Response(JSON.stringify({ error: {
    message: 'PRIVATE_SENTINEL', details: [{ reason: 'PRIVATE_SENTINEL' }, { reason: 'SERVICE_DISABLED' }]
  } }), { status: 403 }));
  assert.deepEqual(r, { httpStatus: 403, reason: 'SERVICE_DISABLED' });
});

test('Firebase success for a different project is rejected and response length is bounded', async () => {
  const r = fixture();
  const results = await probeGoogle(r, {
    execute: (_, args) => args[0] === 'projects' ? JSON.stringify({ ...r.providers.firebase, lifecycleState: 'ACTIVE' }) : 'PRIVATE_SENTINEL',
    request: async () => new Response('{"projectId":"other-project","projectNumber":"111111","state":"ACTIVE"}')
  });
  assert.equal(results[1].state, 'IDENTITY_MISMATCH');
  await assert.rejects(jsonResponse(new Response('x'.repeat(65537))), /RESPONSE_TOO_LARGE/);
});

test('GitHub checks exact repository binding, archived state and sanitized failures', () => {
  const r = fixture();
  const success = probeGithub(r, (cmd, args) => {
    assert.equal(cmd, 'gh');
    assert.equal(args[0], 'api');
    assert.equal(args[1], `repos/${r.providers.github.repository}`);
    return JSON.stringify({ full_name: r.providers.github.repository, archived: false });
  });
  assert.equal(success.state, 'READ_VERIFIED');
  assert.equal(probeGithub(r, () => '{"full_name":"other/repo","archived":false}').state, 'IDENTITY_MISMATCH');
  assert.equal(probeGithub(r, () => JSON.stringify({ full_name: r.providers.github.repository, archived: true })).state, 'NOT_ACTIVE');
  assert.equal(probeGithub(r, () => { throw Error('PRIVATE_SENTINEL'); }).state, 'AUTH_OR_READ_CHECK_FAILED');
});

test('shared MCP resource is locally readable and cannot dispatch writes or caller-supplied URLs', { timeout: 15000 }, async () => {
  const client = new Client({ name: 'provider-federation-test', version: '1.0.0' }, { capabilities: {} });
  const transport = new StdioClientTransport({ command: process.execPath,
    args: [path.join(f.ROOT, 'mcp-servers/sheikha-mcp-readonly-federation.cjs')], cwd: f.ROOT, stderr: 'pipe' });
  transport.stderr?.resume();
  try {
    await client.connect(transport, { timeout: 5000 });
    const resources = (await client.listResources()).resources;
    assert.ok(resources.some(x => x.uri === f.RESOURCE));
    const response = await client.readResource({ uri: f.RESOURCE });
    const report = JSON.parse(response.contents[0].text);
    assert.equal(report.registrySha256, f.inspect().registrySha256);
    assert.equal(report.scope, 'LOCAL_CONFIGURATION_ONLY');
    assert.equal(report.remoteOperations, false);
    assert.equal(report.credentialsShared, false);
    assert.ok(report.providers.every(p => p.liveVerified === false));
    await assert.rejects(client.readResource({ uri: f.RESOURCE + '?url=https://example.org' }));
    const denied = await client.callTool({ name: 'provider_sync', arguments: { approved: true } });
    assert.equal(denied.isError, true);
  } finally { await client.close(); await transport.close(); }
});
