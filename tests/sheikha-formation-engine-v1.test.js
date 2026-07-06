'use strict';

const {
  formations,
  buildFormationEngine
} = require('../core/formation-engine/sheikha-formation-engine-v1');

describe('Sheikha Formation Engine V1', () => {
  test('activates governed formation engines', () => {
    const report = buildFormationEngine();

    expect(report.status).toBe('ACTIVE');
    expect(report.safeguards.noCreationClaim).toBe(true);
    expect(report.safeguards.noImagesOfSouls).toBe(true);
    expect(report.decision).toBe('FORMATION_ENGINE_READY_AND_GOVERNED');
  });

  test('includes civilizational and visual formation models', () => {
    expect(formations.some(f => f.id === 'civilizational-identity')).toBe(true);
    expect(formations.some(f => f.id === 'visual-operating-system')).toBe(true);
    expect(formations.some(f => f.id === 'motion-graphics-model')).toBe(true);
  });
});
