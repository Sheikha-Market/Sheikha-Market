'use strict';

const subscriptions = require('../runtime/saas/subscriptions/subscription-manager');
const tenancy = require('../runtime/tenancy/tenant-isolation');
const apiKeys = require('../runtime/security/api-keys/api-key-manager');

describe('Sheikha Enterprise SaaS V2', () => {
  test('subscription manager is active and governed', () => {
    const result = subscriptions.status();
    expect(result.system).toBe('SHEIKHA_SUBSCRIPTION_MANAGER_V2');
    expect(result.status).toBe('ACTIVE');
    expect(result.governance.noLicenseWithoutContract).toBe(true);
    expect(result.governance.noBillingWithoutApproval).toBe(true);
  });

  test('tenant isolation is active', () => {
    const result = tenancy.status();
    expect(result.system).toBe('SHEIKHA_TENANT_ISOLATION_V2');
    expect(result.status).toBe('ACTIVE');
    expect(result.boundaries.organizationIsolation).toBe(true);
  });

  test('api key manager is active and safe', () => {
    const result = apiKeys.status();
    expect(result.system).toBe('SHEIKHA_API_KEY_MANAGER_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.rules.neverExposeSecrets).toBe(true);
    expect(result.rules.hashBeforeStore).toBe(true);
  });
});
