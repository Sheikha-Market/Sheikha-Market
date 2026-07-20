'use strict';

const logic = require(
  '../runtime/reasoning-governance/v2/' +
  'sheikha-logical-reasoning-governance-v2'
);

describe('Sheikha logical reasoning governance V2', () => {
  test('fails closed without evidence', () => {
    const result = logic.evaluate({
      claim: 'Architecture claim'
    });

    expect(result.status).toBe('FAIL_CLOSED');
    expect(result.failures).toContain('EVIDENCE_REQUIRED');
    expect(result.autonomousExecutionAllowed).toBe(false);
  });

  test('requires qualified review for Islamic references', () => {
    const result = logic.evaluate({
      claim: 'Reference classification',
      evidence: ['verified-source'],
      domain: 'ISLAMIC_REFERENCE',
      qualifiedReview: false
    });

    expect(result.status).toBe('FAIL_CLOSED');
    expect(result.failures).toContain(
      'QUALIFIED_SCHOLAR_REVIEW_REQUIRED'
    );
  });

  test('accepts evidence-ready non-autonomous evaluation', () => {
    const result = logic.evaluate({
      claim: 'Root contract exists',
      evidence: ['contract-hash'],
      domain: 'SOFTWARE_ARCHITECTURE',
      operatorReview: true
    });

    expect(result.status).toBe('EVIDENCE_READY');
    expect(result.autonomousExecutionAllowed).toBe(false);
  });
});
