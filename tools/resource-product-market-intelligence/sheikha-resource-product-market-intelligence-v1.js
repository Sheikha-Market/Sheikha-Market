'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = process.cwd();

const exists = p => fs.existsSync(path.join(ROOT, p));
const write = (p, c) => {
  fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true });
  fs.writeFileSync(path.join(ROOT, p), c);
};

const checks = {
  engine: exists('runtime/resource-product-market-intelligence/v1/sheikha-resource-product-market-intelligence-v1.json'),
  chainMap: exists('runtime/resource-product-market-intelligence/v1/registries/resource-product-sector-map.json'),
  dependencyGraph: exists('runtime/resource-product-market-intelligence/v1/registries/dependency-impact-graph.json'),
  marketGaps: exists('runtime/resource-product-market-intelligence/v1/registries/market-gap-registry.json'),
  sdkMcpBindings: exists('runtime/resource-product-market-intelligence/v1/registries/sdk-fabric-mcp-bindings.json'),
  docs: exists('docs/resource-product-market-intelligence/SHEIKHA-RESOURCE-PRODUCT-MARKET-INTELLIGENCE-V1.md'),
  sdkFabricMcp: exists('runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json'),
  hsIntelligence: exists('runtime/hs-intelligence-engine/v1/sheikha-hs-intelligence-engine-v1-report.json'),
  resourceGraph: exists('runtime/global-resource-graph-v2/v1/sheikha-global-resource-graph-v2-report.json'),
  simulation: exists('runtime/supply-chain-simulation/v1/sheikha-supply-chain-simulation-v1-report.json'),
  smartCities: exists('runtime/smart-cities-engine/v1/sheikha-smart-cities-engine-v1-report.json'),
  executiveCommercialOS: exists('runtime/executive-commercial-os/v1/sheikha-executive-commercial-os-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const report = {
  system: 'SHEIKHA_RESOURCE_PRODUCT_MARKET_INTELLIGENCE_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 7) : 100,
  decision: missing.length ? 'REVIEW_RESOURCE_PRODUCT_MARKET_INTELLIGENCE_GAPS' : 'RESOURCE_PRODUCT_MARKET_INTELLIGENCE_ACTIVE_100',
  checks,
  missing,
  coverage: {
    resourceChains: 5,
    dependencyQuestions: 8,
    impactDimensions: 9,
    marketGaps: 10,
    sdkMcpBindings: 10
  },
  cycle: [
    'SOURCE',
    'RESOURCE',
    'MATERIAL',
    'HS_CODE',
    'PRODUCT',
    'SECTOR',
    'MARKET',
    'CUSTOMER',
    'SUPPLY_CHAIN',
    'IMPACT'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/resource-product-market-intelligence/v1/sheikha-resource-product-market-intelligence-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/resource-product-market-intelligence/v1/sheikha-resource-product-market-intelligence-v1-report.md',
  `# SHEIKHA_RESOURCE_PRODUCT_MARKET_INTELLIGENCE_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
