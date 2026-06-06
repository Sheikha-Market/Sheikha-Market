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

  test('intelligence levels cover generative agentic multi agent AGI and ASI safely', () => {
    const levels = readJson(
      'runtime/root-knowledge-agentic-fabric/v1/registries/intelligence-levels-registry.json'
    );
    const names = new Set(levels.levels.map((level) => level.name));

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
      'evidence_retrieval',
      'agent_plan',
      'tool_permission_check',
      'approved_tool_execution',
      'human_review_when_required',
      'audit_and_lessons_update'
    ]));
    expect(workflow.agentRoles.length).toBeGreaterThanOrEqual(5);
    expect(workflow.boundaries.no_high_risk_autonomy).toBe(true);
    expect(knowledgeMap.knowledgeSources).toEqual(expect.arrayContaining([
      'SHEIKHA_KNOWLEDGE_ENGINE_V2',
      'SHEIKHA_FEDERATED_KNOWLEDGE_AND_REASONING_FABRIC',
      'SHEIKHA_SDK_FABRIC_MCP_INTEGRATION_V1'
    ]));
    expect(knowledgeMap.evidenceChain).toEqual(expect.arrayContaining([
      'source',
      'policy',
      'decision',
      'capability',
      'plan',
      'tool_use',
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
    expect(report.coverage.agentRoles).toBeGreaterThanOrEqual(5);
    expect(packageJson.scripts['ops:root-knowledge-agentic-fabric:v1']).toBe(
      'node tools/root-knowledge-agentic-fabric/sheikha-root-knowledge-agentic-fabric-v1.js'
    );
    expect(docs).toContain('SHEIKHA_ROOT_KNOWLEDGE_AGENTIC_FABRIC_V1');
    expect(docs).toContain('/api/knowledge/agentic-fabric/status');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/knowledge/agentic-fabric',
      module: 'routes/root-knowledge-agentic-fabric/status.routes.js',
      priority: 238
    }));
  });
});
