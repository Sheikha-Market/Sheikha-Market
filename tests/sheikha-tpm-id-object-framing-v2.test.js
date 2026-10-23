'use strict';

const crypto = require('node:crypto');
const {
  repairLegacyTpm2bIdObjectFraming,
  packTpm2ToolsCredential,
} = require('../core/governance/sheikha-tpm-id-object-framing-v2');

function tpm2b(value) {
  const size = Buffer.alloc(2);
  size.writeUInt16BE(value.length);
  return Buffer.concat([size, value]);
}

describe('Sheikha TPM2B_ID_OBJECT framing repair V2', () => {
  test('removes only the redundant encIdentity size prefix', () => {
    const hmac = crypto.randomBytes(32);
    const encIdentity = crypto.randomBytes(34);
    const legacy = tpm2b(Buffer.concat([tpm2b(hmac), tpm2b(encIdentity)]));
    const result = repairLegacyTpm2bIdObjectFraming(legacy);

    expect(legacy).toHaveLength(72);
    expect(result.correctedBlob).toHaveLength(70);
    expect(result.correctedBlob.readUInt16BE(0)).toBe(68);
    expect(result.correctedBlob.subarray(4, 36)).toEqual(hmac);
    expect(result.correctedBlob.subarray(36)).toEqual(encIdentity);
    expect(result.evidence).toMatchObject({
      removedBytes: 2,
      integrityHmacPreserved: true,
      encIdentityPreserved: true,
      tpmAccessed: false,
      activationExecuted: false,
      physicalRetryAuthorized: false,
    });
  });

  test.each([
    ['truncated outer object', Buffer.from([0, 70, 0])],
    ['wrong HMAC profile', tpm2b(Buffer.concat([tpm2b(Buffer.alloc(20)), tpm2b(Buffer.alloc(34))]))],
    ['trailing data', Buffer.concat([tpm2b(Buffer.concat([tpm2b(Buffer.alloc(32)), tpm2b(Buffer.alloc(34))])), Buffer.from([0])])],
  ])('fails closed for %s', (_name, value) => {
    expect(() => repairLegacyTpm2bIdObjectFraming(value)).toThrow();
  });

  test('packs corrected credential and secret in tpm2-tools format', () => {
    const credential = tpm2b(Buffer.alloc(68, 1));
    const secret = tpm2b(Buffer.alloc(68, 2));
    const packed = packTpm2ToolsCredential(credential, secret);
    expect(packed).toHaveLength(148);
    expect(packed.readUInt32BE(0)).toBe(0xbadcc0de);
    expect(packed.readUInt32BE(4)).toBe(1);
    expect(packed.subarray(8, 78)).toEqual(credential);
    expect(packed.subarray(78)).toEqual(secret);
  });
});
