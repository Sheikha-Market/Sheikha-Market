const { collectRuntimeMetrics } =
require('../runtime/observability/sheikha-observability-runtime');

describe('Sheikha Observability Runtime V1', () => {
  test('collects runtime metrics and health', () => {
    const metrics = collectRuntimeMetrics();

    expect(metrics.status).toBe('ACTIVE');
    expect(metrics.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(metrics.pid).toBeGreaterThan(0);
    expect(metrics.nodeVersion).toMatch(/^v/);
    expect(metrics.health.status).toBe('HEALTHY');
    expect(metrics.health.activeModules).toBe(metrics.health.totalModules);
  });
});
