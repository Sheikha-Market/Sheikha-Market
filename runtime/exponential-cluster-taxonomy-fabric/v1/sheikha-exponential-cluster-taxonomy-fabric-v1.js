'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data', 'exponential-cluster-taxonomy-fabric');

function ensureData() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function status() {
  return {
    success: true,
    system: 'SHEIKHA_EXPONENTIAL_CLUSTER_TAXONOMY_FABRIC_V1',
    status: 'ACTIVE',
    apexLevel: 52,
    role: 'ROOT_CLUSTER_PIPELINE_BRANCH_FACTORY_TAXONOMY_EXPONENTIAL_ENGINE',
    taxonomy: {
      dataTypes: ['STRUCTURED', 'SEMI_STRUCTURED', 'UNSTRUCTURED'],
      scopes: ['ROOT', 'CLUSTER', 'PIPELINE', 'BRANCH', 'FACTORY', 'CATEGORY', 'TAB'],
      growthMode: 'CALCULATION_ONLY_NOT_PREDICTION'
    },
    governance: {
      principle: 'لا ضرر ولا ضرار',
      noFuturePredictionClaim: true,
      calculationOnly: true,
      noRibaAutomation: true,
      secretsProtected: true,
      envProtected: true
    }
  };
}

function classifyNode(node = {}) {
  const rawType = String(node.type || node.dataType || '').toLowerCase();
  const content = node.content ?? node.schema ?? node.fields ?? null;

  if (rawType.includes('structured') && !rawType.includes('semi')) return 'STRUCTURED';
  if (rawType.includes('semi')) return 'SEMI_STRUCTURED';
  if (rawType.includes('unstructured')) return 'UNSTRUCTURED';

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
  const roots = Array.isArray(input.roots) ? input.roots : [];
  const growthFactor = Number(input.growthFactor || 1.618);
  const maxDepth = Number(input.maxDepth || 5);

  function visit(node, depth = 0, pathParts = []) {
    const name = String(node.name || node.id || `node-${depth}`);
    const scope = String(node.scope || (depth === 0 ? 'ROOT' : 'CATEGORY')).toUpperCase();
    const dataType = classifyNode(node);
    const children = Array.isArray(node.children) ? node.children : [];
    const nodePath = [...pathParts, name];

    const tab = {
      id: node.id || nodePath.join('/'),
      name,
      scope,
      dataType,
      depth,
      path: nodePath.join('/'),
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
      dataType: node.dataType,
      depth: node.depth,
      path: node.path,
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

  const result = {
    success: true,
    system: 'SHEIKHA_EXPONENTIAL_CLUSTER_TAXONOMY_FABRIC_V1',
    status: 'ANALYZED',
    growthFactor: Number(input.growthFactor || 1.618),
    maxDepth: Number(input.maxDepth || 5),
    totalNodes: flat.length,
    byType,
    byScope,
    totalExponentialScore: Number(flat.reduce((s, x) => s + x.exponentialScore, 0).toFixed(6)),
    totalIntegrationScore: Number(flat.reduce((s, x) => s + x.integrationScore, 0).toFixed(6)),
    tabs: flat,
    tree,
    governance: {
      calculationOnly: true,
      noFuturePredictionClaim: true,
      note: 'هذا اختبار تكاثر أسي وتصنيف وتبويب وتكامل حسابي، وليس تنبؤاً بالغيب ولا توصية مالية.'
    }
  };

  fs.writeFileSync(
    path.join(DATA_DIR, 'latest-analysis.json'),
    JSON.stringify(result, null, 2)
  );

  return result;
}

module.exports = { status, analyze, classifyNode };
