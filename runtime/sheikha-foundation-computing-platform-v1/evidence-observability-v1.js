'use strict';

function evidenceRecord({ objectId, event, source, payloadHash, metrics = {}, at = new Date().toISOString() } = {}) {
  if (!objectId || !event || !source || !payloadHash) throw new Error('EVIDENCE_FIELDS_REQUIRED');
  return Object.freeze({ objectId, event, source, payloadHash, metrics: Object.freeze({ ...metrics }), at });
}

module.exports = { evidenceRecord };
