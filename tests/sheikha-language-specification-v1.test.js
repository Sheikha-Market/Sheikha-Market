'use strict';

const {
  SheikhaLanguageSpecification,
  RESERVED_KEYWORDS,
  DATA_TYPES,
  GOVERNANCE_RULES,
  STANDARD_FUNCTION_CONTRACTS
} = require('../runtime/sheikha-language-stack/spec/sheikha-language-specification');

test('activates Sheikha language specification with grammar foundations and governance', () => {
  const spec = new SheikhaLanguageSpecification();
  const status = spec.getStatus();

  expect(status.status).toBe('ACTIVE_LANGUAGE_SPECIFICATION');
  expect(status.version).toBe('1.0.0');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.reservedKeywords).toEqual(RESERVED_KEYWORDS);
  expect(status.dataTypes).toEqual(DATA_TYPES);
  expect(status.governanceRules).toEqual(GOVERNANCE_RULES);
  expect(status.standardFunctionContracts).toEqual(STANDARD_FUNCTION_CONTRACTS);

  expect(status.boundaries.allFunctionsHaveContracts).toBe(true);
  expect(status.boundaries.governanceRequired).toBe(true);
});

test('standard library functions have inputs outputs preconditions and governance', () => {
  for (const fn of STANDARD_FUNCTION_CONTRACTS) {
    expect(fn.name).toBeTruthy();
    expect(fn.purpose).toBeTruthy();
    expect(Array.isArray(fn.input)).toBe(true);
    expect(Array.isArray(fn.output)).toBe(true);
    expect(Array.isArray(fn.preconditions)).toBe(true);
    expect(Array.isArray(fn.governance)).toBe(true);
  }

  expect(STANDARD_FUNCTION_CONTRACTS.find((fn) => fn.name === 'حوّل').governance)
    .toContain('no-unsafe-transformation');

  expect(STANDARD_FUNCTION_CONTRACTS.find((fn) => fn.name === 'تعافى').governance)
    .toContain('recovery-required');
});
