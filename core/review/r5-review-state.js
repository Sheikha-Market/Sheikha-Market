'use strict';
(function (root) {
  const MAX_IMPORT_BYTES = 256 * 1024;
  const STATES = Object.freeze({ NOT_REVIEWED: 'لم يراجع', NEEDS_CHANGE: 'يحتاج تعديل', READY_FOR_TEST: 'جاهز للاختبار' });
  const object = value => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
  const fail = code => { throw new Error(code); };
  const date = value => typeof value === 'string' && value.length <= 40 && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value));
  const copy = items => Object.fromEntries(Object.entries(items).map(([id, item]) => [id, { ...item }]));
  const meaningful = item => !!item && (item.state !== 'NOT_REVIEWED' || item.note.trim() !== '');
  const equivalent = (left, right) => (left?.state || 'NOT_REVIEWED') === right.state && (left?.note || '') === right.note;

  function parseReview(text, sourceSha256, knownCriteria) {
    if (typeof text !== 'string' || new TextEncoder().encode(text).length > MAX_IMPORT_BYTES) fail('IMPORT_TOO_LARGE');
    let value;
    try { value = JSON.parse(text); } catch { fail('INVALID_JSON'); }
    if (!object(value) || value.schema !== 'SHEIKHA_R5_HUMAN_REVIEW_V1') fail('INVALID_SCHEMA');
    if (!/^[a-f0-9]{64}$/.test(value.sourceSha256) || value.sourceSha256 !== sourceSha256) fail('SOURCE_MISMATCH');
    if (value.publicationApproval !== false || value.testResults !== 'NOT_EVALUATED' || value.status !== 'DRAFT_REQUIRES_REVIEW') fail('UNSAFE_REVIEW_FLAGS');
    const allowed = new Set(['schema', 'sourceSha256', 'exportedAt', 'items', 'publicationApproval', 'testResults', 'status']);
    if (Object.keys(value).some(key => !allowed.has(key)) || !date(value.exportedAt) || !object(value.items)) fail('INVALID_REVIEW');
    const known = new Set(knownCriteria), entries = Object.entries(value.items);
    if (entries.length > known.size) fail('INVALID_REVIEW');
    const result = {};
    for (const [id, item] of entries) {
      if (!known.has(id)) fail('UNKNOWN_CRITERION');
      if (!object(item) || Object.keys(item).some(key => !['state', 'note', 'updatedAt'].includes(key)) || !Object.hasOwn(STATES, item.state) || typeof item.note !== 'string' || item.note.length > 2000 || (item.updatedAt !== null && !date(item.updatedAt))) fail('INVALID_ITEM');
      result[id] = { state: item.state, note: item.note, updatedAt: item.updatedAt };
    }
    return result;
  }

  function planImport(local, incoming) {
    const plan = { local: copy(local), incoming: copy(incoming), added: [], unchanged: [], conflicts: [] };
    for (const [id, item] of Object.entries(incoming)) {
      if (equivalent(local[id], item)) plan.unchanged.push(id);
      else if (!meaningful(local[id])) plan.added.push(id);
      else plan.conflicts.push(id);
    }
    return plan;
  }

  function applyImport(plan, choices = {}) {
    const items = copy(plan.local), changedIds = [...plan.added];
    for (const id of plan.conflicts) {
      const choice = Object.hasOwn(choices, id) ? choices[id] : 'keep';
      if (!['keep', 'incoming'].includes(choice)) fail('INVALID_CONFLICT_CHOICE');
      if (choice === 'incoming') changedIds.push(id);
    }
    for (const id of changedIds) items[id] = { ...plan.incoming[id] };
    return { items, changedIds };
  }

  const api = Object.freeze({ MAX_IMPORT_BYTES, STATES, parseReview, planImport, applyImport });
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.SheikhaR5ReviewState = api;
})(globalThis);
