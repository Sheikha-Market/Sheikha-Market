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
  engine: exists('runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1.json'),
  integrationCatalog: exists('runtime/sdk-fabric-mcp-integration/v1/registries/integration-catalog.json'),
  customerEnvironmentMap: exists('runtime/sdk-fabric-mcp-integration/v1/registries/customer-environment-map.json'),
  mcpToolCatalog: exists('runtime/sdk-fabric-mcp-integration/v1/registries/mcp-tool-catalog.json'),
  sdkFabricMap: exists('runtime/sdk-fabric-mcp-integration/v1/registries/sdk-fabric-map.json'),
  docs: exists('docs/sdk-fabric-mcp-integration/SHEIKHA-SDK-FABRIC-MCP-INTEGRATION-V1.md'),
  productionLanguage: exists('runtime/sheikha-production-language/v1/sheikha-production-language-v1-report.json'),
  executiveCommercialOS: exists('runtime/executive-commercial-os/v1/sheikha-executive-commercial-os-v1-report.json'),
  spaceIotMlAi: exists('runtime/space-iot-ml-ai-fabric/v1/sheikha-space-iot-ml-ai-fabric-v1-report.json'),
  hsIntelligence: exists('runtime/hs-intelligence-engine/v1/sheikha-hs-intelligence-engine-v1-report.json'),
  resourceGraph: exists('runtime/global-resource-graph-v2/v1/sheikha-global-resource-graph-v2-report.json'),
  simulation: exists('runtime/supply-chain-simulation/v1/sheikha-supply-chain-simulation-v1-report.json'),
  smartCities: exists('runtime/smart-cities-engine/v1/sheikha-smart-cities-engine-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const report = {
  system: 'SHEIKHA_SDK_FABRIC_MCP_INTEGRATION_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 6) : 100,
  decision: missing.length ? 'REVIEW_SDK_FABRIC_MCP_INTEGRATION_GAPS' : 'SDK_FABRIC_MCP_INTEGRATION_ACTIVE_100',
  checks,
  missing,
  cycle: [
    'SDK',
    'FABRIC',
    'MCP',
    'INTEGRATION_CATALOG',
    'CUSTOMER_ENVIRONMENT',
    'OPEN_DATA_OR_AUTHORIZED_API',
    'DIGITAL_TWIN',
    'DASHBOARD',
    'PRODUCT',
    'IMPACT'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.md',
  `# SHEIKHA_SDK_FABRIC_MCP_INTEGRATION_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
