'use strict';

const crypto = require('node:crypto');

const ALG = Object.freeze({RSA: 0x0001, SHA1: 0x0004, SHA256: 0x000b, SHA384: 0x000c, SHA512: 0x000d, NULL: 0x0010, RSASSA: 0x0014, RSAPSS: 0x0016, ECDSA: 0x0018, ECC: 0x0023});
const HASHES = Object.freeze({[ALG.SHA1]: 'sha1', [ALG.SHA256]: 'sha256', [ALG.SHA384]: 'sha384', [ALG.SHA512]: 'sha512'});
const CURVES = Object.freeze({0x0003: 'P-256', 0x0004: 'P-384', 0x0005: 'P-521'});

class Cursor {
  constructor(value) { this.buffer = Buffer.from(value); this.offset = 0; }
  need(size) { if (this.offset + size > this.buffer.length) throw new Error('TRUNCATED_TPM_PUBLIC'); }
  u16() { this.need(2); const value = this.buffer.readUInt16BE(this.offset); this.offset += 2; return value; }
  u32() { this.need(4); const value = this.buffer.readUInt32BE(this.offset); this.offset += 4; return value; }
  bytes(size) { this.need(size); const value = this.buffer.subarray(this.offset, this.offset + size); this.offset += size; return value; }
  tpm2b(limit = 8192) { const size = this.u16(); if (size > limit) throw new Error('TPM2B_PUBLIC_FIELD_LIMIT_EXCEEDED'); return this.bytes(size); }
  finish() { if (this.offset !== this.buffer.length) throw new Error('TRAILING_TPM_PUBLIC_BYTES'); }
}

function parseNullSymmetric(cursor) {
  const algorithm = cursor.u16();
  if (algorithm !== ALG.NULL) throw new Error('UNSUPPORTED_TPM_PUBLIC_SYMMETRIC_LAYOUT');
  return {algorithm};
}

function parseScheme(cursor, allowed) {
  const scheme = cursor.u16();
  if (scheme === ALG.NULL) return {scheme, hashAlg: null};
  if (!allowed.includes(scheme)) throw new Error('UNSUPPORTED_TPM_PUBLIC_SCHEME');
  const hashAlg = cursor.u16();
  if (!HASHES[hashAlg]) throw new Error('UNSUPPORTED_TPM_PUBLIC_SCHEME_HASH');
  return {scheme, hashAlg, hashAlgorithm: HASHES[hashAlg]};
}

function parseTpmtPublic(publicArea) {
  const raw = Buffer.from(publicArea);
  const cursor = new Cursor(raw);
  const type = cursor.u16();
  const nameAlg = cursor.u16();
  if (!HASHES[nameAlg]) throw new Error('UNSUPPORTED_TPM_PUBLIC_NAME_ALGORITHM');
  const objectAttributes = cursor.u32();
  const authPolicy = cursor.tpm2b();
  let parameters;
  let unique;
  if (type === ALG.RSA) {
    parameters = {
      symmetric: parseNullSymmetric(cursor),
      scheme: parseScheme(cursor, [ALG.RSASSA, ALG.RSAPSS]),
      keyBits: cursor.u16(),
      exponent: cursor.u32()
    };
    unique = {rsa: cursor.tpm2b()};
  } else if (type === ALG.ECC) {
    const symmetric = parseNullSymmetric(cursor);
    const scheme = parseScheme(cursor, [ALG.ECDSA]);
    const curveId = cursor.u16();
    if (!CURVES[curveId]) throw new Error('UNSUPPORTED_TPM_ECC_CURVE');
    const kdf = cursor.u16();
    if (kdf !== ALG.NULL) throw new Error('UNSUPPORTED_TPM_ECC_KDF');
    parameters = {symmetric, scheme, curveId, curve: CURVES[curveId], kdf};
    unique = {x: cursor.tpm2b(), y: cursor.tpm2b()};
  } else {
    throw new Error('UNSUPPORTED_TPM_PUBLIC_TYPE');
  }
  cursor.finish();
  return {type, nameAlg, nameAlgorithm: HASHES[nameAlg], objectAttributes, authPolicy, parameters, unique, marshaledPublicArea: raw};
}

function parseTpm2bPublic(value) {
  const cursor = new Cursor(value);
  const publicArea = cursor.tpm2b(16384);
  cursor.finish();
  return parseTpmtPublic(publicArea);
}

function computeObjectName(parsed) {
  const prefix = Buffer.alloc(2);
  prefix.writeUInt16BE(parsed.nameAlg);
  const digest = crypto.createHash(parsed.nameAlgorithm).update(parsed.marshaledPublicArea).digest();
  return Buffer.concat([prefix, digest]);
}

function decodeBase64Url(value) { return Buffer.from(value, 'base64url'); }

function publicAreaMatchesAk(parsed, akPublicKey) {
  const key = akPublicKey?.type === 'public' ? akPublicKey : crypto.createPublicKey(akPublicKey);
  const jwk = key.export({format: 'jwk'});
  if (parsed.type === ALG.RSA && jwk.kty === 'RSA') {
    const exponent = parsed.parameters.exponent === 0 ? 65537 : parsed.parameters.exponent;
    const jwkExponent = decodeBase64Url(jwk.e).reduce((value, byte) => value * 256 + byte, 0);
    return parsed.parameters.keyBits === decodeBase64Url(jwk.n).length * 8 && exponent === jwkExponent &&
      parsed.unique.rsa.equals(decodeBase64Url(jwk.n));
  }
  if (parsed.type === ALG.ECC && jwk.kty === 'EC') {
    return parsed.parameters.curve === jwk.crv && parsed.unique.x.equals(decodeBase64Url(jwk.x)) &&
      parsed.unique.y.equals(decodeBase64Url(jwk.y));
  }
  return false;
}

function verifyAkNameBinding({parsedPublic, akPublicKey, qualifiedSigner, enrollment}) {
  const objectName = computeObjectName(parsedPublic);
  const expectedQualifiedName = Buffer.from(enrollment?.qualifiedName || '', 'hex');
  const signer = Buffer.from(qualifiedSigner || []);
  const trusted = publicAreaMatchesAk(parsedPublic, akPublicKey) &&
    enrollment?.objectName === objectName.toString('hex') && expectedQualifiedName.length > 0 &&
    signer.length === expectedQualifiedName.length && crypto.timingSafeEqual(signer, expectedQualifiedName) &&
    Boolean(enrollment.platformId && enrollment.governanceDecisionId);
  return {
    trusted, objectName: objectName.toString('hex'),
    qualifiedName: expectedQualifiedName.toString('hex'),
    objectNameAndQualifiedNameDistinct: !objectName.equals(expectedQualifiedName),
    tpmResidencyProven: false
  };
}

module.exports = {ALG, CURVES, HASHES, computeObjectName, parseTpm2bPublic, parseTpmtPublic, publicAreaMatchesAk, verifyAkNameBinding};
