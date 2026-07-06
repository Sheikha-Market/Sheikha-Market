'use strict';

const { evaluateAlert } = require('../runtime/self-healing/sheikha-direct-repair-governance-v1');

test('direct repair governance blocks high alerts', () => {
  const r = evaluateAlert({ severity: 'high', kind: 'security' });
  expect(r.decision).toBe('BLOCK_DIRECT_FIX_REQUIRE_REVIEW');
});

test('direct repair governance allows moderate safe alerts', () => {
  const r = evaluateAlert({ severity: 'moderate', kind: 'dependency' });
  expect(r.decision).toBe('ALLOW_SAFE_DIRECT_FIX');
});
