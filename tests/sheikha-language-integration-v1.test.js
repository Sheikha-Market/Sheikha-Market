'use strict';

const contract = require('../runtime/sheikha-language-integration/sheikha-language-integration-v1.json');

describe('Sheikha Language Integration V1', () => {
  test('activates governed Arabic DSL integration', () => {
    expect(contract.status).toBe('ACTIVE');
    expect(contract.mode).toBe('ARABIC_DSL_GOVERNED_PROGRAMMING_INTEGRATION');
  });

  test('connects language with governance and runtime layers', () => {
    expect(contract.integrationTargets).toContain('governance_engine');
    expect(contract.integrationTargets).toContain('sheikha_os');
    expect(contract.integrationTargets).toContain('hpc_runtime');
    expect(contract.integrationTargets).toContain('master_log');
  });

  test('blocks unverifiable language claims', () => {
    expect(contract.blockedClaims).toContain('language_ready_without_compiler_check');
    expect(contract.blockedClaims).toContain('production_ready_without_truth_gate');
  });
});
