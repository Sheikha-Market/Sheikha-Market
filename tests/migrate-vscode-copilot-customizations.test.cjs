'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const yaml = require('js-yaml');
const m = require('../tools/migrations/migrate-vscode-copilot-customizations.cjs');

function source() {
  return { servers: Object.fromEntries(m.SELECTED.map(name => [name,
    name.startsWith('datacloud') ? { command: 'node', args: ['/fixture/proxy.js', 'https://example.googleapis.com/mcp'],
      env: { X_GOOG_PROXY_HEADERS: '{"User-Agent":"fixture"}' } }
      : { type: 'http', url: 'https://api.githubcopilot.com/mcp/', gallery: true, version: '1' }])) };
}

test('migrates exactly the nine selected user servers', () => {
  const s = source(); s.servers.datacloud_dataproc_remote = { command: 'node', args: ['${REGION}'] };
  const out = m.migrateServers(s);
  assert.equal(Object.keys(out.mcpServers).length, 9);
  assert.equal(out.mcpServers.datacloud_dataproc_remote, undefined);
  assert.equal(out.mcpServers.datacloud_alloydb_remote.type, 'local');
  assert.equal(out.mcpServers['io.github.github/github-mcp-server'].gallery, undefined);
});
test('does not modify sources or unrelated destination entries', () => {
  const s = source(), before = structuredClone(s);
  const existing = { mcpServers: { unrelated: { type: 'http', url: 'https://example.com/mcp' } }, note: 'keep' };
  const out = m.migrateServers(s, existing);
  assert.deepEqual(s, before); assert.equal(Object.keys(existing.mcpServers).length, 1);
  assert.deepEqual(out.mcpServers.unrelated, existing.mcpServers.unrelated); assert.equal(out.note, 'keep');
});
test('rejects conflicting destination rather than overwriting', () => {
  assert.throws(() => m.migrateServers(source(), { mcpServers: { [m.SELECTED[0]]: { command: 'different' } } }), /CONFLICT/);
});
test('identical definitions are idempotent', () => {
  const out = m.migrateServers(source()); assert.deepEqual(m.migrateServers(source(), out), out);
});
test('missing server fails closed', () => {
  const s = source(); delete s.servers[m.SELECTED[0]]; assert.throws(() => m.migrateServers(s), /OBJECT_REQUIRED/);
});
test('unresolved workspace/input/region placeholders are blocked', () => {
  for (const value of ['${workspaceFolder}/tool.js', '${input:secret}', '${REGION}']) {
    assert.throws(() => m.convert({ command: 'node', args: [value] }), /UNRESOLVED/);
  }
});
test('unknown fields and unsafe transports are blocked', () => {
  assert.throws(() => m.convert({ command: 'node', args: [], dangerous: true }), /UNSUPPORTED/);
  assert.throws(() => m.convert({ type: 'http', url: 'http://example.com' }), /UNSAFE/);
  assert.throws(() => m.convert({ type: 'http', command: 'node', args: [] }), /CONFLICT/);
});
test('existing tool limits are preserved', () => {
  assert.deepEqual(m.convert({ type: 'http', url: 'https://example.com', tools: ['read'] }).tools, ['read']);
});
test('repairs invalid YAML description without changing the body', () => {
  const input = '---\r\ndescription: **CRITICAL**: Only Cosmos DB.\r\n---\r\n\r\n# Body\r\nKeep.\r\n';
  const out = m.migrateInstruction(input); const header = /^---\n([\s\S]*?)\n---\n/.exec(out);
  assert.equal(yaml.load(header[1]).description, '**CRITICAL**: Only Cosmos DB.');
  assert.equal(out.slice(header[0].length), '\r\n# Body\r\nKeep.\r\n');
});
test('preserves existing applyTo metadata', () => {
  const out = m.migrateInstruction('---\ndescription: Cosmos\napplyTo: "src/db/**"\n---\nBody');
  assert.equal(yaml.load(out.split('---')[1]).applyTo, 'src/db/**');
});
test('does not guess malformed multi-field instruction metadata', () => {
  assert.throws(() => m.migrateInstruction('---\ndescription: **oops**\ninvalid: [\n---\nbody'), /UNSUPPORTED/);
});
test('exclusive publication is private and cannot overwrite', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-migration-test-'));
  try {
    const dest = path.join(root, 'config.json'); m.publishNew(dest, Buffer.from('keep'));
    assert.equal(fs.statSync(dest).mode & 0o777, 0o600);
    assert.throws(() => m.publishNew(dest, Buffer.from('overwrite')), { code: 'EEXIST' });
    assert.equal(fs.readFileSync(dest, 'utf8'), 'keep'); assert.deepEqual(fs.readdirSync(root), ['config.json']);
    const link = path.join(root, 'link'); fs.symlinkSync(dest, link);
    assert.throws(() => m.noLinks(link), /SYMLINK/);
    assert.doesNotThrow(() => m.noLinks(path.join(root, 'missing', 'file')));
  } finally { fs.rmSync(root, { recursive: true }); }
});
