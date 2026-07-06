'use strict';

const { policy, evaluateAudit } = require('../runtime/security-governance/sheikha-security-self-healing-governance-v1');

test('security self-healing governance is active and blocks force fixes', () => {
  expect(policy.status).toBe('ACTIVE');
  expect(policy.rules.blockForceFix).toBe(true);
  expect(policy.protectedCommands).toContain('npm audit fix --force');
});

test('high vulnerabilities block merge', () => {
  const r = evaluateAudit([{ package: '@grpc/grpc-js', severity: 'high' }]);
  expect(r.decision).toBe('BLOCK_MERGE');
});
