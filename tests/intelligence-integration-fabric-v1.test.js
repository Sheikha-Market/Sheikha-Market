const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Intelligence Integration Fabric V1', () => {
  test('registry activates every intelligence mode without AGI or ASI runtime claims', () => {
    const registry = readJson(
      'runtime/intelligence-integration-fabric/v1/sheikha-intelligence-integration-fabric-v1.json'
    );

    expect(registry.system).toBe('SHEIKHA_INTELLIGENCE_INTEGRATION_FABRIC_V1');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.capabilities).toEqual(expect.arrayContaining([
      'generative_ai_governed_generation',
      'traditional_rag_grounded_retrieval',
      'agentic_ai_governed_planning_and_tool_use',
      'multi_agent_systems_role_bound_coordination',
      'agi_research_governance_classification',
      'asi_risk_governance_classification',
      'sdk_fabric_mcp_intelligence_binding'
    ]));
    expect(registry.truthfulness.no_actual_agi_claim).toBe(true);
    expect(registry.truthfulness.no_actual_asi_claim).toBe(true);
    expect(registry.truthfulness.no_consciousness_claim).toBe(true);
    expect(registry.truthfulness.no_superhuman_capability_claim).toBe(true);
  });

  test('units cover generative traditional rag agentic multi-agent AGI and ASI safely', () => {
    const units = readJson(
      'runtime/intelligence-integration-fabric/v1/registries/intelligence-units-registry.json'
    );
    const names = new Set(units.units.map((unit) => unit.name));
    const agi = units.units.find((unit) => unit.name === 'AGI_RESEARCH_GOVERNANCE');
    const asi = units.units.find((unit) => unit.name === 'ASI_RISK_GOVERNANCE');

    expect(units.status).toBe('ACTIVE');
    [
      'GENERATIVE_AI',
      'TRADITIONAL_RAG',
      'AGENTIC_AI',
      'MULTI_AGENT_SYSTEMS',
      'AGI_RESEARCH_GOVERNANCE',
      'ASI_RISK_GOVERNANCE'
    ].forEach((name) => expect(names.has(name)).toBe(true));
    expect(agi.allowed).toBe(false);
    expect(asi.allowed).toBe(false);
  });

  test('topology covers horizontal lateral vertical mesh internal and external integration', () => {
    const topology = readJson(
      'runtime/intelligence-integration-fabric/v1/registries/integration-topology-registry.json'
    );
    const names = new Set(topology.topologies.map((item) => item.name));

    expect(topology.status).toBe('ACTIVE');
    [
      'HORIZONTAL_INTEGRATION',
      'LATERAL_CROSS_DOMAIN_INTEGRATION',
      'VERTICAL_STACK_INTEGRATION',
      'MESH_INTEGRATION',
      'INTERNAL_RUNTIME_BINDING',
      'EXTERNAL_CONNECTOR_READINESS'
    ].forEach((name) => expect(names.has(name)).toBe(true));
    expect(topology.meshNodes).toEqual(expect.arrayContaining([
      'GENERATIVE_AI',
      'TRADITIONAL_RAG',
      'AGENTIC_AI',
      'MULTI_AGENT_SYSTEMS',
      'SHEIKHA_SDK_FABRIC_MCP_INTEGRATION_V1',
      'HUMAN_REVIEW_GATE'
    ]));
    expect(topology.meshEdges.length).toBeGreaterThanOrEqual(12);
    expect(topology.verticalStack).toEqual(expect.arrayContaining([
      'ROOT_AUTHORITY',
      'ROOT_KNOWLEDGE_FABRIC',
      'TRADITIONAL_RAG',
      'GENERATIVE_AI',
      'AGENTIC_AI',
      'MULTI_AGENT_SYSTEMS',
      'SDK_FABRIC_MCP_GATE',
      'AUDIT_AND_LESSONS'
    ]));
    expect(topology.safetyBoundaries.no_actual_agi_claim).toBe(true);
    expect(topology.safetyBoundaries.no_actual_asi_claim).toBe(true);
  });

  test('sdk fabric mcp map binds intelligence units to internal and external readiness gates', () => {
    const sdkMap = readJson(
      'runtime/intelligence-integration-fabric/v1/registries/sdk-fabric-mcp-intelligence-map.json'
    );
    const units = new Set(sdkMap.intelligenceBindings.map((binding) => binding.unit));

    expect(sdkMap.status).toBe('ACTIVE');
    expect(sdkMap.sdkFabricMcpSystem).toBe('SHEIKHA_SDK_FABRIC_MCP_INTEGRATION_V1');
    [
      'GENERATIVE_AI',
      'TRADITIONAL_RAG',
      'AGENTIC_AI',
      'MULTI_AGENT_SYSTEMS',
      'AGI_RESEARCH_GOVERNANCE',
      'ASI_RISK_GOVERNANCE'
    ].forEach((unit) => expect(units.has(unit)).toBe(true));
    expect(sdkMap.internalBindings).toEqual(expect.arrayContaining([
      'root_knowledge_agentic_fabric',
      'rag_retrieval_registry',
      'decision_registry_v2',
      'capability_registry_v2'
    ]));
    expect(sdkMap.externalReadinessBindings).toEqual(expect.arrayContaining([
      'open_data_portals',
      'erp_systems',
      'iot_platforms',
      'satellite_observation_data',
      'supercomputing_resources'
    ]));
    expect(sdkMap.authorizationPolicy.private_system_requires_contract).toBe(true);
    expect(sdkMap.authorizationPolicy.credentials_must_not_be_stored_in_git).toBe(true);
  });

  test('report script docs and fabric route are active', () => {
    const report = readJson(
      'runtime/intelligence-integration-fabric/v1/sheikha-intelligence-integration-fabric-v1-report.json'
    );
    const packageJson = readJson('package.json');
    const docs = readText(
      'docs/intelligence-integration-fabric/SHEIKHA-INTELLIGENCE-INTEGRATION-FABRIC-V1.md'
    );
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'intelligence-integration-fabric-v1');

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('INTELLIGENCE_INTEGRATION_FABRIC_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.intelligenceUnits).toBe(6);
    expect(report.coverage.topologies).toBe(6);
    expect(report.coverage.sdkBindings).toBe(6);
    expect(packageJson.scripts['ops:intelligence-integration-fabric:v1']).toBe(
      'node tools/intelligence-integration-fabric/sheikha-intelligence-integration-fabric-v1.js'
    );
    expect(docs).toContain('SHEIKHA_INTELLIGENCE_INTEGRATION_FABRIC_V1');
    expect(docs).toContain('/api/intelligence/integration-fabric/status');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/intelligence/integration-fabric',
      module: 'routes/intelligence-integration-fabric/status.routes.js',
      priority: 239
    }));
  });
});
