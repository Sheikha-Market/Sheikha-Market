'use strict';

const {
  registerEngine,
  resolveEngine,
  listEngines,
  clearEngines
} = require('../core/engine-registry/sheikha-engine-registry-v1');

describe('Sheikha Engine Registry V1', () => {
  beforeEach(() => clearEngines());

  test('registers and resolves engine safely', () => {
    registerEngine('TestEngine', () => ({ ok: true }), { optional: false });

    const result = resolveEngine('TestEngine');

    expect(result.system).toBe('SHEIKHA_ENGINE_REGISTRY_V1');
    expect(result.status).toBe('RESOLVED');
    expect(result.instance.ok).toBe(true);
  });

  test('returns optional not registered instead of ReferenceError', () => {
    const result = resolveEngine('MSMEngine');

    expect(result.status).toBe('OPTIONAL_NOT_REGISTERED');
    expect(result.safe).toBe(true);
    expect(result.message).toContain('MSMEngine');
  });

  test('lists registered engines', () => {
    registerEngine('MGD', () => ({ data: true }));

    const result = listEngines();

    expect(result.status).toBe('ACTIVE');
    expect(result.count).toBe(1);
  });
});
