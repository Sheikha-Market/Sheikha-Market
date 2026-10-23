'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {execFileSync} = require('node:child_process');
const {spkiSha256} = require('../core/governance/sheikha-native-tpm-attestation-v1');
const {verifyEkAkResidencyEvidence} = require('../core/governance/sheikha-ek-ak-residency-evidence-v1');

function fixture() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'sheikha-ek-ak-'));
  const run = (...args) => execFileSync('openssl', args, {cwd: directory, stdio: 'ignore'});
  run('req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '2', '-subj', '/CN=Sheikha EK Test Root', '-addext', 'basicConstraints=critical,CA:TRUE', '-keyout', 'root.key', '-out', 'root.pem');
  run('req', '-newkey', 'rsa:2048', '-nodes', '-subj', '/CN=Ephemeral EK', '-keyout', 'ek.key', '-out', 'ek.csr');
  run('x509', '-req', '-in', 'ek.csr', '-CA', 'root.pem', '-CAkey', 'root.key', '-CAcreateserial', '-days', '1', '-out', 'ek.pem');
  const ekLeafCertificatePem = fs.readFileSync(path.join(directory, 'ek.pem'));
  const ekRootCertificatePem = fs.readFileSync(path.join(directory, 'root.pem'));
  const ekPublicKey = new crypto.X509Certificate(ekLeafCertificatePem).publicKey;
  const expectedEkRootSha256 = crypto.createHash('sha256').update(new crypto.X509Certificate(ekRootCertificatePem).raw).digest('hex');
  const ek = spkiSha256(ekPublicKey);
  const challenge = crypto.randomBytes(32).toString('hex');
  const secret = crypto.randomBytes(32).toString('hex');
  const base = {
    ekPublicKey, ekLeafCertificatePem, ekRootCertificatePem, expectedEkRootSha256,
    platformEnrollment: {platformId: 'msi-c1vfkg', ekSpkiSha256: ek},
    akEnrollment: {platformId: 'msi-c1vfkg', ekSpkiSha256: ek, akObjectName: '000b' + '11'.repeat(32), akQualifiedName: '000b' + '22'.repeat(32), akSpkiSha256: '33'.repeat(32), activationChallengeSha256: challenge, expectedRecoveredSecretSha256: secret},
    activationEvidence: {collectorId: 'lab-collector-1', challengeSha256: challenge, akObjectName: '000b' + '11'.repeat(32), ekSpkiSha256: ek, recoveredSecretSha256: secret, externalActivationExecuted: true},
    trustedCollectorIds: ['lab-collector-1']
  };
  return {directory, base};
}

describe('Sheikha EK/AK residency evidence V1', () => {
  test('accepts a complete ephemeral lab profile while preserving production boundaries', () => {
    const {directory, base} = fixture();
    try {
      const result = verifyEkAkResidencyEvidence(base);
      expect(result.verdict).toBe('TPM_RESIDENCY_EVIDENCE_ACCEPTED');
      expect(result.accepted).toBe(true);
      expect(result.boundaries.ekTrustAloneProvesAkResidency).toBe(false);
      expect(result.boundaries.firmwareMutationPerformed).toBe(false);
    } finally { fs.rmSync(directory, {recursive: true, force: true}); }
  });

  test.each([
    ['untrusted collector', (base) => ({...base, trustedCollectorIds: []}), 'collectorTrusted'],
    ['wrong challenge', (base) => ({...base, activationEvidence: {...base.activationEvidence, challengeSha256: '00'.repeat(32)}}), 'challengeBound'],
    ['wrong AK name', (base) => ({...base, activationEvidence: {...base.activationEvidence, akObjectName: 'bad'}}), 'akNameBound'],
    ['missing external activation', (base) => ({...base, activationEvidence: {...base.activationEvidence, externalActivationExecuted: false}}), 'externalActivationDeclaredExecuted']
  ])('denies %s', (_name, mutate, blocker) => {
    const {directory, base} = fixture();
    try { expect(verifyEkAkResidencyEvidence(mutate(base)).blockers).toContain(blocker); }
    finally { fs.rmSync(directory, {recursive: true, force: true}); }
  });

  test('keeps missing activation evidence indeterminate', () => {
    const result = verifyEkAkResidencyEvidence({});
    expect(result.verdict).toBe('INDETERMINATE');
    expect(result.realTpmCommandExecutionProven).toBe(false);
  });
});
