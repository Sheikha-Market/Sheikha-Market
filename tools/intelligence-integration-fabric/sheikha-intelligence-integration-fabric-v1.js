'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RUNTIME_DIR = 'runtime/intelligence-integration-fabric/v1';
const REPORT_JSON = `${RUNTIME_DIR}/sheikha-intelligence-integration-fabric-v1-report.json`;
const REPORT_MD = `${RUNTIME_DIR}/sheikha-intelligence-integration-fabric-v1-report.md`;

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
  return requiredValues.every((item) => available.has(item));
}

function routeMounted(routes) {
  return routes.find((route) => (
    route.name === 'intelligence-integration-fabric-v1' &&
    route.mount === '/api/intelligence/integration-fabric' &&
    route.module === 'routes/intelligence-integration-fabric/status.routes.js' &&
    route.priority >= 239
  ));
}

const registry = readJson(`${RUNTIME_DIR}/sheikha-intelligence-integration-fabric-v1.json`);
const unitsRegistry = readJson(`${RUNTIME_DIR}/registries/intelligence-units-registry.json`);
const topologyRegistry = readJson(`${RUNTIME_DIR}/registries/integration-topology-registry.json`);
const sdkMap = readJson(`${RUNTIME_DIR}/registries/sdk-fabric-mcp-intelligence-map.json`);
const rootKnowledgeReport =
  readJson('runtime/root-knowledge-agentic-fabric/v1/sheikha-root-knowledge-agentic-fabric-v1-report.json');
const sdkFabricMcpReport =
  readJson('runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json');
const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');

const requiredCapabilities = [
  'generative_ai_governed_generation',
  'traditional_rag_grounded_retrieval',
  'agentic_ai_governed_planning_and_tool_use',
  'multi_agent_systems_role_bound_coordination',
  'agi_research_governance_classification',
  'asi_risk_governance_classification',
  'horizontal_intelligence_integration',
  'lateral_cross_domain_intelligence_integration',
  'vertical_stack_intelligence_integration',
  'mesh_intelligence_integration',
  'internal_runtime_intelligence_binding',
  'external_connector_readiness_binding',
  'sdk_fabric_mcp_intelligence_binding'
];

const requiredUnits = [
  'GENERATIVE_AI',
  'TRADITIONAL_RAG',
  'AGENTIC_AI',
  'MULTI_AGENT_SYSTEMS',
  'AGI_RESEARCH_GOVERNANCE',
  'ASI_RISK_GOVERNANCE'
];

const requiredTopologies = [
  'HORIZONTAL_INTEGRATION',
  'LATERAL_CROSS_DOMAIN_INTEGRATION',
  'VERTICAL_STACK_INTEGRATION',
  'MESH_INTEGRATION',
  'INTERNAL_RUNTIME_BINDING',
  'EXTERNAL_CONNECTOR_READINESS'
];

const requiredInternalBindings = [
  'root_authority_layer',
  'root_knowledge_agentic_fabric',
  'rag_retrieval_registry',
  'decision_registry_v2',
  'capability_registry_v2',
  'runtime_admission_controller',
  'runtime_drift_detector',
  'audit_and_lessons'
];

const requiredExternalReadiness = [
  'open_data_portals',
  'research_databases',
  'educational_platforms',
  'erp_systems',
  'crm_systems',
  'wms_systems',
  'tms_systems',
  'iot_platforms',
  'satellite_observation_data',
  'cloud_providers',
  'data_centers',
  'supercomputing_resources'
];

const unitNames = (unitsRegistry.units || []).map((unit) => unit.name);
const topologyNames = (topologyRegistry.topologies || []).map((topology) => topology.name);
const sdkBindingUnits = (sdkMap.intelligenceBindings || []).map((binding) => binding.unit);
const agiUnit = (unitsRegistry.units || []).find((unit) => unit.name === 'AGI_RESEARCH_GOVERNANCE');
const asiUnit = (unitsRegistry.units || []).find((unit) => unit.name === 'ASI_RISK_GOVERNANCE');
const ragUnit = (unitsRegistry.units || []).find((unit) => unit.name === 'TRADITIONAL_RAG');
const agenticUnit = (unitsRegistry.units || []).find((unit) => unit.name === 'AGENTIC_AI');
const multiAgentUnit = (unitsRegistry.units || []).find((unit) => unit.name === 'MULTI_AGENT_SYSTEMS');
const route = routeMounted(fabric.routes || []);

const dependencies = {
  rootAuthorityLayer: exists('runtime/root-authority-layer/v1/sheikha-root-authority-layer-v1.json'),
  rootKnowledgeAgenticFabric: rootKnowledgeReport.status === 'ACTIVE' &&
    rootKnowledgeReport.score === 100,
  rootKnowledgeAgenticRag: rootKnowledgeReport.checks &&
    rootKnowledgeReport.checks.ragRegistryActive === true &&
    rootKnowledgeReport.checks.ragGroundingChecksComplete === true,
  sdkFabricMcpIntegration: sdkFabricMcpReport.status === 'ACTIVE' &&
    sdkFabricMcpReport.score === 100,
  ugitAiControlPlane: exists('runtime/ugit-ai-control-plane/v1/sheikha-ugit-ai-control-plane-v1-report.json'),
  runtimeAdmissionController: exists('tools/governance/runtime-admission-controller.js'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const checks = {
  registryActive: registry.system === 'SHEIKHA_INTELLIGENCE_INTEGRATION_FABRIC_V1' &&
    registry.status === 'ACTIVE',
  capabilitiesComplete: includesAll(registry.capabilities, requiredCapabilities),
  truthfulnessPolicy: registry.truthfulness &&
    registry.truthfulness.architecture_and_readiness_only === true &&
    registry.truthfulness.no_actual_agi_claim === true &&
    registry.truthfulness.no_actual_asi_claim === true &&
    registry.truthfulness.no_consciousness_claim === true &&
    registry.truthfulness.no_superhuman_capability_claim === true &&
    registry.truthfulness.no_unrestricted_autonomy_claim === true,
  unitsRegistryActive: unitsRegistry.status === 'ACTIVE',
  unitsComplete: includesAll(unitNames, requiredUnits),
  unitsGoverned: (unitsRegistry.units || []).every((unit) =>
    unit.status === 'ACTIVE' &&
    Array.isArray(unit.requiredControls) &&
    unit.requiredControls.length >= 3
  ),
  ragTraditionalComplete: Boolean(
    ragUnit &&
    ragUnit.runtimeMode === 'GOVERNED_RETRIEVAL_AUGMENTED_GENERATION' &&
    includesAll(ragUnit.requiredControls, [
      'source_selection',
      'retrieval_policy',
      'evidence_ranking',
      'citation_metadata',
      'grounding_check'
    ])
  ),
  agenticComplete: Boolean(
    agenticUnit &&
    agenticUnit.runtimeMode === 'GOVERNED_PLANNING_AND_TOOL_USE' &&
    includesAll(agenticUnit.requiredControls, [
      'agent_plan',
      'tool_permission',
      'least_privilege',
      'human_review_for_high_impact',
      'audit'
    ])
  ),
  multiAgentComplete: Boolean(
    multiAgentUnit &&
    multiAgentUnit.runtimeMode === 'GOVERNED_MULTI_AGENT_COORDINATION' &&
    includesAll(multiAgentUnit.requiredControls, [
      'role_boundary',
      'shared_context',
      'conflict_review',
      'escalation_policy',
      'audit'
    ])
  ),
  agiAsiClaimsBlocked: Boolean(
    agiUnit &&
    agiUnit.allowed === false &&
    agiUnit.runtimeMode === 'RESEARCH_CLASSIFICATION_AND_RISK_GOVERNANCE_ONLY' &&
    asiUnit &&
    asiUnit.allowed === false &&
    asiUnit.runtimeMode === 'RISK_GOVERNANCE_CLASSIFICATION_ONLY'
  ),
  topologyActive: topologyRegistry.status === 'ACTIVE',
  topologyComplete: includesAll(topologyNames, requiredTopologies),
  meshComplete: Array.isArray(topologyRegistry.meshNodes) &&
    topologyRegistry.meshNodes.length >= 10 &&
    Array.isArray(topologyRegistry.meshEdges) &&
    topologyRegistry.meshEdges.length >= 12,
  verticalStackComplete: includesAll(topologyRegistry.verticalStack, [
    'ROOT_AUTHORITY',
    'ROOT_KNOWLEDGE_FABRIC',
    'TRADITIONAL_RAG',
    'GENERATIVE_AI',
    'AGENTIC_AI',
    'MULTI_AGENT_SYSTEMS',
    'SDK_FABRIC_MCP_GATE',
    'GOVERNANCE_REVIEW',
    'HUMAN_REVIEW_GATE',
    'AUDIT_AND_LESSONS'
  ]),
  safetyBoundariesComplete: topologyRegistry.safetyBoundaries &&
    topologyRegistry.safetyBoundaries.no_actual_agi_claim === true &&
    topologyRegistry.safetyBoundaries.no_actual_asi_claim === true &&
    topologyRegistry.safetyBoundaries.no_consciousness_claim === true &&
    topologyRegistry.safetyBoundaries.no_external_execution_without_authorization === true &&
    topologyRegistry.safetyBoundaries.no_high_impact_action_without_human_review === true,
  sdkMapActive: sdkMap.status === 'ACTIVE' &&
    sdkMap.sdkFabricMcpSystem === 'SHEIKHA_SDK_FABRIC_MCP_INTEGRATION_V1',
  sdkBindingsComplete: includesAll(sdkBindingUnits, requiredUnits),
  internalBindingsComplete: includesAll(sdkMap.internalBindings, requiredInternalBindings),
  externalReadinessComplete: includesAll(sdkMap.externalReadinessBindings, requiredExternalReadiness),
  authorizationPolicySafe: sdkMap.authorizationPolicy &&
    sdkMap.authorizationPolicy.open_data_allowed_when_license_allows === true &&
    sdkMap.authorizationPolicy.private_system_requires_contract === true &&
    sdkMap.authorizationPolicy.government_system_requires_formal_authorization === true &&
    sdkMap.authorizationPolicy.customer_environment_requires_scope === true &&
    sdkMap.authorizationPolicy.credentials_must_not_be_stored_in_git === true &&
    sdkMap.authorizationPolicy.mcp_tools_must_be_least_privilege === true,
  fabricRouteMounted: Boolean(route)
};

const missingDependencies = Object.entries(dependencies)
  .filter(([, value]) => !value)
  .map(([key]) => key);
const missingChecks = Object.entries(checks)
  .filter(([, value]) => !value)
  .map(([key]) => key);
const missing = [
  ...missingDependencies.map((item) => `dependency:${item}`),
  ...missingChecks.map((item) => `check:${item}`)
];

const report = {
  system: 'SHEIKHA_INTELLIGENCE_INTEGRATION_FABRIC_V1',
  status: missing.length === 0 ? 'ACTIVE' : 'ACTIVE_WITH_REVIEW',
  score: missing.length === 0 ? 100 : Math.max(0, 100 - missing.length * 5),
  decision: missing.length === 0
    ? 'INTELLIGENCE_INTEGRATION_FABRIC_ACTIVE_100'
    : 'INTELLIGENCE_INTEGRATION_FABRIC_REVIEW_REQUIRED',
  dependencies,
  checks,
  missing,
  missingDependencies,
  missingChecks,
  coverage: {
    capabilities: (registry.capabilities || []).length,
    intelligenceUnits: (unitsRegistry.units || []).length,
    topologies: (topologyRegistry.topologies || []).length,
    meshNodes: (topologyRegistry.meshNodes || []).length,
    meshEdges: (topologyRegistry.meshEdges || []).length,
    verticalStack: (topologyRegistry.verticalStack || []).length,
    sdkBindings: (sdkMap.intelligenceBindings || []).length,
    internalBindings: (sdkMap.internalBindings || []).length,
    externalReadinessBindings: (sdkMap.externalReadinessBindings || []).length
  },
  cycle: [
    'ROOT_AUTHORITY',
    'ROOT_KNOWLEDGE',
    'TRADITIONAL_RAG',
    'GENERATIVE_AI',
    'AGENTIC_AI',
    'MULTI_AGENT_SYSTEMS',
    'SDK_FABRIC_MCP',
    'HORIZONTAL_LATERAL_VERTICAL_MESH',
    'INTERNAL_EXTERNAL_BOUNDARIES',
    'HUMAN_REVIEW',
    'AUDIT'
  ],
  truthfulness: {
    actualAgiClaimed: false,
    actualAsiClaimed: false,
    consciousnessClaimed: false,
    superhumanCapabilityClaimed: false,
    classificationOnlyForAgiAsi: true
  },
  route: route || null,
  nextActions: [
    'Use the fabric to select the proper intelligence mode before generation, retrieval, planning, or tool invocation.',
    'Keep Traditional RAG source-traced before complex or external claims.',
    'Keep AGI and ASI as research and risk-governance classifications only.',
    'Keep SDK/Fabric/MCP tool use least-privilege and externally authorized.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

writeFile(REPORT_JSON, `${JSON.stringify(report, null, 2)}\n`);
writeFile(
  REPORT_MD,
  `# SHEIKHA_INTELLIGENCE_INTEGRATION_FABRIC_V1

## Status
- System: ${report.system}
- Status: ${report.status}
- Score: ${report.score}
- Decision: ${report.decision}

## Intelligence Units
- Generative AI
- Traditional RAG
- Agentic AI
- Multi-Agent Systems
- AGI research governance only
- ASI risk governance only

## Integration Topology
- Horizontal
- Lateral cross-domain
- Vertical stack
- Mesh
- Internal runtime binding
- External connector readiness
- SDK/Fabric/MCP binding

## Runtime Route
- \`/api/intelligence/integration-fabric/status\`

## Truthfulness
No actual AGI, ASI, consciousness, superhuman capability, unrestricted autonomy, or unauthorized external integration is claimed.

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
