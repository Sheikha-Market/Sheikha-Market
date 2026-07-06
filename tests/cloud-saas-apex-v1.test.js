'use strict';

const apex = require('../runtime/cloud-saas/apex/cloud-saas-apex');

describe('Sheikha Cloud SaaS Apex V1', () => {
  test('apex cloud SaaS layer is active and governed', () => {
    const status = apex.status();
    expect(status.system).toBe('SHEIKHA_CLOUD_SAAS_APEX_V1');
    expect(status.status).toBe('ACTIVE');
    expect(status.boundaries.noFalseCloudOwnershipClaim).toBe(true);
    expect(status.boundaries.governanceBeforeProvisioning).toBe(true);
    expect(status.readiness.multiTenant).toBe(true);
  });

  test('region registry is active', () => {
    const regions = apex.regions();
    expect(regions.registry).toBe('SHEIKHA_REGION_REGISTRY_V1');
    expect(regions.status).toBe('ACTIVE');
    expect(regions.regions.length).toBeGreaterThan(0);
  });

  test('deployment manager has governed gates', () => {
    const deployments = apex.deployments();
    expect(deployments.manager).toBe('SHEIKHA_DEPLOYMENT_MANAGER_V1');
    expect(deployments.gates).toContain('governance');
    expect(deployments.gates).toContain('human-approval');
  });
});
