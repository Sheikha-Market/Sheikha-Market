const {
  classifyWarning,
  analyzeWarning,
  governWarnings
} = require('../../runtime/warning-governance/sheikha-warning-governance-fabric');

describe('Sheikha Warning Governance Fabric V1', () => {
  test('classifies dependency and configuration warnings', () => {
    expect(classifyWarning('punycode deprecated')).toBe('DEPENDENCY_DRIFT');
    expect(classifyWarning('todo-tree.ripgrep missing')).toBe('CONFIGURATION_CONTRACT');
  });

  test('governs warnings without suppression', () => {
    const result = governWarnings([
      { message: 'Unknown word Sheikha', severity: 'WARNING' }
    ]);

    expect(result.status).toBe('ACTIVE');
    expect(result.warningPolicy.doNotMinimizeWarnings).toBe(true);
    expect(result.summary.actionRequiredCount).toBe(1);
    expect(result.summary.suppressibleCount).toBe(0);
    expect(result.warnings[0].hideOrSuppress).toBe(false);
    expect(result.warnings[0].category).toBe('DICTIONARY_GOVERNANCE');
    expect(result.warnings[0].rootCause).toContain('Domain-specific');
    expect(result.warnings[0].consequences.length).toBeGreaterThan(0);
    expect(result.warnings[0].safeResolution.length).toBeGreaterThan(0);
    expect(result.rootCauseRegister[0].firstPreventionControl).toBeTruthy();
  });

  test('explains dependency drift with historical failures and safe prevention', () => {
    const result = analyzeWarning({
      message: 'punycode deprecated warning from packaged extension'
    });

    expect(result.category).toBe('DEPENDENCY_DRIFT');
    expect(result.hideOrSuppress).toBe(false);
    expect(result.historicalFailureModes.join(' ')).toContain('punycode');
    expect(result.preventionControls).toEqual(expect.arrayContaining([
      'runtime smoke test after package or Node upgrade'
    ]));
    expect(result.verification.suppressOnlyWithEvidence).toBe(true);
  });
});
