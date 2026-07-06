'use strict';

const {
  workspaceModules,
  buildWorkspaceState
} = require('../enterprise-workspace/sheikha-enterprise-workspace-v1');

function buildNavigationTree() {
  return {
    system: 'SHEIKHA_ENTERPRISE_NAVIGATION_V1',
    status: 'ACTIVE',
    direction: 'rtl',
    mode: 'UNIFIED_NAVIGATION_RUNTIME',
    items: workspaceModules.map((module, index) => ({
      order: index + 1,
      id: module.id,
      labelAr: module.labelAr,
      path: module.path,
      mode: module.mode,
      visible: true
    })),
    rules: {
      singleNavigationSource: true,
      unifiedWorkspaceRouting: true,
      humanModeDefault: true,
      developerModeProtected: true,
      noHarm: true
    }
  };
}

function resolveNavigationTarget(moduleId = 'dashboard', user = {}) {
  const item = workspaceModules.find((module) => module.id === moduleId) || workspaceModules[0];
  const requestedMode = item.mode;
  const userRole = user.role || 'trader';

  const allowed =
    requestedMode === 'human' ||
    userRole === 'developer' ||
    userRole === 'admin';

  return {
    system: 'SHEIKHA_ENTERPRISE_NAVIGATION_V1',
    status: allowed ? 'ALLOWED' : 'BLOCKED',
    allowed,
    target: item,
    workspace: buildWorkspaceState(item.id, allowed ? requestedMode : 'human'),
    reason: allowed ? 'Navigation allowed' : 'Developer module requires authorized role'
  };
}

module.exports = {
  buildNavigationTree,
  resolveNavigationTarget
};
