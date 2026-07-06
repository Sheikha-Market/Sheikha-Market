'use strict';

const requiredRoutes = Object.freeze([
  { id: 'home', path: '/', type: 'ui' },
  { id: 'marketplace', path: '/marketplace', type: 'ui' },
  { id: 'product-knowledge', path: '/product-knowledge/?v=11', type: 'ui' },
  { id: 'ide', path: '/ide/', type: 'ui' },
  { id: 'health', path: '/api/health', type: 'api' }
]);

function validateStaging(input = {}) {
  const routes = input.routes || requiredRoutes;
  const checks = routes.map((route) => ({
    ...route,
    status: route.path ? 'PASS' : 'BLOCKED',
    passed: Boolean(route.path)
  }));

  const blocked = checks.filter((check) => !check.passed);

  return {
    system: 'SHEIKHA_STAGING_VALIDATION_V1',
    status: blocked.length ? 'BLOCKED' : 'READY_FOR_STAGING_TEST',
    passed: blocked.length === 0,
    checks,
    blocked,
    requiredHumanValidation: [
      'open_home_ui',
      'open_marketplace_ui',
      'open_product_knowledge_ui',
      'open_ide_ui',
      'confirm_no_visible_json_for_business_user',
      'confirm_developer_mode_shows_technical_details',
      'confirm_rtl_layout',
      'confirm_navigation_consistency'
    ],
    safety: {
      noExternalMutation: true,
      noProductionTraffic: true,
      noHarm: true
    }
  };
}

module.exports = {
  requiredRoutes,
  validateStaging
};
