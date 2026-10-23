'use strict';

const {
  buildAzureReadiness,
  planAzureWorkflow,
} = require('../runtime/sheikha-studio/core/sheikha-azure-integration-fabric-v1');

describe('Sheikha Azure Integration Fabric V1', () => {
  test('registers AI training, production, data, security, operations, and cost capabilities', () => {
    const status = buildAzureReadiness({ SHEIKHA_AZURE_CLI_INSTALLED: 'true' });
    const ids = status.capabilities.map((capability) => capability.id);
    expect(ids).toEqual(expect.arrayContaining([
      'MICROSOFT_FOUNDRY', 'FOUNDRY_FINE_TUNING', 'AZURE_MACHINE_LEARNING',
      'AI_SEARCH', 'API_MANAGEMENT_AI_GATEWAY', 'AKS', 'KEY_VAULT_MANAGED_HSM',
      'AZURE_MONITOR_APP_INSIGHTS', 'COST_MANAGEMENT',
    ]));
    expect(status.productionReady).toBe(false);
    expect(status.paidProvisioningExecuted).toBe(false);
    expect(status.blockers).toContain('authenticatedSubscriptionConfigured');
  });

  test('plans training without creating paid resources', () => {
    const plan = planAzureWorkflow({
      workflow: 'TRAIN_MODEL',
      environment: { SHEIKHA_AZURE_CLI_INSTALLED: 'true' },
    });
    expect(plan.status).toBe('PREFLIGHT_BLOCKED');
    expect(plan.stages).toContain('DATA_LICENSE_GATE');
    expect(plan.executionStarted).toBe(false);
    expect(plan.paidResourcesCreated).toBe(false);
    expect(plan.humanApprovalRequired).toBe(true);
  });

  test('rejects unknown workflows', () => {
    expect(planAzureWorkflow({ workflow: 'anything' }).status).toBe('UNKNOWN_WORKFLOW');
  });
});
