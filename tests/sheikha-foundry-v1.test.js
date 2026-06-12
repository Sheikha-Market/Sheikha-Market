'use strict';

const { status, buildCapability } = require('../core/foundry/sheikha-foundry-v1');

test('Sheikha Foundry V1 is active', () => {
  const s = status();
  expect(s.success).toBe(true);
  expect(s.foundry).toBe('SHEIKHA_FOUNDRY_V1');
  expect(s.layers.capabilityFactory).toBe('ACTIVE');
});

test('Sheikha Foundry builds governed capability plan', () => {
  const r = buildCapability({ name: 'unified-chat' });
  expect(r.success).toBe(true);
  expect(r.lifecycle).toContain('Governance');
  expect(r.lifecycle).toContain('Tests');
});
