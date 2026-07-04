'use strict';

const {
  evaluateProductionReadiness,
  isCurrentPm2Log
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
    expect(result.candidateReady).toBe(false);
  });

  test('classifies cron missed execution as review instead of hard blocker', () => {
    const result = evaluateProductionReadiness([
      { file: 'error.log', line: '[NODE-CRON] missed execution at Sun Jul 05 2026' }
    ]);

    expect(result.status).toBe('REVIEW');
    expect(result.productionReady).toBe(false);
    expect(result.candidateReady).toBe(true);
    expect(result.summary.review).toBe(1);
  });

  test('limits production gate log scope to active runtime logs', () => {
    expect(isCurrentPm2Log('sheikha-main-portal-error.log')).toBe(true);
    expect(isCurrentPm2Log('sheikha-universal-api-error-2.log')).toBe(true);
    expect(isCurrentPm2Log('sheikha-main-portal-error__2026-05-30_01-29-01.log')).toBe(false);
    expect(isCurrentPm2Log('sheikha-api-error-129.log')).toBe(false);
  });
});
