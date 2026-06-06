'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const RUNTIME_DIR = 'runtime/sdk-fabric-mcp-integration/v1';

function resolvePath(relativePath) {
  return path.join(ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(resolvePath(relativePath));
}

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(resolvePath(relativePath), 'utf8'));
  } catch {
    return null;
  }
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

const registry = readJson(`${RUNTIME_DIR}/sheikha-sdk-fabric-mcp-integration-v1.json`);
const integrationCatalog = readJson(`${RUNTIME_DIR}/registries/integration-catalog.json`);
const customerEnvironmentMap = readJson(`${RUNTIME_DIR}/registries/customer-environment-map.json`);
const mcpToolCatalog = readJson(`${RUNTIME_DIR}/registries/mcp-tool-catalog.json`);
const sdkFabricMap = readJson(`${RUNTIME_DIR}/registries/sdk-fabric-map.json`);
const connectorProfileRegistry = readJson(`${RUNTIME_DIR}/registries/connector-profile-registry.json`);
const rootNeuralGovernanceCellMap =
  readJson(`${RUNTIME_DIR}/registries/root-neural-governance-cell-map.json`);
const fabricRoutes = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');

const route = fabricRoutes?.routes?.find(
  (item) => item.name === 'sdk-fabric-mcp-integration-v1'
);

const requiredModules = [
  'SDK_FABRIC',
  'MCP_GATEWAY',
  'INTEGRATION_CATALOG',
  'GOVERNMENT_INTEGRATION_READINESS',
  'OPEN_DATA_CONNECTORS',
  'SPACE_IOT_ML_AI_CONNECTORS',
  'SUPPLY_CHAIN_CONNECTORS',
  'SCIENCE_AND_EDUCATION_CONNECTORS',
  'DATABASE_CONNECTORS',
  'SUPERCOMPUTING_AND_DATACENTER_CONNECTORS',
  'MARITIME_AND_TRANSPORT_CONNECTORS',
  'CUSTOMER_ENVIRONMENT_CONNECTORS',
  'ROOT_NEURAL_GOVERNANCE_CELL_BINDING'
];

const requiredCategories = [
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
];

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

const requiredMcpTools = [
  'inspect_customer_environment',
  'map_resource_sources',
  'classify_hs_code',
  'generate_supply_chain_twin',
  'generate_logistics_dashboard',
  'generate_smart_city_dashboard',
  'analyze_space_iot_signal',
  'analyze_supply_chain_risk',
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
  'map_supercomputing_resource_connector',
  'generate_advisory_report',
  'list_marketplace_products',
  'prepare_crm_opportunity',
  'prepare_sales_pipeline_stage'
];

const requiredEnvironments = [
  'MINE',
  'SMELTER',
  'WAREHOUSE',
  'FACTORY',
  'SCRAP_SOURCE',
  'SCRAPYARD',
  'PORT',
  'LOGISTICS_ZONE',
  'INDUSTRIAL_CITY',
  'RETAIL_STORE',
  'SUPPLIER',
  'BUYER',
  'VESSEL',
  'TRUCK_FLEET',
  'DATACENTER',
  'RESEARCH_LAB',
  'EDUCATION_PLATFORM'
];

const requiredObjects = [
  'assets',
  'inventory',
  'orders',
  'shipments',
  'containers',
  'machines',
  'sensors',
  'contracts',
  'invoices',
  'hs_codes',
  'resources',
  'customers',
  'suppliers',
  'locations',
  'risks',
  'kpis',
  'databases',
  'datasets',
  'digital_twins',
  'environment_signals'
];

const requiredSdkLayers = [
  'sheikha-js-sdk',
  'sheikha-api-sdk',
  'sheikha-cli',
  'sheikha-mcp',
  'sheikha-ide',
  'sheikha-package-manager'
];

const requiredFabricTargets = [
  'sdk_registry',
  'mcp_unified_bridge',
  'fabric_bootstrap',
  'production_language',
  'executive_commercial_os',
  'space_iot_ml_ai_fabric',
  'logistics_market_network_platform',
  'resource_source_registry',
  'hs_intelligence_engine',
  'global_resource_graph_v2',
  'supply_chain_simulation',
  'smart_cities_engine',
  'resource_intelligence_simulation_fabric',
  'ugit_ai_control_plane',
  'customer_intelligence_onboarding',
  'provider_compute_fabric',
  'multi_supercomputer_cloud_fabric'
];

const requiredRootNeuralCells = [
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
];

function cellNames(cells) {
  return Array.isArray(cells)
    ? cells.map((cell) => cell.name).filter(Boolean)
    : [];
}

function profileCategories(profiles) {
  return Array.isArray(profiles)
    ? profiles.map((profile) => profile.category).filter(Boolean)
    : [];
}

const dependencies = {
  docs: exists('docs/sdk-fabric-mcp-integration/SHEIKHA-SDK-FABRIC-MCP-INTEGRATION-V1.md'),
  sdkRegistry: exists('runtime/sdk-registry/sheikha-sdk-registry.json'),
  generatedSdkRegistry: exists('runtime/sdk-registry/generated/sheikha-sdk-generated-registry.json'),
  mcpUnifiedBridge: exists('runtime/mcp-unified-bridge/sheikha-mcp-unified-bridge.json'),
  fabricBootstrap: exists('runtime/fabric-bootstrap/sheikha-fabric-routes.json'),
  quranSunnahGovernance: exists('runtime/quran-sunnah-governance/sheikha-quran-sunnah-governance.json'),
  rootAuthorityLayer: exists('runtime/root-authority-layer/v1/sheikha-root-authority-layer-report.json'),
  neuralCluster: exists('runtime/neural-cluster/sheikha-neural-cluster.json'),
  productionLanguage: exists('runtime/sheikha-production-language/v1/sheikha-production-language-v1-report.json'),
  executiveCommercialOS: exists('runtime/executive-commercial-os/v1/sheikha-executive-commercial-os-v1-report.json'),
  spaceIotMlAi: exists('runtime/space-iot-ml-ai-fabric/v1/sheikha-space-iot-ml-ai-fabric-v1-report.json'),
  hsIntelligence: exists('runtime/hs-intelligence-engine/v1/sheikha-hs-intelligence-engine-v1-report.json'),
  resourceGraph: exists('runtime/global-resource-graph-v2/v1/sheikha-global-resource-graph-v2-report.json'),
  simulation: exists('runtime/supply-chain-simulation/v1/sheikha-supply-chain-simulation-v1-report.json'),
  smartCities: exists('runtime/smart-cities-engine/v1/sheikha-smart-cities-engine-v1-report.json'),
  resourceIntelligenceSimulation: exists('runtime/resource-intelligence-simulation-fabric/v1/sheikha-resource-intelligence-simulation-fabric-v1-report.json'),
  customerIntelligenceOnboarding: exists('runtime/customer-intelligence-onboarding/v1/sheikha-customer-intelligence-onboarding-v1-report.json'),
  providerComputeFabric: exists('runtime/provider-registry/v1/sheikha-provider-compute-fabric-v1-report.json'),
  connectorProfileRegistry: exists(`${RUNTIME_DIR}/registries/connector-profile-registry.json`),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const checks = {
  registryActive: registry?.status === 'ACTIVE',
  modulesComplete: includesAll(registry?.modules, requiredModules),
  governanceReferenceComplete: Boolean(
    registry?.governance_reference?.foundation === 'QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS' &&
    registry?.governance_reference?.sourceLayer === 'SHEIKHA_QURAN_SUNNAH_GOVERNANCE_LAYER' &&
    registry?.governance_reference?.system_is_tool_not_religious_authority === true &&
    registry?.governance_reference?.human_scholar_or_specialist_review_when_required === true
  ),
  rootNeuralBindingComplete: Boolean(
    registry?.root_neural_binding?.network === 'SHEIKHA_DISTRIBUTED_NEURAL_CLUSTER' &&
    registry?.root_neural_binding?.mode === 'governed-root-neural-cell-binding' &&
    includesAll(registry?.root_neural_binding?.appliesTo, [
      'SDK',
      'FABRIC',
      'MCP',
      'EXTERNAL_SYSTEMS',
      'CUSTOMER_ENVIRONMENTS'
    ])
  ),
  integrationFlowComplete: includesAll(registry?.integration_flow, [
    'SDK',
    'FABRIC_ROUTE',
    'MCP_TOOL_CONTRACT',
    'AUTHORIZATION_GATE',
    'CUSTOMER_ENVIRONMENT_TWIN',
    'GOVERNED_DASHBOARD',
    'COMMERCIAL_PRODUCT'
  ]),
  truthfulnessPolicy: Boolean(
    registry?.truthfulness?.architecture_and_readiness_only &&
    registry?.truthfulness?.no_government_system_claim_without_authorization &&
    registry?.truthfulness?.no_private_api_claim_without_contract &&
    registry?.truthfulness?.no_customer_environment_claim_without_customer_consent &&
    registry?.truthfulness?.no_supercomputer_or_datacenter_claim_without_provider_evidence &&
    registry?.truthfulness?.no_education_science_platform_claim_without_terms_review &&
    registry?.truthfulness?.no_maritime_transport_tracking_claim_without_data_source
  ),
  integrationCatalogActive: integrationCatalog?.status === 'ACTIVE',
  categoriesComplete: includesAll(integrationCatalog?.categories, requiredCategories),
  connectorProfileCategoriesComplete: includesAll(
    integrationCatalog?.connectorProfileCategories,
    requiredConnectorCategories
  ),
  systemProfilesComplete: Array.isArray(integrationCatalog?.systemProfiles) &&
    integrationCatalog.systemProfiles.length >= 7 &&
    integrationCatalog.systemProfiles.every((profile) => profile.integrationMode),
  mcpToolCatalogActive: mcpToolCatalog?.status === 'ACTIVE',
  mcpToolsComplete: includesAll(mcpToolCatalog?.tools, requiredMcpTools),
  mcpSecurityComplete: Boolean(
    mcpToolCatalog?.security?.schema_required &&
    mcpToolCatalog?.security?.permission_required &&
    mcpToolCatalog?.security?.audit_required &&
    mcpToolCatalog?.security?.no_secret_exposure &&
    mcpToolCatalog?.toolContract?.input_schema_required &&
    mcpToolCatalog?.toolContract?.output_schema_required &&
    mcpToolCatalog?.toolContract?.permission_scope_required &&
    mcpToolCatalog?.toolContract?.evidence_reference_required
  ),
  customerEnvironmentMapActive: customerEnvironmentMap?.status === 'ACTIVE',
  customerEnvironmentsComplete: includesAll(customerEnvironmentMap?.environments, requiredEnvironments),
  integrationObjectsComplete: includesAll(customerEnvironmentMap?.integrationObjects, requiredObjects),
  sdkFabricMapActive: sdkFabricMap?.status === 'ACTIVE',
  sdkLayersComplete: includesAll(sdkFabricMap?.sdkLayers, requiredSdkLayers),
  fabricTargetsComplete: includesAll(sdkFabricMap?.fabricTargets, requiredFabricTargets),
  sdkOutputsComplete: includesAll(sdkFabricMap?.sdkOutputs, [
    'api_client',
    'cli_command',
    'mcp_tool_contract',
    'fabric_route_descriptor',
    'openapi_descriptor',
    'customer_environment_blueprint',
    'evidence_report'
  ]),
  connectorProfileRegistryActive: connectorProfileRegistry?.status === 'ACTIVE',
  connectorProfilesComplete: includesAll(
    profileCategories(connectorProfileRegistry?.profiles),
    requiredConnectorCategories
  ),
  connectorProfilesGoverned: Array.isArray(connectorProfileRegistry?.profiles) &&
    connectorProfileRegistry.profiles.length >= requiredConnectorCategories.length &&
    connectorProfileRegistry.profiles.every((profile) =>
      profile.id &&
      profile.integrationMode &&
      profile.accessGate &&
      Array.isArray(profile.rootNeuralCells) &&
      profile.rootNeuralCells.length >= 4
    ),
  connectorProfilesNoLiveClaims: Array.isArray(connectorProfileRegistry?.profiles) &&
    connectorProfileRegistry.profiles.every((profile) => profile.liveConnectionClaim === false),
  connectorTruthfulnessPolicy: Boolean(
    connectorProfileRegistry?.truthfulness?.readiness_only &&
    connectorProfileRegistry?.truthfulness?.no_live_connection_claim_without_credentials &&
    connectorProfileRegistry?.truthfulness?.no_private_system_claim_without_contract &&
    connectorProfileRegistry?.truthfulness?.no_open_data_claim_without_terms_review &&
    connectorProfileRegistry?.truthfulness?.no_compute_resource_claim_without_provider_evidence
  ),
  connectorMeshActive: Boolean(
    connectorProfileRegistry?.mesh?.status === 'ACTIVE' &&
    connectorProfileRegistry?.mesh?.name === 'SHEIKHA_ROOT_NEURAL_CONNECTOR_MESH' &&
    includesAll(connectorProfileRegistry?.mesh?.architecture, [
      'connector_profile',
      'sdk_output',
      'fabric_route',
      'mcp_tool_contract',
      'authorization_gate',
      'data_rights_gate',
      'root_neural_cell_gate',
      'evidence_report'
    ])
  ),
  rootNeuralGovernanceCellMapActive: rootNeuralGovernanceCellMap?.status === 'ACTIVE',
  rootNeuralCellsComplete: includesAll(
    cellNames(rootNeuralGovernanceCellMap?.cells),
    requiredRootNeuralCells
  ),
  rootNeuralCellNumberingComplete: Boolean(
    rootNeuralGovernanceCellMap?.numbering?.prefix === 'NGC' &&
    rootNeuralGovernanceCellMap?.numbering?.range === 'NGC-001..NGC-010'
  ),
  rootNeuralModuleBindingsComplete: Array.isArray(rootNeuralGovernanceCellMap?.moduleBindings) &&
    rootNeuralGovernanceCellMap.moduleBindings.length >= 8 &&
    rootNeuralGovernanceCellMap.moduleBindings.every((binding) =>
      Array.isArray(binding.cells) && binding.cells.length >= 4
    ),
  rootNeuralConnectorMeshActive: Boolean(
    rootNeuralGovernanceCellMap?.connectorMesh?.status === 'ACTIVE' &&
    rootNeuralGovernanceCellMap?.connectorMesh?.profileRegistry === 'SHEIKHA_CONNECTOR_PROFILE_REGISTRY_V1' &&
    rootNeuralGovernanceCellMap?.connectorMesh?.claimPolicy?.readinessAllowed === true &&
    rootNeuralGovernanceCellMap?.connectorMesh?.claimPolicy?.liveConnectionRequiresCredentials === true
  ),
  rootNeuralGovernanceReferenceSafe: Boolean(
    rootNeuralGovernanceCellMap?.governanceReference?.foundation === 'QURAN_SUNNAH_RIGHTLY_GUIDED_CALIPHS' &&
    rootNeuralGovernanceCellMap?.governanceReference?.system_is_tool_not_religious_authority === true &&
    rootNeuralGovernanceCellMap?.governanceReference?.human_scholar_or_specialist_review_when_required === true
  ),
  fabricRouteMounted: Boolean(
    route &&
    route.mount === '/api/sdk-fabric-mcp/integration' &&
    route.module === 'routes/sdk-fabric-mcp-integration/status.routes.js' &&
    route.priority >= 237
  )
};

const missingDependencies = Object.entries(dependencies)
  .filter(([, ok]) => !ok)
  .map(([key]) => key);
const missingChecks = Object.entries(checks)
  .filter(([, ok]) => !ok)
  .map(([key]) => key);
const missing = [...missingDependencies, ...missingChecks];

const report = {
  system: 'SHEIKHA_SDK_FABRIC_MCP_INTEGRATION_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 4) : 100,
  decision: missing.length
    ? 'REVIEW_SDK_FABRIC_MCP_INTEGRATION_GAPS'
    : 'SDK_FABRIC_MCP_INTEGRATION_ACTIVE_100',
  dependencies,
  checks,
  missing,
  missingDependencies,
  missingChecks,
  coverage: {
    modules: registry?.modules?.length || 0,
    categories: integrationCatalog?.categories?.length || 0,
    systemProfiles: integrationCatalog?.systemProfiles?.length || 0,
    mcpTools: mcpToolCatalog?.tools?.length || 0,
    customerEnvironments: customerEnvironmentMap?.environments?.length || 0,
    integrationObjects: customerEnvironmentMap?.integrationObjects?.length || 0,
    sdkLayers: sdkFabricMap?.sdkLayers?.length || 0,
    fabricTargets: sdkFabricMap?.fabricTargets?.length || 0,
    sdkOutputs: sdkFabricMap?.sdkOutputs?.length || 0,
    connectorProfiles: connectorProfileRegistry?.profiles?.length || 0,
    connectorProfileCategories: integrationCatalog?.connectorProfileCategories?.length || 0,
    rootNeuralCells: rootNeuralGovernanceCellMap?.cells?.length || 0,
    rootNeuralModuleBindings: rootNeuralGovernanceCellMap?.moduleBindings?.length || 0
  },
  cycle: [
    'SDK',
    'FABRIC',
    'MCP',
    'INTEGRATION_CATALOG',
    'CUSTOMER_ENVIRONMENT',
    'OPEN_DATA_OR_AUTHORIZED_API',
    'DIGITAL_TWIN',
    'DASHBOARD',
    'PRODUCT',
    'IMPACT'
  ],
  nextActions: [
    'Create OpenAPI schemas for each external connector before live API binding.',
    'Add credential vault integration outside Git before any private system integration.',
    'Create customer environment onboarding forms for mines, smelters, warehouses, factories, scrap sources, ports, stores, fleets, and data centers.',
    'Keep Quran, Sunnah, and rightly guided caliphs governance as a moral and operational gate, not as automatic religious ruling authority.',
    'Keep government, customer, provider, science, education, maritime, and compute integrations in readiness mode until authorization and data rights are documented.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

writeJson(
  `${RUNTIME_DIR}/sheikha-sdk-fabric-mcp-integration-v1-report.json`,
  report
);

writeText(
  `${RUNTIME_DIR}/sheikha-sdk-fabric-mcp-integration-v1-report.md`,
  `# SHEIKHA_SDK_FABRIC_MCP_INTEGRATION_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## التغطية
- الوحدات: ${report.coverage.modules}
- فئات التكامل: ${report.coverage.categories}
- ملفات الأنظمة: ${report.coverage.systemProfiles}
- أدوات MCP: ${report.coverage.mcpTools}
- بيئات العميل: ${report.coverage.customerEnvironments}
- كائنات التكامل: ${report.coverage.integrationObjects}
- طبقات SDK: ${report.coverage.sdkLayers}
- أهداف Fabric: ${report.coverage.fabricTargets}
- موصلات التكامل: ${report.coverage.connectorProfiles}
- فئات موصلات التكامل: ${report.coverage.connectorProfileCategories}
- خلايا الجذر العصبية: ${report.coverage.rootNeuralCells}
- ارتباطات الخلايا بالوحدات: ${report.coverage.rootNeuralModuleBindings}

## الفحوص
${Object.entries(checks).map(([key, value]) => `- ${value ? 'PASS' : 'FAIL'} ${key}`).join('\n')}

## الاعتماديات
${Object.entries(dependencies).map(([key, value]) => `- ${value ? 'PASS' : 'FAIL'} ${key}`).join('\n')}

## التالي
${report.nextActions.map((action, index) => `${index + 1}. ${action}`).join('\n')}

ولا حول ولا قوة إلا بالله.
`
);

console.log(JSON.stringify(report, null, 2));
