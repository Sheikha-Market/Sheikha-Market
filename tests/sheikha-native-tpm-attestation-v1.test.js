'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {
  TPM_GENERATED_VALUE, TPM_ST_ATTEST_QUOTE, parseTpm2bAttest, parseTpmsAttestQuote,
  spkiSha256, verifyGovernancePinnedAk, verifySignedNonce, verifyX509AkChain
} = require('../core/governance/sheikha-native-tpm-attestation-v1');

const u16 = (value) => { const b = Buffer.alloc(2); b.writeUInt16BE(value); return b; };
const u32 = (value) => { const b = Buffer.alloc(4); b.writeUInt32BE(value); return b; };
const u64 = (value) => { const b = Buffer.alloc(8); b.writeBigUInt64BE(BigInt(value)); return b; };
const tpm2b = (value) => Buffer.concat([u16(value.length), value]);

function quoteFixture({magic = TPM_GENERATED_VALUE, type = TPM_ST_ATTEST_QUOTE, safe = 1} = {}) {
  const nonce = Buffer.from('signed-nonce');
  const attestationData = Buffer.concat([
    u32(magic), u16(type), tpm2b(Buffer.from('ak-name')), tpm2b(nonce),
    u64(42), u32(1), u32(2), Buffer.from([safe]), u64(7),
    u32(1), u16(0x000b), Buffer.from([3, 0x81, 0x00, 0x00]), tpm2b(Buffer.alloc(32, 0xab))
  ]);
  return {attestationData, nonce, wrapper: tpm2b(attestationData)};
}

function x509Fixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-ak-chain-'));
  const run = (...args) => execFileSync('openssl', args, {cwd: directory, stdio: 'ignore'});
  run('req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '2', '-subj', '/CN=Sheikha Test Root',
    '-addext', 'basicConstraints=critical,CA:TRUE', '-keyout', 'root.key', '-out', 'root.pem');
  run('req', '-newkey', 'rsa:2048', '-nodes', '-subj', '/CN=Sheikha Ephemeral AK', '-keyout', 'ak.key', '-out', 'ak.csr');
  run('x509', '-req', '-in', 'ak.csr', '-CA', 'root.pem', '-CAkey', 'root.key', '-CAcreateserial',
    '-days', '1', '-out', 'ak.pem');
  const rootCertificatePem = fs.readFileSync(path.join(directory, 'root.pem'));
  const leafCertificatePem = fs.readFileSync(path.join(directory, 'ak.pem'));
  const akPublicKey = new crypto.X509Certificate(leafCertificatePem).publicKey;
  const expectedRootSha256 = crypto.createHash('sha256')
    .update(new crypto.X509Certificate(rootCertificatePem).raw).digest('hex');
  return {directory, rootCertificatePem, leafCertificatePem, akPublicKey, expectedRootSha256};
}

describe('Sheikha native TPMS_ATTEST parser V1', () => {
  test('parses a native quote and unwraps TPM2B_ATTEST', () => {
    const fixture = quoteFixture();
    const parsed = parseTpmsAttestQuote(fixture.attestationData);
    const wrapped = parseTpm2bAttest(fixture.wrapper);
    expect(parsed.magic).toBe(TPM_GENERATED_VALUE);
    expect(parsed.type).toBe(TPM_ST_ATTEST_QUOTE);
    expect(parsed.pcrSelections[0]).toMatchObject({hashAlgorithm: 'sha256', selectedPcrs: [0, 7]});
    expect(parsed.pcrDigest).toBe('ab'.repeat(32));
    expect(verifySignedNonce(parsed, fixture.nonce)).toBe(true);
    expect(verifySignedNonce(parsed, Buffer.from('wrong'))).toBe(false);
    expect(wrapped.signedBytes.equals(fixture.attestationData)).toBe(true);
  });

  test.each([
    ['bad magic', () => quoteFixture({magic: 0}).attestationData, 'INVALID_TPM_GENERATED_MAGIC'],
    ['bad type', () => quoteFixture({type: 0x8017}).attestationData, 'ATTESTATION_TYPE_IS_NOT_QUOTE'],
    ['invalid safe flag', () => quoteFixture({safe: 2}).attestationData, 'INVALID_CLOCK_SAFE_FLAG'],
    ['truncation', () => quoteFixture().attestationData.subarray(0, -1), 'TRUNCATED_TPM_STRUCTURE'],
    ['trailing bytes', () => Buffer.concat([quoteFixture().attestationData, Buffer.from([0])]), 'TRAILING_TPM_BYTES']
  ])('rejects %s', (_name, value, error) => {
    expect(() => parseTpmsAttestQuote(value())).toThrow(error);
  });

  test('verifies a governance-pinned AK without claiming TPM residency', () => {
    const {publicKey} = crypto.generateKeyPairSync('ed25519');
    const fingerprint = spkiSha256(publicKey);
    const result = verifyGovernancePinnedAk({
      akPublicKey: publicKey, expectedSpkiSha256: fingerprint,
      enrollment: {spkiSha256: fingerprint, platformId: 'msi-c1vfkg', governanceDecisionId: 'd1', evidenceReferences: ['e1']}
    });
    expect(result).toMatchObject({trusted: true, tpmResidencyProven: false, physicalPlatformIdentityProvenByPinAlone: false});
    expect(verifyGovernancePinnedAk({akPublicKey: publicKey, expectedSpkiSha256: '00'.repeat(32), enrollment: {}}).trusted).toBe(false);
  });

  test('verifies an ephemeral X.509 AK chain and fails closed on pin, key, and time mismatches', () => {
    const fixture = x509Fixture();
    try {
      const input = {
        akPublicKey: fixture.akPublicKey,
        leafCertificatePem: fixture.leafCertificatePem,
        rootCertificatePem: fixture.rootCertificatePem,
        expectedRootSha256: fixture.expectedRootSha256
      };
      expect(verifyX509AkChain(input)).toMatchObject({
        trusted: true, rootIsCa: true, rootIsSelfIssued: true, leafIssuedByRoot: true,
        rootValidAtVerificationTime: true, leafValidAtVerificationTime: true,
        leafMatchesAk: true, tpmResidencyProven: false,
        physicalPlatformIdentityProvenByCertificateAlone: false
      });
      expect(verifyX509AkChain({...input, expectedRootSha256: '00'.repeat(32)}).trusted).toBe(false);
      expect(verifyX509AkChain({...input, akPublicKey: crypto.generateKeyPairSync('ed25519').publicKey}).trusted).toBe(false);
      expect(verifyX509AkChain({...input, now: new Date('2100-01-01T00:00:00Z')}).trusted).toBe(false);
    } finally {
      fs.rmSync(fixture.directory, {recursive: true, force: true});
    }
  });
});
