'use strict';

const {
  SheikhaGeneralEnterpriseInspectorFederation
} = require('../runtime/enterprise-inspector-federation/sheikha-general-and-sub-inspector-federation');

test('general inspector verifies sovereign foundation and sub inspector recovery path', () => {
  const inspector = new SheikhaGeneralEnterpriseInspectorFederation();
  const status = inspector.getStatus();

  expect(status.status).toBe('ACTIVE_VERIFIED');
  expect(status.layerRank).toBe('GENERAL_INSPECTOR_ABOVE_SOVEREIGN_FOUNDATION');
  expect(status.productionReady).toBe(true);
  expect(status.inspectorOnly).toBe(false);

  expect(status.sovereignStatus.status).toBe('ACTIVE');
  expect(status.subInspection.status).toBe('PASSED');
  expect(status.boundaries.recoveryIsGoverned).toBe(true);
});
