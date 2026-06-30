const {
  status,
  languagePlan,
  PROGRAMMING_LANGUAGE_CHAIN,
  MARKUP_LANGUAGE_CHAIN,
  INTERNAL_EXTERNAL_SYSTEM_CHAINS
} = require('../runtime/arabic-language-cluster-fabric/v91/sheikha-arabic-language-cluster-fabric-v91');

describe('Sheikha Arabic Language Cluster Fabric V91', () => {
  test('adds Sheikha programming and markup cluster chains on Arabic foundation', () => {
    const result = status();

    expect(result.system).toBe('SHEIKHA_ARABIC_LANGUAGE_CLUSTER_FABRIC_V91');
    expect(result.languageFoundation.arabicFirst).toBe(true);
    expect(result.languageFoundation.quranSunnahValues).toBe(true);
    expect(result.languageFoundation.tawhid).toBe('وحدها لله');
    expect(result.clusterChains.programmingLanguage.phases).toEqual(
      expect.arrayContaining(['SEMANTIC_ACTION_MAPPING', 'SAFE_RUNTIME_EXECUTION'])
    );
    expect(result.clusterChains.markupLanguage.phases).toEqual(
      expect.arrayContaining(['ARABIC_TAGS_AND_ATTRIBUTES', 'GOVERNANCE_ANNOTATIONS'])
    );
    expect(PROGRAMMING_LANGUAGE_CHAIN).toContain('EVIDENCE_AND_AUDIT_TRACE');
    expect(MARKUP_LANGUAGE_CHAIN).toContain('ARCHIVAL_EVIDENCE_EXPORT');
  });

  test('maps internal and external cluster chains with authorization rules', () => {
    const result = status();

    expect(result.clusterChains.internalExternalSystems.internal)
      .toEqual(expect.arrayContaining(['runtime-kernel', 'compiler', 'observability']));
    expect(result.clusterChains.internalExternalSystems.external)
      .toEqual(expect.arrayContaining(['ide-extension', 'hosting-connector', 'supply-chain-system']));
    expect(INTERNAL_EXTERNAL_SYSTEM_CHAINS.rules.internalKernelPrivate).toBe(true);
    expect(INTERNAL_EXTERNAL_SYSTEM_CHAINS.rules.externalConnectorsNeedAuthorization).toBe(true);
  });

  test('creates a language plan with classification and tab integration tests', () => {
    const plan = languagePlan({ name: 'اختبار لغة شيخة', scope: 'FULL_LANGUAGE_CLUSTER' });

    expect(plan.status).toBe('LANGUAGE_CLUSTER_PLAN_CREATED');
    expect(plan.clusterChains.programmingLanguage.dataClassification).toEqual(expect.arrayContaining([
      'STRUCTURED',
      'SEMI_STRUCTURED',
      'UNSTRUCTURED'
    ]));
    expect(plan.clusterChains.markupLanguage.tabFamilies).toEqual(expect.arrayContaining([
      'document',
      'schema',
      'governance',
      'rendering',
      'archive'
    ]));
    expect(plan.integrationTest.programmingAndMarkupUnified).toBe(true);
    expect(plan.integrationTest.internalExternalChainsMapped).toBe(true);
    expect(plan.integrationTest.structuredSemiStructuredUnstructuredCovered).toBe(true);
  });
});
