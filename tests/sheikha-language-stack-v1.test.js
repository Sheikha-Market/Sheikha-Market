'use strict';

const {
  SheikhaLanguageStack,
  SHEIKHA_STACK_COMPONENTS,
  SHEIKHA_TARGETS
} = require('../runtime/sheikha-language-stack/sheikha-language-stack');

test('activates full Sheikha language stack', () => {
  const stack = new SheikhaLanguageStack();
  const status = stack.getStatus();

  expect(status.status).toBe('ACTIVE_LANGUAGE_STACK');
  expect(status.layerRank).toBe('ABOVE_PROGRAMMING_LANGUAGE_UNIVERSAL_FABRIC');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);

  expect(status.components).toEqual(SHEIKHA_STACK_COMPONENTS);
  expect(status.targets).toEqual(SHEIKHA_TARGETS);
  expect(status.sample.status).toBe('COMPILED');
  expect(status.boundaries.inspectorRequired).toBe(true);
});

test('compiles Sheikha source into governed IR and generated code', () => {
  const stack = new SheikhaLanguageStack();

  const result = stack.compile('نظام:\n"تحويل السجلات إلى تطبيق"\nمصدر:\nlog', 'json');

  expect(result.status).toBe('COMPILED');
  expect(result.semantic.status).toBe('SEMANTICALLY_VALID');
  expect(result.types.status).toBe('TYPES_INFERRED');
  expect(result.ir.kind).toBe('GovernedApplicationBlueprint');
  expect(result.code.target).toBe('json');
  expect(result.code.status).toBe('CODE_GENERATED');
  expect(result.boundaries.auditRequired).toBe(true);
});

test('rejects invalid source and unsupported generation target', () => {
  const stack = new SheikhaLanguageStack();

  expect(() => stack.compile('', 'json')).toThrow('Sheikha source code is required');
  expect(() => stack.compile('نظام:\n"اختبار"', 'unknown-target'))
    .toThrow('Unsupported Sheikha code generation target');
});
