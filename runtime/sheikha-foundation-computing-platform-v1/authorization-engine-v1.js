'use strict';

function nonBlank(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeScope(scope = []) {
  if (!Array.isArray(scope)) throw new TypeError('AUTHORIZATION_SCOPE_ARRAY_REQUIRED');
  const normalized = [];
  for (const item of scope) {
    if (!nonBlank(item)) throw new TypeError('AUTHORIZATION_SCOPE_ENTRY_INVALID');
    normalized.push(item.trim());
  }
  return Object.freeze([...new Set(normalized)].sort());
}

function sameScope(left, right) {
  const a = normalizeScope(left);
  const b = normalizeScope(right);
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function authorize({
  authorizationId,
  action,
  objectId,
  scope = [],
  singleUse = false,
  expiresAt = null,
  approvedBy = null
} = {}) {
  const required = { authorizationId, action, objectId, approvedBy };
  for (const [name, value] of Object.entries(required)) {
    if (!nonBlank(value)) throw new Error(name.toUpperCase() + '_REQUIRED');
  }

  if (expiresAt != null && !Number.isFinite(Date.parse(expiresAt))) {
    throw new Error('INVALID_AUTHORIZATION_EXPIRY');
  }

  return Object.freeze({
    authorizationId: authorizationId.trim(),
    action: action.trim(),
    objectId: objectId.trim(),
    scope: normalizeScope(scope),
    singleUse: Boolean(singleUse),
    expiresAt,
    approvedBy: approvedBy.trim(),
    issuedAt: new Date().toISOString()
  });
}

function canUse(auth, {
  objectId,
  action,
  scope = [],
  now = Date.now()
} = {}) {
  if (!auth) return false;
  if (!nonBlank(objectId) || !nonBlank(action)) return false;
  if (auth.objectId !== objectId.trim()) return false;
  if (auth.action !== action.trim()) return false;

  try {
    if (!sameScope(auth.scope || [], scope)) return false;
  } catch {
    return false;
  }

  if (auth.expiresAt != null) {
    const expiry = Date.parse(auth.expiresAt);
    if (!Number.isFinite(expiry)) return false;
    if (now >= expiry) return false;
  }

  return true;
}

async function verifyAndConsume({
  authorization,
  expectedObjectId,
  expectedAction,
  expectedScope = [],
  claimStore = null,
  evidenceRef = null,
  now = Date.now()
} = {}) {
  if (!canUse(authorization, {
    objectId: expectedObjectId,
    action: expectedAction,
    scope: expectedScope,
    now
  })) {
    return Object.freeze({
      ok: false,
      consumed: false,
      reason: 'AUTHORIZATION_BINDING_OR_EXPIRY_INVALID'
    });
  }

  if (authorization.singleUse !== true) {
    return Object.freeze({
      ok: true,
      consumed: false,
      reason: 'REUSABLE_AUTHORIZATION_VALID'
    });
  }

  if (!claimStore || typeof claimStore.verifyAndConsume !== 'function') {
    return Object.freeze({
      ok: false,
      consumed: false,
      reason: 'PERSISTENT_CLAIM_STORE_REQUIRED'
    });
  }

  try {
    const result = await claimStore.verifyAndConsume({
      authorizationId: authorization.authorizationId,
      expectedObjectId,
      expectedAction,
      expectedScope: normalizeScope(expectedScope),
      evidenceRef,
      now
    });
    if (!result || result.ok !== true || result.consumed !== true) {
      return Object.freeze({
        ok: false,
        consumed: false,
        reason: (result && result.reason) || 'SINGLE_USE_CONSUMPTION_DENIED'
      });
    }
    return Object.freeze({
      ok: true,
      consumed: true,
      reason: 'SINGLE_USE_AUTHORIZATION_CONSUMED'
    });
  } catch {
    return Object.freeze({
      ok: false,
      consumed: false,
      reason: 'CLAIM_STORE_UNAVAILABLE_OR_FAILED'
    });
  }
}

module.exports = {
  nonBlank,
  normalizeScope,
  sameScope,
  authorize,
  canUse,
  verifyAndConsume
};
