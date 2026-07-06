'use strict';

const {
  getSheikhaCivilizationSystem,
  evaluateCivilizationReadiness
} = require('../core/sheikha-civilization/sheikha-civilization-kingdom-global-trade');

describe('Sheikha Civilization Kingdom Global Trade V1', () => {
  test('activates civilization kingdom and global trade architecture', () => {
    const system = getSheikhaCivilizationSystem();

    expect(system.system).toBe('SHEIKHA_CIVILIZATION_KINGDOM_GLOBAL_TRADE_V1');
    expect(system.status).toBe('ACTIVE');
    expect(system.layers.map((layer) => layer.id)).toContain('sheikha-civilization');
    expect(system.layers.map((layer) => layer.id)).toContain('sheikha-kingdom');
    expect(system.layers.map((layer) => layer.id)).toContain('sheikha-global-trade-system');
  });

  test('evaluates excellent readiness', () => {
    const result = evaluateCivilizationReadiness();

    expect(result.system).toBe('SHEIKHA_CIVILIZATION_READINESS_V1');
    expect(result.status).toBe('EXCELLENT');
    expect(result.score).toBe(100);
    expect(result.checks.noHarm).toBe(true);
  });
});
