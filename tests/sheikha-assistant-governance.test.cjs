'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
const g = require('../core/security/sheikha-sdk-mcp-governance.cjs');
const { check, inspectBindings, probeLocalBridge } = require('../tools/environment/sheikha-assistant-governance-check.cjs');
const ROOT = path.resolve(__dirname, '..');
const request = (name, args = {}) => ({ params: { name, arguments: args } });

test('activation, client identity and approval assertions cannot expand the federation policy', async () => {
  let dispatched = 0;
  const receipts = [], gate = g.createToolGate({ surface: 'federation', audit: r => receipts.push(r) });
  for (const name of ['write_file_unapproved', 'exec_shell', 'sheikha_physical_start', 'sheikha_status', 'toString', '__proto__', 'SECRET_SENTINEL']) {
    const result = await gate(request(name, { environment: 'codex', role: 'admin', humanApproved: true }), () => dispatched++);
    assert.equal(result.isError, true);
  }
  for (const args of [null, [], { humanApproved: true }, { enabled: true }, { permission: '*' }, { url: 'http://example.invalid' }]) {
    assert.equal((await gate(request('sheikha_federation_status', args), () => dispatched++)).isError, true);
  }
  assert.equal(dispatched, 0);
  assert.ok(!JSON.stringify(receipts).includes('SECRET_SENTINEL'));
  assert.equal(g.federationStatus().activationTransfersPermissions, false);
});

test('malformed limits, disabled audit and widened deny rules fail closed', () => {
  for (const mutate of [c => delete c.policies.rate_limit, c => { c.policies.rate_limit.max_requests = 0; },
    c => { c.policies.payload_limits.max_response_bytes = Infinity; }, c => { c.policies.audit.enabled = false; },
    c => { c.denylist.process_exec = false; }, c => { c.allowlist.default = 'allow'; }, c => { c.policies.mode.deny_by_default = false; }]) {
    const config = g.policy('federation'); mutate(config);
    assert.equal(g.decision('sheikha_runtime_status', {}, config).code, 'UNSAFE_POLICY_CONFIGURATION');
  }
  assert.throws(() => g.policy('chatgpt-admin'), /UNKNOWN_POLICY_SURFACE/);
});

test('resources and tools share a per-process rate limit and resource audit is accurate', async () => {
  const receipts = [], gate = g.createToolGate({ surface: 'federation', now: () => 1000, audit: r => receipts.push(r) });
  const resource = { params: { uri: 'sheikha://federation/audit' } };
  for (let i = 0; i < 119; i++) await gate(request('sheikha_federation_status'), () => ({}));
  assert.equal((await gate.resource(resource, () => ({}))).isError, undefined);
  assert.equal(receipts[119].kind, 'resource');
  assert.equal(receipts[119].tool, resource.params.uri);
  let dispatched = false;
  assert.equal((await gate(request('sheikha_federation_status'), () => { dispatched = true; })).content[0].text, 'RATE_LIMITED');
  assert.equal((await gate.resource(resource, () => { dispatched = true; })).content[0].text, 'RATE_LIMITED');
  assert.equal(dispatched, false);
});

test('asynchronous audit failure blocks tools and resources', async () => {
  let dispatched = false;
  const gate = g.createToolGate({ surface: 'federation', audit: async () => { throw Error('disk'); } });
  assert.equal((await gate(request('sheikha_runtime_status'), () => { dispatched = true; })).content[0].text, 'AUDIT_UNAVAILABLE');
  assert.equal((await gate.resource({ params: { uri: 'sheikha://federation/audit' } }, () => { dispatched = true; })).content[0].text, 'AUDIT_UNAVAILABLE');
  assert.equal(dispatched, false);
});

test('parse JSON before redaction so embedded bearer strings cannot disable nested secret filtering', () => {
  for (const field of ['content', 'contents']) {
    const result = g.sanitizeResult({ [field]: [{ type: 'text', text: JSON.stringify({
      title: 'Sheikha platform', header: 'Bearer PRIVATE_TOKEN', nested: { password: 'SECRET_SENTINEL' }, contact: 'private@example.org',
      credentialText: 'Sheikha skh_v2_PRIVATE_KEY'
    }) }] });
    assert.doesNotThrow(() => JSON.parse(result[field][0].text));
    assert.equal(JSON.parse(result[field][0].text).title, 'Sheikha platform');
    assert.ok(!JSON.stringify(result).includes('SECRET_SENTINEL'));
    assert.ok(!JSON.stringify(result).includes('PRIVATE_TOKEN'));
    assert.ok(!JSON.stringify(result).includes('PRIVATE_KEY'));
    assert.ok(!JSON.stringify(result).includes('private@example.org'));
  }
});

test('unavailable shared policy closes dispatch, catalogs and resources without exceptions or execution', async t => {
  const original = fs.readFileSync;
  t.mock.method(fs, 'readFileSync', function (file, ...args) {
    if (String(file).endsWith('federation-allowlist.json')) throw Error('not available');
    return original.call(this, file, ...args);
  });
  let dispatched = false;
  const gate = g.createToolGate({ surface: 'federation' });
  assert.equal((await gate(request('sheikha_runtime_status'), () => { dispatched = true; })).content[0].text, 'POLICY_UNAVAILABLE');
  assert.deepEqual(g.toolCatalog([{ name: 'sheikha_runtime_status' }], 'federation'), []);
  assert.equal(g.resourceAllowed('sheikha://federation/audit', 'federation'), false);
  assert.equal(dispatched, false);
});

test('project bindings agree and drift checker rejects duplicate local aliases and broader command configurations', () => {
  assert.equal(check().status, 'PASS');
  const base = () => ({ mcpServers: { 'sheikha-readonly': { command: 'node', args: ['./mcp-servers/sheikha-mcp-readonly-federation.cjs'] } } });
  assert.equal(inspectBindings(base(), 'standard'), true);
  for (const mutate of [d => { d.mcpServers['sheikha-readonly'].env = { APPROVAL: 'auto' }; },
    d => { d.mcpServers['sheikha-readonly'].args = ['./mcp-servers/sheikha-mcp-server.js']; },
    d => { d.mcpServers['sheikha-readonly'].command = 'bash'; },
    d => { d.mcpServers['sheikha-readonly'].cwd = true; },
    d => { d.mcpServers.provider = { args: 'not-an-array' }; },
    d => { d.mcpServers['sheikha-legacy'] = { command: 'node' }; },
    d => { d.mcpServers.alias = { args: ['./mcp-servers/sheikha-mcp-server.js'] }; }]) {
    const doc = base(); mutate(doc); assert.equal(inspectBindings(doc, 'standard'), false);
  }
});

test('repeatable bridge probe verifies local handshake without claiming app reload or cloud connection', { timeout: 15000 }, async () => {
  const result = await probeLocalBridge();
  assert.equal(result.status, 'PASS');
  assert.equal(result.toolCount, g.federationStatus().tools.length);
  assert.equal(result.policySha256, g.federationStatus().policySha256);
  assert.equal(result.appSessionDiscoveryVerified, false);
  assert.equal(result.externalChatgptConnectionVerified, false);
});

async function connect(name, home) {
  const client = new Client({ name, version: '1.0.0' }, { capabilities: {} });
  const transport = new StdioClientTransport({ command: process.execPath,
    args: [path.join(ROOT, 'mcp-servers/sheikha-mcp-readonly-federation.cjs')], cwd: ROOT,
    env: { HOME: home }, stderr: 'pipe' });
  transport.stderr?.resume();
  try { await client.connect(transport, { timeout: 5000 }); }
  catch (e) { await transport.close(); throw e; }
  return { client, async close() { await client.close(); await transport.close(); } };
}

test('real ChatGPT-labelled and Codex-labelled local clients see identical policy and cannot inherit permissions', { timeout: 20000 }, async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-environment-test-'));
  const clients = [];
  try {
    let previous;
    for (const name of ['ChatGPT', 'Codex']) {
      const connected = await connect(name, home); clients.push(connected);
      const { client } = connected;
      const tools = (await client.listTools()).tools;
      assert.deepEqual(tools.map(t => t.name).sort(), g.federationStatus().tools.sort());
      assert.ok(tools.every(t => t.annotations.readOnlyHint && !t.annotations.destructiveHint));
      const result = await client.callTool({ name: 'sheikha_environment_governance_status', arguments: {} });
      const policy = JSON.parse(result.content[0].text);
      assert.equal(policy.policySha256, g.federationStatus().policySha256);
      if (previous) assert.deepEqual(policy, previous);
      previous = policy;
      assert.equal(policy.externalChatgptConnection, 'NOT_VERIFIED');
      for (const tool of ['exec_shell', 'sheikha_physical_start', 'sheikha_environment_governance_status']) {
        const denied = await client.callTool({ name: tool, arguments: { humanApproved: true, environment: name },
          _meta: { role: 'admin', activatedInOtherEnvironment: true } });
        assert.equal(denied.isError, true);
      }
      await assert.rejects(client.readResource({ uri: 'file:///etc/passwd' }), /RESOURCE_NOT_ADMITTED/);
      await assert.rejects(client.readResource({ uri: 'toString' }), /RESOURCE_NOT_ADMITTED/);
    }
  } finally {
    for (const connected of clients) await connected.close();
    fs.rmSync(home, { recursive: true, force: true });
  }
});

test('real federation evidence is redacted in both tool/resource paths and bounded files fail closed', { timeout: 15000 }, async () => {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-evidence-test-'));
  const file = path.join(home, '.local/share/sheikha-mcp-federation/v2/current/SHEIKHA_MCP_SDK_CURRENT.json');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify({ header: 'Bearer PRIVATE_TOKEN', nested: { password: 'SECRET_SENTINEL' }, state: 'PRESERVED' }));
  let connected;
  try {
    connected = await connect('untrusted-client', home);
    const { client } = connected;
    const tool = await client.callTool({ name: 'sheikha_federation_status', arguments: {} });
    const resource = await client.readResource({ uri: 'sheikha://federation/audit' });
    for (const result of [tool, resource]) {
      assert.ok(!JSON.stringify(result).includes('SECRET_SENTINEL'));
      assert.ok(!JSON.stringify(result).includes('PRIVATE_TOKEN'));
      assert.ok(!JSON.stringify(result).includes(home));
    }
    assert.equal(JSON.parse(tool.content[0].text).audit.evidence, 'PRESERVED_NOT_LIVE');
    const read = async () => JSON.parse((await client.readResource({ uri: 'sheikha://federation/audit' })).contents[0].text);
    fs.writeFileSync(file, 'x'.repeat(1048577));
    assert.equal((await read()).error, 'EVIDENCE_UNAVAILABLE');
    fs.unlinkSync(file);
    const target = path.join(home, 'private.json'); fs.writeFileSync(target, '{"status":"MUST_NOT_READ"}');
    fs.symlinkSync(target, file);
    assert.equal((await read()).error, 'EVIDENCE_UNAVAILABLE');
  } finally {
    if (connected) await connected.close();
    fs.rmSync(home, { recursive: true, force: true });
  }
});
