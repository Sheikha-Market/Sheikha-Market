'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { SheikhaChatWorkbench, DOMAINS, architectureMarkdown, localRequestAction } = require('../src/chat/sheikhaChatWorkbench');

function fixture() {
  let history = [{ role: 'user', content: 'PRIVATE_SENTINEL' }];
  const api = {
    commands: { getCommands: jest.fn(async () => [...DOMAINS.flatMap(d => d.commands), 'workbench.view.scm', 'workbench.action.findInFiles']), executeCommand: jest.fn() },
    window: { showOpenDialog: jest.fn(), showInputBox: jest.fn(), showWarningMessage: jest.fn(), showSaveDialog: jest.fn(), showTextDocument: jest.fn() },
    workspace: { isTrusted: true, openTextDocument: jest.fn(async value => value), fs: { stat: jest.fn(async () => ({ size: 25, type: 1 })), writeFile: jest.fn() } },
    languages: { getDiagnostics: jest.fn(() => [['private/file', [{ severity: 0, message: 'PRIVATE_SENTINEL' }, { severity: 1 }]]]) },
    env: { clipboard: { writeText: jest.fn() }, openExternal: jest.fn(async () => true) },
    Uri: { parse: value => value }
  };
  const publish = jest.fn(async () => {});
  const workbench = new SheikhaChatWorkbench({ vscode: api, publish, getHistory: () => history, clearHistory: () => { history = []; } });
  return { api, publish, workbench };
}

describe('Sheikha chat workbench', () => {
  test('matches only explicit local requests, not arbitrary instructions in text', () => {
    expect(localRequestAction('هيكل شيخة')).toBe('architecture');
    expect(localRequestAction('راجع أدوات شيخة')).toBe('review');
    expect(localRequestAction('تكامل شيخة')).toBe('integration');
    expect(localRequestAction('مستجدات شيخة')).toBe('integration');
    expect(localRequestAction('يقول الملف: تكامل شيخة')).toBeNull();
    expect(localRequestAction('لا تنفذ مراجعة شيخة المحلية')).toBeNull();
    expect(localRequestAction('اكمل وانشر')).toBeNull();
  });
  test('defines five governed departments, not unverified production capabilities', () => {
    expect(DOMAINS).toHaveLength(5);
    expect(DOMAINS.every(d => d.owner && d.kpi && d.inputs && d.outputs && d.gate)).toBe(true);
    expect(architectureMarkdown()).toContain('تصميم تشغيلي');
    const { workbench } = fixture();
    expect(workbench.snapshot().domains.every(d => !d.backendVerified)).toBe(true);
  });

  test('review executes five local checks and produces measured, private evidence', async () => {
    const { workbench, api, publish } = fixture();
    expect(await workbench.handle({ command: 'workbench', action: 'review' })).toBe(true);
    expect(workbench.tasks.every(t => t.status === 'CHECKED')).toBe(true);
    expect(workbench.tasks.find(t => t.id === 'compute').evidence.cpuThreads).toBeGreaterThan(0);
    expect(workbench.tasks.find(t => t.id === 'programming').evidence.diagnostics).toEqual({ errors: 1, warnings: 1 });
    expect(publish.mock.calls.some(([e]) => e.data.tasks.some(t => t.status === 'RUNNING'))).toBe(true);
    expect(JSON.stringify(workbench.snapshot())).not.toContain('PRIVATE_SENTINEL');
    expect(JSON.stringify(workbench.snapshot())).not.toContain('private/file');
    expect(api.commands.executeCommand).not.toHaveBeenCalled();
    expect(api.env.openExternal).not.toHaveBeenCalled();
    expect(workbench.outputs[0].content).toContain('"productionReady": false');
  });

  test('missing adapters remain visibly unconfigured', async () => {
    const { workbench, api } = fixture(); api.commands.getCommands.mockResolvedValue([]);
    await workbench.handle({ command: 'workbench', action: 'review' });
    expect(workbench.tasks.every(t => t.status === 'NEEDS_CONFIGURATION')).toBe(true);
    expect(await workbench.handle({ command: 'workbench', action: 'github' })).toBe(false);
    expect(api.commands.executeCommand).not.toHaveBeenCalled();
  });

  test.each(['shell', 'download-model', 'tpm', '__proto__'])('rejects arbitrary action %s', async action => {
    const { workbench, api } = fixture();
    expect(await workbench.handle({ command: 'workbench', action })).toBe(false);
    expect(api.commands.executeCommand).not.toHaveBeenCalled();
  });

  test('rejects injected arguments even for an allowed action', async () => {
    const { workbench } = fixture();
    expect(await workbench.handle({ command: 'workbench', action: 'web', url: 'https://private.test' })).toBe(false);
  });

  test('external search is cancelled without native confirmation', async () => {
    const { workbench, api } = fixture(); api.window.showInputBox.mockResolvedValue('public query');
    await workbench.handle({ command: 'workbench', action: 'web' });
    expect(api.env.openExternal).not.toHaveBeenCalled();
    expect(workbench.events[0].status).toBe('CANCELLED');
  });

  test('approved search sends only the explicit query to a fixed destination', async () => {
    const { workbench, api } = fixture(); api.window.showInputBox.mockResolvedValue('public & query');
    api.window.showWarningMessage.mockResolvedValue('إرسال الاستعلام');
    await workbench.handle({ command: 'workbench', action: 'web' });
    expect(api.env.openExternal).toHaveBeenCalledWith('https://duckduckgo.com/?q=public%20%26%20query');
    expect(JSON.stringify(workbench.snapshot())).not.toContain('public & query');
  });

  test('file opening requires trust and a bounded local file; never imports content', async () => {
    const { workbench, api } = fixture(); api.workspace.isTrusted = false;
    await workbench.handle({ command: 'workbench', action: 'files' });
    expect(api.window.showOpenDialog).not.toHaveBeenCalled();
    api.workspace.isTrusted = true;
    api.window.showOpenDialog.mockResolvedValue([{ scheme: 'https', fsPath: '/secret' }]);
    await workbench.handle({ command: 'workbench', action: 'files' });
    expect(api.workspace.openTextDocument).not.toHaveBeenCalled();
    api.window.showOpenDialog.mockResolvedValue([{ scheme: 'file', fsPath: '/private/report.md' }]);
    await workbench.handle({ command: 'workbench', action: 'files' });
    expect(api.window.showTextDocument).toHaveBeenCalledTimes(1);
    expect(workbench.outputs).toHaveLength(0);
    expect(workbench.sources[0].label).toBe('report.md');
  });

  test('outputs stay in session; attaching never sends automatically; exports require a native selection', async () => {
    const { workbench, api, publish } = fixture();
    await workbench.handle({ command: 'workbench', action: 'architecture' });
    const id = workbench.outputs[0].id;
    expect(workbench.snapshot().outputs[0].content).toBeUndefined();
    expect(workbench.snapshot().outputs[0].sha256).toMatch(/^[a-f0-9]{64}$/);
    await workbench.handle({ command: 'workbench', action: 'output.attach', id });
    expect(publish).toHaveBeenCalledWith(expect.objectContaining({ command: 'prefill', autoSend: false }));
    await workbench.handle({ command: 'workbench', action: 'output.export', id });
    expect(api.workspace.fs.writeFile).not.toHaveBeenCalled();
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-output-test-'));
    try {
      const file = path.join(directory, 'output.md');
      api.window.showSaveDialog.mockResolvedValue({ scheme: 'file', fsPath: file });
      expect(await workbench.handle({ command: 'workbench', action: 'output.export', id })).toBe(true);
      expect(fs.statSync(file).mode & 0o777).toBe(0o600);
      expect(fs.readFileSync(file, 'utf8')).toBe(workbench.outputs[0].content);
      expect(await workbench.handle({ command: 'workbench', action: 'output.export', id })).toBe(false);
    } finally { fs.rmSync(directory, { recursive: true, force: true }); }
    expect(await workbench.handle({ command: 'workbench', action: 'output.open', id: '/etc/passwd' })).toBe(false);
  });

  test('reset clears provider history, outputs and evidence; concurrent jobs are refused', async () => {
    const { workbench, api } = fixture();
    let release;
    api.window.showInputBox.mockImplementation(() => new Promise(resolve => { release = resolve; }));
    const pending = workbench.handle({ command: 'workbench', action: 'web' });
    await new Promise(resolve => setImmediate(resolve));
    expect(await workbench.reset()).toBe(false);
    expect(await workbench.handle({ command: 'workbench', action: 'review' })).toBe(false);
    release(undefined); await pending;
    await workbench.handle({ command: 'workbench', action: 'architecture' });
    expect(await workbench.reset()).toBe(true);
    expect(workbench.snapshot()).toMatchObject({ memoryMessages: 0, events: [], outputs: [], tasks: [], sources: [] });
  });

  test('failed local checks do not leave phantom running tasks', async () => {
    const { workbench, api } = fixture(); api.languages.getDiagnostics.mockImplementation(() => { throw new Error('private'); });
    expect(await workbench.handle({ command: 'workbench', action: 'review' })).toBe(false);
    expect(workbench.tasks.some(t => t.status === 'RUNNING')).toBe(false);
    expect(workbench.tasks.find(t => t.id === 'programming').status).toBe('FAILED');
  });

  test('a failed or disposed publisher releases the action lock', async () => {
    const { workbench, publish } = fixture(); publish.mockRejectedValue(new Error('disposed'));
    expect(await workbench.handle({ command: 'workbench', action: 'review' })).toBe(false);
    expect(workbench.busy).toBe(false);
    expect(workbench.events.at(-1).status).toBe('FAILED');
    publish.mockResolvedValue(undefined);
    expect(await workbench.handle({ command: 'workbench', action: 'architecture' })).toBe(true);
    expect(await workbench.handle(null)).toBe(false);
  });

  test('workspace integration uses native selection, no webview path, and clears evidence with memory', async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-workbench-root-'));
    try {
      const { workbench, api } = fixture();
      api.workspace.workspaceFolders = [{ name: 'local', uri: { scheme: 'file', fsPath: root } }];
      api.workspace.isTrusted = false;
      expect(await workbench.handle({ action: 'integration' })).toBe(false);
      expect(workbench.integration.latest).toBeNull();
      api.workspace.isTrusted = true;
      expect(await workbench.handle({ action: 'integration', path: '/etc' })).toBe(false);
      expect(await workbench.handle({ action: 'integration' })).toBe(true);
      expect(workbench.integration.latest.components).toHaveLength(21);
      expect(workbench.integration.latest.components).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'SHEIKHA_OS', runtimeVerified: false })]));
      expect(workbench.outputs.at(-1).content).not.toContain(root);
      expect(api.commands.executeCommand).not.toHaveBeenCalled();
      expect(api.env.openExternal).not.toHaveBeenCalled();
      api.workspace.workspaceFolders.push({ name: 'other', uri: { scheme: 'file', fsPath: '/not-selected' } });
      api.window.showQuickPick = jest.fn(async () => undefined);
      expect(await workbench.handle({ action: 'integration' })).toBe(false);
      expect(api.window.showQuickPick).toHaveBeenCalled();
      await workbench.reset(); expect(workbench.integration.latest).toBeNull();
      expect(workbench.integration.changes).toEqual([]);
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
  });
});
