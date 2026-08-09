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

  test('bounds stored findings while preserving the full summary', () => {
    const lines = Array.from({ length: 250 }, (_, index) => ({
      file: 'sheikha-main-portal-error.log',
      line: `Engine${index} is not defined`
    }));
    const result = evaluateProductionReadiness(lines, {
      maxFindings: 10,
      generatedAt: '2026-07-31T00:00:00.000Z'
    });

    expect(result.status).toBe('BLOCKED');
    expect(result.findings).toHaveLength(10);
    expect(result.summary).toMatchObject({
      blockers: 250,
      total: 250,
      suppressed: 240
    });
    expect(result.scanScope.maximumStoredFindings).toBe(10);
  });
});
