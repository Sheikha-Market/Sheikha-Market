'use strict';

const { CognitiveMemory } = require('./sheikhaCognitiveMemory');
const { cognitiveTasks } = require('./sheikhaCognitiveCycle');
const { inspectModelStack } = require('./sheikhaModelStackInspection');
const { workflowMarkdown } = require('./sheikhaTaskEngine');

class CognitiveController {
  constructor({ api, engine, modelAdapter, output, publish, memory = new CognitiveMemory(), inspect = inspectModelStack }) {
    Object.assign(this, { api, engine, modelAdapter, output, publish, memory, inspect });
    this.state = { status: 'IDLE', selectedWorkspace: false, memoryCount: null, pulseCount: 0, lastPulseAt: null,
      consciousnessClaim: false, automaticLearning: false, persistentChatHistory: false };
    this.timer = null; this.disposed = false;
  }
  snapshot() { return { ...this.state }; }
  guard(root) {
    if (this.disposed) throw Error('COGNITION_DISPOSED');
    if (this.api.workspace?.isTrusted !== true) throw Error('WORKSPACE_TRUST_REQUIRED');
    if (root && !this.api.workspace.workspaceFolders?.some(f => f.uri.scheme === 'file' && f.uri.fsPath === root)) throw Error('WORKSPACE_SCOPE_CHANGED');
  }
  async emit() { try { await this.publish(); } catch { /* Closing a panel cannot interrupt cleanup. */ } }
  async workspace() {
    this.guard();
    const folders = (this.api.workspace.workspaceFolders || []).filter(f => f.uri.scheme === 'file');
    if (!folders.length) throw Error('LOCAL_WORKSPACE_REQUIRED');
    const choice = folders.length === 1 ? { index: 0 } : await this.api.window.showQuickPick(folders.map((f, index) => ({ label: f.name, index })), { title: 'مشروع الذاكرة والدورة المعرفية' });
    if (!choice) return null;
    const root = folders[choice.index]?.uri.fsPath;
    if (!root) throw Error('LOCAL_WORKSPACE_REQUIRED');
    this.guard(root); return root;
  }
  refresh(root) {
    this.guard(root);
    this.state.memoryCount = this.memory.list(root).length;
    this.state.selectedWorkspace = true;
  }
  async handle(action) {
    this.guard();
    if (action === 'cognition.stack') {
      const report = await this.inspect({ modelAdapter: this.modelAdapter }); this.guard();
      this.state.stackCheckedAt = report.checkedAt;
      this.output('موصلات النماذج والتنسيق.json', JSON.stringify(report, null, 2), { language: 'json', kind: 'MODEL_STACK_PROBE' }); return;
    }
    const root = await this.workspace(); if (!root) return false;
    this.refresh(root);
    if (action === 'cognition.start') return this.start(root);
    if (action === 'cognition.save') {
      const title = await this.api.window.showInputBox({ title: 'عنوان الذاكرة الخاصة', validateInput: s => s.trim() && s.length <= 100 ? null : 'عنوان من 1 إلى 100 حرف' });
      if (title === undefined) return false;
      const text = await this.api.window.showInputBox({ title: 'المعلومة المراد حفظها', prompt: 'ملاحظة للمشروع فقط؛ لا كلمات مرور أو مفاتيح أو بيانات عملاء غير مفوضة.',
        validateInput: s => s.trim() && s.length <= 2000 ? null : 'ملاحظة من 1 إلى 2000 حرف' });
      if (text === undefined) return false;
      const duration = await this.api.window.showQuickPick([7, 30, 90].map(days => ({ label: days + ' يومًا', days })), { title: 'صلاحية الاسترجاع' });
      if (!duration || ![7, 30, 90].includes(duration.days)) return false;
      const answer = await this.api.window.showWarningMessage('حفظ هذه الملاحظة محليًا لهذا المشروع؟',
        { modal: true, detail: title + '\n' + text + '\nصلاحيات خاصة، دون تشفير. تنتهي صلاحية الاسترجاع بعد ' + duration.days + ' يومًا؛ تزال المنتهية عند الحفظ التالي. لا تدريب أو مزامنة.' }, 'حفظ خاص');
      if (answer !== 'حفظ خاص') return false;
      this.guard(root);
      const record = this.memory.save(root, { title, text, days: duration.days, consent: true });
      this.output('إيصال حفظ ذاكرة', JSON.stringify({ id: record.id, sha256: record.sha256, expiresAt: new Date(record.expiresAt).toISOString(),
        privateLocalOnly: true, encrypted: false, trainingExecuted: false }, null, 2), { language: 'json' });
    } else if (action === 'cognition.recall' || action === 'cognition.forget') {
      let query = '';
      if (action === 'cognition.recall') {
        query = await this.api.window.showInputBox({ title: 'بحث في ذاكرة المشروع', prompt: 'اتركه فارغًا لعرض الملاحظات السارية.', validateInput: s => s.length <= 200 ? null : '200 حرف كحد أقصى' });
        if (query === undefined) return false;
      }
      this.guard(root);
      const records = this.memory.list(root, query);
      if (!records.length) { this.output('ذاكرة المشروع', 'لا توجد ملاحظات سارية مطابقة في المشروع المختار.'); return; }
      const choice = await this.api.window.showQuickPick(records.map(r => ({ label: r.title, id: r.id, description: new Date(r.expiresAt).toISOString() })), { title: action === 'cognition.forget' ? 'الملاحظة المراد حذفها' : 'الملاحظة المراد قراءتها' });
      if (!choice) return false;
      this.guard(root);
      const record = this.memory.list(root).find(r => r.id === choice.id);
      if (!record) throw Error('MEMORY_RECORD_NOT_FOUND');
      if (action === 'cognition.forget') {
        const answer = await this.api.window.showWarningMessage('حذف الملاحظة من سجل المشروع؟', { modal: true, detail: record.title + '\nلا يمحو النسخ السابقة المصدرة أو المعروضة ولا يضمن محوًا جنائيًا للقرص.' }, 'حذف الملاحظة');
        if (answer !== 'حذف الملاحظة') return false;
        this.guard(root); this.memory.forget(root, record.id, true);
        this.output('إيصال حذف ذاكرة', JSON.stringify({ id: record.id, removedFromActiveStore: true, secureEraseClaim: false }, null, 2), { language: 'json' });
      } else {
        const document = await this.api.workspace.openTextDocument({ content: JSON.stringify(record, null, 2), language: 'json' });
        await this.api.window.showTextDocument(document);
        this.output('استرجاع ذاكرة', 'فُتحت الملاحظة المختارة محليًا في المحرر. لم تُرسل إلى نموذج.');
      }
    } else throw Error('COGNITIVE_ACTION_DENIED');
    this.refresh(root); await this.emit();
  }
  async start(root) {
    if (this.engine.active) throw Error('WORKFLOW_BUSY');
    const goal = await this.api.window.showInputBox({ title: 'هدف دورة شيخة المعرفية', prompt: 'هدف واحد قابل للمراجعة؛ لا تنفيذ للكود أو تعديل للملفات.',
      validateInput: s => s.trim() && s.length <= 2000 ? null : 'حدد هدفًا من 1 إلى 2000 حرف' });
    if (goal === undefined) return false;
    this.guard(root);
    const records = this.memory.list(root);
    const picked = records.length ? await this.api.window.showQuickPick(records.map(r => ({ label: r.title, id: r.id, sha256: r.sha256 })),
      { title: 'مراجع الدورة: صفر إلى ملاحظتين', canPickMany: true }) : [];
    if (!picked) return false;
    if (picked.length > 2 || picked.some(p => !records.some(r => r.id === p.id && r.sha256 === p.sha256))) throw Error('COGNITIVE_REFERENCE_SELECTION_INVALID');
    this.guard(root);
    let models = [];
    try { models = (await this.modelAdapter.inspect()).models; } catch { /* A declared planning-only option remains available. */ }
    const choice = await this.api.window.showQuickPick([{ label: 'خطة وسياق فقط، دون استدلال نموذج', id: 'plan' },
      ...models.map(m => ({ label: m.name, id: 'model', name: m.name, digest: m.digest, description: 'Ollama محلي · ' + m.parameters }))], { title: 'منفذ الدورة المعرفية' });
    if (!choice) return false;
    if (!['plan', 'model'].includes(choice.id) || (choice.id === 'model' && !models.some(m => m.name === choice.name && m.digest === choice.digest))) throw Error('MODEL_SELECTION_INVALID');
    let selection = null;
    if (choice.id === 'model') {
      const details = picked.map(p => records.find(r => r.id === p.id)).map(({ id, sha256, text }) => ({ id, sha256, text }));
      const context = details.length ? JSON.stringify(details) : '';
      if (context.length > 2400 || Buffer.byteLength(context) > 6000) throw Error('COGNITIVE_CONTEXT_LIMIT');
      const answer = await this.api.window.showWarningMessage('تشغيل مسودة ومراجعة متتابعتين محليًا؟', { modal: true,
        detail: 'النموذج: ' + choice.name + '\nالهدف: ' + goal + '\nالمراجع المختارة: ' + context + '\nطلبان إلى Ollama 127.0.0.1:11434 بحد 512 رمزًا لكل طلب؛ المراجعة تقرأ المسودة. لا ملفات أو سجل محادثة أو تدريب أو تنفيذ أدوات. الخدمة المحلية ليست إثبات منع خروج الشبكة.' }, 'تشغيل الدورة');
      if (answer !== 'تشغيل الدورة') return false;
      selection = { model: choice.name, digest: choice.digest, consent: true };
    }
    this.guard(root);
    const tasks = cognitiveTasks({ api: this.api, memory: this.memory, root, goal, selected: picked, modelAdapter: this.modelAdapter, selection,
      authorize: () => this.guard(root) });
    this.state.status = 'RUNNING'; this.state.pulseCount = 0;
    const pulse = () => { this.state.pulseCount += 1; this.state.lastPulseAt = new Date().toISOString(); void this.emit(); };
    pulse(); this.timer = setInterval(pulse, 5000); this.timer.unref?.();
    try {
      const run = await this.engine.start(goal, tasks, { maxConcurrentTasks: 1 });
      this.state.status = run.status;
      for (const task of run.tasks) this.output(task.label + '.json', JSON.stringify(this.engine.detail(task.id), null, 2), { language: 'json', kind: 'COGNITIVE_EVIDENCE', derived: true });
      this.output('تقرير دورة العقل والمنطق', workflowMarkdown(run), { kind: 'COGNITIVE_CLOSURE' });
      return run.status !== 'CANCELLED';
    } catch (error) { this.state.status = 'FAILED'; throw error; }
    finally { clearInterval(this.timer); this.timer = null; await this.emit(); }
  }
  dispose() { this.disposed = true; clearInterval(this.timer); this.timer = null; if (this.engine.active) void this.engine.cancel(); }
}

module.exports = { CognitiveController };
