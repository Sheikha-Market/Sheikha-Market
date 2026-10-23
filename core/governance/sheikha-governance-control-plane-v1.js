'use strict';

const crypto = require('node:crypto');

const AUDIENCES = Object.freeze([
  'FIRMWARE', 'BMC', 'BARE_METAL', 'OS', 'RUNTIME',
  'AI', 'DATA', 'SECURITY', 'ENTERPRISE', 'PRODUCTS'
]);

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    const keys = Object.keys(value)
      .sort((left, right) => left.localeCompare(right));
    const entries = keys.map((key) =>
      `${JSON.stringify(key)}:${canonical(value[key])}`
    );
    return `{${entries.join(',')}}`;
  }
  return JSON.stringify(value);
}

function encode(value) { return Buffer.from(canonical(value)).toString('base64url'); }
function nowSeconds(clock) { return Math.floor(clock() / 1000); }

class PublicKeyRegistry {
  constructor() { this.keys = new Map(); }
  register({keyId, publicKey, status = 'ACTIVE'}) {
    if (!keyId || !publicKey) throw new Error('KEY_ID_AND_PUBLIC_KEY_REQUIRED');
    if (!['ACTIVE', 'RETIRED', 'REVOKED'].includes(status)) throw new Error('INVALID_KEY_STATUS');
    this.keys.set(keyId, {keyId, publicKey, status});
  }
  get(keyId) { return this.keys.get(keyId) || null; }
}

class RevocationRegistry {
  constructor() { this.entries = new Set(); }
  revoke(type, id) { this.entries.add(`${type}:${id}`); }
  isRevoked(type, id) { return this.entries.has(`${type}:${id}`); }
}

class NonceStore {
  constructor() { this.consumed = new Set(); }
  consume(nonce) {
    if (!nonce || this.consumed.has(nonce)) return false;
    this.consumed.add(nonce);
    return true;
  }
}

class MasterAuditLog {
  constructor(clock = Date.now) { this.clock = clock; this.events = []; }
  append(type, data) {
    const event = {
      sequence: this.events.length + 1,
      timestamp: new Date(this.clock()).toISOString(),
      type,
      data,
      previousHash: this.events.at(-1)?.eventHash || 'GENESIS'
    };
    event.eventHash = crypto.createHash('sha256').update(canonical(event)).digest('hex');
    this.events.push(Object.freeze(event));
    return event;
  }
  verify() {
    return this.events.every((event, index) => {
      const copy = {...event};
      delete copy.eventHash;
      const expectedPrevious = index === 0 ? 'GENESIS' : this.events[index - 1].eventHash;
      const expectedHash = crypto.createHash('sha256').update(canonical(copy)).digest('hex');
      return event.previousHash === expectedPrevious && event.eventHash === expectedHash;
    });
  }
}

function decide(input) {
  const required = ['decisionId', 'requestId', 'capability', 'resources', 'riskClass', 'sourceClass', 'derivationStatus', 'evidenceProvenance'];
  const missing = required.filter((field) => input[field] === undefined || input[field] === null);
  if (missing.length) return {decision: 'DENY', reason: 'MISSING_DECISION_INPUT', missing};
  if (input.derivationStatus === 'UNVERIFIED' || !input.evidenceProvenance) return {decision: 'DENY', reason: 'UNVERIFIED_OR_MISSING_PROVENANCE'};
  if (input.derivationStatus === 'DISPUTED_REQUIRES_QUALIFIED_REVIEW' && input.qualifiedReview !== true) {
    return {decision: 'HOLD_FOR_QUALIFIED_HUMAN_REVIEW', reason: 'DISPUTED_MATTER'};
  }
  if (['HIGH', 'CRITICAL'].includes(input.riskClass) && input.humanApproval !== true) {
    return {decision: 'HOLD_FOR_HUMAN_REVIEW', reason: 'HIGH_IMPACT_APPROVAL_REQUIRED'};
  }
  const mutationAllowed = input.mutationRequested === true && input.humanApproval === true && Boolean(input.recoveryPlan);
  if (input.mutationRequested === true && !mutationAllowed) return {decision: 'DENY', reason: 'MUTATION_REQUIRES_APPROVAL_AND_RECOVERY'};
  return {
    decision: mutationAllowed ? 'ALLOW_BOUNDED_MUTATION' : 'ALLOW_READ_ONLY',
    decisionId: input.decisionId,
    requestId: input.requestId,
    capability: input.capability,
    resources: [...input.resources],
    mutationAllowed,
    networkAllowed: input.networkRequested === true && input.networkApproved === true
  };
}

function issueCapabilityToken({decision, lease, privateKey, keyId, issuer, subject, audience, ttlSeconds = 60, clock = Date.now}) {
  if (!privateKey) throw new Error('PRIVATE_KEY_MUST_BE_INJECTED');
  if (!AUDIENCES.includes(audience)) throw new Error('UNREGISTERED_AUDIENCE');
  if (!['ALLOW_READ_ONLY', 'ALLOW_BOUNDED_MUTATION'].includes(decision.decision)) throw new Error('ALLOW_DECISION_REQUIRED');
  if (!lease?.executionLeaseId || lease.governanceDecisionId !== decision.decisionId || lease.requestId !== decision.requestId) {
    throw new Error('INVALID_EXECUTION_LEASE_BINDING');
  }
  const issuedAt = nowSeconds(clock);
  const payload = {
    governanceDecisionId: decision.decisionId,
    executionLeaseId: lease.executionLeaseId,
    requestId: decision.requestId,
    issuer,
    audience,
    subject,
    capability: decision.capability,
    resources: [...decision.resources],
    mode: decision.decision,
    networkAllowed: decision.networkAllowed,
    mutationAllowed: decision.mutationAllowed,
    issuedAt,
    notBefore: issuedAt,
    expiresAt: issuedAt + ttlSeconds,
    nonce: crypto.randomBytes(24).toString('base64url'),
    singleUse: true,
    evidenceDigest: lease.evidenceDigest,
    keyId
  };
  const protectedHeader = {alg: 'EdDSA', typ: 'SHEIKHA-CAPABILITY+JWT', kid: keyId};
  const protectedPart = encode(protectedHeader);
  const payloadPart = encode(payload);
  const signingInput = `${protectedPart}.${payloadPart}`;
  const signature = crypto.sign(null, Buffer.from(signingInput), privateKey).toString('base64url');
  return {protected: protectedPart, payload: payloadPart, signature};
}

function parsePart(part) { return JSON.parse(Buffer.from(part, 'base64url').toString('utf8')); }
function scopeContains(granted, requested) {
  return requested.every((resource) => granted.some((scope) => resource === scope || resource.startsWith(`${scope}/`)));
}

function headerFailureReason(header, payload) {
  if (
    header.alg !== 'EdDSA' ||
    header.typ !== 'SHEIKHA-CAPABILITY+JWT' ||
    header.kid !== payload.keyId
  ) return 'INVALID_HEADER_BINDING';
  return null;
}

function signatureFailureReason({token, payload, keyRegistry, revocations}) {
  const key = keyRegistry.get(payload.keyId);
  if (key?.status !== 'ACTIVE' || revocations.isRevoked('KEY', payload.keyId)) {
    return 'KEY_NOT_ACTIVE';
  }
  const signingInput = Buffer.from(`${token.protected}.${token.payload}`);
  const signature = Buffer.from(token.signature, 'base64url');
  if (!crypto.verify(null, signingInput, key.publicKey, signature)) {
    return 'INVALID_SIGNATURE';
  }
  return null;
}

function claimsFailureReason({payload, expected, clock}) {
  const now = nowSeconds(clock);
  if (now < payload.notBefore || now >= payload.expiresAt) return 'TOKEN_TIME_INVALID';
  if (payload.audience !== expected.audience) return 'WRONG_AUDIENCE';
  if (payload.capability !== expected.capability) return 'CAPABILITY_MISMATCH';
  if (
    payload.governanceDecisionId !== expected.governanceDecisionId ||
    payload.executionLeaseId !== expected.executionLeaseId ||
    payload.requestId !== expected.requestId
  ) return 'DECISION_LEASE_REQUEST_BINDING_INVALID';
  if (!scopeContains(payload.resources, expected.resources || [])) {
    return 'RESOURCE_SCOPE_ESCAPE';
  }
  if (expected.mutationRequested && !payload.mutationAllowed) {
    return 'MUTATION_NOT_ALLOWED';
  }
  if (expected.networkRequested && !payload.networkAllowed) {
    return 'NETWORK_NOT_ALLOWED';
  }
  return null;
}

function revocationFailureReason(payload, revocations) {
  const revokedBinding = [
    ['TOKEN', payload.nonce],
    ['GOVERNANCE_DECISION', payload.governanceDecisionId],
    ['EXECUTION_LEASE', payload.executionLeaseId]
  ].find(([type, id]) => revocations.isRevoked(type, id));
  return revokedBinding ? `${revokedBinding[0]}_REVOKED` : null;
}

function capabilityTokenFailureReason({
  token,
  header,
  payload,
  expected,
  keyRegistry,
  revocations,
  clock
}) {
  return headerFailureReason(header, payload) ||
    signatureFailureReason({token, payload, keyRegistry, revocations}) ||
    claimsFailureReason({payload, expected, clock}) ||
    revocationFailureReason(payload, revocations);
}

function enforceCapabilityToken({token, expected, keyRegistry, revocations, nonceStore, clock = Date.now}) {
  try {
    const header = parsePart(token.protected);
    const payload = parsePart(token.payload);
    const failureReason = capabilityTokenFailureReason({
      token,
      header,
      payload,
      expected,
      keyRegistry,
      revocations,
      clock
    });
    if (failureReason) {
      return {allowed: false, reason: failureReason};
    }
    if (payload.singleUse !== true || !nonceStore.consume(payload.nonce)) {
      return {allowed: false, reason: 'NONCE_REPLAYED'};
    }
    return {allowed: true, reason: 'ALLOW_BOUNDED_EXECUTION', payload};
  } catch {
    return {allowed: false, reason: 'MALFORMED_TOKEN'};
  }
}

module.exports = {
  AUDIENCES,
  MasterAuditLog,
  NonceStore,
  PublicKeyRegistry,
  RevocationRegistry,
  canonical,
  decide,
  enforceCapabilityToken,
  issueCapabilityToken
};
