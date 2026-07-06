'use strict';

const {
  ProgrammingLanguageEnterpriseFederationFabric
} = require('../runtime/programming-language-enterprise-federation/programming-language-enterprise-federation-fabric');

const {
  GovernanceEnterpriseFederationFabric
} = require('../runtime/governance-enterprise-federation/governance-enterprise-federation-fabric');

test('activates programming language enterprise federation as top production layer', () => {
  const fabric = new ProgrammingLanguageEnterpriseFederationFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ACTIVE');
  expect(status.layerRank).toBe('ABOVE_SDK_FEDERATION');
  expect(status.productionReady).toBe(true);
  expect(status.inspectorOnly).toBe(false);
  expect(status.federation.find((x) => x.language === 'python').status).toBe('ENTERPRISE_FEDERATED');
});

test('activates governance enterprise federation as highest governance layer', () => {
  const governance = new GovernanceEnterpriseFederationFabric();
  const status = governance.getStatus();

  expect(status.status).toBe('ACTIVE');
  expect(status.layerRank).toBe('TOP_ENTERPRISE_GOVERNANCE_LAYER');
  expect(status.productionReady).toBe(true);
  expect(status.inspectorOnly).toBe(false);
  expect(status.pillars).toContain('الكتاب والسنة');
  expect(status.governedLayers.length).toBeGreaterThanOrEqual(10);
});
