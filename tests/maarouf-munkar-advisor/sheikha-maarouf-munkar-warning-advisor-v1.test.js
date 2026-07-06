const {
  adviseWarning
} = require('../../runtime/maarouf-munkar-advisor/sheikha-maarouf-munkar-warning-advisor');

describe('Sheikha Maarouf Munkar Warning Advisor V1', () => {
  test('advises warnings through governed nasiha without suppression', () => {
    const result = adviseWarning({
      message: 'punycode deprecated warning'
    });

    expect(result.status).toBe('ACTIVE');
    expect(result.principle).toBe('AMR_BIL_MAAROOF_NAHY_ANIL_MUNKAR');
    expect(result.category).toBe('ITQAN_TECHNICAL_DEBT');
    expect(result.noCoercion).toBe(true);
    expect(result.noFatwaClaim).toBe(true);
    expect(result.noHiddenSuppression).toBe(true);
    expect(result.requiredAction).toContain('find-root-cause');
  });
});
