'use strict';

const { inspectWorkspace } = require('./sheikhaWorkspaceIntegration');
const { inspectDelivery } = require('./sheikhaDeliveryInspection');

function workflowTasks({ api, root, observation, modelAdapter, selection, goal }) {
  const guard = signal => {
    if (signal.aborted) throw Error('CANCELLED');
    if (api.workspace.isTrusted !== true) throw Error('WORKSPACE_TRUST_REQUIRED');
  };
  const bounded = execute => async context => { guard(context.signal); const result = await execute(context); guard(context.signal); return result; };
  const tasks = [
    { id: 'editor-inspector', label: 'فحص أدوات الشات والمحرر', adapter: 'VSCODE_READ_ONLY', kind: 'LOCAL_TOOL', execute: bounded(async ({ update }) => {
      await update('Inspecting: تسجيل الأوامر وأعداد تشخيص المحرر فقط.');
      const commands = new Set(await api.commands.getCommands(true));
      const counts = { errors: 0, warnings: 0 };
      for (const [, values] of api.languages.getDiagnostics()) for (const item of values) {
        if (item.severity === 0) counts.errors++; if (item.severity === 1) counts.warnings++;
      }
      const ids = require('../ui/sheikhaChatTemplate').CHAT_TOOL_COMMAND_IDS;
      return { summary: 'فُحص تسجيل ' + ids.filter(id => commands.has(id)).length + ' من ' + ids.length + ' أمرًا؛ التسجيل لا يثبت تشغيل الخلفية.',
        reviewRequired: counts.errors > 0 || counts.warnings > 0 || ids.some(id => !commands.has(id)),
        measuredAt: new Date().toISOString(), diagnostics: counts, commands: ids.map(id => ({ id, registered: commands.has(id) })), privateDiagnosticMessagesIncluded: false };
    }) },
    { id: 'adapter-inspector', label: 'فحص موصلات البيانات والنموذج', adapter: 'FIXED_LOOPBACK_PROBES', kind: 'LOCAL_TOOL', execute: bounded(async ({ signal, update }) => {
      await update('Inspecting adapters: فحص الخدمة المحلية 8142 ثم فهرس Ollama المحلي.');
      const adapters = [];
      try { const r = await observation.inspect(); adapters.push({ id: 'OBSERVATION_8142', status: 'AVAILABLE', toolCount: r.tools.length, checkedAt: r.checkedAt }); }
      catch { adapters.push({ id: 'OBSERVATION_8142', status: 'UNAVAILABLE', checkedAt: new Date().toISOString() }); }
      guard(signal);
      try { const r = await modelAdapter.inspect(signal); adapters.push({ id: 'OLLAMA_11434', status: r.models.length ? 'AVAILABLE' : 'NO_LOCAL_MODELS', modelCount: r.models.length, checkedAt: r.checkedAt, inferenceTested: false }); }
      catch { adapters.push({ id: 'OLLAMA_11434', status: 'UNAVAILABLE', checkedAt: new Date().toISOString() }); }
      return { summary: 'انتهى فحص موصلين محليين؛ فهرس النموذج لا يثبت نجاح استدلاله.', reviewRequired: adapters.some(item => item.status !== 'AVAILABLE'), adapters };
    }) },
    { id: 'workspace-inspector', label: 'فحص مصادر التكامل', adapter: 'PACKAGED_SOURCE_HASHES', kind: 'LOCAL_TOOL', execute: bounded(async ({ update }) => {
      await update('Inspecting: بصمات المسارات المحددة؛ لا تنفيذ ملفات المشروع.');
      const evidence = await inspectWorkspace(root);
      return { summary: 'فُحصت مصادر ' + evidence.components.length + ' مكوّنًا؛ التشغيل الفعلي غير مثبت بهذا الفحص.',
        reviewRequired: evidence.components.some(item => item.state !== 'SOURCES_PRESENT'), evidence };
    }) },
    { id: 'delivery-inspector', label: 'فحص أدلة التوزيع', adapter: 'BOUNDED_ARTIFACT_HASHES', kind: 'LOCAL_TOOL', execute: bounded(async ({ update }) => {
      await update('Inspecting: تقرير التوزيع المحفوظ ومطابقة أحجام الحزم وبصماتها.');
      const evidence = await inspectDelivery(root);
      return { summary: 'طابقت ' + evidence.artifacts.filter(item => item.matchesRecordedBytes).length + ' حزمة الدليل المحفوظ؛ التوقيع والتشغيل والإطلاق تحتاج تحققًا مستقلًا.',
        reviewRequired: true, evidence };
    }) }
  ];
  if (selection) for (const role of ['design', 'review']) tasks.push({
    id: 'model-' + role, label: role === 'design' ? 'وكيل تصميم المتطلبات' : 'وكيل مراجعة المتطلبات',
    adapter: 'OLLAMA_LOOPBACK', kind: 'LOCAL_MODEL', execute: bounded(async ({ signal, update }) => {
      await update('فحص ربط النموذج المحلي قبل توليد مسودة مقيدة؛ لا ملفات أو سجل محادثة.');
      return modelAdapter.draft({ ...selection, goal, role, signal });
    })
  });
  return tasks;
}

module.exports = { workflowTasks };
