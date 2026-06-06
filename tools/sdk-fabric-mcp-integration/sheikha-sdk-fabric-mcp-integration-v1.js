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
  'CUSTOMER_ENVIRONMENT_CONNECTORS'
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

const dependencies = {
  docs: exists('docs/sdk-fabric-mcp-integration/SHEIKHA-SDK-FABRIC-MCP-INTEGRATION-V1.md'),
  sdkRegistry: exists('runtime/sdk-registry/sheikha-sdk-registry.json'),
  generatedSdkRegistry: exists('runtime/sdk-registry/generated/sheikha-sdk-generated-registry.json'),
  mcpUnifiedBridge: exists('runtime/mcp-unified-bridge/sheikha-mcp-unified-bridge.json'),
  fabricBootstrap: exists('runtime/fabric-bootstrap/sheikha-fabric-routes.json'),
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
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const checks = {
  registryActive: registry?.status === 'ACTIVE',
  modulesComplete: includesAll(registry?.modules, requiredModules),
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
    sdkOutputs: sdkFabricMap?.sdkOutputs?.length || 0
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
