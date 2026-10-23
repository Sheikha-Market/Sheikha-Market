'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { COMPONENTS, REVIEW_AREAS, inspectWorkspace, IntegrationJournal, integrationMarkdown } = require('../src/chat/sheikhaWorkspaceIntegration');
const { COMPONENTS: repositoryComponents } = require('../../runtime/repository-integration/v1/sheikha-repository-integration-v1');

describe('local workspace integration and change evidence', () => {
  let root;
  beforeEach(() => { root = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-integration-test-')); });
  afterEach(() => { fs.rmSync(root, { recursive: true, force: true }); });
  function write(relative, content = 'PRIVATE_FILE_CONTENT') {
    const file = path.join(root, relative);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content, { mode: 0o600 }); return file;
  }

  test('packaged catalog preserves all existing repository inspector paths', () => {
    expect(COMPONENTS).toHaveLength(21);
    expect(COMPONENTS.some(component => component.id === 'SHEIKHA_OS')).toBe(true);
    expect(COMPONENTS.map(component => component.id)).toEqual(expect.arrayContaining(['SHEIKHA_TRUST', 'SHEIKHA_BARE_METAL', 'SHEIKHA_NATIVE']));
    for (const [id, files] of Object.entries(repositoryComponents)) {
      expect(COMPONENTS.find(component => component.id === id).files).toEqual(files);
    }
    expect(new Set(COMPONENTS.map(c => c.id)).size).toBe(COMPONENTS.length);
    expect(REVIEW_AREAS).toHaveLength(8);
    expect(REVIEW_AREAS.every(area => area.state === 'DESIGN_REVIEW_REQUIRED')).toBe(true);
  });

  test('observes hashes, not execution, trained weights or production proof', async () => {
    for (const component of COMPONENTS) for (const file of component.files) write(file, 'throw new Error("PRIVATE_FILE_CONTENT");');
    write('.env', 'SECRET_ENV_SENTINEL');
    const report = await inspectWorkspace(root);
    expect(report.components.every(c => c.state === 'SOURCES_PRESENT')).toBe(true);
    expect(report.components.every(c => c.runtimeVerified === false)).toBe(true);
    expect(report).toMatchObject({ externalRequests: 0, workspaceCodeExecuted: false, sourceModified: false,
      hardwareAccessed: false, modelWeightsVerified: false, commercialProductionReady: false });
    expect(report.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(report)).not.toMatch(/PRIVATE_FILE_CONTENT|SECRET_ENV_SENTINEL/);
    expect(JSON.stringify(report)).not.toContain(root);
    expect(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).toContain('throw new Error');
  });

  test('missing, oversized, hard-linked and symlinked sources cannot be evidence', async () => {
    write('package.json', 'x'.repeat(5 * 1024 * 1024 + 1));
    const secret = write('private.txt');
    fs.symlinkSync(secret, path.join(root, 'package-lock.json'));
    const gitPath = COMPONENTS[0].files[0];
    fs.mkdirSync(path.dirname(path.join(root, gitPath)), { recursive: true });
    fs.linkSync(secret, path.join(root, gitPath));
    const report = await inspectWorkspace(root);
    expect(report.components.every(c => c.state === 'SOURCES_INCOMPLETE')).toBe(true);
    expect(report.components.flatMap(c => c.evidence).every(e => e.sha256 === null)).toBe(true);
    expect(report.components.find(c => c.id === 'SHEIKHA_NODE').evidence.every(e => e.state === 'SOURCE_UNVERIFIED')).toBe(true);
  });

  test('rejects symlinked ancestors and a symlinked workspace root', async () => {
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-outside-test-'));
    try {
      fs.symlinkSync(outside, path.join(root, 'runtime'));
      const location = path.join(outside, 'sheikha-studio/git-lab'); fs.mkdirSync(location, { recursive: true });
      fs.writeFileSync(path.join(location, 'sheikha-git-lab-federation.js'), 'private');
      expect((await inspectWorkspace(root)).components[0].evidence[0].state).toBe('SOURCE_UNVERIFIED');
      const alias = path.join(root, 'alias'); fs.symlinkSync(outside, alias);
      await expect(inspectWorkspace(alias)).rejects.toThrow('CANONICAL_WORKSPACE_REQUIRED');
    } finally { fs.rmSync(outside, { recursive: true, force: true }); }
  });

  test('journal separates baseline, true changes, duplicate refresh and workspace switch', async () => {
    write('package.json', '{}'); const journal = new IntegrationJournal();
    const first = await inspectWorkspace(root); journal.accept(root, first);
    expect(journal.snapshot()).toMatchObject({ newChangeCount: 0, changes: [], monitoring: 'MANUAL_SESSION_ONLY' });
    journal.accept(root, await inspectWorkspace(root)); expect(journal.changes).toHaveLength(0);
    write('package.json', '{"version":"2"}'); journal.accept(root, await inspectWorkspace(root));
    expect(journal.newChangeCount).toBe(1);
    expect(journal.changes[0]).toMatchObject({ componentId: 'SHEIKHA_NODE', causeProven: false, impactMeasured: false,
      changedSources: ['package.json'], status: 'REVIEW_REQUIRED' });
    journal.accept(root, await inspectWorkspace(root)); expect(journal.newChangeCount).toBe(0);
    expect(journal.changes).toHaveLength(1);
    const clone = journal.snapshot(); clone.latest.components[0].state = 'FORGED';
    expect(journal.latest.components[0].state).not.toBe('FORGED');
    expect(integrationMarkdown(journal.snapshot())).toContain('لا تشغيل للخدمات');
    journal.accept('another-workspace', first); expect(journal.changes).toHaveLength(0);
    journal.reset(); expect(journal.latest).toBeNull();
  });

  test('loss and recovery of source evidence are changes without causal claims; retention is bounded', async () => {
    const journal = new IntegrationJournal(); const report = await inspectWorkspace(root);
    journal.accept(root, report);
    for (let i = 0; i < 24; i++) {
      const changed = JSON.parse(JSON.stringify(report));
      changed.components[0].evidence[0] = { ...changed.components[0].evidence[0], sha256: String(i), state: 'SOURCE_PRESENT' };
      journal.accept(root, changed);
    }
    expect(journal.changes).toHaveLength(20);
    journal.accept(root, report); expect(journal.newChangeCount).toBe(1);
    expect(journal.changes.at(-1).causeProven).toBe(false);
  });
});
