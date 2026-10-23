'use strict';

const crypto = require('node:crypto');

const ALGORITHMS = Object.freeze({sha1: 20, sha256: 32, sha384: 48, sha512: 64});
function validHex(value, bytes) { return typeof value === 'string' && new RegExp(`^[a-fA-F0-9]{${bytes * 2}}$`).test(value); }

function normalizeTpmEvidence({pcrExport, eventLogExport}) {
  if (!Array.isArray(pcrExport?.banks) || !Array.isArray(eventLogExport?.events)) throw new Error('PCR_BANKS_AND_EVENT_LOG_REQUIRED');
  const bankValues = new Map();
  for (const bank of pcrExport.banks) {
    const bytes = ALGORITHMS[bank.algorithm];
    if (!bytes) throw new Error('UNSUPPORTED_PCR_ALGORITHM');
    for (const [index, digest] of Object.entries(bank.values || {})) {
      if (!/^([0-9]|1[0-9]|2[0-3])$/.test(index) || !validHex(digest, bytes)) throw new Error('INVALID_PCR_EXPORT');
      bankValues.set(`${bank.algorithm}:${Number(index)}`, digest.toLowerCase());
    }
  }
  const replay = new Map();
  const entries = [...eventLogExport.events].sort((a, b) => a.sequence - b.sequence).map((event) => {
    const bytes = ALGORITHMS[event.algorithm];
    if (!bytes || !Number.isInteger(event.pcrIndex) || event.pcrIndex < 0 || event.pcrIndex > 23 || !validHex(event.digest, bytes)) throw new Error('INVALID_EVENT_LOG_ENTRY');
    const key = `${event.algorithm}:${event.pcrIndex}`;
    const previous = replay.get(key) || Buffer.alloc(bytes);
    const extended = crypto.createHash(event.algorithm).update(Buffer.concat([previous, Buffer.from(event.digest, 'hex')])).digest();
    replay.set(key, extended);
    const expectedDigest = event.artifact?.expectedDigest || null;
    const artifactDigestStatus = expectedDigest === null ? 'UNVERIFIED' : expectedDigest.toLowerCase() === event.digest.toLowerCase() ? 'MATCH' : 'MISMATCH';
    return {
      sequence: event.sequence, bank: event.algorithm, pcrIndex: event.pcrIndex,
      eventType: event.eventType, stage: event.stage, artifactId: event.artifact?.id || null,
      observedDigest: event.digest.toLowerCase(), expectedDigest, artifactDigestStatus,
      replayedPcrAfterEvent: extended.toString('hex')
    };
  });
  const pcrResults = [...new Set([...bankValues.keys(), ...replay.keys()])].sort().map((key) => {
    const [bank, index] = key.split(':');
    const observed = bankValues.get(key) || null;
    const replayed = replay.get(key)?.toString('hex') || null;
    return {bank, pcrIndex: Number(index), observed, replayed, status: !observed || !replayed ? 'UNVERIFIED' : observed === replayed ? 'MATCH' : 'MISMATCH'};
  });
  return {
    schemaVersion: '1.0.0', system: 'SHEIKHA_TPM_PCR_EVENT_LOG_NORMALIZATION_V1',
    entries, pcrResults,
    summary: {
      eventCount: entries.length,
      pcrMatchCount: pcrResults.filter((item) => item.status === 'MATCH').length,
      pcrMismatchCount: pcrResults.filter((item) => item.status === 'MISMATCH').length,
      pcrUnverifiedCount: pcrResults.filter((item) => item.status === 'UNVERIFIED').length,
      artifactMismatchCount: entries.filter((item) => item.artifactDigestStatus === 'MISMATCH').length
    },
    directTpmReadPerformed: false,
    attestationVerified: false
  };
}

module.exports = {ALGORITHMS, normalizeTpmEvidence};
