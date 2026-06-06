'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const FABRIC_DIR = 'runtime/resource-intelligence-simulation-fabric/v1';

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

function includesAll(items, required, field) {
  const values = new Set(
    Array.isArray(items)
      ? items.map((item) => {
        if (typeof item === 'string') {
          return item;
        }

        return item?.[field];
      }).filter(Boolean)
      : []
  );

  return required.every((item) => values.has(item));
}

const registry = readJson(`${FABRIC_DIR}/sheikha-resource-intelligence-simulation-fabric-v1.json`);
const hs = readJson('runtime/hs-intelligence-engine/v1/registries/hs-domain-map.json');
const resources = readJson('runtime/global-resource-graph-v2/v1/registries/resource-nodes.json');
const simulations = readJson('runtime/supply-chain-simulation/v1/registries/simulation-models.json');
const smartCities = readJson('runtime/smart-cities-engine/v1/registries/smart-city-domains.json');
const fabricRoutes = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');

const route = fabricRoutes?.routes?.find(
  (item) => item.name === 'resource-intelligence-simulation-fabric-v1'
);

const requiredHsDomains = [
  'MINING',
  'METALS',
  'ENERGY',
  'LOGISTICS',
  'SMART_CITIES'
];

const requiredResourceNodes = [
  'MINE',
  'FACTORY',
  'PORT',
  'INDUSTRIAL_CITY',
  'ECONOMIC_ZONE'
];

const requiredSimulationModels = [
  'DEMAND_FLOW',
  'INVENTORY_FLOW',
  'TRANSPORT_FLOW',
  'RISK_FLOW',
  'CARBON_FLOW',
  'CIRCULAR_FLOW'
];

const requiredSmartCityDomains = [
  'ENERGY',
  'WATER',
  'WASTE',
  'TRANSPORT',
  'LOGISTICS',
  'TELECOM',
  'IOT',
  'AI',
  'HEALTH',
  'EDUCATION',
  'ECONOMY'
];

const dependencies = {
  resourceSourceRegistry: exists('runtime/resource-source-registry/v1/sheikha-resource-source-registry-v1-report.json'),
  spaceIotMlAiFabric: exists('runtime/space-iot-ml-ai-fabric/v1/sheikha-space-iot-ml-ai-fabric-v1-report.json'),
  logisticsMarketNetworkPlatform: exists('runtime/logistics-market-network-platform/v1/sheikha-logistics-market-network-platform-v1-report.json'),
  executiveCommercialOs: exists('runtime/executive-commercial-os/v1/sheikha-executive-commercial-os-v1-report.json'),
  ugitAiControlPlane: exists('runtime/ugit-ai-control-plane/v1/sheikha-ugit-ai-control-plane-v1-report.json'),
  runtimeAdmissionController: exists('tools/governance/runtime-admission-controller.js'),
  driftDetector: exists('tools/drift/sheikha-runtime-drift-detector.js')
};

const checks = {
  registryActive: registry?.status === 'ACTIVE',
  hsRegistryActive: hs?.status === 'ACTIVE',
  hsDomainsComplete: includesAll(hs?.domains, requiredHsDomains, 'domain'),
  globalResourceGraphActive: resources?.status === 'ACTIVE',
  resourceNodesComplete: includesAll(resources?.nodes, requiredResourceNodes, 'type'),
  supplyChainSimulationActive: simulations?.status === 'ACTIVE',
  simulationModelsComplete: includesAll(simulations?.models, requiredSimulationModels, 'model'),
  smartCitiesEngineActive: smartCities?.status === 'ACTIVE',
  smartCityDomainsComplete: includesAll(smartCities?.domains, requiredSmartCityDomains, 'domain'),
  truthfulnessPolicy: Boolean(
    registry?.truthfulness?.architecture_and_readiness_only &&
    registry?.truthfulness?.no_official_tariff_or_customs_advice_without_authority_review &&
    registry?.truthfulness?.no_live_supply_chain_simulation_claim_without_run_evidence &&
    registry?.truthfulness?.no_resource_availability_claim_without_verified_source &&
    registry?.truthfulness?.no_smart_city_deployment_claim_without_signed_contract &&
    registry?.truthfulness?.no_customer_or_provider_claim_without_contract
  ),
  fabricRouteMounted: Boolean(
    route &&
    route.mount === '/api/resource-intelligence/simulation-fabric' &&
    route.module === 'routes/resource-intelligence-simulation-fabric/status.routes.js' &&
    route.priority >= 227
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
  system: 'SHEIKHA_RESOURCE_INTELLIGENCE_SIMULATION_FABRIC_V1',
  status: missing.length ? 'ACTIVE_WITH_REVIEW' : 'ACTIVE',
  score: missing.length ? Math.max(0, 100 - missing.length * 5) : 100,
  decision: missing.length
    ? 'REVIEW_RESOURCE_INTELLIGENCE_SIMULATION_FABRIC_GAPS'
    : 'RESOURCE_INTELLIGENCE_SIMULATION_FABRIC_ACTIVE_100',
  dependencies,
  checks,
  missing,
  missingDependencies,
  missingChecks,
  coverage: {
    hsDomains: Array.isArray(hs?.domains) ? hs.domains.length : 0,
    resourceNodes: Array.isArray(resources?.nodes) ? resources.nodes.length : 0,
    simulationModels: Array.isArray(simulations?.models) ? simulations.models.length : 0,
    smartCityDomains: Array.isArray(smartCities?.domains) ? smartCities.domains.length : 0,
    requiredHsDomains: requiredHsDomains.length,
    requiredResourceNodes: requiredResourceNodes.length,
    requiredSimulationModels: requiredSimulationModels.length,
    requiredSmartCityDomains: requiredSmartCityDomains.length
  },
  nextActions: [
    'Attach verified data sources before any commercial resource availability claim.',
    'Run governed simulation jobs with evidence before claiming operational optimization results.',
    'Route regulated HS, customs, tariff, or compliance guidance through human authority review.',
    'Promote smart city deployment offers only after signed customer scope and SLA exist.'
  ],
  principle: 'ولا حول ولا قوة إلا بالله'
};

writeJson(`${FABRIC_DIR}/sheikha-resource-intelligence-simulation-fabric-v1-report.json`, report);

fs.writeFileSync(
  resolvePath(`${FABRIC_DIR}/sheikha-resource-intelligence-simulation-fabric-v1-report.md`),
  `# SHEIKHA_RESOURCE_INTELLIGENCE_SIMULATION_FABRIC_V1

## الحالة
- النظام: ${report.system}
- الحالة: ${report.status}
- الدرجة: ${report.score}
- القرار: ${report.decision}

## التغطية
- نطاقات HS: ${report.coverage.hsDomains}
- عقد الموارد العالمية: ${report.coverage.resourceNodes}
- نماذج محاكاة سلاسل الإمداد: ${report.coverage.simulationModels}
- نطاقات المدن الذكية: ${report.coverage.smartCityDomains}

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
