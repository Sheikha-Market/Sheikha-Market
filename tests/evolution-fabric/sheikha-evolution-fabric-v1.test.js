const {
  createEvolutionCycle
} = require('../../runtime/evolution-fabric/sheikha-evolution-fabric-v1');

describe('Sheikha Evolution Fabric V1', () => {
  test('creates governed evolution cycle', () => {
    const cycle = createEvolutionCycle();

    expect(cycle.status).toBe('ACTIVE');
    expect(cycle.noAutomaticProductionPromotion).toBe(true);
    expect(cycle.cycle).toContain('research');
    expect(cycle.cycle).toContain('human-approval');
  });
});
