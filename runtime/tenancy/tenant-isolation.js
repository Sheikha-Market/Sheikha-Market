'use strict';

const crypto = require('crypto');
const store = require('../saas/enterprise-v2/store');
const { normalizeRole, requireAccess, roles } = require('../saas/enterprise-v2/rbac');

const tenantState = Object.freeze({
  system: 'SHEIKHA_TENANT_ISOLATION_V2',
  status: 'ACTIVE',
  isolationModel: ['organization', 'workspace', 'project', 'environment', 'user'],
  boundaries: {
    organizationIsolation: true,
    workspaceIsolation: true,
    projectIsolation: true,
    userRoleIsolation: true,
    auditBoundary: true,
    governanceBoundary: true,
    crossTenantAccessDenied: true
  },
  identityBoundary: 'AUTHENTICATED_UPSTREAM_IDENTITY_OR_SCOPED_API_KEY',
  productionIdentityProviderRequired: true
});

function id(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function required(value, field) {
  const normalized = String(value || '').trim();
  if (!normalized) {
    const error = new Error(`${field} is required.`);
    error.code = 'VALIDATION_ERROR';
    error.statusCode = 400;
    throw error;
  }
  return normalized;
}

function status() {
  return { ...tenantState, rbac: roles(), storage: store.status() };
}

function createOrganization(input = {}, context = {}) {
  const actor = requireAccess(context, 'tenant:manage', null, { humanApprovalRequired: true });
  const name = required(input.name, 'name');
  const slug = String(input.slug || name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!slug) {
    const error = new Error('A valid Latin slug is required.');
    error.code = 'VALIDATION_ERROR';
    error.statusCode = 400;
    throw error;
  }

  return store.transact({
    action: 'TENANT_ORGANIZATION_CREATED',
    actorId: actor.actorId,
    role: actor.role,
    metadata: { slug }
  }, state => {
    if (state.organizations.some(item => item.slug === slug)) {
      const error = new Error('Organization slug already exists.');
      error.code = 'ORGANIZATION_EXISTS';
      error.statusCode = 409;
      throw error;
    }
    const now = new Date().toISOString();
    const organization = {
      id: id('org'),
      name,
      slug,
      status: 'ACTIVE_INTERNAL',
      commercialStatus: 'UNCONTRACTED',
      contractVerified: false,
      createdAt: now,
      createdBy: actor.actorId
    };
    state.organizations.push(organization);
    state.users.push({
      id: id('usr'),
      tenantId: organization.id,
      actorId: actor.actorId,
      displayName: input.ownerName || actor.actorId,
      email: input.ownerEmail ? String(input.ownerEmail).trim().toLowerCase() : null,
      role: 'OWNER',
      status: 'ACTIVE',
      createdAt: now,
      createdBy: actor.actorId
    });
    return organization;
  });
}

function createWorkspace(input = {}, context = {}) {
  const actor = requireAccess(context, 'tenant:manage', context.tenantId, {
    tenantRequired: true,
    humanApprovalRequired: true
  });
  const name = required(input.name, 'name');
  return store.transact({
    action: 'TENANT_WORKSPACE_CREATED', actorId: actor.actorId, role: actor.role, tenantId: actor.tenantId
  }, state => {
    if (!state.organizations.some(item => item.id === actor.tenantId)) {
      const error = new Error('Organization not found.');
      error.code = 'ORGANIZATION_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    const workspace = {
      id: id('wsp'), tenantId: actor.tenantId, name, status: 'ACTIVE',
      createdAt: new Date().toISOString(), createdBy: actor.actorId
    };
    state.workspaces.push(workspace);
    return workspace;
  });
}

function createProject(input = {}, context = {}) {
  const actor = requireAccess(context, 'tenant:manage', context.tenantId, {
    tenantRequired: true,
    humanApprovalRequired: true
  });
  const name = required(input.name, 'name');
  const workspaceId = required(input.workspaceId, 'workspaceId');
  return store.transact({
    action: 'TENANT_PROJECT_CREATED', actorId: actor.actorId, role: actor.role, tenantId: actor.tenantId
  }, state => {
    const workspace = state.workspaces.find(item => item.id === workspaceId);
    if (!workspace || workspace.tenantId !== actor.tenantId) {
      const error = new Error('Workspace not found in tenant.');
      error.code = 'WORKSPACE_NOT_FOUND';
      error.statusCode = 404;
      throw error;
    }
    const project = {
      id: id('prj'), tenantId: actor.tenantId, workspaceId, name, status: 'ACTIVE',
      environment: input.environment || 'development',
      createdAt: new Date().toISOString(), createdBy: actor.actorId
    };
    state.projects.push(project);
    return project;
  });
}

function addUser(input = {}, context = {}) {
  const actor = requireAccess(context, 'user:manage', context.tenantId, {
    tenantRequired: true,
    humanApprovalRequired: true
  });
  const actorId = required(input.actorId, 'actorId');
  const role = normalizeRole(input.role || 'VIEWER');
  if (!roles().some(item => item.role === role)) {
    const error = new Error('Unsupported SaaS role.');
    error.code = 'INVALID_ROLE';
    error.statusCode = 400;
    throw error;
  }
  return store.transact({
    action: 'TENANT_USER_ADDED', actorId: actor.actorId, role: actor.role, tenantId: actor.tenantId,
    metadata: { assignedRole: role }
  }, state => {
    if (state.users.some(item => item.tenantId === actor.tenantId && item.actorId === actorId)) {
      const error = new Error('User already belongs to tenant.');
      error.code = 'USER_EXISTS';
      error.statusCode = 409;
      throw error;
    }
    const user = {
      id: id('usr'), tenantId: actor.tenantId, actorId,
      displayName: required(input.displayName || actorId, 'displayName'),
      email: input.email ? String(input.email).trim().toLowerCase() : null,
      role, status: 'ACTIVE', createdAt: new Date().toISOString(), createdBy: actor.actorId
    };
    state.users.push(user);
    return user;
  });
}

function tenantSnapshot(context = {}) {
  const actor = requireAccess(context, 'tenant:read', context.tenantId, { tenantRequired: true });
  const state = store.readState();
  return {
    organization: state.organizations.find(item => item.id === actor.tenantId) || null,
    workspaces: state.workspaces.filter(item => item.tenantId === actor.tenantId),
    projects: state.projects.filter(item => item.tenantId === actor.tenantId),
    users: state.users.filter(item => item.tenantId === actor.tenantId)
  };
}

function organizations(context = {}) {
  if (context.internal === true) return store.readState().organizations;
  const snapshot = tenantSnapshot(context);
  return snapshot.organization ? [snapshot.organization] : [];
}

function workspaces(context = {}) {
  return tenantSnapshot(context).workspaces;
}

module.exports = {
  addUser,
  createOrganization,
  createProject,
  createWorkspace,
  organizations,
  status,
  tenantSnapshot,
  workspaces
};
