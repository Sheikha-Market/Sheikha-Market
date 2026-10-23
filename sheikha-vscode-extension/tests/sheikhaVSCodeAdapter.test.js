'use strict';
const { VSCodeAdapter, CAPABILITIES } = require('../src/chat/sheikhaVSCodeAdapter');
function fixture() {
  const api = { workspace: { isTrusted: true, openTextDocument: jest.fn(async value => value) },
    commands: { getCommands: jest.fn(async () => [...CAPABILITIES.map(c => c.id), 'vendor.upload', '_private']), executeCommand: jest.fn() },
    window: { showQuickPick: jest.fn(), showWarningMessage: jest.fn(), showTextDocument: jest.fn(),
      activeTextEditor: { document: { version: 1, uri: { scheme: 'file', toString: () => 'file:///local/code.js' } } } } };
  return { api, adapter: new VSCodeAdapter(api) };
}
describe('VS Code governed native adapter', () => {
  test('discovers public commands without claiming all commands executable', async () => {
    const { adapter, api } = fixture(); const report = await adapter.inspect();
    expect(report.commands).not.toContainEqual(expect.objectContaining({ id: '_private' }));
    expect(report.commands).toContainEqual({ id: 'vendor.upload', policy: 'NATIVE_PALETTE_ONLY' });
    expect(report.registrationProvesExecution).toBe(false); expect(report.modelCanInvokeCommands).toBe(false);
    expect(report.catalogSha256).toMatch(/^[a-f0-9]{64}$/);
    expect((await adapter.openCatalog()).commands).toBeUndefined();
    expect(api.commands.executeCommand).not.toHaveBeenCalled();
  });
  test('executes only a native-picked packaged command, with no arguments', async () => {
    const { adapter, api } = fixture(); api.window.showQuickPick.mockResolvedValue({ id: 'workbench.view.explorer' });
    expect((await adapter.chooseAndExecute()).status).toContain('OUTCOME_NOT_INDEPENDENTLY_VERIFIED');
    expect(api.commands.executeCommand.mock.calls).toEqual([['workbench.view.explorer']]);
  });
  test.each(['vendor.upload', 'workbench.action.tasks.runTask', 'workbench.action.debug.start', 'workbench.action.terminal.new', '_private'])('rejects direct execution of %s', async id => {
    const { adapter, api } = fixture(); api.window.showQuickPick.mockResolvedValue({ id });
    await expect(adapter.chooseAndExecute()).rejects.toThrow('COMMAND_POLICY_DENIED');
    expect(api.commands.executeCommand).not.toHaveBeenCalled();
  });
  test('editor mutations require modal confirmation and unchanged active document', async () => {
    const { adapter, api } = fixture(); api.window.showQuickPick.mockResolvedValue({ id: 'editor.action.formatDocument' });
    expect(await adapter.chooseAndExecute()).toBeNull();
    api.window.showWarningMessage.mockImplementation(async () => { api.window.activeTextEditor.document.version++; return 'تنفيذ على الملف المفتوح'; });
    await expect(adapter.chooseAndExecute()).rejects.toThrow('ACTIVE_DOCUMENT_CHANGED');
    expect(api.commands.executeCommand).not.toHaveBeenCalled();
    api.window.showWarningMessage.mockResolvedValue('تنفيذ على الملف المفتوح');
    await adapter.chooseAndExecute(); expect(api.commands.executeCommand).toHaveBeenCalledWith('editor.action.formatDocument');
  });
  test('rechecks trust and command registration after native prompts', async () => {
    const { adapter, api } = fixture();
    api.window.showQuickPick.mockImplementation(async () => { api.workspace.isTrusted = false; return { id: 'workbench.view.explorer' }; });
    await expect(adapter.chooseAndExecute()).rejects.toThrow('WORKSPACE_TRUST_REQUIRED');
    api.workspace.isTrusted = true; api.window.showQuickPick.mockResolvedValue({ id: 'workbench.view.explorer' });
    api.commands.getCommands.mockResolvedValueOnce(['workbench.view.explorer']).mockResolvedValueOnce([]);
    await expect(adapter.chooseAndExecute()).rejects.toThrow('COMMAND_NO_LONGER_REGISTERED');
    expect(api.commands.executeCommand).not.toHaveBeenCalled();
  });
  test('untrusted and cancelled workflows never execute; catalog is bounded', async () => {
    const { adapter, api } = fixture(); api.workspace.isTrusted = false;
    await expect(adapter.chooseAndExecute()).rejects.toThrow('WORKSPACE_TRUST_REQUIRED');
    api.workspace.isTrusted = true; expect(await adapter.chooseAndExecute()).toBeNull();
    api.commands.getCommands.mockResolvedValue(Array(30001).fill('command'));
    await expect(adapter.inspect()).rejects.toThrow('COMMAND_CATALOG_INVALID');
    expect(api.commands.executeCommand).not.toHaveBeenCalled();
  });
});
