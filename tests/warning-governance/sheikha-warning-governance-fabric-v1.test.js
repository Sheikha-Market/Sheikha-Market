const {
  classifyWarning,
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
    expect(result.warnings[0].hideOrSuppress).toBe(false);
    expect(result.warnings[0].category).toBe('DICTIONARY_GOVERNANCE');
  });
});
