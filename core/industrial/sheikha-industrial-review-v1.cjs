'use strict';
const path = require('node:path');
const { createHash } = require('node:crypto');
const { createPrivateStore } = require('./sheikha-industrial-private-store-v1.cjs');

const REVIEW_LIMITS = Object.freeze({ records: 100, bytes: 256 * 1024, directoryEntries: 104, events: 64, noteChars: 1000 });
const POLICY = Object.freeze({ scope: 'CONCEPT_REVIEW_ONLY', approvalGranted: false, reviewerIdentityVerified: false,
  signatureAuthenticated: false, completeHistoryIndependentlyEstablished: false,
  physicalExecutionEnabled: false, publicationEnabled: false, paymentEnabled: false });
const DECISIONS = Object.freeze(['COMMENT', 'CHANGES_REQUESTED', 'CONCEPT_REVIEWED', 'REOPENED']);
const exact = (v, keys) => v && typeof v === 'object' && !Array.isArray(v)
  && Object.keys(v).sort().join(',') === keys.split(',').sort().join(',');
const hash = v => createHash('sha256').update(JSON.stringify(v)).digest('hex');
const clone = v => JSON.parse(JSON.stringify(v));
const fail = code => { throw Error(`REVIEW_${code}`); };
const targetIds = record => ['federation', ...record.snapshot.artifacts.map(a => a.id)];
const nextStatus = decision => ({ CHANGES_REQUESTED: 'CHANGES_REQUESTED', CONCEPT_REVIEWED: 'CONCEPT_REVIEWED', REOPENED: 'PENDING' })[decision];

function validInput(input, record) {
  return exact(input, 'expectedRevision,requestId,targetId,decision,note')
    && Number.isSafeInteger(input.expectedRevision) && input.expectedRevision >= 0 && input.expectedRevision <= REVIEW_LIMITS.events
    && typeof input.requestId === 'string' && /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(input.requestId)
    && targetIds(record).includes(input.targetId) && DECISIONS.includes(input.decision)
    && typeof input.note === 'string' && input.note.trim().length >= 3 && input.note.length <= REVIEW_LIMITS.noteChars
    && !/[\u0000-\u0008\u000b-\u001f\u007f]/u.test(input.note);
}

function createFederationReviews({ archive, root = path.resolve(__dirname, '../../runtime/industrial-federation-reviews/v1'), now = Date.now }) {
  const files = createPrivateStore({ root, limits: REVIEW_LIMITS, prefix: 'REVIEW' });
  function journal(record) {
    let stored;
    try { stored = files.read(record.id); }
    catch (error) {
      if (error.message !== 'REVIEW_NOT_FOUND') throw error;
      return { schemaVersion: 1, archiveId: record.id, policy: POLICY, events: [] };
    }
    try {
      if (!exact(stored, 'schemaVersion,archiveId,policy,events') || stored.schemaVersion !== 1 || stored.archiveId !== record.id
        || !exact(stored.policy, Object.keys(POLICY).join(',')) || Object.entries(POLICY).some(([k, v]) => stored.policy[k] !== v)
        || !Array.isArray(stored.events) || !stored.events.length || stored.events.length > REVIEW_LIMITS.events) fail('RECORD_REJECTED');
      const ids = new Set(), statuses = new Map(targetIds(record).map(id => [id, 'PENDING']));
      let previousHash = null;
      for (const [i, e] of stored.events.entries()) {
        if (!exact(e, 'sequence,requestId,targetId,decision,note,recordedAt,previousHash,sha256')) fail('RECORD_REJECTED');
        const { sha256, ...payload } = e;
        const input = { expectedRevision: i, requestId: e.requestId, targetId: e.targetId, decision: e.decision, note: e.note };
        if (e.sequence !== i + 1 || !validInput(input, record) || e.previousHash !== previousHash || ids.has(e.requestId)
          || typeof e.recordedAt !== 'string' || new Date(e.recordedAt).toISOString() !== e.recordedAt
          || hash(payload) !== sha256 || e.decision === 'REOPENED' && statuses.get(e.targetId) === 'PENDING') fail('RECORD_REJECTED');
        ids.add(e.requestId); previousHash = sha256;
        if (nextStatus(e.decision)) statuses.set(e.targetId, nextStatus(e.decision));
      }
      return stored;
    } catch { fail('RECORD_REJECTED'); }
  }
  function view(record, stored) {
    const targets = targetIds(record).map(id => ({ id, status: 'PENDING', eventCount: 0 }));
    for (const e of stored.events) {
      const target = targets.find(t => t.id === e.targetId);
      if (nextStatus(e.decision)) target.status = nextStatus(e.decision);
      target.eventCount++;
    }
    return clone({ ...stored, revision: stored.events.length, targets, limits: REVIEW_LIMITS,
      chainHead: stored.events.at(-1)?.sha256 || null });
  }
  function read(id) { const record = archive.read(id); return view(record, journal(record)); }
  function append(id, input) {
    const record = archive.read(id);
    if (!validInput(input, record)) fail('INPUT_REJECTED');
    return files.withLock(() => {
      archive.read(id);
      const stored = journal(record), existing = stored.events.find(e => e.requestId === input.requestId);
      if (existing) {
        if (input.expectedRevision !== existing.sequence - 1 || ['targetId', 'decision', 'note'].some(k => existing[k] !== input[k])) fail('REQUEST_CONFLICT');
        return view(record, stored);
      }
      if (input.expectedRevision !== stored.events.length) fail('REVISION_CONFLICT');
      if (stored.events.length >= REVIEW_LIMITS.events) fail('CAPACITY_LIMIT');
      if (input.decision === 'REOPENED' && view(record, stored).targets.find(t => t.id === input.targetId).status === 'PENDING') fail('STATE_CONFLICT');
      const event = { sequence: stored.events.length + 1, requestId: input.requestId, targetId: input.targetId,
        decision: input.decision, note: input.note, recordedAt: new Date(now()).toISOString(), previousHash: stored.events.at(-1)?.sha256 || null };
      stored.events.push({ ...event, sha256: hash(event) });
      files.write(id, stored, { replace: true });
      return view(record, journal(record));
    });
  }
  // A synchronous derivation observes one journal version while other writers are excluded.
  function withSnapshot(id, consume) { return files.withLock(() => consume(read(id))); }
  return { read, append, withSnapshot };
}
module.exports = { createFederationReviews, REVIEW_LIMITS, DECISIONS };
