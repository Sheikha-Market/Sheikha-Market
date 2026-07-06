'use strict';

const {
  normalizeContext,
  buildContextBindings,
  canAccessDeveloperContext
} = require('../core/enterprise-context/sheikha-global-context-engine-v1');

describe('Sheikha Global Context Engine V1', () => {
  test('normalizes enterprise context', () => {
    const report = normalizeContext({
      user: { id: 'salman', name: 'سلمان', role: 'trader' },
      entity: { type: 'product', id: 'copper-cable', name: 'Copper Cable', sector: 'metals' }
    });

    expect(report.system).toBe('SHEIKHA_GLOBAL_CONTEXT_ENGINE_V1');
    expect(report.status).toBe('ACTIVE');
    expect(report.context.workspace.direction).toBe('rtl');
    expect(report.context.entity.id).toBe('copper-cable');
    expect(report.rules.sharedAcrossModules).toBe(true);
  });

  test('builds module bindings from one context', () => {
    const report = normalizeContext({
      user: { role: 'trader' },
      entity: { type: 'product', id: 'copper-cable', name: 'Copper Cable' }
    });

    const bindings = buildContextBindings(report);

    expect(bindings.status).toBe('READY');
    expect(bindings.bindings.marketplace.entity.id).toBe('copper-cable');
    expect(bindings.bindings.aiAssistant.entity.name).toBe('Copper Cable');
  });

  test('protects developer context', () => {
    expect(canAccessDeveloperContext(normalizeContext({ user: { role: 'trader' } }))).toBe(false);
    expect(canAccessDeveloperContext(normalizeContext({ user: { role: 'admin' } }))).toBe(true);
  });
});
