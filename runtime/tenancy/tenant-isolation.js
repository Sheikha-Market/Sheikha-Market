'use strict';

const tenantState = Object.freeze({
  system: 'SHEIKHA_TENANT_ISOLATION_V1',
  status: 'ACTIVE',
  isolationModel: ['organization', 'workspace', 'project', 'environment', 'user'],
  boundaries: {
    organizationIsolation: true,
    workspaceIsolation: true,
    projectIsolation: true,
    auditBoundary: true,
    governanceBoundary: true
  }
});

function status() {
  return tenantState;
}

function organizations() {
  return {
    registry: 'SHEIKHA_ORGANIZATION_REGISTRY_V1',
    status: 'ACTIVE',
    organizations: []
  };
}

function workspaces() {
  return {
    registry: 'SHEIKHA_WORKSPACE_REGISTRY_V1',
    status: 'ACTIVE',
    workspaces: []
  };
}

module.exports = {
  status,
  organizations,
  workspaces
};
