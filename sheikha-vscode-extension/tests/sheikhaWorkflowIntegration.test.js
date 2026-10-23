'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { SheikhaChatWorkbench } = require('../src/chat/sheikhaChatWorkbench');
const { CHAT_TOOL_COMMAND_IDS } = require('../src/ui/sheikhaChatTemplate');
function fixture(root, model = false) {
  const api = { workspace: { isTrusted: true, workspaceFolders: [{ name: 'test', uri: { scheme: 'file', fsPath: root } }],
    openTextDocument: jest.fn(async value => value) }, commands: { getCommands: jest.fn(async () => CHAT_TOOL_COMMAND_IDS) },
    languages: { getDiagnostics: () => [] }, window: { showInputBox: jest.fn(async () => 'Synthetic design goal'),
      showQuickPick: jest.fn(async (choices, options) => options.title === 'نوع المنفذين' ? { id: model ? 'model' : 'tools' } : choices[0]),
      showWarningMessage: jest.fn(async () => 'تشغيل محلي'), showTextDocument: jest.fn(), showSaveDialog: jest.fn() } };
  const modelAdapter = { inspect: jest.fn(async () => ({ models: [{ name: 'local:4b', digest: 'a'.repeat(64), parameters: '4B' }], checkedAt: new Date().toISOString() })),
    draft: jest.fn(async input => ({ summary: input.role + ' draft', reviewRequired: true, text: 'Synthetic output' })) };
  const observation = { inspect: jest.fn(async () => ({ tools: [{ id: 'STATUS' }], checkedAt: new Date().toISOString() })) };
  const publish = jest.fn(async () => {});
  const wb = new SheikhaChatWorkbench({ vscode: api, publish, observation, modelAdapter, getHistory: () => [], clearHistory: jest.fn() });
  return { api, wb, modelAdapter, observation, publish };
}
describe('workbench task integration', () => {
  let root;
  beforeEach(() => { root = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-workflow-test-')); });
  afterEach(() => fs.rmSync(root, { recursive: true, force: true }));
  test('runs four real read-only inspections and emits a valid JSON plan and closure', async () => {
    const { wb, modelAdapter, api } = fixture(root);
    expect(await wb.handle({ action: 'workflow.start' })).toBe(true);
    expect(wb.workflow.snapshot().tasks).toHaveLength(4);
    expect(wb.workflow.snapshot().status).toBe('COMPLETED_WITH_FINDINGS');
    const plan = wb.outputs.find(output => output.title === 'SHEIKHA_CHAT_PLAN.json');
    expect(JSON.parse(plan.content).tasks).toHaveLength(4); expect(plan.language).toBe('json');
    expect(wb.outputs.at(-1).kind).toBe('WORKFLOW_CLOSURE');
    expect(wb.workflow.detail('workspace-inspector').result.evidence.components).toHaveLength(21);
    expect(wb.workflow.detail('workspace-inspector').result.evidence.components).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'SHEIKHA_OS', runtimeVerified: false })]));
    expect(modelAdapter.draft).not.toHaveBeenCalled();
    expect(await wb.handle({ action: 'workflow.detail', id: 'workspace-inspector' })).toBe(true);
    expect(api.workspace.openTextDocument).toHaveBeenLastCalledWith(expect.objectContaining({ language: 'json', content: expect.stringContaining('evidenceSha256') }));
    expect(await wb.handle({ action: 'workflow.detail', id: '/etc/passwd' })).toBe(false);
    await wb.reset(); expect(wb.workflow.snapshot()).toBeNull();
  });
  test('explicit model selection and native approval add two bounded drafts without history/files', async () => {
    const { wb, api, modelAdapter } = fixture(root, true);
    await wb.handle({ action: 'workflow.start' }); expect(api.window.showWarningMessage).toHaveBeenCalled();
    expect(wb.workflow.snapshot().tasks).toHaveLength(6); expect(modelAdapter.draft).toHaveBeenCalledTimes(2);
    const input = modelAdapter.draft.mock.calls[0][0];
    expect(input).toMatchObject({ model: 'local:4b', goal: 'Synthetic design goal', consent: true, role: 'design' });
    expect(input.history).toBeUndefined(); expect(input.files).toBeUndefined();
  });
  test('rejects model inference on cancelled approval or lost trust', async () => {
    const { wb, api, modelAdapter } = fixture(root, true);
    api.window.showWarningMessage.mockResolvedValue(undefined);
    expect(await wb.handle({ action: 'workflow.start' })).toBe(false);
    expect(wb.workflow.snapshot()).toBeNull(); expect(modelAdapter.draft).not.toHaveBeenCalled();
    api.window.showWarningMessage.mockImplementation(async () => { api.workspace.isTrusted = false; return 'تشغيل محلي'; });
    expect(await wb.handle({ action: 'workflow.start' })).toBe(false); expect(modelAdapter.draft).not.toHaveBeenCalled();
  });
  test('rejects webview-supplied executor, paths and model selection', async () => {
    const { wb, api } = fixture(root);
    expect(await wb.handle({ action: 'workflow.start', model: 'remote:cloud' })).toBe(false);
    expect(await wb.handle({ action: 'workflow.cancel', url: 'external' })).toBe(false);
    expect(api.window.showInputBox).not.toHaveBeenCalled();
  });
  test('native cancellation remains available while the workbench lock is held', async () => {
    const { wb, modelAdapter } = fixture(root, true);
    let entered; const started = new Promise(resolve => { entered = resolve; });
    modelAdapter.draft.mockImplementation(async () => { entered(); return new Promise(() => {}); });
    const running = wb.handle({ action: 'workflow.start' }); await started;
    expect(wb.busy).toBe(true); expect(await wb.handle({ action: 'workflow.cancel' })).toBe(true);
    expect(await running).toBe(false); expect(wb.busy).toBe(false);
    expect(wb.workflow.snapshot().status).toBe('CANCELLED'); expect(wb.outputs.at(-1).content).toContain('CANCELLED');
  });
  test('JSON exports are complete, explicit and cannot overwrite a destination', async () => {
    const { wb, api } = fixture(root); wb.output('plan.json', '{"plan":true}', { language: 'json' });
    const destination = path.join(root, 'plan.json'); api.window.showSaveDialog.mockResolvedValue({ scheme: 'file', fsPath: destination });
    const message = { action: 'output.export', id: wb.outputs.at(-1).id };
    expect(await wb.handle(message)).toBe(true); expect(fs.statSync(destination).mode & 0o777).toBe(0o600);
    expect(JSON.parse(fs.readFileSync(destination))).toEqual({ plan: true }); expect(await wb.handle(message)).toBe(false);
    expect(() => wb.output('large.json', JSON.stringify({ a: 'x'.repeat(70000) }), { language: 'json' })).toThrow('JSON_OUTPUT_LIMIT');
  });
});
