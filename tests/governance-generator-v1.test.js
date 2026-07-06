const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha Governance Generator V1', () => {
  test('registry activates governed generation without hidden persuasion or private data capture', () => {
    const registry = readJson(
      'runtime/governance-generator/v1/sheikha-governance-generator-v1.json'
    );

    expect(registry.system).toBe('SHEIKHA_GOVERNANCE_GENERATOR_V1');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.capabilities).toEqual(expect.arrayContaining([
      'runtime_blueprint_generation',
      'registry_contract_generation',
      'tool_contract_generation',
      'route_contract_generation',
      'test_contract_generation',
      'sdk_fabric_mcp_binding_generation',
      'daily_operational_governance_questions',
      'earth_development_cycle_governance',
      'sheikha_lab_studio_git_hub_governance'
    ]));
    expect(registry.truthfulness.no_hidden_persuasion).toBe(true);
    expect(registry.truthfulness.no_private_data_without_consent).toBe(true);
    expect(registry.truthfulness.system_is_tool_not_religious_authority).toBe(true);
  });

  test('generation registry covers runtime registry tool route tests and Sheikha operating targets', () => {
    const generation = readJson(
      'runtime/governance-generator/v1/registries/governance-generation-registry.json'
    );

    expect(generation.status).toBe('ACTIVE');
    expect(generation.artifactTypes).toEqual(expect.arrayContaining([
      'RUNTIME',
      'REGISTRY',
      'TOOL',
      'ROUTE',
      'TEST',
      'REPORT',
      'DOCUMENTATION',
      'SDK_FABRIC_MCP_BINDING'
    ]));
    expect(generation.targetSystems).toEqual(expect.arrayContaining([
      'SHEIKHA_LAB',
      'SHEIKHA_STUDIO',
      'SHEIKHA_GIT',
      'SHEIKHA_HUB',
      'SHEIKHA_UNIFIED_RAG_ENGINE',
      'SHEIKHA_DIGITAL_TWIN_ENGINE',
      'SHEIKHA_SUPPLY_CHAIN_CONTROL_TOWER',
      'SHEIKHA_CRM_AND_SALES_PIPELINE'
    ]));
    expect(generation.qualityGates).toEqual(expect.arrayContaining([
      'truthfulness',
      'consent',
      'least_privilege',
      'tests_passed',
      'lint_passed',
      'no_drift'
    ]));
  });

  test('policy templates and earth development cycle are safe and consent based', () => {
    const policies = readJson(
      'runtime/governance-generator/v1/registries/governance-policy-template-registry.json'
    );
    const earthCycle = readJson(
      'runtime/governance-generator/v1/registries/earth-development-governance-cycle.json'
    );

    expect(policies.templates.map((template) => template.name)).toEqual(expect.arrayContaining([
      'purpose_transparency_and_consent',
      'daily_kickoff_and_end_of_day_operational_learning',
      'earth_development_no_harm_and_impact_measurement',
      'no_hidden_persuasion_or_deception',
      'sdk_fabric_mcp_least_privilege_tool_use'
    ]));
    expect(policies.forbiddenPatterns).toEqual(expect.arrayContaining([
      'private_data_without_consent',
      'hidden_objectives_to_manipulate_users',
      'external_connector_without_authorization'
    ]));
    expect(earthCycle.cycle).toEqual(expect.arrayContaining([
      'ASK_PERMISSIONED_QUESTIONS',
      'CAPTURE_ROLE_SCOPED_INFORMATION',
      'RETRIEVE_EVIDENCE_AND_PRIOR_WORK',
      'GENERATE_GOVERNED_OPTIONS',
      'MEASURE_RESULTS_AND_IMPACT',
      'UPDATE_KNOWLEDGE_AND_CURRICULUM'
    ]));
    expect(earthCycle.guardrails.no_hidden_persuasion).toBe(true);
    expect(earthCycle.guardrails.consent_before_user_input).toBe(true);
    expect(earthCycle.guardrails.non_muslim_users_must_not_be_coerced_or_manipulated).toBe(true);
  });

  test('sdk fabric mcp map and user questions are complete', () => {
    const sdkMap = readJson(
      'runtime/governance-generator/v1/registries/sdk-fabric-mcp-governance-generator-map.json'
    );
    const questions = readJson(
      'runtime/governance-generator/v1/registries/user-interaction-question-registry.json'
    );

    expect(sdkMap.sdkFabricMcpSystem).toBe('SHEIKHA_SDK_FABRIC_MCP_INTEGRATION_V1');
    expect(sdkMap.mcpToolContracts).toEqual(expect.arrayContaining([
      'generate_runtime_blueprint',
      'generate_registry_contract',
      'generate_tool_contract',
      'generate_route_contract',
      'generate_test_contract',
      'run_admission_and_drift_gate'
    ]));
    expect(sdkMap.authorizationPolicy.mcp_tools_must_be_least_privilege).toBe(true);
    expect(questions.roles).toEqual(expect.arrayContaining([
      'BOARD',
      'CEO',
      'EXECUTIVE',
      'OPERATIONS_MANAGER',
      'SUPPLIER',
      'THIRD_PARTY'
    ]));
    expect(questions.dailyKickoffQuestions.length).toBeGreaterThanOrEqual(6);
    expect(questions.endOfDayQuestions.length).toBeGreaterThanOrEqual(6);
    expect(questions.permissionScopes).toEqual(expect.arrayContaining([
      'BOARD_ONLY',
      'EXECUTIVE_ONLY',
      'CUSTOMER_AUTHORIZED',
      'RESEARCH_REVIEW_ONLY'
    ]));
  });

  test('report docs script and fabric route are active', () => {
    const report = readJson(
      'runtime/governance-generator/v1/sheikha-governance-generator-v1-report.json'
    );
    const packageJson = readJson('package.json');
    const docs = readText(
      'docs/governance-generator/SHEIKHA-GOVERNANCE-GENERATOR-V1.md'
    );
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'governance-generator-v1');

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('GOVERNANCE_GENERATOR_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.artifactTypes).toBeGreaterThanOrEqual(10);
    expect(report.coverage.targetSystems).toBeGreaterThanOrEqual(12);
    expect(packageJson.scripts['ops:governance-generator:v1']).toBe(
      'node tools/governance-generator/sheikha-governance-generator-v1.js'
    );
    expect(docs).toContain('SHEIKHA_GOVERNANCE_GENERATOR_V1');
    expect(docs).toContain('/api/governance/generator/status');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/governance/generator',
      module: 'routes/governance-generator/status.routes.js',
      priority: 244
    }));
  });
});
