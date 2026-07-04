'use strict';

const {
  buildNavigationTree,
  resolveNavigationTarget
} = require('../core/enterprise-navigation/sheikha-enterprise-navigation-v1');

describe('Sheikha Enterprise Navigation V1', () => {
  test('builds unified navigation tree', () => {
    const nav = buildNavigationTree();

    expect(nav.system).toBe('SHEIKHA_ENTERPRISE_NAVIGATION_V1');
    expect(nav.status).toBe('ACTIVE');
    expect(nav.items.length).toBeGreaterThan(3);
    expect(nav.rules.singleNavigationSource).toBe(true);
  });

  test('allows business module for trader', () => {
    const result = resolveNavigationTarget('commerce', { role: 'trader' });

    expect(result.status).toBe('ALLOWED');
    expect(result.target.id).toBe('commerce');
  });

  test('blocks developer module for business user', () => {
    const result = resolveNavigationTarget('ide', { role: 'trader' });

    expect(result.status).toBe('BLOCKED');
    expect(result.allowed).toBe(false);
  });

  test('allows developer module for admin', () => {
    const result = resolveNavigationTarget('ide', { role: 'admin' });

    expect(result.status).toBe('ALLOWED');
    expect(result.target.id).toBe('ide');
  });
});
