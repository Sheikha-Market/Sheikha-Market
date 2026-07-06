'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RUNTIME_DIR = 'runtime/governed-intelligence-execution-loop/v1';

function resolve(relativePath) {
  return path.join(ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(resolve(relativePath));
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(resolve(relativePath), 'utf8'));
}

function write(relativePath, content) {
  const target = resolve(relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function includesAll(values, required) {
  const available = new Set(values || []);
  return required.every((value) => available.has(value));
}

const registry = readJson(`${RUNTIME_DIR}/sheikha-governed-intelligence-execution-loop-v1.json`);
const modes = readJson(`${RUNTIME_DIR}/registries/intelligence-mode-execution-registry.json`);
const loop = readJson(`${RUNTIME_DIR}/registries/execution-impact-loop-registry.json`);
const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
const mcpCatalog = readJson('runtime/sdk-fabric-mcp-integration/v1/registries/mcp-tool-catalog.json');
const sdkMap = readJson('runtime/sdk-fabric-mcp-integration/v1/registries/sdk-fabric-map.json');
const extension = fs.readFileSync(resolve('sheikha-vscode-extension/src/chat/sheikhaChatProvider.js'), 'utf8');
const admissionController = fs.readFileSync(resolve('tools/governance/runtime-admission-controller.js'), 'utf8');

const route = (fabric.routes || []).find((item) =>
  item.name === 'governed-intelligence-execution-loop-v1' &&
  item.mount === '/api/intelligence/execution-loop' &&
  item.module === 'routes/governed-intelligence-execution-loop/status.routes.js' &&
  item.priority === 243
);

const requiredModes = [
  'generative',
  'rag',
  'agentic',
  'multi-agent',
  'agi-research',
  'asi-research'
];
const requiredStages = [
  'DISCOVER',
  'RETRIEVE',
  'GENERATE',
  'PLAN',
  'DELEGATE',
  'AUTHORIZE',
  'EXECUTE',
  'VERIFY',
  'MEASURE',
  'LEARN',
  'IMPROVE'
];
const requiredMcpTools = [
  'generate_governed_content',
  'build_grounded_rag_request',
  'build_agentic_execution_plan',
  'coordinate_multi_agent_roles',
  'evaluate_agi_research_readiness',
  'evaluate_asi_research_risk',
  'run_intelligence_execution_impact_loop'
];

const modeNames = (modes.modes || []).map((item) => item.mode);
const stages = (loop.loop || []).map((item) => item.stage);
const dependencies = {
  intelligenceIntegrationFabric: exists('runtime/intelligence-integration-fabric/v1/sheikha-intelligence-integration-fabric-v1-report.json'),
  rootKnowledgeAgenticFabric: exists('runtime/root-knowledge-agentic-fabric/v1/sheikha-root-knowledge-agentic-fabric-v1-report.json'),
  unifiedRagEngine: exists('runtime/unified-rag-engine/v1/sheikha-unified-rag-engine-v1-report.json'),
  sdkFabricMcp: exists('runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json'),
  projectLifecycle: exists('runtime/project-lifecycle-os-v1/v1/sheikha-project-lifecycle-os-v1-report.json'),
  workflowAutomation: exists('runtime/workflow-automation-engine-v1/v1/sheikha-workflow-automation-engine-v1-report.json'),
  productionRuntime: exists('runtime/production-runtime-fabric-v1/v1/sheikha-production-runtime-fabric-v1-report.json'),
  executiveDecision: exists('runtime/executive-decision-engine-v1/v1/sheikha-executive-decision-engine-v1-report.json'),
  marketplaceOS: exists('runtime/marketplace-operating-system-v1/v1/sheikha-marketplace-operating-system-v1-report.json')
};

const checks = {
  registryActive: registry.status === 'ACTIVE',
  modesComplete: includesAll(modeNames, requiredModes),
  runtimeModesTruthful: modes.modes
    .filter((item) => ['agi-research', 'asi-research'].includes(item.mode))
    .every((item) => item.status === 'RESEARCH_ONLY' && item.actualReached === false),
  loopComplete: includesAll(stages, requiredStages),
  evidencePolicyComplete: Object.values(loop.evidencePolicy || {}).every(Boolean),
  fabricRouteMounted: Boolean(route),
  extensionModesComplete: requiredModes.every((mode) => extension.includes(`data-mode="${mode}"`)),
  mcpToolsComplete: includesAll(mcpCatalog.tools, requiredMcpTools),
  sdkFabricTargetComplete: (sdkMap.fabricTargets || []).includes('governed_intelligence_execution_loop'),
  governanceOwnershipRegistered: admissionController.includes("prefix: 'tools/governed-intelligence-execution-loop/'")
};

const missing = [
  ...Object.entries(dependencies).filter(([, value]) => !value).map(([key]) => `dependency:${key}`),
  ...Object.entries(checks).filter(([, value]) => !value).map(([key]) => `check:${key}`)
];
const score = missing.length === 0 ? 100 : Math.max(0, 100 - missing.length * 5);
const report = {
  system: registry.system,
  status: missing.length === 0 ? 'ACTIVE' : 'ACTIVE_WITH_REVIEW',
  score,
  decision: missing.length === 0
    ? 'GOVERNED_INTELLIGENCE_EXECUTION_LOOP_ACTIVE_100'
    : 'GOVERNED_INTELLIGENCE_EXECUTION_LOOP_REVIEW_REQUIRED',
  dependencies,
  checks,
  missing,
  coverage: {
    intelligenceModes: modeNames.length,
    loopStages: stages.length,
    mcpTools: requiredMcpTools.length,
    extensionModes: requiredModes.length
  },
  truthfulness: registry.truthfulness,
  route: route || null,
  principle: registry.principle
};

write(`${RUNTIME_DIR}/sheikha-governed-intelligence-execution-loop-v1-report.json`, `${JSON.stringify(report, null, 2)}\n`);
write(
  `${RUNTIME_DIR}/sheikha-governed-intelligence-execution-loop-v1-report.md`,
  `# SHEIKHA_GOVERNED_INTELLIGENCE_EXECUTION_LOOP_V1\n\n` +
  `- Status: ${report.status}\n` +
  `- Score: ${report.score}\n` +
  `- Decision: ${report.decision}\n` +
  `- Intelligence modes: ${report.coverage.intelligenceModes}\n` +
  `- Execution and impact stages: ${report.coverage.loopStages}\n\n` +
  `AGI and ASI remain research and evaluation programs; no actual AGI, ASI, consciousness, or superhuman runtime is claimed.\n\n` +
  `${report.principle}\n`
);

console.log(JSON.stringify(report, null, 2));
