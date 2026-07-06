'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data', 'exponential-cluster-taxonomy-fabric');

const DEFAULT_CLUSTER_ROOTS = [
  {
    id: 'SHEIKHA_ROOT_LANGUAGE_CLUSTER_CHAIN',
    name: 'Sheikha Root Language Cluster Chain',
    scope: 'ROOT',
    boundary: 'INTERNAL',
    type: 'semi_structured',
    category: 'language',
    content: 'arabic-first programming and markup clusters governed by Quran and Sunnah values',
    children: [
      {
        id: 'SHEIKHA_ARABIC_PROGRAMMING_LANGUAGE_CLUSTER',
        name: 'Arabic Programming Language Cluster',
        scope: 'CLUSTER',
        boundary: 'INTERNAL',
        category: 'programming-language',
        schema: {
          grammar: 'arabic-first',
          commands: ['activate', 'classify', 'verify', 'route'],
          review: 'human_approval_for_critical_actions'
        },
        children: [
          { id: 'parser', name: 'Parser Tab', scope: 'TAB', type: 'structured', fields: ['token', 'syntax', 'intent'] },
          { id: 'compiler', name: 'Compiler Tab', scope: 'TAB', type: 'structured', fields: ['semantic', 'type', 'artifact'] },
          { id: 'runtime', name: 'Runtime Tab', scope: 'TAB', type: 'semi_structured', content: 'route=runtime; guard=true' }
        ]
      },
      {
        id: 'SHEIKHA_ARABIC_MARKUP_LANGUAGE_CLUSTER',
        name: 'Arabic Markup Language Cluster',
        scope: 'CLUSTER',
        boundary: 'INTERNAL',
        category: 'markup-language',
        content: '<شيخة><قسم اسم="الحوكمة">توثيق وتشغيل</قسم></شيخة>',
        children: [
          { id: 'document', name: 'Document Tab', scope: 'TAB', type: 'semi_structured', content: '<وثيقة/>' },
          { id: 'schema', name: 'Schema Tab', scope: 'TAB', type: 'structured', schema: { tags: true, attributes: true } },
          { id: 'rendering', name: 'Rendering Tab', scope: 'TAB', type: 'unstructured', content: 'عرض عربي إنساني قابل للمراجعة' }
        ]
      }
    ]
  },
  {
    id: 'SHEIKHA_UGIT_PRODUCTION_CLUSTER_CHAIN',
    name: 'UGIT Production Cluster Chain',
    scope: 'ROOT',
    boundary: 'INTERNAL',
    type: 'structured',
    category: 'production',
    fields: ['supply_chain', 'logistics', 'industry', 'energy', 'mining', 'petroleum', 'storage'],
    children: [
      { id: 'supply-chain', name: 'Supply Chain Factory', scope: 'FACTORY', category: 'supply-chain', type: 'structured', fields: ['supplier', 'inventory', 'shipment'] },
      { id: 'logistics', name: 'Logistics Factory', scope: 'FACTORY', category: 'logistics', type: 'semi_structured', content: 'shipment:route=multi-modal; status=tracked' },
      { id: 'manufacturing', name: 'Manufacturing Factory', scope: 'FACTORY', category: 'manufacturing', schema: { productionLine: true, qualityGate: true } },
      { id: 'energy', name: 'Energy Factory', scope: 'FACTORY', category: 'energy', type: 'structured', fields: ['source', 'storage', 'grid'] },
      { id: 'mining', name: 'Mining And Minerals Factory', scope: 'FACTORY', category: 'mining-minerals', type: 'semi_structured', content: 'ore=classified; safety=required' },
      { id: 'petroleum', name: 'Petroleum Factory', scope: 'FACTORY', category: 'petroleum', type: 'structured', fields: ['upstream', 'midstream', 'downstream'] },
      { id: 'space-production', name: 'Space Production Supply Chain', scope: 'BRANCH', category: 'space-production', type: 'unstructured', content: 'concept registry for space production and logistics integration' }
    ]
  },
  {
    id: 'SHEIKHA_INTERNAL_EXTERNAL_SYSTEM_CLUSTER_CHAIN',
    name: 'Internal External System Cluster Chain',
    scope: 'ROOT',
    boundary: 'INTERNAL',
    type: 'structured',
    category: 'system-of-systems',
    children: [
      {
        id: 'internal-runtime',
        name: 'Internal Runtime Systems',
        scope: 'CLUSTER',
        boundary: 'INTERNAL',
        category: 'internal-systems',
        fields: ['runtime', 'governance', 'memory', 'observability']
      },
      {
        id: 'external-connectors',
        name: 'External Connector Systems',
        scope: 'CLUSTER',
        boundary: 'EXTERNAL',
        category: 'external-systems',
        content: 'hostinger, github, cloud, ide, logistics connectors; authorization required'
      }
    ]
  }
];

function ensureData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function buildDefaultRoots() {
  return JSON.parse(JSON.stringify(DEFAULT_CLUSTER_ROOTS));
}

function status() {
  return {
    success: true,
    system: 'SHEIKHA_EXPONENTIAL_CLUSTER_TAXONOMY_FABRIC_V1',
    status: 'ACTIVE',
    apexLevel: 65,
    role: 'ROOT_CLUSTER_PIPELINE_BRANCH_FACTORY_TAXONOMY_EXPONENTIAL_ENGINE',
    taxonomy: {
      dataTypes: ['STRUCTURED', 'SEMI_STRUCTURED', 'UNSTRUCTURED'],
      scopes: ['ROOT', 'CLUSTER', 'PIPELINE', 'BRANCH', 'FACTORY', 'CATEGORY', 'TAB'],
      boundaries: ['INTERNAL', 'EXTERNAL'],
      growthMode: 'CALCULATION_ONLY_NOT_PREDICTION',
      defaultRoots: DEFAULT_CLUSTER_ROOTS.length
    },
    clusterChains: {
      rootToClusterPipeline: true,
      branchFactoryCategoryTabs: true,
      internalExternalSystems: true,
      arabicProgrammingLanguage: true,
      arabicMarkupLanguage: true,
      productionSupplyChainLogisticsIndustry: true
    },
    tabIntegrationPolicy: {
      everyNodeHasPath: true,
      everyTabClassified: true,
      integrationKeysRequired: true,
      testBeforePromotion: true
    },
    governance: {
      principle: 'لا ضرر ولا ضرار',
      noFuturePredictionClaim: true,
      calculationOnly: true,
      noRibaAutomation: true,
      secretsProtected: true,
      envProtected: true,
      quranSunnahValues: true,
      tawhid: 'وحدها لله',
      noUnsupportedExternalAuthorityClaim: true
    }
  };
}

function classifyNode(node = {}) {
  const rawType = String(node.type || node.dataType || '').toLowerCase();
  const content = node.content ?? node.schema ?? node.fields ?? null;

  if (rawType.includes('semi')) return 'SEMI_STRUCTURED';
  if (rawType.includes('unstructured')) return 'UNSTRUCTURED';
  if (rawType.includes('structured')) return 'STRUCTURED';

  if (Array.isArray(node.fields) || node.schema || (content && typeof content === 'object' && !Array.isArray(content))) {
    return 'STRUCTURED';
  }

  if (typeof content === 'string') {
    if (/^\s*[{[]/.test(content) || /[:=]/.test(content)) return 'SEMI_STRUCTURED';
    return 'UNSTRUCTURED';
  }

  return 'UNSTRUCTURED';
}

function compoundScore(base, factor, depth) {
  const b = Math.max(0, Number(base || 1));
  const f = Math.max(0, Number(factor || 1));
  const d = Math.max(0, Number(depth || 0));
  return Number((b * Math.pow(f, d)).toFixed(6));
}

function buildTree(input = {}) {
  const roots = Array.isArray(input.roots) && input.roots.length
    ? input.roots
    : buildDefaultRoots();
  const growthFactor = Number(input.growthFactor || 1.618);
  const maxDepth = Number(input.maxDepth || 5);

  function visit(node, depth = 0, pathParts = []) {
    const name = String(node.name || node.id || `node-${depth}`);
    const scope = String(node.scope || (depth === 0 ? 'ROOT' : 'CATEGORY')).toUpperCase();
    const boundary = String(node.boundary || node.systemBoundary || 'INTERNAL').toUpperCase();
    const category = String(node.category || scope.toLowerCase());
    const dataType = classifyNode(node);
    const children = Array.isArray(node.children) ? node.children : [];
    const nodePath = [...pathParts, name];

    const tab = {
      id: node.id || nodePath.join('/'),
      name,
      scope,
      boundary,
      category,
      dataType,
      depth,
      path: nodePath.join('/'),
      tab: `${scope}:${category}:${dataType}`,
      baseWeight: Number(node.weight || 1),
      exponentialScore: compoundScore(node.weight || 1, growthFactor, depth),
      integrationKeys: children.map((x) => String(x.name || x.id || 'child')),
      children: depth < maxDepth ? children.map((child) => visit(child, depth + 1, nodePath)) : []
    };

    tab.integrationScore = Number((
      tab.children.reduce((sum, x) => sum + x.exponentialScore, 0) + tab.exponentialScore
    ).toFixed(6));

    return tab;
  }

  return roots.map((root) => visit(root));
}

function flatten(nodes = [], out = []) {
  for (const node of nodes) {
    out.push({
      id: node.id,
      name: node.name,
      scope: node.scope,
      boundary: node.boundary,
      category: node.category,
      dataType: node.dataType,
      depth: node.depth,
      path: node.path,
      tab: node.tab,
      exponentialScore: node.exponentialScore,
      integrationScore: node.integrationScore
    });
    flatten(node.children || [], out);
  }
  return out;
}

function analyze(input = {}) {
  ensureData();

  const tree = buildTree(input);
  const flat = flatten(tree);
  const byType = flat.reduce((acc, x) => {
    acc[x.dataType] = (acc[x.dataType] || 0) + 1;
    return acc;
  }, {});

  const byScope = flat.reduce((acc, x) => {
    acc[x.scope] = (acc[x.scope] || 0) + 1;
    return acc;
  }, {});

  const byBoundary = flat.reduce((acc, x) => {
    acc[x.boundary] = (acc[x.boundary] || 0) + 1;
    return acc;
  }, {});

  const integrationEdges = flat.reduce((sum, node) => {
    const match = tree.length ? findNodeById(tree, node.id) : null;
    return sum + (match?.integrationKeys?.length || 0);
  }, 0);

  const result = {
    success: true,
    system: 'SHEIKHA_EXPONENTIAL_CLUSTER_TAXONOMY_FABRIC_V1',
    status: 'ANALYZED',
    growthFactor: Number(input.growthFactor || 1.618),
    maxDepth: Number(input.maxDepth || 5),
    totalNodes: flat.length,
    byType,
    byScope,
    byBoundary,
    totalExponentialScore: Number(flat.reduce((s, x) => s + x.exponentialScore, 0).toFixed(6)),
    totalIntegrationScore: Number(flat.reduce((s, x) => s + x.integrationScore, 0).toFixed(6)),
    tabIntegration: {
      integrationEdges,
      allTabsHavePath: flat.every((x) => Boolean(x.path)),
      allTabsClassified: flat.every((x) => Boolean(x.dataType && x.scope && x.boundary)),
      internalExternalConnected: Boolean(byBoundary.INTERNAL && byBoundary.EXTERNAL),
      rootsToFactoriesPresent: Boolean(byScope.ROOT && byScope.FACTORY)
    },
    tabs: flat,
    tree,
    governance: {
      calculationOnly: true,
      noFuturePredictionClaim: true,
      quranSunnahValues: true,
      tawhid: 'وحدها لله',
      note: 'هذا اختبار تكاثر أسي وتصنيف وتبويب وتكامل حسابي، وليس تنبؤاً بالغيب ولا توصية مالية.'
    }
  };

  fs.writeFileSync(
    path.join(DATA_DIR, 'latest-analysis.json'),
    JSON.stringify(result, null, 2)
  );

  return result;
}

function findNodeById(nodes = [], id) {
  for (const node of nodes) {
    if (node.id === id) return node;
    const child = findNodeById(node.children || [], id);
    if (child) return child;
  }
  return null;
}

module.exports = {
  status,
  analyze,
  classifyNode,
  compoundScore,
  buildDefaultRoots
};
