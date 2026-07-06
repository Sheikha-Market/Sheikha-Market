const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Root Knowledge Agentic Fabric V1', () => {
  test('root knowledge agentic fabric is active and blocks unsupported AGI ASI claims', () => {
    const registry = readJson(
      'runtime/root-knowledge-agentic-fabric/v1/sheikha-root-knowledge-agentic-fabric-v1.json'
    );

    expect(registry.system).toBe('SHEIKHA_ROOT_KNOWLEDGE_AGENTIC_FABRIC_V1');
    expect(registry.alias).toBe('SHEIKHA_ROOT_KNOWLEDGE_FABRIC');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.capabilities).toEqual(expect.arrayContaining([
      'root_knowledge_fabric',
      'retrieval_augmented_generation',
      'governed_rag_retrieval',
      'source_grounded_generation',
      'citation_and_evidence_pack',
      'generative_ai_grounded_output',
      'agentic_planning',
      'tool_use_governance',
      'multi_agent_coordination',
      'agi_research_readiness_governance',
      'asi_research_risk_governance'
    ]));
    expect(registry.truthfulness.no_agi_claim).toBe(true);
    expect(registry.truthfulness.no_asi_claim).toBe(true);
    expect(registry.truthfulness.no_consciousness_claim).toBe(true);
  });

  test('rag registry governs retrieval grounding citations and source trace', () => {
    const rag = readJson(
      'runtime/root-knowledge-agentic-fabric/v1/registries/rag-retrieval-registry.json'
    );

    expect(rag.registry).toBe('SHEIKHA_RAG_RETRIEVAL_REGISTRY_V1');
    expect(rag.status).toBe('ACTIVE');
    expect(rag.pipeline).toEqual(expect.arrayContaining([
      'knowledge_source_selection',
      'indexed_context_retrieval',
      'evidence_ranking',
      'source_trace_validation',
      'grounded_generation',
      'citation_and_evidence_pack',
      'hallucination_risk_review'
    ]));
    expect(rag.retrievalSources.map((source) => source.source)).toEqual(expect.arrayContaining([
      'SHEIKHA_KNOWLEDGE_ENGINE_V2',
      'SHEIKHA_FEDERATED_KNOWLEDGE_AND_REASONING_FABRIC',
      'SHEIKHA_DATABASE_KNOWLEDGE_ENGINE_V1',
      'SHEIKHA_DECISION_REGISTRY_V2',
      'SHEIKHA_CAPABILITY_REGISTRY_V2',
      'SHEIKHA_SDK_FABRIC_MCP_INTEGRATION_V1'
    ]));
    expect(rag.retrievalPolicies.source_required_before_generation).toBe(true);
    expect(rag.retrievalPolicies.minimum_evidence_items).toBeGreaterThanOrEqual(2);
    expect(rag.retrievalPolicies.citation_metadata_required).toBe(true);
    expect(rag.retrievalPolicies.source_trace_required).toBe(true);
    expect(rag.groundingChecks).toEqual(expect.arrayContaining([
      'unsupported_claims_blocked',
      'agi_asi_claims_blocked',
      'human_gate_applied_when_required'
    ]));
    expect(rag.truthfulness.no_agi_claim).toBe(true);
    expect(rag.truthfulness.no_asi_claim).toBe(true);
  });

  test('intelligence levels cover generative agentic multi agent AGI and ASI safely', () => {
    const levels = readJson(
      'runtime/root-knowledge-agentic-fabric/v1/registries/intelligence-levels-registry.json'
    );
    const taxonomy = readJson(
      'runtime/root-knowledge-agentic-fabric/v1/registries/agentic-taxonomy.json'
    );
    const names = new Set(levels.levels.map((level) => level.name));
    const taxonomyIds = new Set(taxonomy.levels.map((level) => level.id));

    expect(levels.status).toBe('ACTIVE');
    [
      'GENERATIVE_AI',
      'AGENTIC_AI',
      'MULTI_AGENT_SYSTEMS',
      'AGI',
      'ASI'
    ].forEach((name) => expect(names.has(name)).toBe(true));
    expect(levels.levels.find((level) => level.name === 'AGI').claimStatus).toBe('NO_ACTUAL_AGI_CLAIM');
    expect(levels.levels.find((level) => level.name === 'ASI').claimStatus).toBe('NO_ACTUAL_ASI_CLAIM');
    expect(levels.globalRules.no_consciousness_claim).toBe(true);
    [
      'GENERATIVE_AI',
      'AGENTIC_AI',
      'MULTI_AGENT',
      'AGI',
      'ASI'
    ].forEach((id) => expect(taxonomyIds.has(id)).toBe(true));
    expect(taxonomy.levels.find((level) => level.id === 'AGI').allowed).toBe(false);
    expect(taxonomy.levels.find((level) => level.id === 'ASI').allowed).toBe(false);
  });

  test('agentic workflow has governed agents boundaries and evidence chain', () => {
    const workflow = readJson(
      'runtime/root-knowledge-agentic-fabric/v1/registries/agentic-workflow-registry.json'
    );
    const knowledgeMap = readJson(
      'runtime/root-knowledge-agentic-fabric/v1/registries/root-knowledge-fabric-map.json'
    );

    expect(workflow.status).toBe('ACTIVE');
    expect(workflow.workflow).toEqual(expect.arrayContaining([
      'root_knowledge_lookup',
      'rag_query_decomposition',
      'rag_source_selection',
      'evidence_retrieval',
      'source_trace_validation',
      'agent_plan',
      'tool_permission_check',
      'approved_tool_execution',
      'human_review_when_required',
      'grounded_generation',
      'audit_and_lessons_update'
    ]));
    expect(workflow.agentRoles.length).toBeGreaterThanOrEqual(5);
    expect(workflow.boundaries.no_high_risk_autonomy).toBe(true);
    expect(knowledgeMap.knowledgeSources).toEqual(expect.arrayContaining([
      'SHEIKHA_KNOWLEDGE_ENGINE_V2',
      'SHEIKHA_FEDERATED_KNOWLEDGE_AND_REASONING_FABRIC',
      'SHEIKHA_SDK_FABRIC_MCP_INTEGRATION_V1'
    ]));
    expect(knowledgeMap.ragRetrieval.registry).toBe('SHEIKHA_RAG_RETRIEVAL_REGISTRY_V1');
    expect(knowledgeMap.ragRetrieval.sourceTraceRequired).toBe(true);
    expect(knowledgeMap.ragRetrieval.citationMetadataRequired).toBe(true);
    expect(knowledgeMap.evidenceChain).toEqual(expect.arrayContaining([
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
    ]));
  });

  test('root knowledge agentic fabric report has script docs and fabric route', () => {
    const report = readJson(
      'runtime/root-knowledge-agentic-fabric/v1/sheikha-root-knowledge-agentic-fabric-v1-report.json'
    );
    const packageJson = readJson('package.json');
    const docs = readText(
      'docs/root-knowledge-agentic-fabric/SHEIKHA-ROOT-KNOWLEDGE-AGENTIC-FABRIC-V1.md'
    );
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'root-knowledge-agentic-fabric-v1');

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('ROOT_KNOWLEDGE_AGENTIC_FABRIC_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.intelligenceLevels).toBe(5);
    expect(report.coverage.taxonomyLevels).toBe(5);
    expect(report.coverage.ragPipelineSteps).toBeGreaterThanOrEqual(12);
    expect(report.coverage.ragRetrievalSources).toBeGreaterThanOrEqual(6);
    expect(report.coverage.ragGroundingChecks).toBeGreaterThanOrEqual(7);
    expect(report.coverage.agentRoles).toBeGreaterThanOrEqual(5);
    expect(packageJson.scripts['ops:root-knowledge-agentic-fabric:v1']).toBe(
      'node tools/root-knowledge-agentic-fabric/sheikha-root-knowledge-agentic-fabric-v1.js'
    );
    expect(docs).toContain('SHEIKHA_ROOT_KNOWLEDGE_AGENTIC_FABRIC_V1');
    expect(docs).toContain('/api/knowledge/agentic-fabric/status');
    expect(docs).toContain('/api/knowledge/agentic-fabric/rag');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/knowledge/agentic-fabric',
      module: 'routes/root-knowledge-agentic-fabric/status.routes.js',
      priority: 238
    }));
  });
});
