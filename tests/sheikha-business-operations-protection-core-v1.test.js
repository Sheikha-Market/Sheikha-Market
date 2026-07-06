'use strict';

const {
  SheikhaBusinessOperationsProtectionCore,
  BUSINESS_CORE_CAPABILITIES,
  OPERATIONS_CORE_CAPABILITIES,
  PROTECTION_CORE_CAPABILITIES
} = require('../runtime/sheikha-core/business-operations-protection/sheikha-business-operations-protection-core');

test('activates business operations and protection core', () => {
  const core = new SheikhaBusinessOperationsProtectionCore();
  const status = core.getStatus();

  expect(status.status).toBe('ACTIVE_BUSINESS_OPERATIONS_PROTECTION_CORE');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.businessCore.capabilities).toEqual(BUSINESS_CORE_CAPABILITIES);
  expect(status.operationsCore.capabilities).toEqual(OPERATIONS_CORE_CAPABILITIES);
  expect(status.protectionCore.capabilities).toEqual(PROTECTION_CORE_CAPABILITIES);

  expect(status.boundaries.noHarmNoDamage).toBe(true);
  expect(status.boundaries.noUngovernedCoreOperation).toBe(true);
});

test('activates business core with commercial governance', () => {
  const core = new SheikhaBusinessOperationsProtectionCore();
  const business = core.activateBusinessCore();

  expect(business.status).toBe('BUSINESS_CORE_ACTIVE');
  expect(business.capabilities).toContain('commercial-governance');
  expect(business.boundaries.noRiba).toBe(true);
  expect(business.boundaries.noDeception).toBe(true);
});

test('activates operations core with health and readiness boundaries', () => {
  const core = new SheikhaBusinessOperationsProtectionCore();
  const operations = core.activateOperationsCore();

  expect(operations.status).toBe('OPERATIONS_CORE_ACTIVE');
  expect(operations.capabilities).toContain('monitoring-operations');
  expect(operations.boundaries.healthChecksRequired).toBe(true);
  expect(operations.boundaries.readinessRequired).toBe(true);
});

test('activates protection core with no harm governance', () => {
  const core = new SheikhaBusinessOperationsProtectionCore();
  const protection = core.activateProtectionCore();

  expect(protection.status).toBe('PROTECTION_CORE_ACTIVE');
  expect(protection.capabilities).toContain('no-harm-governance');
  expect(protection.boundaries.noSecretMutation).toBe(true);
  expect(protection.boundaries.noHarm).toBe(true);
});
