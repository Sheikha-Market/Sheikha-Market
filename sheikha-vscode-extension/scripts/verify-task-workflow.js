'use strict';

const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { TaskEngine, workflowMarkdown } = require('../src/chat/sheikhaTaskEngine');
const { LocalModelAdapter } = require('../src/chat/sheikhaLocalModelAdapter');
const { ObservationBridge } = require('../src/chat/sheikhaObservationBridge');
const { workflowTasks } = require('../src/chat/sheikhaWorkflowAdapters');

async function main() {
  if (process.argv[2] !== '--local-drafts' || !process.argv[3]) throw Error('EXPLICIT_LOCAL_TEST_MODEL_REQUIRED');
  const modelAdapter = new LocalModelAdapter(); const catalog = await modelAdapter.inspect();
  const selected = catalog.models.find(model => model.name === process.argv[3]);
  if (!selected) throw Error('INSTALLED_LOCAL_MODEL_REQUIRED');
  const goal = 'مهمة اختبار اصطناعية عامة: اقترح تصميم شاشة عربية لتنظيم قائمة مهام محلية، مع حالات البدء والعمل والإلغاء والاكتمال واختبارات القبول. لا تستخدم معلومات مشروع حقيقي ولا تدع تنفيذًا فعليًا.';
  const selection = { model: selected.name, digest: selected.digest, consent: true };
  const definitions = workflowTasks({ api: { workspace: { isTrusted: true } }, root: path.resolve(__dirname, '../..'),
    observation: new ObservationBridge(), modelAdapter, goal, selection }).filter(task => task.id !== 'editor-inspector');
  const observed = [];
  const engine = new TaskEngine({ publish: async state => { observed.push({ sequence: state.sequence, status: state.status,
    activeTasks: state.tasks.filter(task => task.status === 'RUNNING').map(task => task.id) }); } });
  const run = await engine.start(goal, definitions);
  const details = run.tasks.map(task => engine.detail(task.id));
  const models = details.filter(task => task.kind === 'LOCAL_MODEL');
  const result = { checkedAt: new Date().toISOString(), sourceVersion: require('../package.json').version,
    run, details, observed, vscodeEditorInspection: 'NOT_EXECUTED_OUTSIDE_EXTENSION_HOST',
    promptScope: 'EXPLICIT_SYNTHETIC_TASK_ONLY', privateFilesOrChatSentToModel: false,
    downloadedModel: false, trainedModel: false, remoteApiConfigured: false, productionReady: false };
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-task-workflow-')); fs.chmodSync(directory, 0o700);
  const serialized = JSON.stringify(result, null, 2);
  fs.writeFileSync(path.join(directory, 'verification.json'), serialized, { flag: 'wx', mode: 0o600 });
  fs.writeFileSync(path.join(directory, 'REPORT.ar.md'), workflowMarkdown(run), { flag: 'wx', mode: 0o600 });
  console.log(JSON.stringify({ output: directory, sha256: crypto.createHash('sha256').update(serialized).digest('hex'),
    tasks: run.tasks.map(task => ({ id: task.id, status: task.status })),
    modelMetrics: models.map(task => ({ id: task.id, evidenceSha256: task.evidenceSha256, metrics: task.result?.metrics || null })),
    maxObservedConcurrency: Math.max(...observed.map(item => item.activeTasks.length)), productionReady: false }, null, 2));
  assert.equal(models.length, 2); assert.ok(models.every(task => task.status === 'REVIEW_REQUIRED' && task.result?.text));
  assert.ok(observed.every(item => item.activeTasks.length <= 2 && item.activeTasks.filter(id => id.startsWith('model-')).length <= 1));
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
