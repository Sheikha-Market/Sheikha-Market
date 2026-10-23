'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { SheikhaStudioWorkspace } = require('../runtime/sheikha-studio/core/sheikha-studio-workspace-v1');

describe('Sheikha Studio Workspace V1', () => {
  let root;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-studio-'));
    fs.writeFileSync(path.join(root, 'example.js'), 'const value = 1;\n', { mode: 0o640 });
    fs.mkdirSync(path.join(root, 'src'));
    fs.mkdirSync(path.join(root, '.git'));
  });

  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));

  test('lists and reads bounded workspace files while hiding sensitive paths', () => {
    const workspace = new SheikhaStudioWorkspace({ root });
    const listing = workspace.list('.');
    expect(listing.entries.map((entry) => entry.name)).toContain('example.js');
    expect(listing.entries.map((entry) => entry.name)).not.toContain('.git');
    const file = workspace.read('example.js');
    expect(file.content).toBe('const value = 1;\n');
    expect(file.sha256).toMatch(/^[a-f0-9]{64}$/);
  });

  test('denies traversal and writes by default', () => {
    const workspace = new SheikhaStudioWorkspace({ root });
    expect(() => workspace.read('../outside')).toThrow(expect.objectContaining({ code: 'PATH_ESCAPE_DENIED' }));
    const current = workspace.read('example.js');
    expect(() => workspace.write('example.js', 'changed\n', current.sha256))
      .toThrow(expect.objectContaining({ code: 'WORKSPACE_WRITE_DISABLED' }));
  });

  test('uses optimistic concurrency and preserves file permissions when enabled', () => {
    const workspace = new SheikhaStudioWorkspace({ root, writeEnabled: true });
    const current = workspace.read('example.js');
    expect(() => workspace.write('example.js', 'changed\n', '0'.repeat(64)))
      .toThrow(expect.objectContaining({ code: 'FILE_VERSION_CONFLICT' }));
    const updated = workspace.write('example.js', 'changed\n', current.sha256);
    expect(updated.content).toBe('changed\n');
    expect(fs.statSync(path.join(root, 'example.js')).mode & 0o777).toBe(0o640);
  });
});
