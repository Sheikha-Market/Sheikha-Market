'use strict';

const {
  DEFAULT_INTERVAL_MS,
  buildDecision,
  parseInterval
} = require('../tools/release/sheikha-periodic-safety-gate-v1');

describe('Sheikha Periodic Safety Gate V1', () => {
  test('uses a known six hour default interval', () => {
    expect(DEFAULT_INTERVAL_MS).toBe(21600000);
    expect(parseInterval()).toBe(21600000);
  });

  test('rejects unsafe tiny intervals and falls back to the governed default', () => {
    expect(parseInterval('1000')).toBe(21600000);
    expect(parseInterval('not-a-number')).toBe(21600000);
  });

  test('returns passed only when every no-harm check is true', () => {
    const passed = buildDecision({
      productionGateReady: true,
      diskReady: true,
      sourceBackupReady: true,
      restoreSampleReady: true,
      pm2Saved: true,
      healthOk: true
    });

    expect(passed.status).toBe('PASSED');
    expect(passed.decision).toBe('PERIODIC_NO_HARM_GATE_PASSED');
    expect(passed.failed).toEqual([]);
  });

  test('moves to review when any safety check fails', () => {
    const review = buildDecision({
      productionGateReady: true,
      diskReady: false,
      sourceBackupReady: true
    });

    expect(review.status).toBe('REVIEW');
    expect(review.failed).toEqual(['diskReady']);
  });
});
