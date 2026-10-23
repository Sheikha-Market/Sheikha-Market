'use strict';
jest.mock('vscode', () => ({ workspace: { isTrusted: true, workspaceFolders: [] }, commands: {} }), { virtual: true });
const { SheikhaChatProvider } = require('../src/chat/sheikhaChatProvider');
const { QUICK_ACTIONS } = require('../src/ui/sheikhaChatTemplate');
function fixture(reply) {
  const localChat = { selection: { name: 'fixture:8b' }, reply: jest.fn(reply), clear: jest.fn() };
  const provider = new SheikhaChatProvider({ subscriptions: [] }, { localChat }); let receive; let dispose;
  const view = { webview: { postMessage: jest.fn(async () => true), onDidReceiveMessage: handler => { receive = handler; } }, onDidDispose: handler => { dispose = handler; } };
  provider.resolveWebviewView(view);
  return { provider, localChat, view, receive, dispose };
}
test('task-free RUN is clarified locally without a model call or execution claim', async () => {
  const f = fixture(async () => { throw Error('UNEXPECTED_MODEL_CALL'); });
  await f.receive({ command: 'ask', text: QUICK_ACTIONS.find(item => item.icon === 'RUN').prompt, mode: 'engineering' });
  expect(f.localChat.reply).not.toHaveBeenCalled();
  const reply = f.view.webview.postMessage.mock.calls.filter(([m]) => m.command === 'reply').at(-1)[0];
  expect(reply.text).toContain('ما المهمة البرمجية');
  expect(reply.meta).toMatchObject({ externalRequest: false, modelHistoryIncluded: false });
  expect(f.provider.pendingViews.has(f.view)).toBe(false);
});
test('RUN with a concrete task reaches the normal local model route', async () => {
  const f = fixture(async () => ({ answer: 'اقتراح للمراجعة', model: 'fixture:8b', metrics: {} }));
  const text = QUICK_ACTIONS.find(item => item.icon === 'RUN').prompt + '\n\nاكتب دالة جمع';
  await f.receive({ command: 'ask', text, mode: 'engineering', chatRoute: 'local' });
  expect(f.localChat.reply).toHaveBeenCalledWith(text, expect.any(Object));
});
test('actual ask path streams local tokens, records answer and keeps sidebar receipts out of reports', async () => {
  const f = fixture(async (text, { onToken }) => { onToken('تحليل'); return { answer: 'تحليل', model: 'fixture:8b', metrics: { firstTokenMs: 1 } }; });
  await f.receive({ command: 'ask', text: 'اشرح البحث الثنائي', chatRoute: 'local' });
  expect(f.localChat.reply).toHaveBeenCalledWith('اشرح البحث الثنائي', expect.any(Object));
  expect(f.view.webview.postMessage).toHaveBeenCalledWith({ command: 'streamToken', text: 'تحليل' });
  expect(f.view.webview.postMessage).toHaveBeenCalledWith(expect.objectContaining({ command: 'streamDone', meta: expect.objectContaining({ route: 'OLLAMA_LOCAL_STREAM' }) }));
  expect(f.provider.history).toEqual([]); expect(f.provider.activeLocalChat).toBeNull();
  f.provider.workbench.output('adapter', 'PRIVATE_RECEIPT');
  await f.receive({ command: 'ask', text: 'اكتب تقرير' });
  const report = f.view.webview.postMessage.mock.calls.filter(([m]) => m.command === 'reply').at(-1)[0];
  expect(report.text).toContain('تحليل'); expect(report.text).not.toContain('PRIVATE_RECEIPT');
});
test('cancel reaches active request and partial output cannot become complete evidence', async () => {
  let started;
  const ready = new Promise(resolve => { started = resolve; });
  const f = fixture((text, { signal, onToken }) => new Promise((resolve, reject) => {
    onToken('جزء'); signal.addEventListener('abort', () => reject(Error('CANCELLED')), { once: true }); started();
  }));
  const run = f.receive({ command: 'ask', text: 'اشرح خوارزمية الفرز' });
  await ready; await f.receive({ command: 'cancelChat' }); await run;
  const result = f.view.webview.postMessage.mock.calls.filter(([m]) => m.command === 'streamDone').at(-1)[0];
  expect(result.meta).toMatchObject({ cancelled: true, incomplete: true }); expect(result.text).toContain('رد جزئي');
  expect(f.provider.workbench.currentReportSource().kind).toBe('LOCAL_MODEL_INCOMPLETE');
  expect(f.provider.activeLocalChat).toBeNull(); expect(f.provider.pendingViews.has(f.view)).toBe(false);
});
test('disposing the owning view aborts generation', async () => {
  let started; const ready = new Promise(resolve => { started = resolve; });
  const f = fixture((text, { signal }) => new Promise((resolve, reject) => { signal.addEventListener('abort', () => reject(Error('CANCELLED')), { once: true }); started(); }));
  const run = f.receive({ command: 'ask', text: 'اكتب دالة جمع' }); await ready; f.dispose(); await run;
  expect(f.provider.activeLocalChat).toBeNull(); expect(f.provider.views.size).toBe(0);
});
