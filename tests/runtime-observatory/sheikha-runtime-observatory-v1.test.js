const {
  createRuntimeObservatory
} = require('../../runtime/runtime-observatory/sheikha-runtime-observatory');

describe('Sheikha Runtime Observatory V1', () => {
  test('creates runtime observatory with metrics', () => {
    const observatory = createRuntimeObservatory();

    expect(observatory.status).toBe('ACTIVE');
    expect(observatory.metrics.status).toBe('ACTIVE');
    expect(observatory.watches).toContain('warnings');
    expect(observatory.outputs).toContain('risk-score');
  });
});
