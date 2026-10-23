'use strict';

const {AUDIENCES, decide, enforceCapabilityToken, issueCapabilityToken} = require('./sheikha-governance-control-plane-v1');

const DEFAULT_MODES = Object.freeze(Object.fromEntries(AUDIENCES.map((domain) => [
  domain,
  domain === 'AI' ? 'ANALYSIS_ONLY' : ['FIRMWARE', 'BMC', 'BARE_METAL'].includes(domain) ? 'READ_ONLY' : 'BOUNDED'
])));

class DomainGovernanceAdapter {
  #executor;
  constructor({domain, executor, postVerify}) {
    if (!AUDIENCES.includes(domain)) throw new Error('UNREGISTERED_DOMAIN');
    if (typeof executor !== 'function' || typeof postVerify !== 'function') throw new Error('EXECUTOR_AND_POST_VERIFY_REQUIRED');
    this.domain = domain;
    this.defaultMode = DEFAULT_MODES[domain];
    this.#executor = executor;
    this.postVerify = postVerify;
  }

  async route(request, context) {
    if (request.directExecutor === true) return {status: 'DENY', reason: 'DIRECT_REQUEST_TO_EXECUTOR_FORBIDDEN'};
    if (this.domain === 'AI' && request.mutationRequested === true) return {status: 'DENY', reason: 'AI_DIRECT_WRITE_FORBIDDEN'};
    if (['FIRMWARE', 'BMC', 'BARE_METAL'].includes(this.domain) && request.mutationRequested === true && !request.recoveryPlan) {
      return {status: 'DENY', reason: 'LOW_LEVEL_MUTATION_REQUIRES_RECOVERY'};
    }
    const decision = decide({...request, riskClass: request.riskClass || (request.mutationRequested ? 'HIGH' : 'READ_ONLY')});
    context.audit.append('PDP_DECISION', {domain: this.domain, decision: decision.decision, decisionId: request.decisionId});
    if (!decision.decision.startsWith('ALLOW_')) return {status: decision.decision, reason: decision.reason};
    const lease = {
      executionLeaseId: request.executionLeaseId,
      governanceDecisionId: request.decisionId,
      requestId: request.requestId,
      evidenceDigest: request.evidenceProvenance
    };
    const token = issueCapabilityToken({
      decision, lease, privateKey: context.privateKey, keyId: context.keyId,
      issuer: context.issuer, subject: context.subject, audience: this.domain, clock: context.clock
    });
    const enforcement = enforceCapabilityToken({
      token,
      expected: {
        audience: this.domain, capability: request.capability, governanceDecisionId: request.decisionId,
        executionLeaseId: request.executionLeaseId, requestId: request.requestId,
        resources: request.resources, mutationRequested: request.mutationRequested, networkRequested: request.networkRequested
      },
      keyRegistry: context.keyRegistry, revocations: context.revocations, nonceStore: context.nonceStore, clock: context.clock
    });
    context.audit.append(enforcement.allowed ? 'PEP_AUTHORIZATION_ALLOWED' : 'PEP_AUTHORIZATION_DENIED', {domain: this.domain, reason: enforcement.reason});
    if (!enforcement.allowed) return {status: 'DENY', reason: enforcement.reason};
    const output = await this.#executor(request, enforcement.payload);
    const verification = await this.postVerify({request, output});
    context.audit.append(verification.verified ? 'POST_EXECUTION_VERIFIED' : 'POST_EXECUTION_REJECTED', {domain: this.domain, verified: verification.verified});
    return verification.verified
      ? {status: 'COMPLETED_VERIFIED', output, evidence: verification.evidence}
      : {status: 'DENY', reason: 'POST_EXECUTION_VERIFICATION_FAILED'};
  }
}

function createDomainAdapters(factory) {
  return Object.fromEntries(AUDIENCES.map((domain) => [domain, factory(domain, DEFAULT_MODES[domain])]));
}

module.exports = {DEFAULT_MODES, DomainGovernanceAdapter, createDomainAdapters};
