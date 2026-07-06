'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RUNTIME_DIR = 'runtime/platform-factories/v1';

function resolvePath(relativePath) {
  return path.join(ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(resolvePath(relativePath));
}

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(resolvePath(relativePath), 'utf8'));
  } catch {
    return null;
  }
}

function write(relativePath, content) {
  fs.mkdirSync(path.dirname(resolvePath(relativePath)), { recursive: true });
  fs.writeFileSync(resolvePath(relativePath), content);
}

function hasAll(items, required) {
  return Array.isArray(items) && required.every((item) => items.includes(item));
}

const registry = readJson(`${RUNTIME_DIR}/sheikha-platform-factories-v1.json`);
const science = readJson(`${RUNTIME_DIR}/registries/science-factory.json`);
const education = readJson(`${RUNTIME_DIR}/registries/education-factory.json`);
const product = readJson(`${RUNTIME_DIR}/registries/product-factory.json`);
const impact = readJson(`${RUNTIME_DIR}/registries/impact-factory.json`);
const pipeline = readJson(`${RUNTIME_DIR}/registries/factory-pipeline-map.json`);
const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
const route = fabric?.routes?.find((item) => item.name === 'platform-factories-v1');

const factoryItems = [science, education, product, impact].filter(Boolean);
const factoryNames = factoryItems.map((item) => item.factory);

const checks = {
  registryActive: registry?.status === 'ACTIVE',
  factoriesComplete: hasAll(registry?.factories, [
    'SCIENCE_FACTORY',
    'EDUCATION_FACTORY',
    'PRODUCT_FACTORY',
    'IMPACT_FACTORY'
  ]),
  truthfulnessPolicy: Boolean(
    registry?.truthfulness?.factory_layer_is_operating_readiness &&
    registry?.truthfulness?.no_academic_accreditation_claim_without_approval &&
    registry?.truthfulness?.no_scientific_publication_claim_without_review &&
    registry?.truthfulness?.no_product_market_claim_without_launch_evidence &&
    registry?.truthfulness?.no_impact_claim_without_measurement &&
    registry?.truthfulness?.no_revenue_claim_without_payment
  ),
  factoryRegistriesActive: factoryItems.length === 4 && factoryItems.every((item) => item.status === 'ACTIVE'),
  factoryOutputsDefined: factoryItems.every((item) =>
    Array.isArray(item.outputs) && item.outputs.length >= 5
  ),
  factoryQualityGatesDefined: factoryItems.every((item) =>
    Array.isArray(item.qualityGates) && item.qualityGates.length >= 5
  ),
  factoryMetricsDefined: factoryItems.every((item) =>
    Array.isArray(item.metrics) && item.metrics.length >= 4
  ),
  scienceFactoryMapped: factoryNames.includes('SCIENCE_FACTORY'),
  educationFactoryMapped: factoryNames.includes('EDUCATION_FACTORY'),
  productFactoryMapped: factoryNames.includes('PRODUCT_FACTORY'),
  impactFactoryMapped: factoryNames.includes('IMPACT_FACTORY'),
  pipelineMapped: (pipeline?.pipeline || []).length >= 5,
  governanceFlowMapped: (pipeline?.governanceFlow || []).length >= 8,
  knowledgeEngineLinked: exists('runtime/knowledge-engine/v2/sheikha-knowledge-engine-v2-report.json'),
  customerClassificationLinked: exists('runtime/customer-classification/v1/sheikha-customer-classification-v1-report.json'),
  customerRevenueExperienceLinked: exists('runtime/customer-revenue-experience/v1/sheikha-customer-revenue-experience-v1-report.json'),
  commercialProductLayerLinked: exists('runtime/commercial-product-layer/v1/sheikha-commercial-product-layer-v1-report.json'),
  platformOperatingEnginesLinked: exists('runtime/platform-operating-engines/v1/sheikha-platform-operating-engines-v1-report.json'),
  fabricRouteMounted: Boolean(
    route &&
    route.mount === '/api/platform/factories' &&
    route.module === 'routes/platform-factories/status.routes.js'
  )
};

const missing = Object.entries(checks)
  .filter(([, ok]) => !ok)
  .map(([key]) => key);

const report = {
  system: 'SHEIKHA_PLATFORM_FACTORIES_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 5) : 100,
  decision: missing.length ? 'REVIEW_PLATFORM_FACTORIES_GAPS' : 'PLATFORM_FACTORIES_ACTIVE_100',
  checks,
  missing,
  coverage: {
    factories: factoryItems.length,
    pipelineStages: pipeline?.pipeline?.length || 0,
    governanceFlowSteps: pipeline?.governanceFlow?.length || 0,
    outputs: factoryItems.reduce((sum, item) => sum + (item.outputs?.length || 0), 0),
    qualityGates: factoryItems.reduce((sum, item) => sum + (item.qualityGates?.length || 0), 0),
    metrics: factoryItems.reduce((sum, item) => sum + (item.metrics?.length || 0), 0)
  },
  routes: [
    '/api/platform/factories/status',
    '/api/platform/factories/factories',
    '/api/platform/factories/pipeline'
  ],
  nextActions: [
    'Connect Science Factory outputs to the knowledge and decision registries.',
    'Connect Education Factory outputs to customer onboarding and role-based dashboards.',
    'Connect Product Factory outputs to customer revenue experience and commercial product sheets.',
    'Connect Impact Factory outputs to revenue impact metrics and evidence chain.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(`${RUNTIME_DIR}/sheikha-platform-factories-v1-report.json`, `${JSON.stringify(report, null, 2)}\n`);
write(
  `${RUNTIME_DIR}/sheikha-platform-factories-v1-report.md`,
  `# SHEIKHA_PLATFORM_FACTORIES_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## المصانع
- Science Factory
- Education Factory
- Product Factory
- Impact Factory

## التغطية
- المصانع: ${report.coverage.factories}
- مراحل المسار: ${report.coverage.pipelineStages}
- خطوات الحوكمة: ${report.coverage.governanceFlowSteps}
- المخرجات: ${report.coverage.outputs}
- بوابات الجودة: ${report.coverage.qualityGates}
- المقاييس: ${report.coverage.metrics}

## المسارات
${report.routes.map((item) => `- ${item}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
