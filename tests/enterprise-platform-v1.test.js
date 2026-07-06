'use strict';

const agentFabric = require('../runtime/enterprise-agent-fabric/enterprise-agent-fabric');
const dashboard = require('../runtime/admin-dashboard/enterprise-admin-dashboard');
const observability = require('../runtime/observability/enterprise/enterprise-observability');

describe('Sheikha Enterprise Platform V1', () => {
  test('enterprise agent fabric is active above global control plane', () => {
    const result = agentFabric.status();
    expect(result.system).toBe('SHEIKHA_ENTERPRISE_AGENT_FABRIC_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.above).toBe('SHEIKHA_GLOBAL_CONTROL_PLANE_V1');
    expect(result.boundaries.governanceBeforeExecution).toBe(true);
  });

  test('agent router selects development agent for code tasks', () => {
    const agent = agentFabric.routeTask({ task: 'fix code and run tests' });
    expect(agent.id).toBe('development-agent');
  });

  test('enterprise admin dashboard is active and safe', () => {
    const result = dashboard.status();
    expect(result.system).toBe('SHEIKHA_ENTERPRISE_ADMIN_DASHBOARD_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.boundaries.readOnlyByDefault).toBe(true);
  });

  test('enterprise observability is active', () => {
    const result = observability.status();
    expect(result.system).toBe('SHEIKHA_ENTERPRISE_OBSERVABILITY_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.objectives.noSensitiveSecretLogging).toBe(true);
  });
});
