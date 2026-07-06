'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RUNTIME_DIR = 'runtime/governance-generator/v1';
const REPORT_JSON = `${RUNTIME_DIR}/sheikha-governance-generator-v1-report.json`;
const REPORT_MD = `${RUNTIME_DIR}/sheikha-governance-generator-v1-report.md`;

function resolvePath(relativePath) {
  return path.join(ROOT, relativePath);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(resolvePath(relativePath), 'utf8'));
}

function exists(relativePath) {
  return fs.existsSync(resolvePath(relativePath));
}

function writeFile(relativePath, content) {
  const fullPath = resolvePath(relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

function includesAll(values, requiredValues) {
  const available = new Set(values || []);
  return requiredValues.every((value) => available.has(value));
}

function routeMounted(routes) {
  return routes.find((route) => (
    route.name === 'governance-generator-v1' &&
    route.mount === '/api/governance/generator' &&
    route.module === 'routes/governance-generator/status.routes.js' &&
    route.priority >= 244
  ));
}

const registry = readJson(`${RUNTIME_DIR}/sheikha-governance-generator-v1.json`);
const generation = readJson(`${RUNTIME_DIR}/registries/governance-generation-registry.json`);
const policies = readJson(`${RUNTIME_DIR}/registries/governance-policy-template-registry.json`);
const sdkMap = readJson(`${RUNTIME_DIR}/registries/sdk-fabric-mcp-governance-generator-map.json`);
const earthCycle = readJson(`${RUNTIME_DIR}/registries/earth-development-governance-cycle.json`);
const questions = readJson(`${RUNTIME_DIR}/registries/user-interaction-question-registry.json`);
const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
const route = routeMounted(fabric.routes || []);

const requiredCapabilities = [
  'runtime_blueprint_generation',
  'registry_contract_generation',
  'tool_contract_generation',
  'route_contract_generation',
  'test_contract_generation',
  'report_and_documentation_generation',
  'fabric_bootstrap_route_generation',
  'sdk_fabric_mcp_binding_generation',
  'daily_operational_governance_questions',
  'permission_scoped_information_capture',
  'earth_development_cycle_governance',
  'research_result_tool_binding',
  'sheikha_lab_studio_git_hub_governance'
];

const requiredArtifactTypes = [
  'RUNTIME',
  'REGISTRY',
  'TOOL',
  'ROUTE',
  'TEST',
  'REPORT',
  'DOCUMENTATION',
  'FABRIC_BOOTSTRAP_ROUTE',
  'SDK_FABRIC_MCP_BINDING',
  'ADMISSION_POLICY'
];

const requiredTargets = [
  'SHEIKHA_LAB',
  'SHEIKHA_STUDIO',
  'SHEIKHA_GIT',
  'SHEIKHA_HUB',
  'SHEIKHA_UNIFIED_RAG_ENGINE',
  'SHEIKHA_VECTOR_KNOWLEDGE_STORE',
  'SHEIKHA_DIGITAL_TWIN_ENGINE',
  'SHEIKHA_SUPPLY_CHAIN_CONTROL_TOWER',
  'SHEIKHA_EXECUTIVE_DASHBOARD_GENERATOR',
  'SHEIKHA_MARKETPLACE_CATALOG',
  'SHEIKHA_CRM_AND_SALES_PIPELINE',
  'SHEIKHA_EARTH_DEVELOPMENT_CYCLE'
];

const requiredPolicyTemplates = [
  'purpose_transparency_and_consent',
  'role_based_access_and_board_executive_operations_separation',
  'daily_kickoff_and_end_of_day_operational_learning',
  'research_result_source_trace_and_tool_binding',
  'earth_development_no_harm_and_impact_measurement',
  'no_hidden_persuasion_or_deception',
  'sdk_fabric_mcp_least_privilege_tool_use',
  'quran_sunnah_truthfulness_itqan_shura'
];

const requiredToolContracts = [
  'generate_runtime_blueprint',
  'generate_registry_contract',
  'generate_tool_contract',
  'generate_route_contract',
  'generate_test_contract',
  'generate_governance_questions',
  'generate_research_evidence_pack',
  'generate_impact_report_blueprint',
  'bind_fabric_bootstrap_route',
  'run_admission_and_drift_gate'
];

const requiredCycle = [
  'OBSERVE_NEED_OR_ISSUE',
  'ASK_PERMISSIONED_QUESTIONS',
  'CAPTURE_ROLE_SCOPED_INFORMATION',
  'CLASSIFY_LOCAL_NATIONAL_GLOBAL_IMPACT',
  'RETRIEVE_EVIDENCE_AND_PRIOR_WORK',
  'GENERATE_GOVERNED_OPTIONS',
  'REVIEW_WITH_AUTHORIZED_DECISION_MAKERS',
  'EXECUTE_APPROVED_ACTIONS',
  'MEASURE_RESULTS_AND_IMPACT',
  'UPDATE_KNOWLEDGE_AND_CURRICULUM',
  'IMPROVE_NEXT_CYCLE'
];

const policyNames = (policies.templates || []).map((template) => template.name);

const dependencies = {
  quranSunnahGovernance: exists('runtime/quran-sunnah-governance/sheikha-quran-sunnah-governance.json'),
  rootAuthorityLayer: exists('runtime/root-authority-layer/v1/sheikha-root-authority-layer-v1.json'),
  sdkFabricMcpIntegration: exists('runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json'),
  unifiedRagEngine: exists('runtime/unified-rag-engine/v1/sheikha-unified-rag-engine-v1.json'),
  intelligenceIntegrationFabric: exists('runtime/intelligence-integration-fabric/v1/sheikha-intelligence-integration-fabric-v1-report.json'),
  agiAsiResearchScienceFabric: exists('runtime/agi-asi-research-science-fabric/v1/sheikha-agi-asi-research-science-fabric-v1-report.json'),
  ugitAiControlPlane: exists('runtime/ugit-ai-control-plane/v1/sheikha-ugit-ai-control-plane-v1-report.json'),
  runtimeAdmissionController: exists('tools/governance/runtime-admission-controller.js'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const checks = {
  registryActive: registry.system === 'SHEIKHA_GOVERNANCE_GENERATOR_V1' &&
    registry.status === 'ACTIVE',
  capabilitiesComplete: includesAll(registry.capabilities, requiredCapabilities),
  truthfulnessPolicy: registry.truthfulness &&
    registry.truthfulness.no_false_governance_claims === true &&
    registry.truthfulness.no_hidden_persuasion === true &&
    registry.truthfulness.no_private_data_without_consent === true &&
    registry.truthfulness.no_external_integration_without_authorization === true &&
    registry.truthfulness.system_is_tool_not_religious_authority === true,
  rulesComplete: registry.rules &&
    registry.rules.purpose_transparency_required === true &&
    registry.rules.role_based_access_required === true &&
    registry.rules.consent_before_information_capture === true &&
    registry.rules.source_trace_required === true &&
    registry.rules.test_required_before_activation === true,
  generationRegistryActive: generation.status === 'ACTIVE',
  artifactTypesComplete: includesAll(generation.artifactTypes, requiredArtifactTypes),
  targetSystemsComplete: includesAll(generation.targetSystems, requiredTargets),
  generationFlowComplete: (generation.generationFlow || []).length >= 15,
  qualityGatesComplete: includesAll(generation.qualityGates, [
    'truthfulness',
    'no_harm',
    'consent',
    'least_privilege',
    'source_traceability',
    'human_review',
    'tests_passed',
    'lint_passed',
    'no_drift'
  ]),
  policyTemplatesActive: policies.status === 'ACTIVE',
  policyTemplatesComplete: includesAll(policyNames, requiredPolicyTemplates),
  forbiddenPatternsSafe: includesAll(policies.forbiddenPatterns, [
    'private_data_without_consent',
    'hidden_objectives_to_manipulate_users',
    'unreviewed_high_impact_recommendations',
    'external_connector_without_authorization',
    'claim_without_source_trace'
  ]),
  sdkMapActive: sdkMap.status === 'ACTIVE' &&
    sdkMap.sdkFabricMcpSystem === 'SHEIKHA_SDK_FABRIC_MCP_INTEGRATION_V1',
  sdkToolContractsComplete: includesAll(sdkMap.mcpToolContracts, requiredToolContracts),
  sdkAuthorizationSafe: sdkMap.authorizationPolicy &&
    sdkMap.authorizationPolicy.read_only_by_default === true &&
    sdkMap.authorizationPolicy.write_requires_explicit_scope === true &&
    sdkMap.authorizationPolicy.external_connector_requires_contract_or_permission === true &&
    sdkMap.authorizationPolicy.credentials_must_not_be_stored_in_git === true &&
    sdkMap.authorizationPolicy.mcp_tools_must_be_least_privilege === true,
  earthCycleActive: earthCycle.status === 'ACTIVE',
  earthCycleComplete: includesAll(earthCycle.cycle, requiredCycle),
  earthGuardrailsSafe: earthCycle.guardrails &&
    earthCycle.guardrails.no_hidden_persuasion === true &&
    earthCycle.guardrails.consent_before_user_input === true &&
    earthCycle.guardrails.role_based_visibility === true &&
    earthCycle.guardrails.high_impact_human_review === true &&
    earthCycle.guardrails.non_muslim_users_must_not_be_coerced_or_manipulated === true,
  questionsActive: questions.status === 'ACTIVE',
  questionSetsComplete: (questions.dailyKickoffQuestions || []).length >= 6 &&
    (questions.endOfDayQuestions || []).length >= 6 &&
    (questions.researchPromptQuestions || []).length >= 6,
  permissionScopesComplete: includesAll(questions.permissionScopes, [
    'PUBLIC',
    'ROLE_INTERNAL',
    'EXECUTIVE_ONLY',
    'BOARD_ONLY',
    'CUSTOMER_AUTHORIZED',
    'SUPPLIER_AUTHORIZED',
    'RESEARCH_REVIEW_ONLY'
  ]),
  fabricRouteMounted: Boolean(route)
};

const missingDependencies = Object.entries(dependencies)
  .filter(([, ok]) => !ok)
  .map(([key]) => key);
const missingChecks = Object.entries(checks)
  .filter(([, ok]) => !ok)
  .map(([key]) => key);
const missing = [
  ...missingDependencies.map((key) => `dependency:${key}`),
  ...missingChecks.map((key) => `check:${key}`)
];

const report = {
  system: 'SHEIKHA_GOVERNANCE_GENERATOR_V1',
  status: missing.length === 0 ? 'ACTIVE' : 'ACTIVE_WITH_REVIEW',
  score: missing.length === 0 ? 100 : Math.max(0, 100 - missing.length * 5),
  decision: missing.length === 0
    ? 'GOVERNANCE_GENERATOR_ACTIVE_100'
    : 'GOVERNANCE_GENERATOR_REVIEW_REQUIRED',
  dependencies,
  checks,
  missing,
  missingDependencies,
  missingChecks,
  coverage: {
    capabilities: (registry.capabilities || []).length,
    artifactTypes: (generation.artifactTypes || []).length,
    targetSystems: (generation.targetSystems || []).length,
    generationFlowSteps: (generation.generationFlow || []).length,
    policyTemplates: (policies.templates || []).length,
    mcpToolContracts: (sdkMap.mcpToolContracts || []).length,
    fabricTargets: (sdkMap.fabricTargets || []).length,
    earthCycleSteps: (earthCycle.cycle || []).length,
    impactDimensions: (earthCycle.impactDimensions || []).length,
    dailyKickoffQuestions: (questions.dailyKickoffQuestions || []).length,
    endOfDayQuestions: (questions.endOfDayQuestions || []).length,
    researchPromptQuestions: (questions.researchPromptQuestions || []).length
  },
  cycle: [
    'INTAKE',
    'CONSENT',
    'ROLE_SCOPE',
    'SOURCE_TRACE',
    'GOVERNANCE_TEMPLATE',
    'RUNTIME',
    'REGISTRY',
    'TOOL',
    'ROUTE',
    'TEST',
    'REPORT',
    'SDK_FABRIC_MCP',
    'ADMISSION',
    'NO_DRIFT',
    'COMMIT_PUSH'
  ],
  route: route || null,
  nextActions: [
    'Use this generator to produce governed blueprints before adding new runtime layers.',
    'Keep all user questions consent-based, role-scoped, and transparent.',
    'Bind generated tools to SDK/Fabric/MCP with least privilege.',
    'Run test, lint, admission, drift, commit, and push for every generated baseline.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

writeFile(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`);
writeFile(
  REPORT_MD,
  `# SHEIKHA_GOVERNANCE_GENERATOR_V1

## Status
- System: ${report.system}
- Status: ${report.status}
- Score: ${report.score}
- Decision: ${report.decision}

## Generated Governance Scope
- Runtime
- Registry
- Tool
- Route
- Tests
- Reports
- Documentation
- Fabric route
- SDK/Fabric/MCP binding
- Admission and drift gate

## Earth Development Cycle
- Consent-based questions
- Role-scoped information
- Evidence retrieval
- Governed options
- Authorized decisions
- Impact measurement
- Knowledge and curriculum update

## Runtime Route
- \`/api/governance/generator/status\`

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
