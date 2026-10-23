'use strict';

const {
  buildSheikhaCloudStatus,
  planCloudWorkload,
  activateLocalCloudCanary,
  inspectLocalCloudRuntime,
} = require('../runtime/sheikha-studio/core/sheikha-cloud-v1');

describe('Sheikha Cloud V1', () => {
  test('registers a local independent cloud core without claiming hyperscale capacity', () => {
    const status = buildSheikhaCloudStatus({});
    expect(status.claims.isSheikhaCloudProduct).toBe(true);
    expect(status.claims.ownsHyperscaleDataCenters).toBe(false);
    expect(status.claims.commercialPublicCloudReady).toBe(false);
    expect(status.services.map((service) => service.id)).toEqual(expect.arrayContaining([
      'COMPUTE', 'GPU_ACCELERATION', 'STORAGE', 'NETWORK', 'AI_FOUNDRY', 'FINOPS',
    ]));
    expect(status.externalFederation.every((provider) => provider.optional)).toBe(true);
  });

  test('plans local work without executing it', () => {
    const plan = planCloudWorkload({ serviceId: 'COMPUTE' });
    expect(plan.status).toBe('LOCAL_PLAN_READY');
    expect(plan.executionStarted).toBe(false);
    expect(plan.paidResourceCreated).toBe(false);
  });

  test('keeps paid resources behind contract, budget, and approval', () => {
    const plan = planCloudWorkload({ serviceId: 'GPU_ACCELERATION', paidResource: true, target: 'AWS' });
    expect(plan.status).toBe('CONTRACT_BUDGET_AND_HUMAN_APPROVAL_REQUIRED');
    expect(plan.executionStarted).toBe(false);
  });

  test('activates only when the local canary evidence is complete', () => {
    const inventory = [
      'node', 'docker', 'qemu', 'nvidia_smi', 'ollama', 'prometheus', 'grafana_server', 'redis_server',
    ].map((command) => ({ command, installed: true, path: `/test/${command}` }));
    const activation = activateLocalCloudCanary({ studioControlPlaneHealthy: true, inventory });
    expect(activation.status).toBe('LOCAL_CANARY_ACTIVE');
    expect(activation.activated).toBe(true);
    expect(activation.externalProvisioningExecuted).toBe(false);
    expect(activation.productionBoundary).toBe('NOT_DISTRIBUTED_OR_PUBLIC_CLOUD_PRODUCTION');
  });

  test('separates live health from public network hardening', async () => {
    const evidence = await inspectLocalCloudRuntime({
      snapshot: {
        dockerHealthy: true,
        gpuHealthy: true,
        ollama: { reachable: true },
        prometheus: { reachable: true, expectedResponse: true },
        grafana: { reachable: true },
        redis: { reachable: true },
        networkExposure: { inspected: true, exposedPorts: [3000, 9090] },
      },
    });
    expect(evidence.eligibleForLocalControlledPilot).toBe(true);
    expect(evidence.eligibleForPublicProduction).toBe(false);
    expect(evidence.warnings).toHaveLength(2);
    expect(evidence.mutationExecuted).toBe(false);
  });

  test('accepts loopback-only observability as hardened', async () => {
    const evidence = await inspectLocalCloudRuntime({
      snapshot: {
        dockerHealthy: true,
        gpuHealthy: true,
        ollama: { reachable: true },
        prometheus: { reachable: true, expectedResponse: true },
        grafana: { reachable: true },
        redis: { reachable: true },
        networkExposure: { inspected: true, exposedPorts: [] },
      },
    });
    expect(evidence.status).toBe('LOCAL_RUNTIME_ACTIVE');
    expect(evidence.warnings).toEqual([]);
    expect(evidence.observabilityNetworkHardened).toBe(true);
    expect(evidence.eligibleForPublicProduction).toBe(false);
  });
});
