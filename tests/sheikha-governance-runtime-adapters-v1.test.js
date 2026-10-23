'use strict';

const crypto = require('node:crypto');
const {MasterAuditLog, NonceStore, PublicKeyRegistry, RevocationRegistry} = require('../core/governance/sheikha-governance-control-plane-v1');
const {DEFAULT_MODES, DomainGovernanceAdapter, createDomainAdapters} = require('../core/governance/sheikha-runtime-governance-adapters-v1');

function context() {
  const {privateKey, publicKey} = crypto.generateKeyPairSync('ed25519');
  const keyRegistry = new PublicKeyRegistry();
  keyRegistry.register({keyId: 'ephemeral-adapter', publicKey});
  return {privateKey, keyId: 'ephemeral-adapter', issuer: 'TEST_PDP', subject: 'adapter-test', keyRegistry, revocations: new RevocationRegistry(), nonceStore: new NonceStore(), audit: new MasterAuditLog(() => Date.parse('2026-09-01T00:00:00Z')), clock: () => Date.parse('2026-09-01T00:00:00Z')};
}

function request(overrides = {}) {
  return {decisionId: 'd1', executionLeaseId: 'l1', requestId: 'r1', capability: 'firmware.inspect', resources: ['board/msi'], sourceClass: 'DIRECT_TECHNICAL_EVIDENCE', derivationStatus: 'DIRECTLY_VERIFIED', evidenceProvenance: 'sha256:evidence', riskClass: 'READ_ONLY', ...overrides};
}

describe('Sheikha governance runtime adapters V1', () => {
  test('registers ten adapters with low-level and AI safe defaults', () => {
    const adapters = createDomainAdapters((domain) => ({domain}));
    expect(Object.keys(adapters)).toHaveLength(10);
    expect(DEFAULT_MODES).toMatchObject({FIRMWARE: 'READ_ONLY', BMC: 'READ_ONLY', BARE_METAL: 'READ_ONLY', AI: 'ANALYSIS_ONLY'});
  });

  test('routes a read-only firmware request through PDP, PEP, execution and verification', async () => {
    const adapter = new DomainGovernanceAdapter({domain: 'FIRMWARE', executor: async () => ({inspected: true}), postVerify: async () => ({verified: true, evidence: 'sha256:result'})});
    const ctx = context();
    await expect(adapter.route(request(), ctx)).resolves.toMatchObject({status: 'COMPLETED_VERIFIED', output: {inspected: true}});
    expect(ctx.audit.verify()).toBe(true);
    expect(ctx.audit.events.map((event) => event.type)).toEqual(['PDP_DECISION', 'PEP_AUTHORIZATION_ALLOWED', 'POST_EXECUTION_VERIFIED']);
  });

  test('denies direct bypass, AI writes, and low-level mutation without recovery', async () => {
    const make = (domain) => new DomainGovernanceAdapter({domain, executor: async () => ({}), postVerify: async () => ({verified: true})});
    await expect(make('RUNTIME').route(request({directExecutor: true}), context())).resolves.toMatchObject({status: 'DENY', reason: 'DIRECT_REQUEST_TO_EXECUTOR_FORBIDDEN'});
    await expect(make('AI').route(request({mutationRequested: true}), context())).resolves.toMatchObject({status: 'DENY', reason: 'AI_DIRECT_WRITE_FORBIDDEN'});
    await expect(make('FIRMWARE').route(request({mutationRequested: true}), context())).resolves.toMatchObject({status: 'DENY', reason: 'LOW_LEVEL_MUTATION_REQUIRES_RECOVERY'});
  });

  test('denies when post-execution verification fails', async () => {
    const adapter = new DomainGovernanceAdapter({domain: 'RUNTIME', executor: async () => ({changed: true}), postVerify: async () => ({verified: false})});
    await expect(adapter.route(request({capability: 'runtime.inspect'}), context())).resolves.toMatchObject({status: 'DENY', reason: 'POST_EXECUTION_VERIFICATION_FAILED'});
  });
});
