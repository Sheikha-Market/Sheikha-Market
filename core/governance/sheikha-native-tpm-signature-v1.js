'use strict';

const crypto = require('node:crypto');
const {HASH_ALGORITHMS} = require('./sheikha-native-tpm-attestation-v1');

const SIGNATURE_ALGORITHMS = Object.freeze({0x0014: 'RSASSA', 0x0016: 'RSAPSS', 0x0018: 'ECDSA'});

function tpm2b(cursor, max = 8192) {
  if (cursor.offset + 2 > cursor.buffer.length) throw new Error('TRUNCATED_TPMT_SIGNATURE');
  const size = cursor.buffer.readUInt16BE(cursor.offset); cursor.offset += 2;
  if (size > max || cursor.offset + size > cursor.buffer.length) throw new Error('INVALID_TPMT_SIGNATURE_LENGTH');
  const value = cursor.buffer.subarray(cursor.offset, cursor.offset + size); cursor.offset += size;
  return value;
}

function parseTpmtSignature(buffer) {
  const cursor = {buffer: Buffer.from(buffer), offset: 0};
  if (cursor.buffer.length < 4) throw new Error('TRUNCATED_TPMT_SIGNATURE');
  const sigAlgId = cursor.buffer.readUInt16BE(cursor.offset); cursor.offset += 2;
  const algorithm = SIGNATURE_ALGORITHMS[sigAlgId];
  if (!algorithm) throw new Error('UNSUPPORTED_TPM_SIGNATURE_ALGORITHM');
  const hashAlgId = cursor.buffer.readUInt16BE(cursor.offset); cursor.offset += 2;
  const hashAlgorithm = HASH_ALGORITHMS[hashAlgId];
  if (!hashAlgorithm) throw new Error('UNSUPPORTED_TPM_SIGNATURE_HASH');
  const parsed = {sigAlgId, algorithm, hashAlgId, hashAlgorithm};
  if (algorithm === 'ECDSA') {
    parsed.r = tpm2b(cursor, 1024);
    parsed.s = tpm2b(cursor, 1024);
  } else {
    parsed.signature = tpm2b(cursor, 8192);
  }
  if (cursor.offset !== cursor.buffer.length) throw new Error('TRAILING_TPMT_SIGNATURE_BYTES');
  return parsed;
}

function derLength(length) { return length < 128 ? Buffer.from([length]) : Buffer.from([0x81, length]); }
function derInteger(value) {
  let bytes = Buffer.from(value);
  while (bytes.length > 1 && bytes[0] === 0 && (bytes[1] & 0x80) === 0) bytes = bytes.subarray(1);
  if ((bytes[0] & 0x80) !== 0) bytes = Buffer.concat([Buffer.from([0]), bytes]);
  return Buffer.concat([Buffer.from([0x02]), derLength(bytes.length), bytes]);
}
function ecdsaDer(r, s) {
  const body = Buffer.concat([derInteger(r), derInteger(s)]);
  return Buffer.concat([Buffer.from([0x30]), derLength(body.length), body]);
}

function verifyNativeQuoteSignature({attestationData, tpmtSignature, akPublicKey}) {
  const parsed = parseTpmtSignature(tpmtSignature);
  let signature;
  let options = akPublicKey?.type === 'public' ? akPublicKey : crypto.createPublicKey(akPublicKey);
  if (parsed.algorithm === 'ECDSA') signature = ecdsaDer(parsed.r, parsed.s);
  else {
    signature = parsed.signature;
    options = {
      key: options,
      padding: parsed.algorithm === 'RSAPSS' ? crypto.constants.RSA_PKCS1_PSS_PADDING : crypto.constants.RSA_PKCS1_PADDING,
      ...(parsed.algorithm === 'RSAPSS' ? {saltLength: crypto.createHash(parsed.hashAlgorithm).digest().length} : {})
    };
  }
  return {verified: crypto.verify(parsed.hashAlgorithm, Buffer.from(attestationData), options, signature), signature: parsed};
}

module.exports = {SIGNATURE_ALGORITHMS, ecdsaDer, parseTpmtSignature, verifyNativeQuoteSignature};
