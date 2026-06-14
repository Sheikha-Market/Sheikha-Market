'use strict';

class SaaSAccessError extends Error {
  constructor(code, message, statusCode = 403) {
    super(message);
    this.name = 'SaaSAccessError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

const ROLE_ALIASES = Object.freeze({
  TENANT_ADMIN: 'ADMIN',
  EXECUTIVE: 'VIEWER',
  MANAGER: 'OPERATOR',
  SUPERVISOR: 'OPERATOR',
  EMPLOYEE: 'VIEWER'
});

const ROLE_PERMISSIONS = Object.freeze({
  OWNER: ['*'],
  ADMIN: [
    'tenant:read', 'tenant:manage', 'user:manage', 'subscription:manage', 'subscription:read',
    'usage:record', 'usage:read', 'apikey:manage', 'audit:read'
  ],
  OPERATOR: ['tenant:read', 'subscription:read', 'usage:record', 'usage:read'],
  AUDITOR: ['tenant:read', 'subscription:read', 'usage:read', 'audit:read'],
  VIEWER: ['tenant:read', 'subscription:read', 'usage:read']
});

function normalizeRole(role) {
  const normalized = String(role || '').trim().toUpperCase();
  return ROLE_ALIASES[normalized] || normalized;
}

function hasPermission(role, permission) {
  const permissions = ROLE_PERMISSIONS[normalizeRole(role)] || [];
  return permissions.includes('*') || permissions.includes(permission);
}

function requireAccess(context = {}, permission, resourceTenantId = null, options = {}) {
  const normalized = {
    actorId: String(context.actorId || '').trim(),
    role: normalizeRole(context.role),
    tenantId: context.tenantId ? String(context.tenantId) : null,
    trusted: context.trusted === true,
    humanApproved: context.humanApproved === true,
    source: context.source || 'unknown'
  };

  if (!normalized.trusted || !normalized.actorId || !normalized.role) {
    throw new SaaSAccessError('IDENTITY_REQUIRED', 'Trusted actor identity and role are required.', 401);
  }
  if (!hasPermission(normalized.role, permission)) {
    throw new SaaSAccessError('PERMISSION_DENIED', `Role ${normalized.role} cannot perform ${permission}.`);
  }
  if (Array.isArray(context.scopes) && !context.scopes.includes(permission)) {
    throw new SaaSAccessError('API_KEY_SCOPE_DENIED', `API key scope does not allow ${permission}.`);
  }
  if (options.humanApprovalRequired && !normalized.humanApproved) {
    throw new SaaSAccessError('HUMAN_APPROVAL_REQUIRED', 'Explicit human approval is required for this write.', 403);
  }
  if (resourceTenantId && normalized.tenantId !== resourceTenantId) {
    throw new SaaSAccessError('CROSS_TENANT_ACCESS_DENIED', 'Cross-tenant access is not permitted.', 403);
  }
  if (options.tenantRequired && !normalized.tenantId) {
    throw new SaaSAccessError('TENANT_CONTEXT_REQUIRED', 'A tenant context is required.', 400);
  }
  return normalized;
}

function roles() {
  return Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => ({ role, permissions }));
}

module.exports = {
  ROLE_PERMISSIONS,
  SaaSAccessError,
  hasPermission,
  normalizeRole,
  requireAccess,
  roles
};
