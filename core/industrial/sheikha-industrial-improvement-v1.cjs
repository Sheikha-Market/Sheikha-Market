'use strict';
const { validConfig, CONFIG_COUNTS, UUID, DIGEST, validNote } = require('./sheikha-industrial-federation-v1.cjs');
const IMPROVEMENT_LIMITS = Object.freeze({ requestsPerExperiment: 8, requestsPerProcess: 64 });
const fail = code => { throw Error(`DERIVATION_${code}`); };
const exact = (v, keys) => v && typeof v === 'object' && !Array.isArray(v)
  && Object.keys(v).sort().join(',') === keys.split(',').sort().join(',');
function openRequests(review) {
  return review.targets.filter(t => t.status === 'CHANGES_REQUESTED').map(t =>
    review.events.findLast(e => e.targetId === t.id && e.decision === 'CHANGES_REQUESTED'));
}
function createFederationImprovements({ store, archive, reviews, now = Date.now }) {
  // Kept for this process, even after a child expires: a retry must not create another run.
  const requests = new Map();
  function read(requestId) {
    if (typeof requestId !== 'string' || !UUID.test(requestId)) fail('INPUT_REJECTED');
    const entry = requests.get(requestId);
    if (!entry) fail('NOT_FOUND');
    try { return store.read(entry.runId); }
    catch (error) { if (error.message === 'SIMULATION_NOT_FOUND') fail('EXPIRED'); throw error; }
  }
  function derive(archiveId, input) {
    if (typeof archiveId !== 'string' || !DIGEST.test(archiveId)
      || !exact(input, 'requestId,expectedReviewRevision,expectedReviewChainHead,requestIds,config,intent')
      || typeof input.requestId !== 'string' || !UUID.test(input.requestId)
      || !Number.isSafeInteger(input.expectedReviewRevision) || input.expectedReviewRevision < 1 || input.expectedReviewRevision > 64
      || typeof input.expectedReviewChainHead !== 'string' || !DIGEST.test(input.expectedReviewChainHead)
      || !validConfig(input.config) || !validNote(input.intent)
      || !Array.isArray(input.requestIds) || !input.requestIds.length || input.requestIds.length > IMPROVEMENT_LIMITS.requestsPerExperiment
      || new Set(input.requestIds).size !== input.requestIds.length
      || input.requestIds.some(id => typeof id !== 'string' || !UUID.test(id))) fail('INPUT_REJECTED');
    const fingerprint = JSON.stringify([archiveId, input.expectedReviewRevision, input.expectedReviewChainHead,
      [...input.requestIds].sort(), input.intent, input.config.name, input.config.templateId, ...CONFIG_COUNTS.map(k => input.config[k])]);
    const existing = requests.get(input.requestId);
    if (existing) {
      if (existing.fingerprint !== fingerprint) fail('REQUEST_CONFLICT');
      return read(input.requestId);
    }
    if (requests.size >= IMPROVEMENT_LIMITS.requestsPerProcess) fail('CAPACITY_LIMIT');
    return reviews.withSnapshot(archiveId, review => {
      const source = archive.read(archiveId).snapshot;
      if (review.revision !== input.expectedReviewRevision || review.chainHead !== input.expectedReviewChainHead) fail('REVIEW_CONFLICT');
      if (source.config.templateId !== input.config.templateId || !CONFIG_COUNTS.some(k => source.config[k] !== input.config[k])) fail('INPUT_REJECTED');
      const selected = openRequests(review).filter(e => input.requestIds.includes(e.requestId));
      if (selected.length !== input.requestIds.length) fail('REQUEST_CLOSED');
      const child = store.createDerived(input.config, {
        schemaVersion: 1, requestId: input.requestId, sourceArchiveId: archiveId, sourceRunId: source.id,
        sourceRevision: source.revision, sourceGeneration: source.generation, baselineConfig: source.config,
        reviewRevision: review.revision, reviewChainHead: review.chainHead,
        requests: selected.map(({ requestId, targetId, sequence, sha256, note }) => ({ requestId, targetId, sequence, sha256, note })),
        intent: input.intent, createdAt: new Date(now()).toISOString(), approvalInherited: false, improvementVerified: false
      });
      requests.set(input.requestId, { fingerprint, runId: child.id });
      return child;
    });
  }
  return { derive, read };
}
module.exports = { createFederationImprovements, openRequests, IMPROVEMENT_LIMITS };
