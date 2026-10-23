'use strict';

const crypto = require('node:crypto');
const {parseTpmtSignature, verifyNativeQuoteSignature} = require('../core/governance/sheikha-native-tpm-signature-v1');

const u16 = (value) => { const b = Buffer.alloc(2); b.writeUInt16BE(value); return b; };
const tpm2b = (value) => Buffer.concat([u16(value.length), value]);

function parseDerEcdsa(signature) {
  let offset = 0;
  if (signature[offset++] !== 0x30) throw new Error('DER_SEQUENCE_REQUIRED');
  const readLength = () => { const first = signature[offset++]; if (first < 128) return first; const count = first & 0x7f; let length = 0; for (let i = 0; i < count; i += 1) length = length * 256 + signature[offset++]; return length; };
  readLength();
  if (signature[offset++] !== 0x02) throw new Error('DER_INTEGER_REQUIRED');
  const rLength = readLength(); let r = signature.subarray(offset, offset + rLength); offset += rLength;
  if (signature[offset++] !== 0x02) throw new Error('DER_INTEGER_REQUIRED');
  const sLength = readLength(); let s = signature.subarray(offset, offset + sLength);
  if (r[0] === 0) r = r.subarray(1); if (s[0] === 0) s = s.subarray(1);
  return {r, s};
}

describe('Sheikha native TPMT_SIGNATURE verifier V1', () => {
  const data = Buffer.from('native-tpms-attest-signed-bytes');

  test.each([
    ['RSASSA', 0x0014, crypto.constants.RSA_PKCS1_PADDING],
    ['RSAPSS', 0x0016, crypto.constants.RSA_PKCS1_PSS_PADDING]
  ])('parses and verifies %s', (name, algorithm, padding) => {
    const {privateKey, publicKey} = crypto.generateKeyPairSync('rsa', {modulusLength: 2048});
    const signature = crypto.sign('sha256', data, {key: privateKey, padding, ...(name === 'RSAPSS' ? {saltLength: 32} : {})});
    const raw = Buffer.concat([u16(algorithm), u16(0x000b), tpm2b(signature)]);
    expect(parseTpmtSignature(raw)).toMatchObject({algorithm: name, hashAlgorithm: 'sha256'});
    expect(verifyNativeQuoteSignature({attestationData: data, tpmtSignature: raw, akPublicKey: publicKey}).verified).toBe(true);
  });

  test('parses and verifies ECDSA R and S', () => {
    const {privateKey, publicKey} = crypto.generateKeyPairSync('ec', {namedCurve: 'prime256v1'});
    const {r, s} = parseDerEcdsa(crypto.sign('sha256', data, privateKey));
    const raw = Buffer.concat([u16(0x0018), u16(0x000b), tpm2b(r), tpm2b(s)]);
    expect(parseTpmtSignature(raw)).toMatchObject({algorithm: 'ECDSA', hashAlgorithm: 'sha256'});
    expect(verifyNativeQuoteSignature({attestationData: data, tpmtSignature: raw, akPublicKey: publicKey}).verified).toBe(true);
    expect(verifyNativeQuoteSignature({attestationData: Buffer.from('tampered'), tpmtSignature: raw, akPublicKey: publicKey}).verified).toBe(false);
  });

  test('rejects unsupported, truncated, and trailing signature structures', () => {
    expect(() => parseTpmtSignature(Buffer.from([0, 1, 0, 11]))).toThrow('UNSUPPORTED_TPM_SIGNATURE_ALGORITHM');
    expect(() => parseTpmtSignature(Buffer.from([0, 0x14, 0]))).toThrow('TRUNCATED_TPMT_SIGNATURE');
    const raw = Buffer.concat([u16(0x0014), u16(0x000b), tpm2b(Buffer.alloc(256)), Buffer.from([0])]);
    expect(() => parseTpmtSignature(raw)).toThrow('TRAILING_TPMT_SIGNATURE_BYTES');
  });
});
