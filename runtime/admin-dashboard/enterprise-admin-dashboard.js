'use strict';

function status() {
  return {
    system: 'SHEIKHA_ENTERPRISE_ADMIN_DASHBOARD_V1',
    status: 'ACTIVE',
    above: 'SHEIKHA_GLOBAL_CONTROL_PLANE_V1',
    panels: [
      'organizations',
      'workspaces',
      'subscriptions',
      'api-keys',
      'usage-metering',
      'governance-audits',
      'deployments',
      'control-plane-status',
      'cloud-saas-apex',
      'agent-fabric'
    ],
    boundaries: {
      readOnlyByDefault: true,
      writesRequireHumanApproval: true,
      noSecretExposure: true,
      auditDashboardActions: true
    }
  };
}

function panels() {
  return {
    registry: 'SHEIKHA_ADMIN_DASHBOARD_PANEL_REGISTRY_V1',
    status: 'ACTIVE',
    panels: status().panels
  };
}

module.exports = {
  status,
  panels
};
