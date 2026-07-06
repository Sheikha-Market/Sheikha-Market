'use strict';

const {
  identityTerms,
  buildCivilizationalIdentity
} = require('../core/identity/sheikha-civilizational-identity-v1');

describe('Sheikha Civilizational Identity V1', () => {
  test('activates identity without images of souls', () => {
    const report = buildCivilizationalIdentity();

    expect(report.status).toBe('ACTIVE');
    expect(report.visualGovernance.noImagesOfSouls).toBe(true);
    expect(report.personality.noLivingBeingRepresentation).toBe(true);
  });

  test('replaces service with stronger mission verbs', () => {
    expect(identityTerms.replaceServiceWith).toContain('تمكين');
    expect(identityTerms.replaceServiceWith).toContain('إعمار');
    expect(identityTerms.replaceServiceWith).toContain('إتقان');
    expect(identityTerms.replaceServiceWith).toContain('إحسان');
  });
});
