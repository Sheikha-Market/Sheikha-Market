const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

describe('Sheikha SDK Fabric MCP Integration V1', () => {
  test('sdk fabric mcp registry is active and truthfulness gated', () => {
    const registry = readJson(
      'runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1.json'
    );

    expect(registry.system).toBe('SHEIKHA_SDK_FABRIC_MCP_INTEGRATION_V1');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.position).toBe('ABOVE_RESOURCE_INTELLIGENCE_AND_BELOW_UGIT_CONTROL_PLANE');
    expect(registry.modules).toEqual(expect.arrayContaining([
      'SDK_FABRIC',
      'MCP_GATEWAY',
      'GOVERNMENT_INTEGRATION_READINESS',
      'SPACE_IOT_ML_AI_CONNECTORS',
      'SCIENCE_AND_EDUCATION_CONNECTORS',
      'SUPERCOMPUTING_AND_DATACENTER_CONNECTORS',
      'MARITIME_AND_TRANSPORT_CONNECTORS',
      'CUSTOMER_ENVIRONMENT_CONNECTORS',
      'ROOT_NEURAL_GOVERNANCE_CELL_BINDING'
    ]));
    expect(registry.integration_flow).toEqual(expect.arrayContaining([
      'SDK',
      'FABRIC_ROUTE',
      'MCP_TOOL_CONTRACT',
      'AUTHORIZATION_GATE',
      'CUSTOMER_ENVIRONMENT_TWIN',
      'COMMERCIAL_PRODUCT'
    ]));
    expect(registry.truthfulness.no_government_system_claim_without_authorization).toBe(true);
    expect(registry.truthfulness.no_private_api_claim_without_contract).toBe(true);
    expect(registry.truthfulness.no_customer_environment_claim_without_customer_consent).toBe(true);
    expect(registry.truthfulness.no_supercomputer_or_datacenter_claim_without_provider_evidence).toBe(true);
    expect(registry.truthfulness.no_maritime_transport_tracking_claim_without_data_source).toBe(true);
    expect(registry.governance_reference.foundation).toBe('QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS');
    expect(registry.governance_reference.system_is_tool_not_religious_authority).toBe(true);
    expect(registry.root_neural_binding.network).toBe('SHEIKHA_DISTRIBUTED_NEURAL_CLUSTER');
    expect(registry.root_neural_binding.appliesTo).toEqual(expect.arrayContaining([
      'SDK',
      'FABRIC',
      'MCP',
      'EXTERNAL_SYSTEMS',
      'CUSTOMER_ENVIRONMENTS'
    ]));
  });

  test('integration catalog covers public private scientific compute maritime and customer systems', () => {
    const catalog = readJson(
      'runtime/sdk-fabric-mcp-integration/v1/registries/integration-catalog.json'
    );

    const requiredConnectorCategories = [
      'OPEN_DATA_PORTALS',
      'RESEARCH_DATABASES',
      'SCIENTIFIC_PUBLICATIONS',
      'EDUCATIONAL_PLATFORMS',
      'ERP_SYSTEMS',
      'CRM_SYSTEMS',
      'WMS',
      'TMS',
      'IOT_PLATFORMS',
      'SATELLITE_OPEN_OBSERVATION_DATA',
      'CLOUD_PROVIDERS',
      'DATA_CENTERS',
      'SUPERCOMPUTING_RESOURCES'
    ];

    expect(catalog.status).toBe('ACTIVE');
    expect(catalog.categories).toEqual(expect.arrayContaining([
      'GOVERNMENT_SYSTEMS',
      'CUSTOMS_AND_PORTS',
      'SPACE_AND_SATELLITES',
      'IOT_AND_EDGE',
      'ML_AI_PLATFORMS',
      'SUPPLY_CHAIN_SYSTEMS',
      'ERP_CRM_WMS_TMS',
      'SCIENCE_DATABASES',
      'EDUCATION_PLATFORMS',
      'SUPERCOMPUTERS',
      'DATA_CENTERS',
      'MARITIME_AND_SHIPPING',
      'TRANSPORT_AND_LOGISTICS',
      'CUSTOMER_ENVIRONMENTS'
    ]));
    expect(catalog.connectorProfileCategories).toEqual(
      expect.arrayContaining(requiredConnectorCategories)
    );
    expect(catalog.systemProfiles.length).toBeGreaterThanOrEqual(7);
    expect(catalog.systemProfiles.every((profile) => profile.integrationMode)).toBe(true);
  });

  test('mcp tools sdk fabric map and customer environment map are complete', () => {
    const mcp = readJson(
      'runtime/sdk-fabric-mcp-integration/v1/registries/mcp-tool-catalog.json'
    );
    const sdkFabric = readJson(
      'runtime/sdk-fabric-mcp-integration/v1/registries/sdk-fabric-map.json'
    );
    const customerEnvironment = readJson(
      'runtime/sdk-fabric-mcp-integration/v1/registries/customer-environment-map.json'
    );

    expect(mcp.status).toBe('ACTIVE');
    expect(mcp.tools).toEqual(expect.arrayContaining([
      'inspect_customer_environment',
      'map_resource_sources',
      'classify_hs_code',
      'generate_supply_chain_twin',
      'connect_government_system_readiness',
      'map_science_database',
      'prepare_education_platform_link',
      'map_supercomputer_datacenter_readiness',
      'map_maritime_shipping_network',
      'map_open_data_portal_connector',
      'map_research_database_connector',
      'map_scientific_publication_connector',
      'map_erp_connector',
      'map_crm_connector',
      'map_wms_connector',
      'map_tms_connector',
      'map_iot_platform_connector',
      'map_satellite_observation_connector',
      'map_cloud_provider_connector',
      'map_datacenter_connector',
      'map_supercomputing_resource_connector'
    ]));
    expect(mcp.security.schema_required).toBe(true);
    expect(mcp.toolContract.evidence_reference_required).toBe(true);

    expect(sdkFabric.sdkLayers).toEqual(expect.arrayContaining([
      'sheikha-js-sdk',
      'sheikha-api-sdk',
      'sheikha-cli',
      'sheikha-mcp',
      'sheikha-ide'
    ]));
    expect(sdkFabric.fabricTargets).toEqual(expect.arrayContaining([
      'sdk_registry',
      'mcp_unified_bridge',
      'fabric_bootstrap',
      'resource_intelligence_simulation_fabric',
      'ugit_ai_control_plane',
      'provider_compute_fabric',
      'multi_supercomputer_cloud_fabric'
    ]));
    expect(sdkFabric.sdkOutputs).toEqual(expect.arrayContaining([
      'api_client',
      'cli_command',
      'mcp_tool_contract',
      'customer_environment_blueprint',
      'evidence_report'
    ]));

    expect(customerEnvironment.environments).toEqual(expect.arrayContaining([
      'MINE',
      'SMELTER',
      'WAREHOUSE',
      'FACTORY',
      'SCRAP_SOURCE',
      'RETAIL_STORE',
      'VESSEL',
      'TRUCK_FLEET',
      'DATACENTER',
      'RESEARCH_LAB',
      'EDUCATION_PLATFORM'
    ]));
    expect(customerEnvironment.integrationObjects).toEqual(expect.arrayContaining([
      'assets',
      'inventory',
      'shipments',
      'sensors',
      'contracts',
      'hs_codes',
      'digital_twins',
      'environment_signals',
      'scientific_references'
    ]));
  });

  test('connector profile registry covers requested enterprise scientific compute and observation connectors', () => {
    const connectorProfiles = readJson(
      'runtime/sdk-fabric-mcp-integration/v1/registries/connector-profile-registry.json'
    );
    const categories = new Set(connectorProfiles.profiles.map((profile) => profile.category));

    expect(connectorProfiles.status).toBe('ACTIVE');
    expect(connectorProfiles.truthfulness.readiness_only).toBe(true);
    expect(connectorProfiles.truthfulness.no_live_connection_claim_without_credentials).toBe(true);
    expect(connectorProfiles.mesh.name).toBe('SHEIKHA_ROOT_NEURAL_CONNECTOR_MESH');
    expect(connectorProfiles.mesh.architecture).toEqual(expect.arrayContaining([
      'connector_profile',
      'sdk_output',
      'fabric_route',
      'mcp_tool_contract',
      'authorization_gate',
      'data_rights_gate',
      'root_neural_cell_gate',
      'evidence_report'
    ]));

    [
      'OPEN_DATA_PORTALS',
      'RESEARCH_DATABASES',
      'SCIENTIFIC_PUBLICATIONS',
      'EDUCATIONAL_PLATFORMS',
      'ERP_SYSTEMS',
      'CRM_SYSTEMS',
      'WMS',
      'TMS',
      'IOT_PLATFORMS',
      'SATELLITE_OPEN_OBSERVATION_DATA',
      'CLOUD_PROVIDERS',
      'DATA_CENTERS',
      'SUPERCOMPUTING_RESOURCES'
    ].forEach((category) => expect(categories.has(category)).toBe(true));

    expect(connectorProfiles.profiles.length).toBeGreaterThanOrEqual(13);
    expect(connectorProfiles.profiles.every((profile) => profile.liveConnectionClaim === false)).toBe(true);
    expect(connectorProfiles.profiles.every((profile) => profile.accessGate)).toBe(true);
    expect(connectorProfiles.profiles.every((profile) => profile.rootNeuralCells.length >= 4)).toBe(true);
  });

  test('root neural governance cells are numbered and bound to sdk fabric mcp modules', () => {
    const quranSunnahGovernance = readJson(
      'runtime/quran-sunnah-governance/sheikha-quran-sunnah-governance.json'
    );
    const rootNeural = readJson(
      'runtime/sdk-fabric-mcp-integration/v1/registries/root-neural-governance-cell-map.json'
    );
    const cellNames = new Set(rootNeural.cells.map((cell) => cell.name));

    expect(quranSunnahGovernance.status).toBe('ACTIVE');
    expect(quranSunnahGovernance.rules.system_is_tool_not_religious_authority).toBe(true);
    expect(rootNeural.status).toBe('ACTIVE');
    expect(rootNeural.governanceReference.foundation).toBe('QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS');
    expect(rootNeural.governanceReference.system_is_tool_not_religious_authority).toBe(true);
    expect(rootNeural.numbering.prefix).toBe('NGC');
    expect(rootNeural.numbering.range).toBe('NGC-001..NGC-010');
    expect(rootNeural.cells.length).toBe(10);
    expect(Array.from(cellNames)).toEqual(expect.arrayContaining([
      'ROOT_TRUTHFULNESS_CELL',
      'NO_HARM_CELL',
      'AMANAH_TRUST_CELL',
      'JUSTICE_AND_NO_DECEPTION_CELL',
      'ITQAN_ENGINEERING_CELL',
      'SHURA_AND_HUMAN_REVIEW_CELL',
      'AUTHORIZATION_GATE_CELL',
      'DATA_RIGHTS_CELL',
      'MCP_SCHEMA_PERMISSION_CELL',
      'AUDIT_AND_EVIDENCE_CELL'
    ]));
    expect(rootNeural.moduleBindings.length).toBeGreaterThanOrEqual(7);
    expect(rootNeural.connectorMesh.status).toBe('ACTIVE');
    expect(rootNeural.connectorMesh.profileRegistry).toBe('SHEIKHA_CONNECTOR_PROFILE_REGISTRY_V1');
    expect(rootNeural.connectorMesh.claimPolicy.liveConnectionRequiresCredentials).toBe(true);
    expect(rootNeural.moduleBindings.every((binding) => binding.cells.length >= 4)).toBe(true);
  });

  test('sdk fabric mcp report has script docs and fabric route', () => {
    const report = readJson(
      'runtime/sdk-fabric-mcp-integration/v1/sheikha-sdk-fabric-mcp-integration-v1-report.json'
    );
    const packageJson = readJson('package.json');
    const docs = readText(
      'docs/sdk-fabric-mcp-integration/SHEIKHA-SDK-FABRIC-MCP-INTEGRATION-V1.md'
    );
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'sdk-fabric-mcp-integration-v1');

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('SDK_FABRIC_MCP_INTEGRATION_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.categories).toBeGreaterThanOrEqual(14);
    expect(report.coverage.mcpTools).toBeGreaterThanOrEqual(29);
    expect(report.coverage.customerEnvironments).toBeGreaterThanOrEqual(20);
    expect(report.coverage.connectorProfiles).toBeGreaterThanOrEqual(13);
    expect(report.coverage.connectorProfileCategories).toBeGreaterThanOrEqual(13);
    expect(report.coverage.rootNeuralCells).toBe(10);
    expect(report.coverage.rootNeuralModuleBindings).toBeGreaterThanOrEqual(8);
    expect(packageJson.scripts['ops:sdk-fabric-mcp-integration:v1']).toBe(
      'node tools/sdk-fabric-mcp-integration/sheikha-sdk-fabric-mcp-integration-v1.js'
    );
    expect(docs).toContain('SHEIKHA_SDK_FABRIC_MCP_INTEGRATION_V1');
    expect(docs).toContain('/api/sdk-fabric-mcp/integration/status');
    expect(docs).toContain('/api/sdk-fabric-mcp/integration/connector-profiles');
    expect(docs).toContain('/api/sdk-fabric-mcp/integration/root-neural-governance');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/sdk-fabric-mcp/integration',
      module: 'routes/sdk-fabric-mcp-integration/status.routes.js',
      priority: 237
    }));
  });
});
