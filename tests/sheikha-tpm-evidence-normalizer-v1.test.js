'use strict';

const crypto = require('node:crypto');
const {normalizeTpmEvidence} = require('../core/governance/sheikha-tpm-evidence-normalizer-v1');

function extend(previous, digest) { return crypto.createHash('sha256').update(Buffer.concat([previous, Buffer.from(digest, 'hex')])).digest(); }

describe('Sheikha TPM evidence normalizer V1', () => {
  const digest1 = '11'.repeat(32);
  const digest2 = '22'.repeat(32);
  const finalPcr = extend(extend(Buffer.alloc(32), digest1), digest2).toString('hex');
  const events = [
    {sequence: 1, algorithm: 'sha256', pcrIndex: 4, digest: digest1, eventType: 'EV_EFI_BOOT_SERVICES_APPLICATION', stage: 'BOOTLOADER', artifact: {id: 'bootx64', expectedDigest: digest1}},
    {sequence: 2, algorithm: 'sha256', pcrIndex: 4, digest: digest2, eventType: 'EV_IPL', stage: 'KERNEL', artifact: {id: 'kernel', expectedDigest: '33'.repeat(32)}}
  ];

  test('replays PCR extension and classifies artifact digests', () => {
    const result = normalizeTpmEvidence({pcrExport: {banks: [{algorithm: 'sha256', values: {'4': finalPcr}}]}, eventLogExport: {events}});
    expect(result.pcrResults[0].status).toBe('MATCH');
    expect(result.entries.map((entry) => entry.artifactDigestStatus)).toEqual(['MATCH', 'MISMATCH']);
    expect(result.summary).toMatchObject({pcrMatchCount: 1, pcrMismatchCount: 0, artifactMismatchCount: 1});
    expect(result.directTpmReadPerformed).toBe(false);
    expect(result.attestationVerified).toBe(false);
  });

  test('detects PCR mismatch and rejects malformed evidence', () => {
    const mismatch = normalizeTpmEvidence({pcrExport: {banks: [{algorithm: 'sha256', values: {'4': '00'.repeat(32)}}]}, eventLogExport: {events}});
    expect(mismatch.pcrResults[0].status).toBe('MISMATCH');
    expect(() => normalizeTpmEvidence({pcrExport: {banks: [{algorithm: 'md5', values: {}}]}, eventLogExport: {events: []}})).toThrow('UNSUPPORTED_PCR_ALGORITHM');
  });
});
