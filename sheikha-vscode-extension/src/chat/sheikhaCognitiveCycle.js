'use strict';

const { sha } = require('./sheikhaCognitiveMemory');

function cognitiveTasks({ api, memory, root, goal, selected = [], modelAdapter, selection, authorize = () => {} }) {
  if (typeof goal !== 'string' || !goal.trim() || goal.length > 2000 || !Array.isArray(selected) || selected.length > 2 ||
      new Set(selected.map(r => r.id)).size !== selected.length) throw Error('COGNITIVE_SCOPE_INVALID');
  let context = ''; let contextReady = false; let draft = null; let review = null;
  const guard = signal => {
    if (signal?.aborted) throw Error('CANCELLED');
    if (api.workspace?.isTrusted !== true) throw Error('WORKSPACE_TRUST_REQUIRED');
    authorize();
  };
  const references = () => {
    const records = memory.list(root);
    return selected.map(reference => {
      const record = records.find(r => r.id === reference.id && r.sha256 === reference.sha256);
      if (!record) throw Error('MEMORY_REFERENCE_CHANGED_OR_EXPIRED');
      return { id: record.id, sha256: record.sha256, text: record.text };
    });
  };
  const local = (id, label, execute) => ({ id, label, kind: 'LOCAL_TOOL', adapter: 'SHEIKHA_COGNITIVE_CYCLE',
    execute: async args => { guard(args.signal); const result = await execute(args); guard(args.signal); return result; } });
  const modelTask = (id, role, label) => ({ id, label, kind: 'LOCAL_MODEL', adapter: 'OLLAMA_LOOPBACK',
    execute: async ({ signal, update }) => {
      guard(signal); references();
      if (!contextReady) throw Error('COGNITIVE_CONTEXT_REQUIRED');
      if (!selection?.consent) throw Error('EXPLICIT_LOCAL_MODEL_TASK_REQUIRED');
      if (role === 'review' && !draft) throw Error('COGNITIVE_DRAFT_REQUIRED');
      await update(role === 'review' ? 'مراجعة المسودة السابقة؛ لا تنفيذ للمقترحات.' : 'صياغة مسودة من الهدف والمراجع المختارة فقط.');
      const input = role === 'review' ? 'راجع هذه المسودة وبيّن الأخطاء وحدودها واختبارات قبولها:\n' + draft.text : context;
      const result = await modelAdapter.draft({ ...selection, goal, role, signal, context: input, contextConsent: true });
      guard(signal);
      if (!result || typeof result.text !== 'string' || !result.text.trim() || result.text.length > 1900) throw Error('LOCAL_MODEL_RESULT_INVALID');
      if (role === 'design') draft = result; else review = result;
      return { ...result, inputSha256: sha(JSON.stringify({ goal, context: input })),
        referenceIds: selected.map(r => r.id), previousDraftSha256: role === 'review' ? sha(draft.text) : null,
        independentVerification: false };
    } });
  const tasks = [
    local('cognition-scope', 'تحديد الهدف وحدود التفويض', async () => ({ summary: 'خطة محلية محدودة؛ لا أدوات تنفيذ يولدها النموذج.',
      goal, maxModelCalls: selection ? 2 : 0, maxOutputTokensPerCall: selection ? 512 : 0,
      toolsExecutedByModel: false, trainingAllowed: false, sourceMutationAllowed: false,
      sequence: ['scope', 'explicit-memory', 'draft', 'review-draft', 'evidence'] })),
    local('cognition-memory', 'استرجاع الذاكرة المختارة', async () => {
      const records = references();
      context = records.length ? JSON.stringify(records) : '';
      if (context.length > 2400 || Buffer.byteLength(context) > 6000) throw Error('COGNITIVE_CONTEXT_LIMIT');
      contextReady = true;
      return { summary: records.length + ' مراجع مختارة، لا ذاكرة تلقائية للمحادثات.',
        references: records.map(({ id, sha256 }) => ({ id, sha256 })), instructionsTrusted: false, workspaceScope: memory.scope(root) };
    })
  ];
  if (selection) tasks.push(modelTask('cognition-draft', 'design', 'مسودة النموذج المحلي'), modelTask('cognition-review', 'review', 'مراجعة مسودة النموذج'));
  tasks.push(local('cognition-evidence', 'إقفال النطاق وفهرسة الدليل', async () => {
    if (!contextReady) throw Error('COGNITIVE_CONTEXT_REQUIRED');
    if (selection && (!draft || !review)) throw Error('COGNITIVE_MODEL_EVIDENCE_INCOMPLETE');
    return { summary: selection ? 'اكتملت المسودة ومراجعتها؛ الجودة تحتاج تقييمًا بشريًا مستقلًا.' : 'خطة وسياق فقط؛ لم يُشغّل نموذج.',
      reviewRequired: true, inferenceExecuted: Boolean(draft && review), trainingExecuted: false,
      selectedMemoryCount: selected.length, draftSha256: draft ? sha(draft.text) : null, reviewSha256: review ? sha(review.text) : null,
      modelMetrics: [draft, review].filter(Boolean).map(r => r.metrics),
      consciousnessClaim: false, lifeClaim: false, semanticCorrectnessProven: false, commercialProductionReady: false };
  }));
  return tasks;
}

module.exports = { cognitiveTasks };
