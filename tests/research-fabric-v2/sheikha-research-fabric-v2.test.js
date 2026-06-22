const {
  createUpgradeResearchPlan
} = require('../../runtime/research-fabric-v2/sheikha-research-fabric-v2');

describe('Sheikha Research Fabric V2', () => {
  test('creates upgrade research plan with governance gates', () => {
    const plan = createUpgradeResearchPlan();

    expect(plan.status).toBe('ACTIVE');
    expect(plan.targets).toContain('nodejs');
    expect(plan.targets).toContain('lsp');
    expect(plan.gates).toContain('tests-pass');
    expect(plan.noAutomaticProductionUpgrade).toBe(true);
  });
});
