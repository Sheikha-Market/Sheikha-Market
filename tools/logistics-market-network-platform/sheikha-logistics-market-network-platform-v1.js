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
  engine: exists('runtime/logistics-market-network-platform/v1/sheikha-logistics-market-network-platform-v1.json'),
  catalog: exists('runtime/logistics-market-network-platform/v1/registries/logistics-market-catalog.json'),
  networkProducts: exists('runtime/logistics-market-network-platform/v1/registries/network-design-products.json'),
  providerTypes: exists('runtime/logistics-market-network-platform/v1/registries/logistics-provider-types.json'),
  controlTower: exists('runtime/logistics-market-network-platform/v1/registries/control-tower-registry.json'),
  incotermsMap: exists('runtime/logistics-market-network-platform/v1/registries/incoterms-logistics-map.json'),
  dashboardRouting: exists('runtime/logistics-market-network-platform/v1/registries/dashboard-routing.json'),
  customerClassification: exists('runtime/customer-classification/v1/sheikha-customer-classification-v1-report.json'),
  resourceSources: exists('runtime/resource-source-registry/v1/sheikha-resource-source-registry-v1-report.json'),
  advisoryServices: exists('runtime/advisory-services/v1/sheikha-advisory-services-v1-report.json'),
  visualChain: exists('runtime/visual-chain-experience/v1/sheikha-visual-chain-experience-v1-report.json'),
  gapClosure: exists('runtime/gap-closure-engine/v1/sheikha-gap-closure-engine-v1-report.json'),
  html: exists('public/sheikha-logistics-market/index.html'),
  css: exists('public/sheikha-logistics-market/logistics-market.css'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const report = {
  system: 'SHEIKHA_LOGISTICS_MARKET_NETWORK_PLATFORM_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 6) : 100,
  decision: missing.length ? 'REVIEW_LOGISTICS_MARKET_NETWORK_PLATFORM_GAPS' : 'LOGISTICS_MARKET_NETWORK_PLATFORM_ACTIVE_100',
  checks,
  missing,
  cycle: [
    'CUSTOMER',
    'CLASSIFICATION',
    'NETWORK_DESIGN',
    'LOGISTICS_MARKET',
    'RFQ',
    'CONTRACT_OR_PO',
    'SHIPMENT',
    'CONTROL_TOWER',
    'SLA',
    'INVOICE',
    'PAYMENT',
    'IMPACT'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/logistics-market-network-platform/v1/sheikha-logistics-market-network-platform-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/logistics-market-network-platform/v1/sheikha-logistics-market-network-platform-v1-report.md',
  `# SHEIKHA_LOGISTICS_MARKET_NETWORK_PLATFORM_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
