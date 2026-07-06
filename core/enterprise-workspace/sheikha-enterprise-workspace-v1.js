'use strict';

const workspaceModules = Object.freeze([
  { id: 'dashboard', labelAr: 'لوحة القيادة', path: '/', mode: 'human' },
  { id: 'commerce', labelAr: 'التجارة', path: '/marketplace', mode: 'human' },
  { id: 'knowledge', labelAr: 'معرفة المنتجات', path: '/product-knowledge/?v=11', mode: 'human' },
  { id: 'governance', labelAr: 'الحوكمة', path: '/api/governance/status', mode: 'developer' },
  { id: 'ide', labelAr: 'Sheikha IDE', path: '/ide/', mode: 'developer' },
  { id: 'integrations', labelAr: 'التكاملات', path: '/api/health', mode: 'developer' }
]);

function buildWorkspaceState(activeModule = 'dashboard', viewMode = 'human') {
  const active = workspaceModules.find((item) => item.id === activeModule) || workspaceModules[0];

  return {
    system: 'SHEIKHA_ENTERPRISE_WORKSPACE_V1',
    status: 'ACTIVE',
    mode: 'UNIFIED_ENTERPRISE_WORKSPACE',
    activeModule: active,
    viewMode,
    rules: {
      singleShell: true,
      unifiedNavigation: true,
      humanModeDefault: true,
      developerModeOnDemand: true,
      hideJsonFromBusinessUsers: true,
      contextualAssistant: true,
      noHarm: true
    },
    modules: workspaceModules
  };
}

function decideViewMode(user = {}) {
  if (user.role === 'developer' || user.role === 'admin') return 'developer';
  return 'human';
}

module.exports = {
  workspaceModules,
  buildWorkspaceState,
  decideViewMode
};
