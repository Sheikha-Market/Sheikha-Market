'use strict';

const {
  evaluateProductionReadiness
} = require('../tools/production/sheikha-production-readiness-gate-v1');

describe('Sheikha Production Readiness Gate V1', () => {
  test('passes clean logs', () => {
    const result = evaluateProductionReadiness([
      { file: 'ok.log', line: 'service online health ok' }
    ]);

    expect(result.status).toBe('PASSED');
    expect(result.productionReady).toBe(true);
  });

  test('blocks runtime errors', () => {
    const result = evaluateProductionReadiness([
      { file: 'error.log', line: 'MSMEngine is not defined' }
    ]);

    expect(result.status).toBe('BLOCKED');
    expect(result.productionReady).toBe(false);
  });
});
