'use strict';

const gate = require('../runtime/production-truth-gate/sheikha-production-truth-gate-v4.json');

describe('Sheikha Production Truth Gate V4', () => {
  test('requires verifiable readiness only', () => {
    expect(gate.status).toBe('ACTIVE');
    expect(gate.mode).toBe('VERIFIABLE_READINESS_ONLY');
    expect(gate.governance.truthfulReporting).toBe(true);
  });

  test('blocks unverifiable production claims', () => {
    expect(gate.blockedClaims).toContain('100_percent_production_ready_without_all_gates');
    expect(gate.allowedDecision).toBe('ADVANCED_PRODUCTION_CANDIDATE_UNTIL_ALL_GATES_PASS');
  });
});
