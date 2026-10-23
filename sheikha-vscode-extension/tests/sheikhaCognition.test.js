'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { CognitiveMemory, sha } = require('../src/chat/sheikhaCognitiveMemory');
const { cognitiveTasks } = require('../src/chat/sheikhaCognitiveCycle');
const { CognitiveController } = require('../src/chat/sheikhaCognitiveController');
const { TaskEngine } = require('../src/chat/sheikhaTaskEngine');
const { inspectModelStack, inspectEndpoint } = require('../src/chat/sheikhaModelStackInspection');
const { LocalModelAdapter } = require('../src/chat/sheikhaLocalModelAdapter');

let directory; let root; let other; let memory; let now;
beforeEach(() => {
  directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-cognition-test-'));
  root = path.join(directory, 'project'); other = path.join(directory, 'other');
  fs.mkdirSync(root); fs.mkdirSync(other); now = 1800000000000;
  memory = new CognitiveMemory({ directory: path.join(directory, 'private'), now: () => now });
});
afterEach(() => fs.rmSync(directory, { recursive: true, force: true }));
const save = (text = 'Selected reference') => memory.save(root, { title: 'Design note', text, consent: true });

test('read is side-effect free; save needs explicit consent and isolates workspace', () => {
  expect(memory.list(root)).toEqual([]); expect(fs.existsSync(memory.directory)).toBe(false);
  expect(() => memory.save(root, { title: 'No', text: 'No' })).toThrow('EXPLICIT');
  const record = save();
  expect(memory.list(root, 'selected')).toEqual([record]); expect(memory.list(other)).toEqual([]);
  expect(fs.statSync(memory.directory).mode & 0o777).toBe(0o700);
  expect(fs.statSync(memory.file(root)).mode & 0o777).toBe(0o600);
  expect(record.trustedAsInstructions).toBe(false);
});
test('expiry excludes records and next write prunes them; removal requires consent', () => {
  const record = save(); now += 31 * 86400000;
  expect(memory.list(root)).toEqual([]); save('Fresh'); expect(memory.read(root).records).toHaveLength(1);
  expect(() => memory.forget(root, record.id, false)).toThrow('EXPLICIT');
  const current = memory.list(root)[0]; memory.forget(root, current.id, true);
  expect(memory.list(root)).toEqual([]);
});
test('unsafe permissions, hard links, symlinks and changed content fail closed', () => {
  save(); const file = memory.file(root); const raw = fs.readFileSync(file, 'utf8');
  fs.chmodSync(file, 0o644); expect(() => memory.list(root)).toThrow('PRIVATE'); fs.chmodSync(file, 0o600);
  const hardlink = path.join(directory, 'hard'); fs.linkSync(file, hardlink);
  expect(() => memory.list(root)).toThrow('PRIVATE'); fs.unlinkSync(hardlink);
  const changed = JSON.parse(raw); changed.records[0].text = 'Tampered'; fs.writeFileSync(file, JSON.stringify(changed));
  expect(() => memory.list(root)).toThrow('INVALID'); fs.unlinkSync(file);
  fs.symlinkSync(path.join(directory, 'missing'), file); expect(() => memory.list(root)).toThrow();
  fs.unlinkSync(file); fs.rmdirSync(memory.directory); fs.symlinkSync(root, memory.directory);
  expect(() => memory.list(root)).toThrow('LINK'); expect(() => save()).toThrow('LINK');
});
test('workspace binding, record bounds and exclusive write lock are enforced', () => {
  save(); fs.copyFileSync(memory.file(root), memory.file(other));
  expect(() => memory.list(other)).toThrow('INVALID');
  expect(() => save('x'.repeat(2001))).toThrow('EXPLICIT');
  const lock = memory.file(root) + '.lock'; fs.writeFileSync(lock, '', { mode: 0o600 });
  expect(() => save()).toThrow('LOCK'); fs.unlinkSync(lock);
  expect(memory.list(root)).toHaveLength(1);
});

function setup(adapter) {
  const api = { workspace: { isTrusted: true, workspaceFolders: [{ name: 'project', uri: { scheme: 'file', fsPath: root } }] }, window: {} };
  const modelAdapter = adapter || { inspect: jest.fn(async () => ({ models: [{ name: 'test:local', digest: 'a'.repeat(64), parameters: 'TEST' }] })),
    draft: jest.fn(async ({ role }) => ({ text: role === 'design' ? '- Draft with test criteria' : '- Review of draft', summary: role, reviewRequired: true,
      metrics: { generatedTokens: 10, promptTokens: 20, totalNanoseconds: 1000 } })) };
  const engine = new TaskEngine();
  const options = { api, memory, root, goal: 'Assess a synthetic design', selected: [], modelAdapter,
    selection: { model: 'test:local', digest: 'a'.repeat(64), consent: true } };
  return { api, modelAdapter, engine, options };
}
test('cycle is sequential; review receives exact draft, not a second independent goal', async () => {
  const { modelAdapter, engine, options } = setup(); const record = save();
  options.selected = [record]; const run = await engine.start(options.goal, cognitiveTasks(options), { maxConcurrentTasks: 1 });
  expect(run.maxConcurrentTasks).toBe(1); expect(run.tasks.map(t => t.status)).toEqual(['COMPLETED', 'COMPLETED', 'REVIEW_REQUIRED', 'REVIEW_REQUIRED', 'REVIEW_REQUIRED']);
  expect(modelAdapter.draft).toHaveBeenCalledTimes(2);
  expect(modelAdapter.draft.mock.calls[0][0].context).toContain(record.text);
  expect(modelAdapter.draft.mock.calls[1][0].context).toContain('- Draft with test criteria');
  expect(engine.detail('cognition-review').result.previousDraftSha256).toBe(sha('- Draft with test criteria'));
  expect(engine.detail('cognition-evidence').result).toMatchObject({ inferenceExecuted: true, trainingExecuted: false, consciousnessClaim: false, commercialProductionReady: false });
});
test('failed draft prevents reviewer call and blocks final evidence', async () => {
  const { modelAdapter, engine, options } = setup(); modelAdapter.draft.mockRejectedValue(Error('LOCAL_MODEL_RESULT_INVALID'));
  const run = await engine.start(options.goal, cognitiveTasks(options), { maxConcurrentTasks: 1 });
  expect(modelAdapter.draft).toHaveBeenCalledTimes(1);
  expect(run.tasks.slice(-3).every(t => t.status === 'FAILED')).toBe(true);
  expect(engine.detail('cognition-evidence').result).toBeNull();
});
test('revoked or oversized memory prevents model requests and evidence', async () => {
  const { modelAdapter, engine, options } = setup(); options.selected = [save('x'.repeat(2000)), save('y'.repeat(2000))];
  await engine.start(options.goal, cognitiveTasks(options), { maxConcurrentTasks: 1 });
  expect(modelAdapter.draft).not.toHaveBeenCalled(); expect(engine.detail('cognition-evidence').result).toBeNull();
  memory.forget(root, options.selected[0].id, true);
  await engine.start(options.goal, cognitiveTasks(options), { maxConcurrentTasks: 1 });
  expect(modelAdapter.draft).not.toHaveBeenCalled();
});
test('planning-only is labelled without inference; trust revocation blocks steps', async () => {
  const { api, modelAdapter, engine, options } = setup(); options.selection = null;
  await engine.start(options.goal, cognitiveTasks(options), { maxConcurrentTasks: 1 });
  expect(engine.detail('cognition-evidence').result.inferenceExecuted).toBe(false);
  api.workspace.isTrusted = false;
  const run = await engine.start(options.goal, cognitiveTasks(options), { maxConcurrentTasks: 1 });
  expect(run.tasks.every(t => t.status === 'FAILED')).toBe(true); expect(modelAdapter.draft).not.toHaveBeenCalled();
});
test('cancellation stops review; late model output is not accepted', async () => {
  const { modelAdapter, engine, options } = setup(); let release;
  modelAdapter.draft.mockImplementation(() => new Promise(resolve => { release = resolve; }));
  const pending = engine.start(options.goal, cognitiveTasks(options), { maxConcurrentTasks: 1 });
  while (!release) await new Promise(resolve => setImmediate(resolve));
  await engine.cancel(); const run = await pending;
  release({ text: '- Late', summary: 'late' }); await new Promise(resolve => setImmediate(resolve));
  expect(run.status).toBe('CANCELLED'); expect(modelAdapter.draft).toHaveBeenCalledTimes(1);
  expect(engine.detail('cognition-draft').result).toBeNull();
});
test('adapter rejects context without separate consent before any HTTP call', async () => {
  const request = jest.fn(); const adapter = new LocalModelAdapter(request);
  await expect(adapter.draft({ model: 'x', goal: 'goal', role: 'design', consent: true, context: 'private' })).rejects.toThrow('CONTEXT');
  expect(request).not.toHaveBeenCalled();
});
test('model-stack inspection never equates a catalog or installed package with running inference', async () => {
  const { modelAdapter } = setup(); const probe = jest.fn(async id => { if (id === 'vllm') throw Error('404'); return { modelCount: 1 }; });
  const result = await inspectModelStack({ modelAdapter, probe, resolve: () => '/installed/package' });
  expect(result.components).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: 'vllm', status: 'UNAVAILABLE_OR_REJECTED' }),
    expect.objectContaining({ id: 'litellm', status: 'CATALOG_REACHABLE_NOT_INFERENCE', inferenceEnabled: false }),
    expect.objectContaining({ id: 'langgraph', executionEnabled: false })]));
  expect(result.workspaceContentSent).toBe(false);
  await expect(inspectEndpoint('https://remote.invalid')).rejects.toThrow('DENIED');
  await expect(inspectEndpoint('vllm', AbortSignal.abort())).rejects.toThrow('CANCELLED');
});
test('controller requires native consent, reports pulse, clears timer and preserves memory', async () => {
  const { api, engine, modelAdapter } = setup(); const output = jest.fn();
  api.window.showInputBox = jest.fn(async () => 'Synthetic local goal');
  api.window.showQuickPick = jest.fn(async choices => choices.find(c => c.id === 'model'));
  api.window.showWarningMessage = jest.fn(async () => 'Cancel');
  const controller = new CognitiveController({ api, engine, modelAdapter, memory, output, publish: async () => {} });
  expect(await controller.handle('cognition.start')).toBe(false); expect(modelAdapter.draft).not.toHaveBeenCalled();
  api.window.showWarningMessage.mockResolvedValue('تشغيل الدورة');
  await controller.handle('cognition.start');
  expect(controller.timer).toBeNull(); expect(controller.state.pulseCount).toBeGreaterThan(0);
  expect(controller.state.status).toBe('COMPLETED_WITH_FINDINGS'); expect(fs.existsSync(memory.directory)).toBe(false);
  controller.dispose(); await expect(controller.handle('cognition.start')).rejects.toThrow('DISPOSED');
});
test('a workspace removed during consent is rejected before inference', async () => {
  const { api, engine, modelAdapter } = setup();
  api.window.showInputBox = jest.fn(async () => 'Goal');
  api.window.showQuickPick = jest.fn(async choices => choices.find(c => c.id === 'model'));
  api.window.showWarningMessage = jest.fn(async () => { api.workspace.workspaceFolders = []; return 'تشغيل الدورة'; });
  const controller = new CognitiveController({ api, engine, modelAdapter, memory, output: jest.fn(), publish: async () => {} });
  await expect(controller.handle('cognition.start')).rejects.toThrow('SCOPE_CHANGED'); expect(modelAdapter.draft).not.toHaveBeenCalled();
});
