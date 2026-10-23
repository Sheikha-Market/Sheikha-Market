'use strict';

const inventory = require(
  '../runtime/sheikha-ai-governor/v1/llm-training/sheikha-regional-provider-inventory-v1.json'
);
const {
  EARTH_ZONES,
  planRegionalExecution
} = require('../runtime/sheikha-ai-governor/v1/sheikha-regional-provider-orchestrator-v1');

describe('Sheikha regional provider orchestrator V1', () => {
  test('uses bounded measurable geographic zones', () => {
    expect(EARTH_ZONES).toContain('SAUDI_ARABIA');
    expect(EARTH_ZONES).toContain('GLOBAL');
    expect(EARTH_ZONES).not.toContain('UNIVERSE');
  });

  test('does not send GPU training to the current Hostinger control plane', () => {
    const plan = planRegionalExecution({
      workload: 'LARGE_LLM_TRAINING', zone: 'SAUDI_ARABIA',
      gpuRequired: true, maxMonthlySAR: 1000, humanApproval: true
    }, inventory.providers);
    expect(plan.status).toBe('NO_PROVIDER_ROUTE_DEFAULT_DENY');
    const hostinger = plan.evaluations.find((entry) => entry.providerId === 'PROV-HOSTINGER');
    expect(hostinger.blockers).toContain('GPU_NOT_AVAILABLE');
    expect(plan.executionStarted).toBe(false);
  });

  test('routes only to a fully approved provider without executing automatically', () => {
    const provider = {
      id: 'approved', name: 'Approved GPU', role: 'training-worker',
      enabled: true, reachable: true, contractVerified: true, budgetApproved: true,
      gpuAvailable: true, pdplTransferApproved: true, customerDataApproved: true,
      zones: ['SAUDI_ARABIA']
    };
    const plan = planRegionalExecution({
      workload: 'LARGE_LLM_TRAINING', zone: 'SAUDI_ARABIA', gpuRequired: true,
      personalData: true, customerData: true, maxMonthlySAR: 1000, humanApproval: true
    }, [provider]);
    expect(plan.status).toBe('ROUTE_APPROVED_NOT_EXECUTED');
    expect(plan.selected.providerId).toBe('approved');
    expect(plan.executionStarted).toBe(false);
    expect(plan.automaticPaidProvisioning).toBe(false);
  });
});
