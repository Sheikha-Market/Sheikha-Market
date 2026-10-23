'use strict';

const { attachWorkspaceCenter, LOCAL_EXTENSIONS } = require('../src/sheikhaWorkspaceCenter');
const { RECEIPT_KEY } = require('../src/sheikhaWorkspaceAutomation');

function fixture({ enabled = true, trusted = true } = {}) {
  const handlers = {};
  const event = name => jest.fn(fn => { handlers[name] = fn; return { dispose: jest.fn(() => delete handlers[name]) }; });
  const config = { enabled };
  const extensions = [...LOCAL_EXTENSIONS, 'cloud.provider'].map(id => {
    const e = { id, isActive: false, packageJSON: { version: '1.0.0', main: 'index.js' } };
    e.activate = jest.fn(async () => { e.isActive = true; }); return e;
  });
  const state = { update: jest.fn(async () => {}) };
  const status = { show: jest.fn(), dispose: jest.fn() };
  const output = { appendLine: jest.fn(), dispose: jest.fn() };
  const update = jest.fn(async (key, value) => { config.enabled = value; handlers.config({ affectsConfiguration: k => k === 'sheikha.workspaceLocalTools' }); });
  const api = { ConfigurationTarget: { Workspace: 2 }, StatusBarAlignment: { Right: 2 },
    extensions: { all: extensions, getExtension: id => extensions.find(e => e.id === id), onDidChange: event('extensions') },
    workspace: { isTrusted: trusted, workspaceFolders: [{ name: 'PRIVATE_FOLDER', uri: { fsPath: '/PRIVATE/PATH' } }],
      getConfiguration: () => ({ get: () => config.enabled, update }),
      openTextDocument: jest.fn(async value => value),
      onDidGrantWorkspaceTrust: event('trust'), onDidChangeConfiguration: event('config'),
      onDidChangeWorkspaceFolders: event('folders') },
    window: { createOutputChannel: jest.fn(() => output), createStatusBarItem: jest.fn(() => status),
      showQuickPick: jest.fn(), showTextDocument: jest.fn() },
    commands: { executeCommand: jest.fn(), getCommands: jest.fn(async () => []) } };
  const context = { subscriptions: [], workspaceState: state };
  const center = attachWorkspaceCenter(api, context);
  return { api, center, automation: center.automation, extensions, handlers, config, state, status, output, update,
    dispose: () => context.subscriptions.forEach(s => s.dispose()) };
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());
const tick = () => jest.advanceTimersByTimeAsync(800);

test('automatically audits and activates the fixed local tools without opening a menu or running commands', async () => {
  const f = fixture();
  expect(f.extensions[0].activate).not.toHaveBeenCalled();
  await tick();
  expect(f.automation.latest).toMatchObject({ status: 'COMPLETED', count: 6, activeCount: 5, persistence: 'WORKSPACE_STATE_SAVED' });
  expect(f.state.update).toHaveBeenCalledWith(RECEIPT_KEY, expect.objectContaining({ status: 'CHECK_STARTED' }));
  expect(f.state.update.mock.invocationCallOrder[0]).toBeLessThan(f.extensions[0].activate.mock.invocationCallOrder[0]);
  expect(f.extensions[5].activate).not.toHaveBeenCalled();
  expect(f.api.commands.executeCommand).not.toHaveBeenCalled();
  expect(f.api.window.showQuickPick).not.toHaveBeenCalled();
  expect(f.status.command).toBe('sheikha.awareness.scan');
  f.dispose();
});

test.each(['disabled', 'untrusted', 'empty'])('does not activate while %s', async mode => {
  const f = fixture({ enabled: mode !== 'disabled', trusted: mode !== 'untrusted' });
  if (mode === 'empty') f.api.workspace.workspaceFolders = [];
  await tick();
  for (const e of f.extensions) expect(e.activate).not.toHaveBeenCalled();
  expect(f.automation.latest.status).not.toBe('COMPLETED'); f.dispose();
});

test('trust grant starts automation without the controller changing trust', async () => {
  const f = fixture({ trusted: false }); await tick();
  f.api.workspace.isTrusted = true; f.handlers.trust(); await tick();
  expect(f.automation.latest.status).toBe('COMPLETED'); f.dispose();
});

test('bursts are coalesced and do not cause polling or repeated activations', async () => {
  const f = fixture();
  for (let i = 0; i < 100; i++) f.handlers.extensions();
  await tick();
  expect(f.state.update).toHaveBeenCalledTimes(2);
  expect(f.automation.latest.reasons).toEqual(['STARTUP', 'EXTENSIONS_CHANGED']);
  await jest.advanceTimersByTimeAsync(3600000);
  expect(f.state.update).toHaveBeenCalledTimes(2);
  for (const e of f.extensions.slice(0, 5)) expect(e.activate).toHaveBeenCalledTimes(1);
  f.dispose();
});

test('schedules one follow-up after changes during an in-flight check and keeps the history bounded', async () => {
  const f = fixture();
  f.extensions[0].activate.mockImplementation(async () => {
    f.extensions[0].isActive = true; f.handlers.extensions(); f.handlers.extensions();
  });
  await jest.advanceTimersByTimeAsync(1600);
  expect(f.state.update).toHaveBeenCalledTimes(4);
  for (let i = 0; i < 15; i++) { f.handlers.extensions(); await tick(); }
  expect(f.automation.inspect().sessionHistory).toHaveLength(20);
  expect(f.extensions[0].activate).toHaveBeenCalledTimes(1); f.dispose();
});

test('an audit failure blocks activation and redacts the failure content', async () => {
  const f = fixture(); f.state.update.mockRejectedValue(Error('PRIVATE_TOKEN'));
  await tick();
  expect(f.automation.state()).toBe('AUDIT_UNAVAILABLE');
  expect(f.extensions[0].activate).not.toHaveBeenCalled();
  expect(JSON.stringify(f.output.appendLine.mock.calls)).not.toContain('PRIVATE_TOKEN');
  f.dispose();
});

test('receipts exclude folder paths, third-party identities and contributed command contents', async () => {
  const f = fixture(); await tick();
  const saved = JSON.stringify(f.state.update.mock.calls);
  for (const privateText of ['PRIVATE_FOLDER', '/PRIVATE/PATH', 'cloud.provider']) expect(saved).not.toContain(privateText);
  f.dispose();
});

test('pausing during activation stops subsequent tools and is persisted to workspace scope', async () => {
  const f = fixture(); let resolve;
  f.extensions[0].activate.mockImplementation(() => new Promise(r => { resolve = r; }));
  await tick();
  await f.automation.setEnabled(false); resolve();
  await tick();
  expect(f.update).toHaveBeenCalledWith('workspaceLocalTools', false, 2);
  expect(f.extensions[1].activate).not.toHaveBeenCalled();
  expect(f.automation.state()).toBe('PAUSED');
  f.dispose();
});

test('settings changes can resume a pause but unrelated changes cannot schedule activation', async () => {
  const f = fixture({ enabled: false }); await tick();
  const calls = f.state.update.mock.calls.length;
  f.handlers.config({ affectsConfiguration: () => false }); await tick();
  expect(f.state.update).toHaveBeenCalledTimes(calls);
  await f.automation.setEnabled(false);
  f.config.enabled = true; f.handlers.config({ affectsConfiguration: () => true }); await tick();
  expect(f.automation.latest.status).toBe('COMPLETED'); f.dispose();
});

test('failed setting writes pause in-session and an untrusted workspace cannot be enabled', async () => {
  const f = fixture(); f.update.mockRejectedValue(Error('PRIVATE_TOKEN'));
  expect(await f.automation.setEnabled(false)).toBe(false); await tick();
  expect(f.automation.enabled()).toBe(false);
  expect(f.extensions[0].activate).not.toHaveBeenCalled();
  f.api.workspace.isTrusted = false;
  expect(await f.automation.setEnabled(true)).toBe(false);
  expect(f.update).toHaveBeenCalledTimes(1); f.dispose();
});

test('dispose cancels queued work and prevents the rest of an active batch', async () => {
  const f = fixture(); f.dispose(); await tick();
  expect(f.extensions[0].activate).not.toHaveBeenCalled();
  const g = fixture(); let resolve;
  g.extensions[0].activate.mockImplementation(() => new Promise(r => { resolve = r; }));
  await tick(); g.dispose(); resolve(); await tick();
  expect(g.extensions[1].activate).not.toHaveBeenCalled();
  expect(g.automation.state()).toBe('DISPOSED');
});

test('automation can be paused and inspected using the existing center command', async () => {
  const f = fixture(); await tick();
  f.api.window.showQuickPick.mockResolvedValueOnce({ id: 'automation-toggle' });
  await f.center.open(); expect(f.automation.enabled()).toBe(false);
  f.api.window.showQuickPick.mockResolvedValueOnce({ id: 'automation-status' });
  await f.center.open();
  expect(f.api.workspace.openTextDocument).toHaveBeenCalledWith(expect.objectContaining({ language: 'json' }));
  f.dispose();
});
