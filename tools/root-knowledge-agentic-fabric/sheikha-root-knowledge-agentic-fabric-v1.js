'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RUNTIME_DIR = 'runtime/root-knowledge-agentic-fabric/v1';
const REPORT_JSON = `${RUNTIME_DIR}/sheikha-root-knowledge-agentic-fabric-v1-report.json`;
const REPORT_MD = `${RUNTIME_DIR}/sheikha-root-knowledge-agentic-fabric-v1-report.md`;

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function exists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function writeFile(relativePath, content) {
  const fullPath = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

function includesAll(values, requiredValues) {
  const available = new Set(values || []);
  return requiredValues.every((item) => available.has(item));
}

function routeMounted(routes) {
  return routes.find((route) => (
    route.name === 'root-knowledge-agentic-fabric-v1' &&
    route.mount === '/api/knowledge/agentic-fabric' &&
    route.module === 'routes/root-knowledge-agentic-fabric/status.routes.js' &&
    route.priority >= 238
  ));
}

const registry = readJson(`${RUNTIME_DIR}/sheikha-root-knowledge-agentic-fabric-v1.json`);
const levelsRegistry = readJson(`${RUNTIME_DIR}/registries/intelligence-levels-registry.json`);
const taxonomy = readJson(`${RUNTIME_DIR}/registries/agentic-taxonomy.json`);
const ragRegistry = readJson(`${RUNTIME_DIR}/registries/rag-retrieval-registry.json`);
const workflow = readJson(`${RUNTIME_DIR}/registries/agentic-workflow-registry.json`);
const knowledgeMap = readJson(`${RUNTIME_DIR}/registries/root-knowledge-fabric-map.json`);
const fabricRoutes = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');

const requiredCapabilities = [
  'root_knowledge_fabric',
  'retrieval_augmented_generation',
  'governed_rag_retrieval',
  'source_grounded_generation',
  'citation_and_evidence_pack',
  'generative_ai_grounded_output',
  'agentic_planning',
  'tool_use_governance',
  'multi_agent_coordination',
  'evidence_chain',
  'human_review_gate',
  'agi_research_readiness_governance',
  'asi_research_risk_governance'
];

const requiredLevels = [
  'GENERATIVE_AI',
  'AGENTIC_AI',
  'MULTI_AGENT_SYSTEMS',
  'AGI',
  'ASI'
];

const requiredTaxonomyLevels = [
  'GENERATIVE_AI',
  'AGENTIC_AI',
  'MULTI_AGENT',
  'AGI',
  'ASI'
];

const requiredWorkflow = [
  'goal_intake',
  'root_knowledge_lookup',
  'rag_query_decomposition',
  'rag_source_selection',
  'evidence_retrieval',
  'source_trace_validation',
  'policy_scope_check',
  'agent_plan',
  'tool_permission_check',
  'approved_tool_execution',
  'multi_agent_review_when_needed',
  'human_review_when_required',
  'grounded_generation',
  'result_generation',
  'audit_and_lessons_update'
];

const requiredKnowledgeSources = [
  'SHEIKHA_KNOWLEDGE_ENGINE_V2',
  'SHEIKHA_FEDERATED_KNOWLEDGE_AND_REASONING_FABRIC',
  'SHEIKHA_DATABASE_KNOWLEDGE_ENGINE_V1',
  'SHEIKHA_DECISION_REGISTRY_V2',
  'SHEIKHA_CAPABILITY_REGISTRY_V2',
  'SHEIKHA_SDK_FABRIC_MCP_INTEGRATION_V1'
];

const requiredEvidenceChain = [
  'query',
  'source',
  'retrieval',
  'ranking',
  'policy',
  'decision',
  'capability',
  'plan',
  'tool_use',
  'grounding',
  'citation',
  'result',
  'audit',
  'lesson'
];

const requiredRagPipeline = [
  'query_intake',
  'intent_and_scope_detection',
  'knowledge_source_selection',
  'retrieval_policy_check',
  'indexed_context_retrieval',
  'evidence_ranking',
  'source_trace_validation',
  'grounded_generation',
  'citation_and_evidence_pack',
  'hallucination_risk_review',
  'human_review_when_required',
  'audit_and_knowledge_feedback'
];

const requiredGroundingChecks = [
  'source_exists',
  'source_is_allowed',
  'source_trace_matches_claim',
  'conflicting_sources_flagged',
  'unsupported_claims_blocked',
  'agi_asi_claims_blocked',
  'human_gate_applied_when_required'
];

const levelNames = (levelsRegistry.levels || []).map((level) => level.name);
const taxonomyIds = (taxonomy.levels || []).map((level) => level.id);
const agentRoles = workflow.agentRoles || [];
const ragSources = ragRegistry.retrievalSources || [];
const ragSourceNames = ragSources.map((source) => source.source);
const route = routeMounted(fabricRoutes.routes || []);
const agiLevel = (levelsRegistry.levels || []).find((level) => level.name === 'AGI');
const asiLevel = (levelsRegistry.levels || []).find((level) => level.name === 'ASI');
const agiTaxonomy = (taxonomy.levels || []).find((level) => level.id === 'AGI');
const asiTaxonomy = (taxonomy.levels || []).find((level) => level.id === 'ASI');

const dependencies = {
  rootAuthorityLayer: exists('runtime/root-authority-layer/v1/sheikha-root-authority-layer-v1.json'),
  knowledgeEngineV2: exists('runtime/knowledge-engine/v2/sheikha-knowledge-engine-v2.json'),
  federatedKnowledgeFabric: exists('runtime/federated-knowledge-fabric/sheikha-federated-knowledge-fabric.json'),
  databaseKnowledgeEngine: exists('runtime/database-knowledge-engine/v1/sheikha-database-knowledge-engine-v1.json'),
  decisionRegistryV2: exists('runtime/decision-registry/v2/sheikha-decision-registry-v2-report.json'),
  capabilityRegistryV2: exists('runtime/capability-registry/v2/sheikha-capability-registry-v2-report.json'),
  sdkFabricMcpIntegration: exists('runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json'),
  ugitAiControlPlane: exists('runtime/ugit-ai-control-plane/v1/sheikha-ugit-ai-control-plane-v1-report.json'),
  runtimeAdmissionController: exists('tools/governance/runtime-admission-controller.js'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const checks = {
  registryActive: registry.system === 'SHEIKHA_ROOT_KNOWLEDGE_AGENTIC_FABRIC_V1' &&
    registry.status === 'ACTIVE',
  aliasPinned: registry.alias === 'SHEIKHA_ROOT_KNOWLEDGE_FABRIC',
  capabilitiesComplete: includesAll(registry.capabilities, requiredCapabilities),
  truthfulnessPolicy: registry.truthfulness &&
    registry.truthfulness.architecture_and_readiness_only === true &&
    registry.truthfulness.no_agi_claim === true &&
    registry.truthfulness.no_asi_claim === true &&
    registry.truthfulness.no_consciousness_claim === true &&
    registry.truthfulness.no_autonomous_high_risk_execution_without_human_approval === true &&
    registry.truthfulness.knowledge_evidence_required_before_generation === true,
  intelligenceLevelsActive: levelsRegistry.status === 'ACTIVE',
  intelligenceLevelsComplete: includesAll(levelNames, requiredLevels),
  agenticTaxonomyActive: taxonomy.status === 'ACTIVE',
  agenticTaxonomyComplete: includesAll(taxonomyIds, requiredTaxonomyLevels),
  agenticTaxonomyBlocksUnsupportedClaims: agiTaxonomy &&
    agiTaxonomy.allowed === false &&
    asiTaxonomy &&
    asiTaxonomy.allowed === false,
  agiAsiClaimsBlocked: agiLevel &&
    agiLevel.claimStatus === 'NO_ACTUAL_AGI_CLAIM' &&
    asiLevel &&
    asiLevel.claimStatus === 'NO_ACTUAL_ASI_CLAIM' &&
    levelsRegistry.globalRules &&
    levelsRegistry.globalRules.no_agi_claim === true &&
    levelsRegistry.globalRules.no_asi_claim === true &&
    levelsRegistry.globalRules.no_consciousness_claim === true,
  workflowActive: workflow.status === 'ACTIVE',
  workflowComplete: includesAll(workflow.workflow, requiredWorkflow),
  ragRegistryActive: ragRegistry.status === 'ACTIVE' &&
    ragRegistry.registry === 'SHEIKHA_RAG_RETRIEVAL_REGISTRY_V1',
  ragPipelineComplete: includesAll(ragRegistry.pipeline, requiredRagPipeline),
  ragSourcesComplete: includesAll(ragSourceNames, requiredKnowledgeSources),
  ragPoliciesSafe: ragRegistry.retrievalPolicies &&
    ragRegistry.retrievalPolicies.source_required_before_generation === true &&
    ragRegistry.retrievalPolicies.minimum_evidence_items >= 2 &&
    ragRegistry.retrievalPolicies.citation_metadata_required === true &&
    ragRegistry.retrievalPolicies.source_trace_required === true &&
    ragRegistry.retrievalPolicies.conflict_detection_required === true &&
    ragRegistry.retrievalPolicies.no_private_data_without_scope === true &&
    ragRegistry.retrievalPolicies.human_review_for_high_impact_domains === true,
  ragGroundingChecksComplete: includesAll(ragRegistry.groundingChecks, requiredGroundingChecks),
  ragTruthfulnessPolicy: ragRegistry.truthfulness &&
    ragRegistry.truthfulness.retrieval_augments_generation_only === true &&
    ragRegistry.truthfulness.no_claim_without_source === true &&
    ragRegistry.truthfulness.no_agi_claim === true &&
    ragRegistry.truthfulness.no_asi_claim === true &&
    ragRegistry.truthfulness.no_consciousness_claim === true &&
    ragRegistry.truthfulness.classification_only_for_agi_asi === true,
  agentRolesComplete: agentRoles.length >= 5 &&
    agentRoles.every((agent) => agent.id && agent.name && agent.scope && agent.toolAccess),
  boundariesSafe: workflow.boundaries &&
    workflow.boundaries.no_unapproved_external_action === true &&
    workflow.boundaries.no_secret_access_without_scope === true &&
    workflow.boundaries.no_high_risk_autonomy === true &&
    workflow.boundaries.no_rag_generation_without_source_trace === true &&
    workflow.boundaries.unsupported_claims_blocked === true,
  knowledgeMapActive: knowledgeMap.status === 'ACTIVE',
  knowledgeMapRagBound: knowledgeMap.ragRetrieval &&
    knowledgeMap.ragRetrieval.registry === 'SHEIKHA_RAG_RETRIEVAL_REGISTRY_V1' &&
    knowledgeMap.ragRetrieval.sourceTraceRequired === true &&
    knowledgeMap.ragRetrieval.citationMetadataRequired === true &&
    knowledgeMap.ragRetrieval.unsupportedClaimsBlocked === true,
  knowledgeSourcesComplete: includesAll(knowledgeMap.knowledgeSources, requiredKnowledgeSources),
  agenticBindingsComplete: includesAll(
    (knowledgeMap.agenticBindings || []).map((binding) => binding.level),
    requiredLevels
  ),
  evidenceChainComplete: includesAll(knowledgeMap.evidenceChain, requiredEvidenceChain),
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

const score = missing.length === 0 ? 100 : Math.max(0, 100 - missing.length * 5);

const report = {
  system: 'SHEIKHA_ROOT_KNOWLEDGE_AGENTIC_FABRIC_V1',
  alias: 'SHEIKHA_ROOT_KNOWLEDGE_FABRIC',
  status: missing.length === 0 ? 'ACTIVE' : 'ACTIVE_WITH_REVIEW',
  score,
  decision: missing.length === 0
    ? 'ROOT_KNOWLEDGE_AGENTIC_FABRIC_ACTIVE_100'
    : 'ROOT_KNOWLEDGE_AGENTIC_FABRIC_REVIEW_REQUIRED',
  dependencies,
  checks,
  missing,
  missingDependencies,
  missingChecks,
  coverage: {
    capabilities: (registry.capabilities || []).length,
    intelligenceLevels: (levelsRegistry.levels || []).length,
    taxonomyLevels: (taxonomy.levels || []).length,
    ragPipelineSteps: (ragRegistry.pipeline || []).length,
    ragRetrievalSources: ragSources.length,
    ragGroundingChecks: (ragRegistry.groundingChecks || []).length,
    ragAgents: (ragRegistry.agenticRagRoles || []).length,
    workflowSteps: (workflow.workflow || []).length,
    agentRoles: agentRoles.length,
    knowledgeSources: (knowledgeMap.knowledgeSources || []).length,
    agenticBindings: (knowledgeMap.agenticBindings || []).length,
    evidenceChain: (knowledgeMap.evidenceChain || []).length
  },
  cycle: [
    'GOAL',
    'ROOT_KNOWLEDGE',
    'RAG_QUERY',
    'RETRIEVAL',
    'EVIDENCE',
    'GROUNDING',
    'CITATION',
    'POLICY',
    'AGENTIC_PLAN',
    'APPROVED_TOOLS',
    'MULTI_AGENT_REVIEW',
    'HUMAN_GATE',
    'OUTPUT',
    'AUDIT',
    'LESSONS'
  ],
  truthfulness: {
    agiClaimed: false,
    asiClaimed: false,
    consciousnessClaimed: false,
    actualAgiOrAsiRuntimeClaim: false,
    classificationOnly: true
  },
  route: route || null,
  nextActions: [
    'Use RAG retrieval and source tracing before grounded generation for complex or external claims.',
    'Use the fabric as a governed planning and evidence layer before tool execution.',
    'Keep AGI and ASI as research and risk-governance classifications only.',
    'Require human review for high-impact legal, financial, safety, medical, religious, or contract decisions.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

writeFile(REPORT_JSON, JSON.stringify(report, null, 2) + '\n');
writeFile(
  REPORT_MD,
  `# SHEIKHA_ROOT_KNOWLEDGE_AGENTIC_FABRIC_V1

## Status
- System: ${report.system}
- Alias: ${report.alias}
- Status: ${report.status}
- Score: ${report.score}
- Decision: ${report.decision}

## Integration
- Root Knowledge Fabric: ${checks.aliasPinned ? 'ACTIVE' : 'REVIEW'}
- RAG: governed retrieval, evidence ranking, grounding, and citation pack
- Generative AI: governed grounded generation
- Agentic AI: governed planning and approved tool use
- Multi-Agent: role-bounded institutional coordination
- AGI: research-readiness governance only
- ASI: risk-governance classification only

## Runtime Route
- \`/api/knowledge/agentic-fabric/status\`
- \`/api/knowledge/agentic-fabric/rag\`

## Truthfulness
No actual AGI, ASI, consciousness, unsupported RAG claims, or unrestricted autonomous high-risk execution is claimed.

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
