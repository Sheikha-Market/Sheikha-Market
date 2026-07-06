'use strict';

const gcp = require('../runtime/global-control-plane/global-control-plane');

describe('Sheikha Global Control Plane V1', () => {
  test('global control plane is active above SaaS and cloud apex', () => {
    const status = gcp.status();
    expect(status.system).toBe('SHEIKHA_GLOBAL_CONTROL_PLANE_V1');
    expect(status.status).toBe('ACTIVE');
    expect(status.level).toBe('GLOBAL_MANAGEMENT_AND_FEDERATION_PLANE');
    expect(status.operationalAuthority).toBe('SHEIKHA_ORCHESTRATOR_FABRIC_V2_L11');
    expect(status.operationalFabric).toBe('SHEIKHA_RUNTIME_FABRIC_V5');
    expect(status.above).toContain('SHEIKHA_CLOUD_SAAS_APEX_V1');
    expect(status.boundaries.governanceBeforeExecution).toBe(true);
  });

  test('federation layer is active', () => {
    const federation = gcp.federation();
    expect(federation.status).toBe('ACTIVE');
    expect(federation.federates).toContain('organizations');
    expect(federation.federates).toContain('control-planes');
  });

  test('deployment federation is governed', () => {
    const deployment = gcp.deploymentFederation();
    expect(deployment.status).toBe('ACTIVE');
    expect(deployment.gates).toContain('governance');
    expect(deployment.gates).toContain('human-approval');
  });
});
