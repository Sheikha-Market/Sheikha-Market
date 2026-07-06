'use strict';

const {
  buildWorkspaceState,
  decideViewMode
} = require('../core/enterprise-workspace/sheikha-enterprise-workspace-v1');

describe('Sheikha Enterprise Workspace V1', () => {
  test('builds unified workspace state', () => {
    const state = buildWorkspaceState('knowledge');

    expect(state.system).toBe('SHEIKHA_ENTERPRISE_WORKSPACE_V1');
    expect(state.status).toBe('ACTIVE');
    expect(state.activeModule.id).toBe('knowledge');
    expect(state.rules.singleShell).toBe(true);
    expect(state.rules.hideJsonFromBusinessUsers).toBe(true);
  });

  test('uses human mode for business users', () => {
    expect(decideViewMode({ role: 'trader' })).toBe('human');
  });

  test('uses developer mode for developer users', () => {
    expect(decideViewMode({ role: 'developer' })).toBe('developer');
  });
});
