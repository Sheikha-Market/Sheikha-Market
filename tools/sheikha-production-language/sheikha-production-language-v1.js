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
  engine: exists('runtime/sheikha-production-language/v1/sheikha-production-language-v1.json'),
  registry: exists('runtime/sheikha-production-language/v1/registries/production-language-registry.json'),
  mlAiIotMap: exists('runtime/sheikha-production-language/v1/registries/ml-ai-iot-integration-map.json'),
  mcpReadiness: exists('runtime/sheikha-production-language/v1/registries/mcp-readiness.json'),
  docs: exists('docs/sheikha-production-language/SHEIKHA-PRODUCTION-LANGUAGE-V1.md'),
  examples: exists('docs/sheikha-production-language/examples/hello.sheikha'),
  sdk: exists('sdk/sheikha-js/index.js'),
  apiSdk: exists('sdk/sheikha-api/index.js'),
  cli: exists('cli/sheikha/sheikha-cli.js'),
  packageManager: exists('packages/sheikha/package-manifest.json'),
  ide: exists('ide/sheikha-vscode/extension-manifest.json'),
  mcp: exists('mcp/sheikha/mcp-manifest.json'),
  spaceIotMlAi: exists('runtime/space-iot-ml-ai-fabric/v1/sheikha-space-iot-ml-ai-fabric-v1-report.json'),
  logisticsPlatform: exists('runtime/logistics-market-network-platform/v1/sheikha-logistics-market-network-platform-v1-report.json'),
  resourceSources: exists('runtime/resource-source-registry/v1/sheikha-resource-source-registry-v1-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const report = {
  system: 'SHEIKHA_PRODUCTION_LANGUAGE_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 6) : 100,
  decision: missing.length ? 'REVIEW_SHEIKHA_PRODUCTION_LANGUAGE_GAPS' : 'SHEIKHA_PRODUCTION_LANGUAGE_ACTIVE_100',
  checks,
  missing,
  cycle: [
    'SOURCE',
    'COMPILER',
    'RUNTIME',
    'SDK',
    'API_SDK',
    'CLI',
    'PACKAGE',
    'IDE',
    'MCP',
    'ML_AI_IOT',
    'PIPELINE',
    'CLUSTER_READINESS',
    'PRODUCTS'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/sheikha-production-language/v1/sheikha-production-language-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/sheikha-production-language/v1/sheikha-production-language-v1-report.md',
  `# SHEIKHA_PRODUCTION_LANGUAGE_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
