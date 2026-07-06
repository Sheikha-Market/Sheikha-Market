'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

const exists = p => fs.existsSync(path.join(ROOT, p));
const readJson = p => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
const write = (p, c) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, p), c);
};

const checks = {
  engine: exists('runtime/operational-platform-v1/v1/sheikha-operational-platform-v1.json'),
  digitalTwinAssets: exists('runtime/operational-platform-v1/v1/registries/digital-twin-assets.json'),
  controlTowerObjects: exists('runtime/operational-platform-v1/v1/registries/control-tower-objects.json'),
  dashboardGenerator: exists('runtime/operational-platform-v1/v1/registries/dashboard-generator-map.json'),
  marketplaceCatalog: exists('runtime/operational-platform-v1/v1/registries/marketplace-catalog-map.json'),
  crmSalesPipeline: exists('runtime/operational-platform-v1/v1/registries/crm-sales-pipeline-map.json'),
  route: exists('routes/operational-platform-v1/status.routes.js'),
  docs: exists('docs/operational-platform-v1/SHEIKHA-OPERATIONAL-PLATFORM-V1.md'),
  sdkFabricMcp: exists('runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json'),
  unifiedRag: exists('runtime/unified-rag-engine/v1/sheikha-unified-rag-engine-v1-report.json'),
  vectorStore: exists('runtime/vector-knowledge-store/v1/sheikha-vector-knowledge-store-v1-report.json'),
  resourceProductMarket: exists('runtime/resource-product-market-intelligence/v1/sheikha-resource-product-market-intelligence-v1-report.json'),
  governanceGenerator: exists('runtime/governance-generator/v1/sheikha-governance-generator-v1.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const digitalTwin = exists('runtime/operational-platform-v1/v1/registries/digital-twin-assets.json')
  ? readJson('runtime/operational-platform-v1/v1/registries/digital-twin-assets.json')
  : { assets: [], metrics: [] };

const controlTower = exists('runtime/operational-platform-v1/v1/registries/control-tower-objects.json')
  ? readJson('runtime/operational-platform-v1/v1/registries/control-tower-objects.json')
  : { objects: [] };

const dashboards = exists('runtime/operational-platform-v1/v1/registries/dashboard-generator-map.json')
  ? readJson('runtime/operational-platform-v1/v1/registries/dashboard-generator-map.json')
  : { dashboards: [] };

const marketplace = exists('runtime/operational-platform-v1/v1/registries/marketplace-catalog-map.json')
  ? readJson('runtime/operational-platform-v1/v1/registries/marketplace-catalog-map.json')
  : { catalog: [] };

const pipeline = exists('runtime/operational-platform-v1/v1/registries/crm-sales-pipeline-map.json')
  ? readJson('runtime/operational-platform-v1/v1/registries/crm-sales-pipeline-map.json')
  : { pipeline: [] };

const report = {
  system: 'SHEIKHA_OPERATIONAL_PLATFORM_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 6) : 100,
  decision: missing.length ? 'REVIEW_OPERATIONAL_PLATFORM_GAPS' : 'OPERATIONAL_PLATFORM_ACTIVE_100',
  checks,
  missing,
  coverage: {
    digitalTwinAssets: digitalTwin.assets.length,
    digitalTwinMetrics: digitalTwin.metrics.length,
    controlTowerObjects: controlTower.objects.length,
    dashboards: dashboards.dashboards.length,
    marketplaceCatalog: marketplace.catalog.length,
    crmSalesPipelineStages: pipeline.pipeline.length
  },
  cycle: [
    'CUSTOMER',
    'CRM',
    'MARKETPLACE',
    'RESOURCE_PRODUCT_MARKET_INTELLIGENCE',
    'DIGITAL_TWIN',
    'CONTROL_TOWER',
    'DASHBOARD',
    'DECISION',
    'EXECUTION',
    'REVENUE',
    'IMPACT'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/operational-platform-v1/v1/sheikha-operational-platform-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/operational-platform-v1/v1/sheikha-operational-platform-v1-report.md',
  `# SHEIKHA_OPERATIONAL_PLATFORM_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
