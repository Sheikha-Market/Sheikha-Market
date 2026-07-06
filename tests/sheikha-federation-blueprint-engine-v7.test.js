'use strict';

const {
  validateDna,
  resolveBlueprint,
  expandFromDnaSchema
} = require('../core/federation-blueprint-engine/sheikha-federation-blueprint-engine-v7');

describe('Sheikha Federation Blueprint Engine V7', () => {
  test('validates federation DNA schema', () => {
    const validation = validateDna({
      name: 'Blueprint Linux',
      family: 'Linux Family',
      blueprint: 'Linux',
      version: '1.0.0'
    });

    expect(validation.status).toBe('VALID');
    expect(validation.valid).toBe(true);
  });

  test('resolves universal blueprint', () => {
    const blueprint = resolveBlueprint('PostgreSQL');

    expect(blueprint).not.toBeNull();
    expect(blueprint.type).toBe('DATABASE');
  });

  test('expands federation from DNA schema safely', () => {
    const result = expandFromDnaSchema({
      name: 'Schema PostgreSQL Federation',
      family: 'PostgreSQL Family',
      blueprint: 'PostgreSQL',
      version: '1.0.0'
    });

    expect(result.system).toBe('SHEIKHA_FEDERATION_BLUEPRINT_ENGINE_V7');
    expect(result.status).toBe('COMMITTED');
    expect(result.safety.noHarm).toBe(true);
    expect(result.result.system).toBe('SHEIKHA_META_FEDERATION_ORCHESTRATOR_V6');
  });

  test('blocks invalid DNA', () => {
    const result = expandFromDnaSchema({
      name: 'Broken DNA'
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.validation.valid).toBe(false);
  });
});
