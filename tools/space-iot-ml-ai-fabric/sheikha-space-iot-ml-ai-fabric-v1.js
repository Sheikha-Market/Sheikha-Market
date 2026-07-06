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
  engine: exists('runtime/space-iot-ml-ai-fabric/v1/sheikha-space-iot-ml-ai-fabric-v1.json'),
  products: exists('runtime/space-iot-ml-ai-fabric/v1/registries/space-data-products.json'),
  pipeline: exists('runtime/space-iot-ml-ai-fabric/v1/registries/ml-iot-ai-pipeline.json'),
  clusterReadiness: exists('runtime/space-iot-ml-ai-fabric/v1/registries/cluster-readiness.json'),
  environmentMap: exists('runtime/space-iot-ml-ai-fabric/v1/registries/environment-intelligence-map.json'),
  supplyChainImpact: exists('runtime/space-iot-ml-ai-fabric/v1/registries/supply-chain-impact-map.json'),
  logisticsPlatform: exists('runtime/logistics-market-network-platform/v1/sheikha-logistics-market-network-platform-v1-report.json'),
  resourceSources: exists('runtime/resource-source-registry/v1/sheikha-resource-source-registry-v1-report.json'),
  gapClosure: exists('runtime/gap-closure-engine/v1/sheikha-gap-closure-engine-v1-report.json'),
  advisoryServices: exists('runtime/advisory-services/v1/sheikha-advisory-services-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const report = {
  system: 'SHEIKHA_SPACE_IOT_ML_AI_FABRIC_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 8) : 100,
  decision: missing.length ? 'REVIEW_SPACE_IOT_ML_AI_FABRIC_GAPS' : 'SPACE_IOT_ML_AI_FABRIC_ACTIVE_100',
  checks,
  missing,
  cycle: [
    'SPACE_OR_IOT_DATA',
    'GOVERNANCE_CHECK',
    'INGESTION',
    'ML_ANALYSIS',
    'AI_INTERPRETATION',
    'SUPPLY_CHAIN_IMPACT',
    'PRODUCT_OR_ADVISORY',
    'DASHBOARD',
    'IMPACT_MEASUREMENT'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/space-iot-ml-ai-fabric/v1/sheikha-space-iot-ml-ai-fabric-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/space-iot-ml-ai-fabric/v1/sheikha-space-iot-ml-ai-fabric-v1-report.md',
  `# SHEIKHA_SPACE_IOT_ML_AI_FABRIC_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
