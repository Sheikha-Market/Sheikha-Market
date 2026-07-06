const { loadGlobalExecutionFabric } =
require('../../runtime/global-execution/sheikha-global-execution-fabric');

describe('Sheikha Global Execution Fabric Omega V1', () => {
  test('loads global execution fabric', () => {
    const g = loadGlobalExecutionFabric();

    expect(g.status).toBe('ACTIVE');
    expect(g.production.health.status).toBe('HEALTHY');
    expect(g.federation.status).toBe('ACTIVE');
    expect(g.unifiedGraph.status).toBe('ACTIVE');
  });
});
