const {
  createDependencyGenome
} = require('../../runtime/dependency-genome/sheikha-dependency-genome');

describe('Sheikha Dependency Genome V1', () => {
  test('creates dependency genome without silent upgrades', () => {
    const genome = createDependencyGenome();

    expect(genome.status).toBe('ACTIVE');
    expect(genome.tracked).toContain('punycode');
    expect(genome.dimensions).toContain('rollback-plan');
    expect(genome.noSilentUpgrade).toBe(true);
  });
});
