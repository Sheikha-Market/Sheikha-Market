'use strict';

const crypto = require('node:crypto');
const digest = value => crypto.createHash('sha256').update(value).digest('hex');
const clone = value => JSON.parse(JSON.stringify(value));
const terminal = new Set(['COMPLETED', 'REVIEW_REQUIRED', 'FAILED', 'CANCELLED', 'TIMED_OUT']);
const safeErrors = new Set(['LOCAL_MODEL_NO_FINAL_ANSWER_WITHIN_BUDGET', 'LOCAL_MODEL_BINDING_CHANGED',
  'LOCAL_MODEL_RESULT_INVALID', 'LOCAL_WEIGHTS_NOT_CONFIRMED', 'LOCAL_MODEL_UNAVAILABLE', 'LOCAL_MODEL_RESPONSE_REJECTED']);

class TaskEngine {
  constructor({ publish = async () => {}, timeoutMs = 90000 } = {}) {
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 90000) throw Error('INVALID_TASK_DEADLINE');
    this.publish = publish; this.timeoutMs = timeoutMs; this.run = null; this.controllers = new Map();
  }
  get active() { return this.run?.status === 'RUNNING' || this.run?.status === 'CANCELLING'; }
  snapshot() {
    if (!this.run) return null;
    const { tasks, ...run } = this.run;
    return clone({ ...run, tasks: tasks.map(({ result, ...task }) => task),
      completed: tasks.filter(task => terminal.has(task.status)).length, total: tasks.length });
  }
  detail(id) {
    const task = this.run?.tasks.find(item => item.id === id);
    return task ? clone({ ...task, runId: this.run.id, goal: this.run.goal,
      events: this.run.events.filter(event => event.taskId === id) }) : null;
  }
  async emit() { try { await this.publish(this.snapshot()); } catch { /* Disposing a view cannot strand tasks. */ } }
  async event(type, task, message) {
    this.run.events.push({ sequence: ++this.run.sequence, type, taskId: task?.id || null, message,
      at: new Date().toISOString() });
    this.run.events = this.run.events.slice(-128); await this.emit();
  }
  async cancel() {
    if (!this.active || this.run.status === 'CANCELLING') return false;
    this.run.status = 'CANCELLING';
    for (const controller of this.controllers.values()) controller.abort();
    await this.event('CANCEL_REQUESTED', null, 'طلب إيقاف المهام؛ لا تراجع تلقائيًا عن عمليات اكتملت.');
    return true;
  }
  reset() { if (this.active) return false; this.run = null; return true; }
  async start(goal, definitions, { maxConcurrentTasks = 2 } = {}) {
    if (this.active) throw Error('WORKFLOW_BUSY');
    if (![1, 2].includes(maxConcurrentTasks)) throw Error('INVALID_WORKER_LIMIT');
    if (typeof goal !== 'string' || !goal.trim() || goal.length > 2000) throw Error('BOUNDED_GOAL_REQUIRED');
    if (!Array.isArray(definitions) || !definitions.length || definitions.length > 6 ||
        new Set(definitions.map(item => item.id)).size !== definitions.length ||
        definitions.some(item => !/^[a-z][a-z-]{1,40}$/.test(item.id) || typeof item.execute !== 'function')) throw Error('PACKAGED_TASKS_REQUIRED');
    this.run = { id: crypto.randomUUID(), goal, status: 'RUNNING', sequence: 0,
      startedAt: new Date().toISOString(), finishedAt: null, events: [], maxConcurrentTasks,
      commercialProductionReady: false, automaticSourceMutation: false,
      tasks: definitions.map(item => ({ id: item.id, label: item.label, adapter: item.adapter,
        kind: item.kind, status: 'QUEUED', phase: 'QUEUED', startedAt: null, finishedAt: null,
        summary: '', evidenceSha256: null, result: null })) };
    await this.event('STARTED', null, 'بدأ العمل على خطة محددة محليًا.');
    // Serial mode preserves cognition dependencies; model calls always share one lane.
    let cursor = 0; let modelLane = Promise.resolve();
    const worker = async () => {
      while (cursor < definitions.length) {
        const index = cursor++; const def = definitions[index]; const task = this.run.tasks[index];
        if (this.run.status === 'CANCELLING') { task.status = 'CANCELLED'; task.phase = 'TERMINAL'; task.finishedAt = new Date().toISOString(); continue; }
        if (def.kind === 'LOCAL_MODEL') {
          const previous = modelLane; let release;
          modelLane = new Promise(resolve => { release = resolve; });
          await previous;
          try { await this.execute(def, task); } finally { release(); }
        } else await this.execute(def, task);
      }
    };
    await Promise.all(Array.from({ length: maxConcurrentTasks }, () => worker()));
    const cancelled = this.run.status === 'CANCELLING';
    this.run.status = cancelled ? 'CANCELLED' : this.run.tasks.some(task => task.status !== 'COMPLETED') ? 'COMPLETED_WITH_FINDINGS' : 'COMPLETED_READ_ONLY';
    this.run.finishedAt = new Date().toISOString();
    await this.event('FINISHED', null, cancelled ? 'انتهى طلب الإيقاف؛ راجع النتائج المكتملة وحدود الإلغاء.' : 'انتهى نطاق الخطة؛ النتائج والأدلة متاحة للمراجعة، لا اعتماد إنتاج شامل.');
    return this.snapshot();
  }
  async execute(def, task) {
    if (this.run.status === 'CANCELLING') { task.status = 'CANCELLED'; task.phase = 'TERMINAL'; task.finishedAt = new Date().toISOString(); return; }
    const controller = new AbortController(); this.controllers.set(task.id, controller);
    task.status = 'RUNNING'; task.phase = 'INSPECTING'; task.startedAt = new Date().toISOString();
    await this.event('INSPECTING', task, 'فحص: ' + task.label);
    let timer; let abort;
    const interrupted = new Promise((resolve, reject) => {
      abort = () => reject(Error('CANCELLED'));
      controller.signal.addEventListener('abort', abort, { once: true });
      timer = setTimeout(() => { reject(Error('TIMED_OUT')); controller.abort(); }, this.timeoutMs);
      if (controller.signal.aborted) abort();
    });
    const update = async message => {
      if (controller.signal.aborted || task.status !== 'RUNNING') return;
      task.phase = 'WORKING';
      await this.event('UPDATED', task, String(message).slice(0, 180));
    };
    try {
      const result = await Promise.race([Promise.resolve().then(() => {
        if (controller.signal.aborted) throw Error('CANCELLED');
        return def.execute({ signal: controller.signal, update });
      }), interrupted]);
      if (controller.signal.aborted || this.run.status === 'CANCELLING') throw Error('CANCELLED');
      const serialized = JSON.stringify(result);
      if (!result || typeof result.summary !== 'string' || typeof serialized !== 'string' || Buffer.byteLength(serialized) > 128 * 1024) throw Error('BOUNDED_RESULT_REQUIRED');
      task.result = JSON.parse(serialized); task.evidenceSha256 = digest(serialized);
      task.summary = result.summary.slice(0, 400);
      task.status = result.reviewRequired === true ? 'REVIEW_REQUIRED' : 'COMPLETED';
      task.phase = 'VERIFYING';
      await this.event('VERIFIED_ENVELOPE', task, 'حُسبت بصمة النتيجة؛ ليست تصديقًا مستقلًا لمحتواها.');
    } catch (error) {
      task.status = ['CANCELLED', 'TIMED_OUT'].includes(error?.message) ? error.message : 'FAILED';
      task.failureCode = safeErrors.has(error?.message) ? error.message : task.status;
      task.summary = task.status === 'CANCELLED' ? 'أُلغي انتظار النتيجة؛ توقف الحساب لدى الخدمة غير مثبت.' :
        task.failureCode === 'LOCAL_MODEL_NO_FINAL_ANSWER_WITHIN_BUDGET' ? 'لم يرجع النموذج جوابًا نهائيًا ضمن حد الرموز؛ راجع توافق القالب أو اختر نموذجًا محليًا آخر صراحةً.' :
        task.status === 'TIMED_OUT' ? 'انتهت مهلة المهمة؛ لم تُعتمد نتيجة متأخرة.' : 'تعذر المنفذ أو التحقق؛ لا نتيجة بديلة مختلقة.';
    } finally {
      clearTimeout(timer); controller.signal.removeEventListener('abort', abort); this.controllers.delete(task.id);
      task.finishedAt = new Date().toISOString(); task.phase = 'TERMINAL';
      await this.event(task.status, task, task.label + ': ' + task.summary);
    }
  }
}

function workflowMarkdown(run) {
  return ['# تقرير دورة مهام شيخة', '', 'المهمة: ' + run.goal, 'الحالة: ' + run.status,
    'البداية: ' + run.startedAt, 'النهاية: ' + (run.finishedAt || 'لم تنته بعد'),
    '', '| المهمة | المنفذ | الحالة | النتيجة |', '| --- | --- | --- | --- |',
    ...run.tasks.map(task => '| ' + [task.label, task.adapter, task.status, task.summary].map(value => String(value).replace(/[|\r\n]/g, ' ')).join(' | ') + ' |'),
    '', '## الدليل والحدود',
    'تفاصيل كل مهمة متاحة بزرها، مع بصمة النتيجة ووقت التنفيذ. Complete يعني انتهاء المهمة المحددة لا إغلاق المنتج تجاريًا.',
    'المهام LOCAL_TOOL أدوات حتمية؛ LOCAL_MODEL مسودات نموذج محلي تحتاج مراجعة بشرية. لا كود مولد يُنفذ ولا تعديل مصدر أو تدريب أو نشر من هذه الدورة.',
    'الإلغاء يوقف جدولة المتبقي وانتظار الرد؛ قد تستمر قراءة بدأت أو عملية حساب لدى خدمة لا تدعم الإلغاء.',
    '', '## مقترحات التحسين',
    ...run.tasks.filter(task => task.status !== 'COMPLETED').map(task => '- راجع دليل «' + task.label + '» وحدد معالجة مستقلة قبل اعتماده.'),
    'لا تعديل تلقائي أو إعلان زيادة جودة دون اختبار مستقل.',
    '', '## فهرس الأدلة', ...run.tasks.map(task => '- ' + task.id + ': `' + (task.evidenceSha256 || 'NO_ACCEPTED_RESULT') + '`')].join('\n');
}

module.exports = { TaskEngine, workflowMarkdown };
