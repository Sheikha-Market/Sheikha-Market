'use strict';

const crypto = require('crypto');
const store = require('../../saas/enterprise-v2/store');
const { normalizeRole, requireAccess } = require('../../saas/enterprise-v2/rbac');

const ALLOWED_SCOPES = Object.freeze([
  'tenant:read', 'usage:record', 'usage:read', 'subscription:read', 'audit:read',
  'runtime:read', 'runtime:execute', 'runtime:schedule', 'runtime:audit',
  'civilization:read', 'civilization:write', 'civilization:execute', 'civilization:audit'
]);
const ASSIGNABLE_ROLES = Object.freeze(['ADMIN', 'OPERATOR', 'AUDITOR', 'VIEWER']);

function digest(secret) {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

function publicKey(record) {
  const { secretHash, ...safe } = record;
  return safe;
}

function status() {
  const keys = store.readState().apiKeys;
  return {
    system: 'SHEIKHA_API_KEY_MANAGER_V2',
    status: 'ACTIVE',
    supportedActions: ['issue', 'authenticate', 'rotate', 'revoke', 'audit'],
    counts: {
      total: keys.length,
      active: keys.filter(item => item.status === 'ACTIVE').length,
      revoked: keys.filter(item => item.status === 'REVOKED').length
    },
    rules: {
      neverExposeSecrets: true,
      neverExposeStoredSecrets: true,
      secretReturnedOnce: true,
      hashBeforeStore: true,
      scopedKeysOnly: true,
      auditEveryAction: true,
      humanApprovalForProductionKeys: true
    }
  };
}

function validateScopes(scopes) {
  const normalized = [...new Set((Array.isArray(scopes) ? scopes : []).map(String))];
  if (normalized.length === 0 || normalized.some(scope => !ALLOWED_SCOPES.includes(scope))) {
    const error = new Error('At least one supported API key scope is required.');
    error.code = 'INVALID_API_KEY_SCOPES';
    error.statusCode = 400;
    throw error;
  }
  return normalized;
}

function buildKey(input, actor, rotatedFrom = null) {
  const secret = `skh_v2_${crypto.randomBytes(32).toString('base64url')}`;
  const role = normalizeRole(input.role || 'OPERATOR');
  if (!ASSIGNABLE_ROLES.includes(role)) {
    const error = new Error('API keys cannot be assigned the requested role.');
    error.code = 'INVALID_API_KEY_ROLE';
    error.statusCode = 400;
    throw error;
  }
  const now = new Date().toISOString();
  const record = {
    id: `key_${crypto.randomUUID()}`,
    tenantId: actor.tenantId,
    name: String(input.name || 'Sheikha API Key').trim(),
    purpose: String(input.purpose || '').trim(),
    role,
    scopes: validateScopes(input.scopes),
    prefix: secret.slice(0, 14),
    lastFour: secret.slice(-4),
    secretHash: digest(secret),
    status: 'ACTIVE',
    environment: input.environment === 'production' ? 'production' : 'development',
    createdAt: now,
    createdBy: actor.actorId,
    rotatedFrom,
    revokedAt: null,
    revokedBy: null
  };
  if (!record.purpose) {
    const error = new Error('API key purpose is required.');
    error.code = 'API_KEY_PURPOSE_REQUIRED';
    error.statusCode = 400;
    throw error;
  }
  return { record, secret };
}

function issue(input = {}, context = {}) {
  const actor = requireAccess(context, 'apikey:manage', context.tenantId, {
    tenantRequired: true,
    humanApprovalRequired: true
  });
  const generated = buildKey(input, actor);
  const saved = store.transact({
    action: 'API_KEY_ISSUED', actorId: actor.actorId, role: actor.role, tenantId: actor.tenantId,
    metadata: { keyId: generated.record.id, scopes: generated.record.scopes, environment: generated.record.environment }
  }, state => {
    state.apiKeys.push(generated.record);
    return publicKey(generated.record);
  });
  return { key: saved, secret: generated.secret, secretShownOnce: true };
}

function registry(context = {}) {
  const actor = requireAccess(context, 'tenant:read', context.tenantId, { tenantRequired: true });
  return {
    registry: 'SHEIKHA_API_KEY_REGISTRY_V2',
    status: 'ACTIVE',
    keys: store.readState().apiKeys
      .filter(item => item.tenantId === actor.tenantId)
      .map(publicKey)
  };
}

function rotate(keyId, input = {}, context = {}) {
  const actor = requireAccess(context, 'apikey:manage', context.tenantId, {
    tenantRequired: true,
    humanApprovalRequired: true
  });
  let generated;
  const result = store.transact({
    action: 'API_KEY_ROTATED', actorId: actor.actorId, role: actor.role, tenantId: actor.tenantId,
    resourceId: keyId
  }, state => {
    const existing = state.apiKeys.find(item => item.id === keyId && item.tenantId === actor.tenantId);
    if (!existing || existing.status !== 'ACTIVE') {
      const error = new Error('Active API key not found in tenant.');
      error.code = 'API_KEY_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    generated = buildKey({
      name: input.name || existing.name,
      purpose: input.purpose || existing.purpose,
      role: input.role || existing.role,
      scopes: input.scopes || existing.scopes,
      environment: input.environment || existing.environment
    }, actor, existing.id);
    existing.status = 'ROTATED';
    existing.revokedAt = new Date().toISOString();
    existing.revokedBy = actor.actorId;
    existing.rotatedTo = generated.record.id;
    state.apiKeys.push(generated.record);
    return publicKey(generated.record);
  });
  return { key: result, secret: generated.secret, secretShownOnce: true };
}

function revoke(keyId, context = {}) {
  const actor = requireAccess(context, 'apikey:manage', context.tenantId, {
    tenantRequired: true,
    humanApprovalRequired: true
  });
  return store.transact({
    action: 'API_KEY_REVOKED', actorId: actor.actorId, role: actor.role, tenantId: actor.tenantId,
    resourceId: keyId
  }, state => {
    const existing = state.apiKeys.find(item => item.id === keyId && item.tenantId === actor.tenantId);
    if (!existing || existing.status !== 'ACTIVE') {
      const error = new Error('Active API key not found in tenant.');
      error.code = 'API_KEY_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    existing.status = 'REVOKED';
    existing.revokedAt = new Date().toISOString();
    existing.revokedBy = actor.actorId;
    return publicKey(existing);
  });
}

function authenticate(secret, requiredScope = null) {
  const value = String(secret || '').trim();
  if (!value.startsWith('skh_v2_')) return null;
  const record = store.readState().apiKeys.find(item =>
    item.status === 'ACTIVE' && crypto.timingSafeEqual(
      Buffer.from(item.secretHash, 'hex'),
      Buffer.from(digest(value), 'hex')
    )
  );
  if (!record || (requiredScope && !record.scopes.includes(requiredScope))) return null;
  return {
    actorId: record.id,
    role: record.role,
    tenantId: record.tenantId,
    trusted: true,
    humanApproved: false,
    source: 'scoped-api-key',
    scopes: record.scopes
  };
}

module.exports = {
  ALLOWED_SCOPES,
  authenticate,
  digest,
  issue,
  registry,
  revoke,
  rotate,
  status
};
