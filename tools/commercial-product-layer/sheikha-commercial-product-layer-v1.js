'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function exists(p) {
  return fs.existsSync(path.join(ROOT, p));
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
  } catch {
    return null;
  }
}

const dependencies = {
  heartCore: exists('runtime/heart-core/v1/sheikha-heart-core-report.json'),
  rootAuthorityLayer: exists('runtime/root-authority-layer/v1/sheikha-root-authority-layer-report.json'),
  knowledgeEngineV2: exists('runtime/knowledge-engine/v2/sheikha-knowledge-engine-v2-report.json'),
  decisionRegistryV2: exists('runtime/decision-registry/v2/sheikha-decision-registry-v2-report.json'),
  capabilityRegistryV2: exists('runtime/capability-registry/v2/sheikha-capability-registry-v2-report.json'),
  stabilityLayer: exists('runtime/stability-layer/v1/sheikha-stability-layer-report.json'),
  runtimeContractEnforcer: exists('runtime/runtime-contract-enforcer/v1/sheikha-runtime-contract-enforcer-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const products = readJson('runtime/commercial-product-layer/v1/registries/commercial-products-registry.json');
const readiness = readJson('runtime/commercial-product-layer/v1/registries/commercial-readiness-registry.json');

const registryChecks = {
  productsRegistry: Boolean(products && products.products && products.products.length),
  allProductsSellable: Boolean(products && products.products && products.products.every(p => p.sellable === true)),
  allProductsHaveValue: Boolean(products && products.products && products.products.every(p => p.value && p.evidence && p.commercialModels)),
  readinessRegistry: Boolean(readiness && readiness.readinessCriteria),
  noFalsePartnershipClaim: Boolean(readiness && readiness.readinessCriteria && readiness.readinessCriteria.noFalsePartnershipClaim === true),
  legalReviewRequired: Boolean(readiness && readiness.readinessCriteria && readiness.readinessCriteria.externalLegalReviewRequired === true)
};

const missingDependencies = Object.entries(dependencies).filter(([, ok]) => !ok).map(([k]) => k);
const missingRegistryChecks = Object.entries(registryChecks).filter(([, ok]) => !ok).map(([k]) => k);
const totalMissing = missingDependencies.length + missingRegistryChecks.length;

const report = {
  system: 'SHEIKHA_COMMERCIAL_PRODUCT_LAYER_V1',
  status: totalMissing ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: totalMissing ? Math.max(0, 100 - totalMissing * 8) : 100,
  decision: totalMissing ? 'REVIEW_COMMERCIAL_PRODUCT_LAYER_GAPS' : 'COMMERCIAL_PRODUCT_LAYER_ACTIVE_100',
  dependencies,
  registryChecks,
  missing: [...missingDependencies, ...missingRegistryChecks],
  coverage: {
    products: products?.products?.length || 0,
    sellableProducts: products?.products?.filter(p => p.sellable === true).length || 0,
    commercialModels: readiness?.commercialModels?.length || 0,
    proofTargets: readiness?.commercialProofTargets?.length || 0
  },
  nextActions: [
    'Activate Provider Registry V1 after Commercial Product Layer is clean.',
    'Create product sheets for Governance Engine, Stability Engine, Decision Registry, and Capability Registry.',
    'Prepare legal/IP review before external licensing or enterprise sales.',
    'Do not claim OpenAI or any company is a customer without a signed agreement.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

const outDir = path.join(ROOT, 'runtime/commercial-product-layer/v1');
fs.mkdirSync(outDir, { recursive: true });

fs.writeFileSync(
  path.join(outDir, 'sheikha-commercial-product-layer-v1-report.json'),
  JSON.stringify(report, null, 2)
);

fs.writeFileSync(
  path.join(outDir, 'sheikha-commercial-product-layer-v1-report.md'),
  `# SHEIKHA_COMMERCIAL_PRODUCT_LAYER_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## التغطية
- المنتجات: ${report.coverage.products}
- المنتجات القابلة للبيع: ${report.coverage.sellableProducts}
- نماذج البيع: ${report.coverage.commercialModels}
- مؤشرات إثبات القيمة: ${report.coverage.proofTargets}

## الفحوص
${Object.entries(dependencies).map(([k, v]) => `- ${v ? '✅' : '❌'} ${k}`).join('\n')}

## التالي
${report.nextActions.map((x, i) => `${i + 1}. ${x}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
