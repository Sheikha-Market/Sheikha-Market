'use strict';

const crypto = require('node:crypto');
const {ALG, computeObjectName, parseTpm2bPublic, parseTpmtPublic, publicAreaMatchesAk, verifyAkNameBinding} = require('../core/governance/sheikha-native-tpm-public-v1');

const u16 = (v) => { const b = Buffer.alloc(2); b.writeUInt16BE(v); return b; };
const u32 = (v) => { const b = Buffer.alloc(4); b.writeUInt32BE(v); return b; };
const tpm2b = (v) => Buffer.concat([u16(v.length), v]);
const b64 = (v) => Buffer.from(v, 'base64url');

function rsaFixture() {
  const {publicKey} = crypto.generateKeyPairSync('rsa', {modulusLength: 2048});
  const jwk = publicKey.export({format: 'jwk'});
  const area = Buffer.concat([u16(ALG.RSA), u16(ALG.SHA256), u32(0x00040072), tpm2b(Buffer.alloc(0)),
    u16(ALG.NULL), u16(ALG.RSASSA), u16(ALG.SHA256), u16(2048), u32(0), tpm2b(b64(jwk.n))]);
  return {publicKey, area, wrapper: tpm2b(area)};
}

function eccFixture() {
  const {publicKey} = crypto.generateKeyPairSync('ec', {namedCurve: 'prime256v1'});
  const jwk = publicKey.export({format: 'jwk'});
  const area = Buffer.concat([u16(ALG.ECC), u16(ALG.SHA256), u32(0x00040072), tpm2b(Buffer.alloc(0)),
    u16(ALG.NULL), u16(ALG.ECDSA), u16(ALG.SHA256), u16(0x0003), u16(ALG.NULL),
    tpm2b(b64(jwk.x)), tpm2b(b64(jwk.y))]);
  return {publicKey, area};
}

describe('Sheikha native TPM2B_PUBLIC and AK Name binding V1', () => {
  test('parses RSA, applies the default exponent, and computes the Object Name without wrapper size', () => {
    const fixture = rsaFixture();
    const parsed = parseTpm2bPublic(fixture.wrapper);
    expect(parsed.parameters.exponent).toBe(0);
    expect(publicAreaMatchesAk(parsed, fixture.publicKey)).toBe(true);
    const expected = Buffer.concat([u16(ALG.SHA256), crypto.createHash('sha256').update(fixture.area).digest()]);
    expect(computeObjectName(parsed)).toEqual(expected);
  });

  test('parses ECC coordinates and binds them to the AK public key', () => {
    const fixture = eccFixture();
    const parsed = parseTpmtPublic(fixture.area);
    expect(parsed.parameters.curve).toBe('P-256');
    expect(publicAreaMatchesAk(parsed, fixture.publicKey)).toBe(true);
    expect(publicAreaMatchesAk(parsed, rsaFixture().publicKey)).toBe(false);
  });

  test('keeps Object Name and Qualified Name distinct and requires governed enrollment', () => {
    const fixture = rsaFixture();
    const parsed = parseTpmtPublic(fixture.area);
    const objectName = computeObjectName(parsed).toString('hex');
    const qualifiedName = Buffer.concat([u16(ALG.SHA256), crypto.randomBytes(32)]);
    const result = verifyAkNameBinding({parsedPublic: parsed, akPublicKey: fixture.publicKey,
      qualifiedSigner: qualifiedName, enrollment: {objectName, qualifiedName: qualifiedName.toString('hex'), platformId: 'msi', governanceDecisionId: 'd1'}});
    expect(result).toMatchObject({trusted: true, objectNameAndQualifiedNameDistinct: true, tpmResidencyProven: false});
    expect(verifyAkNameBinding({parsedPublic: parsed, akPublicKey: fixture.publicKey,
      qualifiedSigner: crypto.randomBytes(34), enrollment: {objectName, qualifiedName: qualifiedName.toString('hex'), platformId: 'msi', governanceDecisionId: 'd1'}}).trusted).toBe(false);
  });

  test.each([
    ['truncation', (area) => area.subarray(0, -1), 'TRUNCATED_TPM_PUBLIC'],
    ['trailing bytes', (area) => Buffer.concat([area, Buffer.from([0])]), 'TRAILING_TPM_PUBLIC_BYTES'],
    ['unsupported symmetric layout', (area) => { const copy = Buffer.from(area); copy.writeUInt16BE(0x0006, 10); return copy; }, 'UNSUPPORTED_TPM_PUBLIC_SYMMETRIC_LAYOUT']
  ])('rejects %s', (_name, mutate, error) => {
    expect(() => parseTpmtPublic(mutate(rsaFixture().area))).toThrow(error);
  });
});
