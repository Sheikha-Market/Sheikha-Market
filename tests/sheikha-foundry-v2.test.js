'use strict';

const { status, forge } = require('../core/foundry/sheikha-foundry-v2');

test('Sheikha Foundry V2 is active', () => {
  const s = status();
  expect(s.success).toBe(true);
  expect(s.foundry).toBe('SHEIKHA_FOUNDRY_V2');
  expect(s.factories.capabilityFactory).toBe('ACTIVE');
  expect(s.factories.inspectorPanelFactory).toBe('ACTIVE');
});

test('Sheikha Foundry V2 forges governed capability plan', () => {
  const r = forge({ name: 'enterprise-inspector' });
  expect(r.success).toBe(true);
  expect(r.lifecycle).toContain('Governance Review');
  expect(r.lifecycle).toContain('Extension Integration');
});
