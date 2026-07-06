const {
  createSelfHealingPlan
} = require('../../runtime/self-healing-v2/sheikha-self-healing-fabric-v2');

describe('Sheikha Self Healing Fabric V2', () => {
  test('creates governed repair plan without silent suppression', () => {
    const plan = createSelfHealingPlan([
      { message: 'Unknown word Sheikha', severity: 'WARNING' },
      { message: 'punycode deprecated', severity: 'WARNING' }
    ]);

    expect(plan.status).toBe('ACTIVE');
    expect(plan.noSilentSuppression).toBe(true);
    expect(plan.repairs.length).toBe(2);
    expect(plan.repairs.every((r) => r.requiresVerification)).toBe(true);
  });
});
