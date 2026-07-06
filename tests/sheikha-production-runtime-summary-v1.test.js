const { productionSummary } = require('../runtime/production-summary');

describe('Sheikha Production Runtime Summary V1', () => {
  test('summarizes production runtime state', () => {
    const summary = productionSummary();

    expect(summary.status).toBe('ACTIVE');
    expect(summary.health.status).toBe('HEALTHY');
    expect(summary.modules.length).toBeGreaterThanOrEqual(15);
    expect(summary.registration.every((m) => m.registered)).toBe(true);
  });
});
