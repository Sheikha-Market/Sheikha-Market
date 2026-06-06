const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
}

function readText(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function valueSet(items, field) {
  return new Set(
    items.map((item) => {
      if (typeof item === 'string') {
        return item;
      }

      return item[field];
    })
  );
}

describe('Sheikha Resource Intelligence Simulation Fabric V1', () => {
  test('resource intelligence simulation fabric registry is active and truthfulness gated', () => {
    const registry = readJson(
      'runtime/resource-intelligence-simulation-fabric/v1/sheikha-resource-intelligence-simulation-fabric-v1.json'
    );

    expect(registry.system).toBe('SHEIKHA_RESOURCE_INTELLIGENCE_SIMULATION_FABRIC_V1');
    expect(registry.status).toBe('ACTIVE');
    expect(registry.position).toBe('ABOVE_RESOURCE_REGISTRIES_BELOW_UGIT_CONTROL_PLANE');
    expect(registry.components).toEqual(expect.arrayContaining([
      'HS_CODE_INTELLIGENCE_REGISTRY',
      'GLOBAL_RESOURCE_GRAPH_V2_REGISTRY',
      'SUPPLY_CHAIN_SIMULATION_REGISTRY',
      'SMART_CITIES_ENGINE_REGISTRY'
    ]));
    expect(registry.truthfulness.no_official_tariff_or_customs_advice_without_authority_review).toBe(true);
    expect(registry.truthfulness.no_live_supply_chain_simulation_claim_without_run_evidence).toBe(true);
    expect(registry.truthfulness.no_resource_availability_claim_without_verified_source).toBe(true);
    expect(registry.truthfulness.no_smart_city_deployment_claim_without_signed_contract).toBe(true);
  });

  test('resource registries cover hs resource graph simulation and smart city domains', () => {
    const hs = readJson('runtime/hs-intelligence-engine/v1/registries/hs-domain-map.json');
    const resources = readJson('runtime/global-resource-graph-v2/v1/registries/resource-nodes.json');
    const simulations = readJson('runtime/supply-chain-simulation/v1/registries/simulation-models.json');
    const smartCities = readJson('runtime/smart-cities-engine/v1/registries/smart-city-domains.json');

    const hsDomains = valueSet(hs.domains, 'domain');
    const resourceTypes = valueSet(resources.nodes, 'type');
    const simulationModels = valueSet(simulations.models, 'model');
    const smartCityDomains = valueSet(smartCities.domains, 'domain');

    expect(hs.status).toBe('ACTIVE');
    expect(resources.status).toBe('ACTIVE');
    expect(simulations.status).toBe('ACTIVE');
    expect(smartCities.status).toBe('ACTIVE');

    [
      'MINING',
      'METALS',
      'ENERGY',
      'LOGISTICS',
      'SMART_CITIES'
    ].forEach((domain) => expect(hsDomains.has(domain)).toBe(true));

    [
      'MINE',
      'FACTORY',
      'PORT',
      'INDUSTRIAL_CITY',
      'ECONOMIC_ZONE'
    ].forEach((type) => expect(resourceTypes.has(type)).toBe(true));

    [
      'DEMAND_FLOW',
      'INVENTORY_FLOW',
      'TRANSPORT_FLOW',
      'RISK_FLOW',
      'CARBON_FLOW',
      'CIRCULAR_FLOW'
    ].forEach((model) => expect(simulationModels.has(model)).toBe(true));

    [
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
    ].forEach((domain) => expect(smartCityDomains.has(domain)).toBe(true));
  });

  test('resource intelligence simulation fabric report has script docs and fabric route', () => {
    const report = readJson(
      'runtime/resource-intelligence-simulation-fabric/v1/sheikha-resource-intelligence-simulation-fabric-v1-report.json'
    );
    const packageJson = readJson('package.json');
    const docs = readText(
      'docs/resource-intelligence-simulation-fabric/SHEIKHA-RESOURCE-INTELLIGENCE-SIMULATION-FABRIC-V1.md'
    );
    const fabric = readJson('runtime/fabric-bootstrap/sheikha-fabric-routes.json');
    const route = fabric.routes.find((item) => item.name === 'resource-intelligence-simulation-fabric-v1');

    expect(report.status).toBe('ACTIVE');
    expect(report.score).toBe(100);
    expect(report.decision).toBe('RESOURCE_INTELLIGENCE_SIMULATION_FABRIC_ACTIVE_100');
    expect(report.missing).toEqual([]);
    expect(report.coverage.hsDomains).toBeGreaterThanOrEqual(10);
    expect(report.coverage.resourceNodes).toBeGreaterThanOrEqual(12);
    expect(report.coverage.simulationModels).toBeGreaterThanOrEqual(7);
    expect(report.coverage.smartCityDomains).toBeGreaterThanOrEqual(11);
    expect(packageJson.scripts['ops:resource-intelligence-simulation-fabric:v1']).toBe(
      'node tools/resource-intelligence-simulation-fabric/sheikha-resource-intelligence-simulation-fabric-v1.js'
    );
    expect(docs).toContain('SHEIKHA_RESOURCE_INTELLIGENCE_SIMULATION_FABRIC_V1');
    expect(docs).toContain('/api/resource-intelligence/simulation-fabric/status');
    expect(route).toEqual(expect.objectContaining({
      mount: '/api/resource-intelligence/simulation-fabric',
      module: 'routes/resource-intelligence-simulation-fabric/status.routes.js',
      priority: 227
    }));
  });
});
