const {
  status,
  analyze,
  classifyNode,
  buildDefaultRoots
} = require('../runtime/exponential-cluster-taxonomy-fabric/v1/sheikha-exponential-cluster-taxonomy-fabric-v1');

describe('Sheikha Exponential Cluster Taxonomy Fabric V1', () => {
  test('activates root cluster taxonomy above branches factories categories and tabs', () => {
    const result = status();

    expect(result.system).toBe('SHEIKHA_EXPONENTIAL_CLUSTER_TAXONOMY_FABRIC_V1');
    expect(result.status).toBe('ACTIVE');
    expect(result.apexLevel).toBe(65);
    expect(result.taxonomy.dataTypes).toEqual(expect.arrayContaining([
      'STRUCTURED',
      'SEMI_STRUCTURED',
      'UNSTRUCTURED'
    ]));
    expect(result.taxonomy.scopes).toEqual(expect.arrayContaining([
      'ROOT',
      'CLUSTER',
      'BRANCH',
      'FACTORY',
      'CATEGORY',
      'TAB'
    ]));
    expect(result.clusterChains.arabicProgrammingLanguage).toBe(true);
    expect(result.clusterChains.arabicMarkupLanguage).toBe(true);
    expect(result.clusterChains.internalExternalSystems).toBe(true);
    expect(result.governance.quranSunnahValues).toBe(true);
  });

  test('classifies structured semi structured and unstructured data safely', () => {
    expect(classifyNode({ type: 'structured' })).toBe('STRUCTURED');
    expect(classifyNode({ type: 'semi_structured' })).toBe('SEMI_STRUCTURED');
    expect(classifyNode({ type: 'unstructured' })).toBe('UNSTRUCTURED');
    expect(classifyNode({ content: '{"name":"شيخة"}' })).toBe('SEMI_STRUCTURED');
    expect(classifyNode({ fields: ['name', 'status'] })).toBe('STRUCTURED');
  });

  test('analyzes default roots with exponential tabs and internal external integration', () => {
    const roots = buildDefaultRoots();
    const result = analyze({ roots, growthFactor: 2, maxDepth: 5 });

    expect(result.status).toBe('ANALYZED');
    expect(result.totalNodes).toBeGreaterThan(10);
    expect(result.byType.STRUCTURED).toBeGreaterThan(0);
    expect(result.byType.SEMI_STRUCTURED).toBeGreaterThan(0);
    expect(result.byType.UNSTRUCTURED).toBeGreaterThan(0);
    expect(result.byBoundary.INTERNAL).toBeGreaterThan(0);
    expect(result.byBoundary.EXTERNAL).toBeGreaterThan(0);
    expect(result.byScope.ROOT).toBeGreaterThan(0);
    expect(result.byScope.FACTORY).toBeGreaterThan(0);
    expect(result.totalExponentialScore).toBeGreaterThan(result.totalNodes);
    expect(result.tabIntegration.allTabsHavePath).toBe(true);
    expect(result.tabIntegration.allTabsClassified).toBe(true);
    expect(result.tabIntegration.internalExternalConnected).toBe(true);
    expect(result.tabIntegration.rootsToFactoriesPresent).toBe(true);
    expect(result.tabs.map((tab) => tab.category)).toEqual(expect.arrayContaining([
      'programming-language',
      'markup-language',
      'supply-chain',
      'space-production',
      'external-systems'
    ]));
  });
});
