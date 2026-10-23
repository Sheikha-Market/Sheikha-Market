'use strict';

const crypto = require('node:crypto');
const {
  MasterAuditLog, NonceStore, PublicKeyRegistry, RevocationRegistry, decide,
  enforceCapabilityToken, issueCapabilityToken
} = require('../core/governance/sheikha-governance-control-plane-v1');
const {evaluateRelease} = require('../core/governance/sheikha-release-production-gate-v1');

test('Reference through PEP and Audit reaches release gate without bypass', () => {
  const clock = () => Date.parse('2026-09-01T00:00:00Z');
  const {privateKey, publicKey} = crypto.generateKeyPairSync('ed25519');
  const keys = new PublicKeyRegistry();
  keys.register({keyId: 'ephemeral-e2e', publicKey});
  const decision = decide({decisionId: 'd-e2e', requestId: 'r-e2e', capability: 'service.release.inspect', resources: ['service/demo'], riskClass: 'READ_ONLY', sourceClass: 'DIRECT_TECHNICAL_EVIDENCE', derivationStatus: 'DIRECTLY_VERIFIED', evidenceProvenance: 'sha256:evidence'});
  const lease = {executionLeaseId: 'l-e2e', governanceDecisionId: 'd-e2e', requestId: 'r-e2e', evidenceDigest: 'sha256:evidence'};
  const token = issueCapabilityToken({decision, lease, privateKey, keyId: 'ephemeral-e2e', issuer: 'E2E_PDP', subject: 'e2e', audience: 'RUNTIME', clock});
  const enforcement = enforceCapabilityToken({token, expected: {audience: 'RUNTIME', capability: 'service.release.inspect', governanceDecisionId: 'd-e2e', executionLeaseId: 'l-e2e', requestId: 'r-e2e', resources: ['service/demo']}, keyRegistry: keys, revocations: new RevocationRegistry(), nonceStore: new NonceStore(), clock});
  const audit = new MasterAuditLog(clock);
  audit.append('PDP_DECISION', {id: decision.decisionId});
  audit.append('PEP_AUTHORIZATION_ALLOWED', {allowed: enforcement.allowed});
  audit.append('POST_EXECUTION_VERIFIED', {verified: true});
  const release = evaluateRelease({
    releaseType: 'SERVICE', aiSelfAuthorized: false, mutableRelease: true,
    governance: {referenceId: 'ref-e2e', policyId: 'policy-e2e', decisionId: decision.decisionId, executionLeaseId: lease.executionLeaseId, capabilityTokenVerified: enforcement.allowed, pepAuthorizationAllowed: enforcement.allowed, postExecutionVerified: true, masterAuditValid: audit.verify()},
    artifact: {sha256: 'b'.repeat(64), signatureVerified: true, sbomDigest: 'sha256:sbom', buildProvenanceDigest: 'sha256:provenance'},
    productionKey: {status: 'APPROVED_PRODUCTION'}, environment: {authorizedId: 'e2e-fixture', targetId: 'e2e-fixture'},
    recovery: {available: true, rollbackAvailable: true}, criticalBlockers: []
  });
  expect(enforcement.allowed).toBe(true);
  expect(audit.verify()).toBe(true);
  expect(release.decision).toBe('RELEASE_ALLOW');
});
