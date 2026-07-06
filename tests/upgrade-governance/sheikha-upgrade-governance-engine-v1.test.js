const {
  createModuleModernizationPlan
} = require('../../runtime/upgrade-governance/sheikha-upgrade-governance-engine');

describe('Sheikha Upgrade Governance Engine V1', () => {
  test('creates governed CommonJS to ESM modernization plan', () => {
    const plan = createModuleModernizationPlan();

    expect(plan.status).toBe('ACTIVE');
    expect(plan.category).toBe('MODULE_SYSTEM_MODERNIZATION');
    expect(plan.upgrade.from).toBe('CommonJS');
    expect(plan.upgrade.to).toBe('ES Module');
    expect(plan.upgrade.automaticFullMigration).toBe(false);
    expect(plan.gates).toContain('tests-pass');
    expect(plan.protectedBoundaries).toContain('do-not-hide-warning');
  });
});
