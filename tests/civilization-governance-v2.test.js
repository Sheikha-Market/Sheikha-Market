'use strict';

const governance = require('../runtime/civilization-governance/civilization-governance-v2');

describe('Sheikha Civilization Governance V2', () => {
  test('civilization governance v2 is active above civilization OS', () => {
    const result = governance.status();
    expect(result.system).toBe('SHEIKHA_CIVILIZATION_GOVERNANCE_V2');
    expect(result.status).toBe('ACTIVE');
    expect(result.above).toBe('SHEIKHA_CIVILIZATION_OPERATING_SYSTEM_V1');
    expect(result.boundaries.auditEveryDecision).toBe(true);
  });

  test('decision registry is active', () => {
    const result = governance.decisionRegistry();
    expect(result.registry).toBe('SHEIKHA_CIVILIZATION_DECISION_REGISTRY_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.fields).toContain('auditTrail');
  });

  test('impact objectives are active', () => {
    const result = governance.impactObjectives();
    expect(result.status).toBe('ACTIVE');
    expect(result.objectives).toContain('continuous-improvement');
  });
});
