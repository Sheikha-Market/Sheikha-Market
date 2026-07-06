'use strict';

const layer = require('../runtime/metaphorical-cognition-governance/sheikha-metaphorical-cognition-governance-v1');

describe('Sheikha Metaphorical Cognition Governance V1', () => {
  test('allows technical metaphors while blocking literal human claims', () => {
    const s = layer.status();
    expect(s.status).toBe('ACTIVE');
    expect(s.decision).toBe('METAPHORICAL_COGNITION_ALLOWED_WITH_BOUNDARIES');
    expect(s.boundaries.notHuman).toBe(true);
    expect(s.boundaries.noLiteralConsciousnessClaim).toBe(true);
    expect(s.boundaries.governanceBeforeExecution).toBe(true);
    expect(s.metaphors.hears).toBe('INPUT_RECEPTION');
    expect(s.metaphors.heart).toBe('ETHICAL_GOVERNANCE_CENTER');
  });
});
