'use strict';

const crypto = require('node:crypto');
const {
  AUDIENCES, MasterAuditLog, NonceStore, PublicKeyRegistry, RevocationRegistry,
  decide, enforceCapabilityToken, issueCapabilityToken
} = require('../core/governance/sheikha-governance-control-plane-v1');

describe('Sheikha Governance Control Plane V1', () => {
  const fixedMs = Date.parse('2026-09-01T00:00:00Z');
  const clock = () => fixedMs;
  let privateKey;
  let publicKey;
  let keys;
  let revocations;
  let nonces;
  let decision;
  let lease;

  beforeEach(() => {
    ({privateKey, publicKey} = crypto.generateKeyPairSync('ed25519'));
    keys = new PublicKeyRegistry();
    keys.register({keyId: 'dev-ephemeral-1', publicKey});
    revocations = new RevocationRegistry();
    nonces = new NonceStore();
    decision = decide({
      decisionId: 'decision-1', requestId: 'request-1', capability: 'firmware.inspect',
      resources: ['board/msi-c1vfkg'], riskClass: 'READ_ONLY', sourceClass: 'DIRECT_TECHNICAL_EVIDENCE',
      derivationStatus: 'DIRECTLY_VERIFIED', evidenceProvenance: 'sha256:evidence'
    });
    lease = {executionLeaseId: 'lease-1', governanceDecisionId: 'decision-1', requestId: 'request-1', evidenceDigest: 'sha256:evidence'};
  });

  function token(overrides = {}) {
    return issueCapabilityToken({decision, lease, privateKey, keyId: 'dev-ephemeral-1', issuer: 'SHEIKHA_TEST_PDP', subject: 'tester', audience: 'FIRMWARE', ttlSeconds: 60, clock, ...overrides});
  }

  function expected(overrides = {}) {
    return {audience: 'FIRMWARE', capability: 'firmware.inspect', governanceDecisionId: 'decision-1', executionLeaseId: 'lease-1', requestId: 'request-1', resources: ['board/msi-c1vfkg'], ...overrides};
  }

  test('separates PDP review and deny outcomes from execution', () => {
    expect(AUDIENCES).toHaveLength(10);
    expect(decide({...decision, decisionId: 'd2', requestId: 'r2', capability: 'x', resources: [], riskClass: 'LOW', sourceClass: 'ISLAMIC_REFERENCE', derivationStatus: 'DISPUTED_REQUIRES_QUALIFIED_REVIEW', evidenceProvenance: 'citation'}).decision).toBe('HOLD_FOR_QUALIFIED_HUMAN_REVIEW');
    expect(decide({...decision, decisionId: 'd3', requestId: 'r3', capability: 'x', resources: [], riskClass: 'LOW', sourceClass: 'ENGINEERING_POLICY', derivationStatus: 'UNVERIFIED', evidenceProvenance: 'x'}).decision).toBe('DENY');
  });

  test('accepts one correctly bound Ed25519 token and rejects replay', () => {
    const signed = token();
    expect(enforceCapabilityToken({token: signed, expected: expected(), keyRegistry: keys, revocations, nonceStore: nonces, clock}).allowed).toBe(true);
    expect(enforceCapabilityToken({token: signed, expected: expected(), keyRegistry: keys, revocations, nonceStore: nonces, clock})).toMatchObject({allowed: false, reason: 'NONCE_REPLAYED'});
  });

  test.each([
    ['wrong audience', {audience: 'AI'}, 'WRONG_AUDIENCE'],
    ['scope escape', {resources: ['board/other']}, 'RESOURCE_SCOPE_ESCAPE'],
    ['read-only mutation', {mutationRequested: true}, 'MUTATION_NOT_ALLOWED'],
    ['invalid decision binding', {governanceDecisionId: 'other'}, 'DECISION_LEASE_REQUEST_BINDING_INVALID']
  ])('rejects %s', (_name, changes, reason) => {
    expect(enforceCapabilityToken({token: token(), expected: expected(changes), keyRegistry: keys, revocations, nonceStore: nonces, clock})).toMatchObject({allowed: false, reason});
  });

  test('rejects expiration, revocation, and signature tampering', () => {
    const expired = token({ttlSeconds: 1});
    expect(enforceCapabilityToken({token: expired, expected: expected(), keyRegistry: keys, revocations, nonceStore: nonces, clock: () => fixedMs + 2000}).reason).toBe('TOKEN_TIME_INVALID');
    revocations.revoke('EXECUTION_LEASE', 'lease-1');
    expect(enforceCapabilityToken({token: token(), expected: expected(), keyRegistry: keys, revocations, nonceStore: new NonceStore(), clock}).reason).toBe('EXECUTION_LEASE_REVOKED');
    const tampered = token();
    tampered.signature = `${tampered.signature.slice(0, -2)}aa`;
    expect(enforceCapabilityToken({token: tampered, expected: expected(), keyRegistry: keys, revocations: new RevocationRegistry(), nonceStore: new NonceStore(), clock}).reason).toBe('INVALID_SIGNATURE');
  });

  test('maintains a verifiable append-only audit hash chain', () => {
    const audit = new MasterAuditLog(clock);
    audit.append('DECISION', {decisionId: 'decision-1'});
    audit.append('TOKEN_ISSUED', {leaseId: 'lease-1'});
    audit.append('NONCE_CONSUMED', {result: 'ALLOW'});
    expect(audit.verify()).toBe(true);
    audit.events[1] = {...audit.events[1], data: {leaseId: 'tampered'}};
    expect(audit.verify()).toBe(false);
  });
});
