'use strict';
const { WorkspaceCenter, LOCAL_EXTENSIONS, attachWorkspaceCenter } = require('../src/sheikhaWorkspaceCenter');

function fixture(options = {}) {
  const extensions = [...LOCAL_EXTENSIONS, 'hostinger-official.hostinger-connector', 'unknown.run-all'].map(id => {
    const e = { id, isActive: false, packageJSON: { version: '1.0.0', main: 'index.js', contributes: {
      commands: [{ command: id + '.run', title: 'Run' }], languages: [{ id: 'fixture' }]
    } } };
    e.activate = jest.fn(async () => { e.isActive = true; }); return e;
  });
  const event = jest.fn(() => ({ dispose() {} }));
  const api = { extensions: { all: extensions, getExtension: id => extensions.find(e => e.id === id), onDidChange: event },
    workspace: { isTrusted: true, workspaceFolders: [{ name: 'SHEIKHA', uri: { fsPath: '/workspace' } }],
      openTextDocument: jest.fn(async d => d), getConfiguration: () => ({ get: () => false }),
      onDidGrantWorkspaceTrust: event, onDidChangeConfiguration: event, onDidChangeWorkspaceFolders: event },
    StatusBarAlignment: { Right: 2 },
    commands: { getCommands: jest.fn(async () => ['workbench.view.scm']), executeCommand: jest.fn() },
    window: { showQuickPick: jest.fn(), showTextDocument: jest.fn(),
      createStatusBarItem: () => ({ show: jest.fn(), dispose() {} }),
      createOutputChannel: () => ({ appendLine: jest.fn(), dispose() {} }) } };
  return { api, extensions, center: new WorkspaceCenter(api, options) };
}

test('catalog distinguishes visibility, activation and command registration without executing anything', () => {
  const f = fixture(); const report = f.center.inspect();
  expect(report).toMatchObject({ count: 7, activeCount: 0, registrationProvesExecution: false, modelCanInvokeCommands: false });
  expect(report.extensions).toHaveLength(7);
  for (const e of f.extensions) expect(e.activate).not.toHaveBeenCalled();
});
test('activates only built-in language tools and does not run contributed commands', async () => {
  const f = fixture(); const result = await f.center.activateLocal();
  expect(result.status).toBe('COMPLETED');
  expect(result.results).toHaveLength(5);
  expect(result.results.every(r => r.state === 'ACTIVE')).toBe(true);
  expect(f.extensions.at(-1).activate).not.toHaveBeenCalled();
  expect(f.extensions.at(-2).activate).not.toHaveBeenCalled();
  expect(f.api.commands.executeCommand).not.toHaveBeenCalled();
  await f.center.activateLocal();
  for (const e of f.extensions.slice(0, 5)) expect(e.activate).toHaveBeenCalledTimes(1);
});
test.each(['untrusted', 'empty', 'disposed'])('does not activate in %s workspace', async state => {
  const f = fixture();
  if (state === 'untrusted') f.api.workspace.isTrusted = false;
  if (state === 'empty') f.api.workspace.workspaceFolders = [];
  if (state === 'disposed') f.center.dispose();
  expect((await f.center.activateLocal()).results).toEqual([]);
  for (const e of f.extensions) expect(e.activate).not.toHaveBeenCalled();
});
test('trust loss stops subsequent activations', async () => {
  const f = fixture(); f.extensions[0].activate.mockImplementation(async () => {
    f.extensions[0].isActive = true; f.api.workspace.isTrusted = false;
  });
  expect((await f.center.activateLocal()).status).toBe('STOPPED');
  expect(f.extensions[1].activate).not.toHaveBeenCalled();
});
test('timeout is unknown, does not duplicate an outstanding activation, and concurrent calls share a run', async () => {
  const f = fixture({ timeoutMs: 5 }); let finish;
  f.extensions[0].activate.mockImplementation(() => new Promise(resolve => { finish = resolve; }));
  const first = f.center.activateLocal(); expect(f.center.activateLocal()).toBe(first);
  expect((await first).results[0].state).toBe('TIMEOUT_STATE_UNKNOWN');
  await f.center.activateLocal(); expect(f.extensions[0].activate).toHaveBeenCalledTimes(1);
  finish();
});
test('failure redacts exception content and missing tools are not promoted to ready', async () => {
  const f = fixture(); f.extensions[0].activate.mockRejectedValue(Error('PRIVATE_SECRET'));
  f.api.extensions.getExtension = id => id === LOCAL_EXTENSIONS[1] ? undefined : f.extensions.find(e => e.id === id);
  const result = await f.center.activateLocal();
  expect(result.status).toBe('INCOMPLETE'); expect(JSON.stringify(result)).not.toContain('PRIVATE_SECRET');
  expect(result.results.map(r => r.state)).toContain('NOT_AVAILABLE');
});
test('catalog selection displays metadata without executing arbitrary extension commands', async () => {
  const f = fixture(); f.api.window.showQuickPick.mockResolvedValueOnce({ id: 'catalog' }).mockResolvedValueOnce({ id: 'unknown.run-all' });
  await f.center.open(); expect(f.api.window.showTextDocument).toHaveBeenCalled();
  expect(f.api.commands.executeCommand).not.toHaveBeenCalled();
  expect(f.extensions.at(-1).activate).not.toHaveBeenCalled();
});
test('only fixed registered UI commands can be dispatched', async () => {
  const f = fixture(); f.api.window.showQuickPick.mockResolvedValueOnce({ id: 'git' });
  await f.center.open(); expect(f.api.commands.executeCommand).toHaveBeenCalledWith('workbench.view.scm');
  f.api.window.showQuickPick.mockResolvedValueOnce({ id: 'workbench.action.terminal.sendSequence' });
  await f.center.open(); expect(f.api.commands.executeCommand).toHaveBeenCalledTimes(1);
});
test('startup activation is off by default and never changes trust', () => {
  const f = fixture(); const context = { subscriptions: [] }; const center = attachWorkspaceCenter(f.api, context);
  expect(center.latest).toBeNull(); expect(context.subscriptions).toHaveLength(8);
  for (const e of f.extensions) expect(e.activate).not.toHaveBeenCalled();
  context.subscriptions.forEach(s => s.dispose());
});

test('automatic failures require a manual retry and do not replay on later events', async () => {
  const f = fixture(); f.extensions[0].activate.mockRejectedValue(new Error('SECRET'));
  await f.center.activateLocal({ automatic: true });
  const repeated = await f.center.activateLocal({ automatic: true });
  expect(repeated.results[0].state).toBe('RETRY_REQUIRES_USER');
  expect(f.extensions[0].activate).toHaveBeenCalledTimes(1);
  await f.center.activateLocal();
  expect(f.extensions[0].activate).toHaveBeenCalledTimes(2);
});

test('revoking authorization stops the remaining activation batch', async () => {
  const f = fixture(); let authorized = true;
  f.extensions[0].activate.mockImplementation(async () => { authorized = false; });
  await f.center.activateLocal({ automatic: true, isAuthorized: () => authorized });
  expect(f.extensions[1].activate).not.toHaveBeenCalled();
});
