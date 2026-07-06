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
  engine: exists('runtime/sheikha-developer-platform/v1/sheikha-developer-platform-v1.json'),
  studioModules: exists('runtime/sheikha-developer-platform/v1/registries/studio-modules.json'),
  ideCapabilities: exists('runtime/sheikha-developer-platform/v1/registries/ide-capabilities.json'),
  lspCapabilities: exists('runtime/sheikha-developer-platform/v1/registries/lsp-capabilities.json'),
  editorAdapters: exists('runtime/sheikha-developer-platform/v1/registries/editor-adapters.json'),
  packageManager: exists('runtime/sheikha-developer-platform/v1/registries/package-manager-commands.json'),
  route: exists('routes/sheikha-developer-platform/status.routes.js'),
  docs: exists('docs/sheikha-developer-platform/SHEIKHA-DEVELOPER-PLATFORM-V1.md'),
  sdkFabricMcp: exists('runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json'),
  productionLanguage: exists('runtime/sheikha-production-language/v1/sheikha-production-language-v1-report.json'),
  unifiedRag: exists('runtime/unified-rag-engine/v1/sheikha-unified-rag-engine-v1-report.json'),
  vectorStore: exists('runtime/vector-knowledge-store/v1/sheikha-vector-knowledge-store-v1-report.json'),
  digitalTwin: exists('runtime/digital-twin-engine-v2/v1/sheikha-digital-twin-engine-v2-report.json'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const missing = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k);

const studio = exists('runtime/sheikha-developer-platform/v1/registries/studio-modules.json')
  ? readJson('runtime/sheikha-developer-platform/v1/registries/studio-modules.json').modules
  : [];

const ide = exists('runtime/sheikha-developer-platform/v1/registries/ide-capabilities.json')
  ? readJson('runtime/sheikha-developer-platform/v1/registries/ide-capabilities.json').capabilities
  : [];

const lsp = exists('runtime/sheikha-developer-platform/v1/registries/lsp-capabilities.json')
  ? readJson('runtime/sheikha-developer-platform/v1/registries/lsp-capabilities.json').capabilities
  : [];

const adapters = exists('runtime/sheikha-developer-platform/v1/registries/editor-adapters.json')
  ? readJson('runtime/sheikha-developer-platform/v1/registries/editor-adapters.json').adapters
  : [];

const packageCommands = exists('runtime/sheikha-developer-platform/v1/registries/package-manager-commands.json')
  ? readJson('runtime/sheikha-developer-platform/v1/registries/package-manager-commands.json').commands
  : [];

const report = {
  system: 'SHEIKHA_DEVELOPER_PLATFORM_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 6) : 100,
  decision: missing.length ? 'REVIEW_SHEIKHA_DEVELOPER_PLATFORM_GAPS' : 'SHEIKHA_DEVELOPER_PLATFORM_ACTIVE_100',
  checks,
  missing,
  coverage: {
    studioModules: studio.length,
    ideCapabilities: ide.length,
    lspCapabilities: lsp.length,
    editorAdapters: adapters.length,
    packageCommands: packageCommands.length
  },
  dependencyPolicy: {
    sheikhaStudioIsPrimary: true,
    externalEditorsAreOptionalAdapters: true,
    vscodeCursorWindsurfJetbrainsTheiaNotCoreDependency: true
  },
  principle: 'ولا حول ولا قوة إلا بالله'
};

write(
  'runtime/sheikha-developer-platform/v1/sheikha-developer-platform-v1-report.json',
  JSON.stringify(report, null, 2) + '\n'
);

write(
  'runtime/sheikha-developer-platform/v1/sheikha-developer-platform-v1-report.md',
  `# SHEIKHA_DEVELOPER_PLATFORM_V1

- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
