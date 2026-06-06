'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RUNTIME_DIR = 'runtime/development-functions-fabric/v1';

function resolvePath(relativePath) {
  return path.join(ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(resolvePath(relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(resolvePath(relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(resolvePath(relativePath), 'utf8');
}

function writeJson(relativePath, value) {
  fs.mkdirSync(path.dirname(resolvePath(relativePath)), { recursive: true });
  fs.writeFileSync(resolvePath(relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  fs.mkdirSync(path.dirname(resolvePath(relativePath)), { recursive: true });
  fs.writeFileSync(resolvePath(relativePath), value);
}

function includesAll(items, required) {
  const values = new Set(Array.isArray(items) ? items : []);
  return required.every((item) => values.has(item));
}

const runtime = readJson(`${RUNTIME_DIR}/sheikha-development-functions-fabric-v1.json`);
const workflow = readJson(`${RUNTIME_DIR}/registries/development-workflow-registry.json`);
const sdkMap = readJson(`${RUNTIME_DIR}/registries/sdk-fabric-mcp-development-map.json`);
const extensionTools = readJson(`${RUNTIME_DIR}/registries/extension-chat-tool-registry.json`);
const fabricRoutes = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
const sdkMcpCatalog = readJson('runtime/sdk-fabric-mcp-integration/v1/registries/mcp-tool-catalog.json');
const sdkFabricMap = readJson('runtime/sdk-fabric-mcp-integration/v1/registries/sdk-fabric-map.json');
const extensionSource = exists('sheikha-vscode-extension/extension.js')
  ? readText('sheikha-vscode-extension/extension.js')
  : '';

const requiredModules = [
  'RUNTIME_CREATION',
  'REGISTRY_CREATION',
  'TOOL_CREATION',
  'ROUTE_CREATION',
  'TEST_CREATION',
  'NPM_TEST_EXECUTION',
  'LINT_EXECUTION',
  'NO_DRIFT_VERIFICATION',
  'GIT_COMMIT',
  'GIT_PUSH',
  'SDK_FABRIC_MCP_INTEGRATION',
  'EXTENSION_CHAT_TOOLS'
];

const requiredFlow = [
  'CREATE_RUNTIME',
  'CREATE_REGISTRY',
  'CREATE_TOOL',
  'CREATE_ROUTE',
  'CREATE_TESTS',
  'RUN_NPM_TEST',
  'RUN_LINT',
  'VERIFY_NO_DRIFT',
  'GIT_COMMIT',
  'GIT_PUSH'
];

const requiredMcpTools = [
  'create_runtime_contract',
  'create_registry_contract',
  'create_tool_contract',
  'create_route_contract',
  'create_tests_contract',
  'run_npm_test_gate',
  'run_lint_gate',
  'verify_no_drift_gate',
  'prepare_git_commit_gate',
  'prepare_git_push_gate'
];

const requiredButtons = [
  'Runtime',
  'Registry',
  'Tool',
  'Route',
  'Tests',
  'Test',
  'Lint',
  'Drift',
  'Commit',
  'Push'
];

const route = fabricRoutes.routes.find(
  (item) => item.name === 'development-functions-fabric-v1'
);

const dependencies = {
  runtime: exists(`${RUNTIME_DIR}/sheikha-development-functions-fabric-v1.json`),
  workflowRegistry: exists(`${RUNTIME_DIR}/registries/development-workflow-registry.json`),
  sdkFabricMcpMap: exists(`${RUNTIME_DIR}/registries/sdk-fabric-mcp-development-map.json`),
  extensionToolRegistry: exists(`${RUNTIME_DIR}/registries/extension-chat-tool-registry.json`),
  sdkFabricMcpIntegration: exists('runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json'),
  governanceGenerator: exists('runtime/governance-generator/v1/sheikha-governance-generator-v1-report.json'),
  ugitControlPlane: exists('runtime/ugit-ai-control-plane/v1/sheikha-ugit-ai-control-plane-v1-report.json'),
  extension: exists('sheikha-vscode-extension/extension.js'),
  route: exists('routes/development-functions-fabric/status.routes.js'),
  docs: exists('docs/development-functions-fabric/SHEIKHA-DEVELOPMENT-FUNCTIONS-FABRIC-V1.md'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const workflowStepNames = workflow.steps.map((step) => step.name);
const workflowMcpTools = workflow.steps.map((step) => step.mcpTool).filter(Boolean);
const workflowButtons = workflow.steps.map((step) => step.extensionButton).filter(Boolean);
const extensionRegistryButtons = extensionTools.tools.map((tool) => tool.label);

const checks = {
  runtimeActive: runtime.status === 'ACTIVE',
  modulesComplete: includesAll(runtime.modules, requiredModules),
  flowComplete: includesAll(runtime.flow, requiredFlow),
  governanceReferenceSafe: Boolean(
    runtime.governanceReference.foundation === 'QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS' &&
    runtime.governanceReference.system_is_tool_not_religious_authority === true &&
    runtime.governanceReference.human_scholar_or_specialist_review_when_required === true
  ),
  truthfulnessComplete: Boolean(
    runtime.truthfulness.no_hidden_execution &&
    runtime.truthfulness.no_secret_exposure &&
    runtime.truthfulness.no_destructive_git_without_explicit_user_request &&
    runtime.truthfulness.no_push_without_tests_or_user_override &&
    runtime.truthfulness.no_external_integration_without_authorization &&
    runtime.truthfulness.no_private_data_without_consent
  ),
  workflowRegistryActive: workflow.status === 'ACTIVE',
  workflowHasTenSteps: workflow.steps.length === 10,
  workflowFlowComplete: includesAll(workflowStepNames, requiredFlow),
  workflowMcpToolsComplete: includesAll(workflowMcpTools, requiredMcpTools),
  workflowButtonsComplete: includesAll(workflowButtons, requiredButtons),
  workflowQualityGatesComplete: includesAll(workflow.qualityGates, [
    'npm_test_passed',
    'lint_passed',
    'admission_allowed',
    'no_drift',
    'commit_created',
    'push_passed'
  ]),
  sdkFabricMcpMapActive: sdkMap.status === 'ACTIVE',
  sdkBindingsComplete: sdkMap.sdkBindings.length >= 4,
  fabricBindingMounted: Boolean(
    route &&
    route.mount === '/api/development/functions-fabric' &&
    route.module === 'routes/development-functions-fabric/status.routes.js' &&
    route.priority >= 245
  ),
  mcpContractsComplete: includesAll(sdkMap.mcpToolContracts, requiredMcpTools),
  extensionChatToolsComplete: includesAll(sdkMap.extensionChatTools, requiredButtons),
  extensionRegistryActive: extensionTools.status === 'ACTIVE',
  extensionRegistryToolsComplete: includesAll(extensionRegistryButtons, requiredButtons),
  sdkMcpCatalogContainsDevelopmentTools: includesAll(sdkMcpCatalog.tools, requiredMcpTools),
  sdkFabricTargetsDevelopmentFabric: includesAll(sdkFabricMap.fabricTargets, [
    'development_functions_fabric'
  ]),
  extensionSourceContainsToolButtons: requiredButtons.every((button) =>
    extensionSource.includes(`>${button}<`) || extensionSource.includes(`'${button}'`) || extensionSource.includes(`"${button}"`)
  )
};

const missingDependencies = Object.entries(dependencies)
  .filter(([, value]) => !value)
  .map(([key]) => key);
const missingChecks = Object.entries(checks)
  .filter(([, value]) => !value)
  .map(([key]) => key);
const missing = [...missingDependencies, ...missingChecks];

const report = {
  system: 'SHEIKHA_DEVELOPMENT_FUNCTIONS_FABRIC_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 5) : 100,
  decision: missing.length
    ? 'REVIEW_DEVELOPMENT_FUNCTIONS_FABRIC_GAPS'
    : 'DEVELOPMENT_FUNCTIONS_FABRIC_ACTIVE_100',
  dependencies,
  checks,
  missing,
  missingDependencies,
  missingChecks,
  coverage: {
    modules: runtime.modules.length,
    workflowSteps: workflow.steps.length,
    qualityGates: workflow.qualityGates.length,
    mcpToolContracts: sdkMap.mcpToolContracts.length,
    sdkBindings: sdkMap.sdkBindings.length,
    fabricBindings: sdkMap.fabricBindings.length,
    extensionChatTools: sdkMap.extensionChatTools.length,
    extensionRegistryTools: extensionTools.tools.length
  },
  cycle: requiredFlow,
  principle: 'ولا حول ولا قوة إلا بالله'
};

writeJson(`${RUNTIME_DIR}/sheikha-development-functions-fabric-v1-report.json`, report);

writeText(
  `${RUNTIME_DIR}/sheikha-development-functions-fabric-v1-report.md`,
  `# SHEIKHA_DEVELOPMENT_FUNCTIONS_FABRIC_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## دورة التطوير
${report.cycle.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## التغطية
- الوحدات: ${report.coverage.modules}
- خطوات workflow: ${report.coverage.workflowSteps}
- بوابات الجودة: ${report.coverage.qualityGates}
- أدوات MCP: ${report.coverage.mcpToolContracts}
- ربط SDK: ${report.coverage.sdkBindings}
- ربط Fabric: ${report.coverage.fabricBindings}
- أدوات الشات: ${report.coverage.extensionChatTools}

## الفحوص
${Object.entries(checks).map(([key, value]) => `- ${value ? 'PASS' : 'FAIL'} ${key}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
