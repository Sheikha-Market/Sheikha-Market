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
  engine: exists('runtime/executive-commercial-os/v1/sheikha-executive-commercial-os-v1.json'),
  digitalTwin: exists('runtime/executive-commercial-os/v1/registries/digital-twin-registry.json'),
  resourceGraph: exists('runtime/executive-commercial-os/v1/registries/global-resource-graph.json'),
  crmSalesMarketplace: exists('runtime/executive-commercial-os/v1/registries/crm-sales-marketplace.json'),
  executiveDashboards: exists('runtime/executive-commercial-os/v1/registries/executive-dashboard-map.json'),
  docs: exists('docs/executive-commercial-os/SHEIKHA-EXECUTIVE-COMMERCIAL-OS-V1.md'),
  productionLanguage: exists('runtime/sheikha-production-language/v1/sheikha-production-language-v1-report.json'),
  spaceIotMlAi: exists('runtime/space-iot-ml-ai-fabric/v1/sheikha-space-iot-ml-ai-fabric-v1-report.json'),
  logisticsPlatform: exists('runtime/logistics-market-network-platform/v1/sheikha-logistics-market-network-platform-v1-report.json'),
  advisoryServices: exists('runtime/advisory-services/v1/sheikha-advisory-services-v1-report.json'),
  resourceSources: exists('runtime/resource-source-registry/v1/sheikha-resource-source-registry-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const report = {
  system: 'SHEIKHA_EXECUTIVE_COMMERCIAL_OS_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 7) : 100,
  decision: missing.length ? 'REVIEW_EXECUTIVE_COMMERCIAL_OS_GAPS' : 'EXECUTIVE_COMMERCIAL_OS_ACTIVE_100',
  checks,
  missing,
  cycle: [
    'CUSTOMER',
    'CRM',
    'RESOURCE_GRAPH',
    'DIGITAL_TWIN',
    'MARKETPLACE',
    'SALES_PIPELINE',
    'CONTRACT',
    'EXECUTION',
    'REVENUE',
    'IMPACT'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/executive-commercial-os/v1/sheikha-executive-commercial-os-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/executive-commercial-os/v1/sheikha-executive-commercial-os-v1-report.md',
  `# SHEIKHA_EXECUTIVE_COMMERCIAL_OS_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
