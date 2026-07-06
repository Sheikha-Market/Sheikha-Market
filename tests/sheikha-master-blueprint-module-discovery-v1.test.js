const { discoverModules } = require('../runtime/discovery/sheikha-module-discovery');

describe('Sheikha Module Discovery V1', () => {
  test('discovers active master blueprint modules', () => {
    const modules = discoverModules();

    expect(modules.length).toBeGreaterThanOrEqual(15);
    expect(modules.find((m) => m.module === 'kernel').status).toBe('ACTIVE');
    expect(modules.find((m) => m.module === 'livingRuntime').status).toBe('ACTIVE');
  });
});
