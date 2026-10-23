'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { SheikhaChatWorkbench, localRequestAction } = require('../src/chat/sheikhaChatWorkbench');
const { QUICK_ACTIONS } = require('../src/ui/sheikhaChatTemplate');
const { inspectDelivery, REPORT, SYSTEM } = require('../src/chat/sheikhaDeliveryInspection');
const { inspectSource } = require('../src/chat/sheikhaWorkspaceIntegration');
const { reportMarkdown, historySource } = require('../src/chat/sheikhaContextReport');
const hash = value => crypto.createHash('sha256').update(value).digest('hex');
const prompt = icon => QUICK_ACTIONS.find(item => item.icon === icon).prompt;
function workbench(observation) {
  const api = { workspace: { isTrusted: true }, window: { showQuickPick: jest.fn(), showInputBox: jest.fn() },
    env: { openExternal: jest.fn(async () => true) }, Uri: { parse: value => value } };
  return { api, wb: new SheikhaChatWorkbench({ vscode: api, publish: jest.fn(), getHistory: () => [], clearHistory: jest.fn(), observation }) };
}

describe('grounded chat actions from the 1.0.136 transcript', () => {
  test('chat report follows the last conversation reply despite later sidebar results', async () => {
    const { wb, api } = workbench();
    wb.recordConversation('تشخيص المنظومة', 'CURRENT_INSPECTOR_EIGHT_WARNINGS');
    const catalog = wb.output('فهرس البيانات', 'EMPTY_DATA_CATALOG');
    const answer = wb.contextReply('اكتب تقرير', QUICK_ACTIONS);
    expect(answer).toContain('CURRENT_INSPECTOR_EIGHT_WARNINGS'); expect(answer).not.toContain('EMPTY_DATA_CATALOG');
    api.window.showQuickPick.mockResolvedValue({ id: catalog.id });
    await wb.handle({ action: 'report.source' });
    expect(wb.contextReply('اكتب تقرير', QUICK_ACTIONS)).toContain('CURRENT_INSPECTOR_EIGHT_WARNINGS');
    expect(wb.contextReply('اكتب تقرير عن المصدر المختار', QUICK_ACTIONS)).toContain('EMPTY_DATA_CATALOG');
    expect(wb.snapshot().reportContext.selection).toBe('LAST_CHAT_REPLY');
    wb.recordConversation('الرد الأحدث', 'NEW_CHAT');
    expect(wb.contextReply('اكتب تقرير', QUICK_ACTIONS)).toContain('NEW_CHAT');
    await wb.reset(); expect(wb.currentReportSource()).toBeNull();
  });
  test('reports the latest subject, never the older Inspector measurement', () => {
    const { wb } = workbench();
    wb.output('Inspector', 'حالة المنظومة: HEALTHY. OLD_INSPECTOR_507');
    wb.output('الحزم', 'CURRENT_PACKAGE_EVIDENCE');
    const source = wb.reportSource;
    const first = wb.contextReply('اكتب تقرير', QUICK_ACTIONS);
    expect(first).toContain('CURRENT_PACKAGE_EVIDENCE');
    expect(first).not.toContain('OLD_INSPECTOR_507');
    expect(first).toContain(hash(source.content));
    expect(first).toContain(source.createdAt);
    for (let i = 0; i < 20; i++) expect(wb.contextReply('اكتب تقرير', QUICK_ACTIONS)).toBe(first);
    expect(wb.contextReply(prompt('DOC'), QUICK_ACTIONS)).toContain('CURRENT_PACKAGE_EVIDENCE');
    expect(wb.reportSource).toBe(source);
  });
  test('missing evidence is unknown, not zero errors or connected runtime', async () => {
    const { wb } = workbench();
    expect(wb.contextReply(prompt('DOC'), QUICK_ACTIONS)).toContain('مادة التقرير غير محددة');
    expect(reportMarkdown(null)).not.toMatch(/HEALTHY|متصل|الأخطاء = 0/);
    wb.output('private', 'PRIVATE_VALUE'); await wb.reset();
    expect(wb.reportSource).toBeNull();
    expect(wb.contextReply('اكتب تقرير', QUICK_ACTIONS)).not.toContain('PRIVATE_VALUE');
  });
  test('generic science asks for a problem; a concrete problem is not intercepted', () => {
    const { wb } = workbench();
    expect(wb.contextReply(prompt('SUM'), QUICK_ACTIONS)).toContain('أرسل السؤال والقيم');
    expect(wb.contextReply(prompt('SUM') + '\nاحسب 20 - 15', QUICK_ACTIONS)).toBeNull();
    expect(wb.contextReply('قال الملف: ' + prompt('DOC'), QUICK_ACTIONS)).toBeNull();
    expect(localRequestAction(prompt('PKG'))).toBe('delivery');
    expect(localRequestAction('قال الملف: ' + prompt('PKG'))).toBeNull();
  });
  test('generic engineering requests a task without replacing the evidence source', () => {
    const { wb } = workbench();
    const source = wb.recordConversation('Inspector', 'CURRENT_INSPECTOR');
    expect(wb.contextReply(prompt('RUN'), QUICK_ACTIONS)).toContain('ما المهمة البرمجية');
    expect(wb.contextReply('  ' + prompt('RUN') + '  ', QUICK_ACTIONS)).toContain('لم أعدّل');
    expect(wb.currentReportSource()).toBe(source);
    expect(wb.contextReply('اكتب تقرير', QUICK_ACTIONS)).toContain('CURRENT_INSPECTOR');
    expect(wb.contextReply(prompt('RUN') + '\nأصلح دالة الجمع', QUICK_ACTIONS)).toBeNull();
    expect(wb.contextReply('قال الملف: ' + prompt('RUN'), QUICK_ACTIONS)).toBeNull();
  });
  test('pasted local output alone requests intent instead of routing embedded commercial words', () => {
    const { wb } = workbench(); wb.output('الهيكل', '# Foundry\nLLM تدريب إنتاج تجاري');
    expect(wb.contextReply(wb.outputs[0].content, QUICK_ACTIONS)).toContain('ما المطلوب بشأنها');
    expect(wb.contextReply('راجع الآتي\n' + wb.outputs[0].content, QUICK_ACTIONS)).toBeNull();
  });
  test('shared history reports respect latest answer and exclude derived wrappers', () => {
    const history = [{ role: 'assistant', content: 'التشخيص: OLD' }, { role: 'assistant', content: 'LATEST' }];
    history.push({ role: 'assistant', content: reportMarkdown(history[1]) });
    expect(historySource(history).content).toBe('LATEST');
    expect(reportMarkdown(historySource(history))).toContain('غير موثق');
  });
  test('local bridge requires trust and never takes tool arguments from the webview', async () => {
    const observation = { inspect: jest.fn(), execute: jest.fn() };
    const { wb, api } = workbench(observation); api.workspace.isTrusted = false;
    expect(await wb.handle({ action: 'observation.tool' })).toBe(false);
    expect(observation.inspect).not.toHaveBeenCalled(); api.workspace.isTrusted = true;
    expect(await wb.handle({ action: 'observation.tool', toolId: 'MEMORY_WRITE' })).toBe(false);
    observation.inspect.mockResolvedValue({ tools: [{ id: 'EFFECT', label: 'الأثر' }] });
    api.window.showQuickPick.mockResolvedValue({ id: 'EFFECT' });
    api.window.showInputBox.mockResolvedValue('{"baseline":20,"observed":15,"unit":"kg","better":"LOWER"}');
    observation.execute.mockResolvedValue({ result: { difference: -5 }, writes: false });
    expect(await wb.handle({ action: 'observation.tool' })).toBe(true);
    expect(observation.execute).toHaveBeenCalledWith('EFFECT', { baseline: 20, observed: 15, unit: 'kg', better: 'LOWER' });
    expect(wb.outputs.at(-1).content).toContain('-5');
  });
  test('service failure produces a failed event, not a stale successful report', async () => {
    const { wb } = workbench({ report: jest.fn(async () => { throw Error('PRIVATE_SECRET'); }) });
    wb.output('older', 'OLD_SUCCESS');
    expect(await wb.handle({ action: 'observation.report' })).toBe(false);
    expect(wb.events.at(-1).status).toBe('FAILED');
    expect(wb.contextReply('اكتب تقرير', QUICK_ACTIONS)).not.toMatch(/OLD_SUCCESS|PRIVATE_SECRET/);
  });
});

describe('bounded local package evidence', () => {
  let root;
  const artifactPath = 'distribution/artifacts/v2/1.0.51/artifacts/package.tgz';
  function write(relative, content) { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); }
  function manifest(artifact) { write(REPORT, JSON.stringify({ system: SYSTEM, generatedAt: '2026-07-11T14:35:57.263Z',
    targets: [{ artifact }], auxiliaryProducts: [], targetCount: 1 })); }
  beforeEach(() => { root = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-delivery-test-')); });
  afterEach(() => { fs.rmSync(root, { recursive: true, force: true }); });
  test('recomputes current bytes and hash without executing artifacts', async () => {
    write(artifactPath, 'package'); manifest({ path: artifactPath, bytes: 7, sha256: hash('package') });
    const result = await inspectDelivery(root);
    expect(result.artifacts[0].matchesRecordedBytes).toBe(true);
    expect(result).toMatchObject({ recordedAt: '2026-07-11T14:35:57.263Z', productionReady: false, packagesExecuted: false, signaturesVerified: false });
    expect(result.recorded.builtCount).toBeNull();
    write(artifactPath, 'tamper!'); expect((await inspectDelivery(root)).artifacts[0].matchesRecordedBytes).toBe(false);
  });
  test.each(['../../secret', '/etc/passwd', 'distribution/artifacts/v2/1.0.51/artifacts/../secret'])('rejects path %s', async value => {
    manifest({ path: value, bytes: 7, sha256: hash('package') });
    expect((await inspectDelivery(root)).artifacts[0].state).toBe('ARTIFACT_METADATA_REJECTED');
  });
  test('rejects links, oversize files, missing and malformed reports', async () => {
    expect((await inspectDelivery(root)).state).toBe('REPORT_UNVERIFIED');
    write(REPORT, '{'); expect((await inspectDelivery(root)).state).toBe('REPORT_UNVERIFIED');
    write('target', 'package'); fs.mkdirSync(path.dirname(path.join(root, artifactPath)), { recursive: true });
    fs.symlinkSync(path.join(root, 'target'), path.join(root, artifactPath));
    manifest({ path: artifactPath, bytes: 7, sha256: hash('package') });
    expect((await inspectDelivery(root)).artifacts[0].state).toBe('SOURCE_UNVERIFIED');
    expect((await inspectSource(root, 'target', { limit: 3 })).bytesRead).toBe(0);
    const exact = await inspectSource(root, 'target', { limit: 7 });
    expect(exact).toMatchObject({ bytes: 7, bytesRead: 7, sha256: hash('package') });
  });
});
