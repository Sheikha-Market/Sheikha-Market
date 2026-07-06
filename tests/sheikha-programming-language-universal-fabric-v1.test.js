'use strict';

const {
  SheikhaProgrammingLanguageUniversalFabric,
  SHEIKHA_LANGUAGE_FOUNDATIONS,
  SHEIKHA_LANGUAGE_RULES,
  SHEIKHA_LANGUAGE_FUNCTIONS,
  SOFTWARE_DOMAINS
} = require('../runtime/sheikha-programming-language-universal-fabric/sheikha-programming-language-universal-fabric');

test('activates Sheikha programming language universal fabric above data pipeline', () => {
  const fabric = new SheikhaProgrammingLanguageUniversalFabric();
  const status = fabric.getStatus();

  expect(status.status).toBe('ACTIVE_SHEIKHA_PROGRAMMING_LANGUAGE_UNIVERSAL_FABRIC');
  expect(status.layerRank).toBe('ABOVE_UNIVERSAL_DATA_PIPELINE');
  expect(status.productionReady).toBe(true);
  expect(status.governed).toBe(true);
  expect(status.audited).toBe(true);
  expect(status.ethicalSource).toBe('الكتاب والسنة');
  expect(status.principle).toBe('لا ضرر ولا ضرار');

  expect(status.foundations).toEqual(SHEIKHA_LANGUAGE_FOUNDATIONS);
  expect(status.rules).toEqual(SHEIKHA_LANGUAGE_RULES);
  expect(status.functions).toEqual(SHEIKHA_LANGUAGE_FUNCTIONS);

  expect(status.softwareDomains).toHaveLength(SOFTWARE_DOMAINS.length);
  expect(status.softwareDomains.every((x) => x.status === 'LANGUAGE_DOMAIN_READY')).toBe(true);
  expect(status.softwareDomains.every((x) => x.supportedData.includes('structured'))).toBe(true);
  expect(status.softwareDomains.every((x) => x.supportedData.includes('semi-structured'))).toBe(true);
  expect(status.softwareDomains.every((x) => x.supportedData.includes('unstructured'))).toBe(true);

  expect(status.sampleCompilation.status).toBe('INTENT_COMPILED_TO_GOVERNED_APPLICATION_BLUEPRINT');
  expect(status.boundaries.allDomainsGoverned).toBe(true);
  expect(status.boundaries.masterLogRequired).toBe(true);
});

test('compiles governed Sheikha language intent into application blueprint', () => {
  const fabric = new SheikhaProgrammingLanguageUniversalFabric();

  const compiled = fabric.compileIntent({
    name: 'نظام نادر لتحويل السجلات إلى تطبيق',
    domain: 'rare-domain-software',
    input: 'logs',
    output: 'application',
    dataClass: 'semi-structured'
  });

  expect(compiled.status).toBe('INTENT_COMPILED_TO_GOVERNED_APPLICATION_BLUEPRINT');
  expect(compiled.domain).toBe('rare-domain-software');
  expect(compiled.blueprint.functions).toContain('حوّل');
  expect(compiled.blueprint.rules).toContain('audit-required');
  expect(compiled.boundaries.noUnsafeTransformation).toBe(true);
});

test('rejects unsupported Sheikha language domain and invalid intent', () => {
  const fabric = new SheikhaProgrammingLanguageUniversalFabric();

  expect(() => fabric.activateDomain('unknown-domain'))
    .toThrow('Unsupported Sheikha software domain');

  expect(() => fabric.compileIntent({ name: 'ناقص' }))
    .toThrow('Sheikha language intent requires name and domain');
});
