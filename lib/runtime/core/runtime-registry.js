// ═══════════════════════════════════════════════════════════════════
// SHEIKHA Runtime Registry — مرجع المنظمات والأسواق والخدمات المركزي
// ═══════════════════════════════════════════════════════════════════

const organizations = {
  globalTrade: {
    active: true,
    domains: [
      'hs-classification',
      'markets',
      'supply-chains',
      'recycling',
      'traceability',
      'industrial-transformation'
    ]
  },
  markets: {
    active: true,
    markets: [
      'metals',
      'scrap',
      'gold',
      'silver',
      'financial',
      'real-estate'
    ]
  },
  cloud: {
    active: true,
    services: [
      'runtime',
      'monitoring',
      'deployment',
      'storage'
    ]
  },
  ai: {
    active: true
  },
  supplyChain: {
    active: true,
    circularModel: true
  },
  recycling: {
    active: true,
    strategicSource: true
  },
  traceability: {
    active: true,
    runtime: 'traceability-runtime-layer'
  },
  space: {
    active: true,
    capabilities: ['satellite-data', 'logistics-observation', 'ports-monitoring']
  },
  communications: {
    active: true,
    stack: ['apis', 'edge-runtime', 'streaming', 'iot', 'ai-routing']
  },
  smartCities: {
    active: true,
    market: 'smart-cities-market',
    integrations: {
      cloud: true,
      ai: true,
      markets: true,
      supplyChain: true,
      operations: true,
      governance: true
    }
  },
  operations: {
    active: true
  },
  governance: {
    active: true
  },
  industrialTransformation: {
    active: true
  },
  experience: {
    active: true
  }
};

const registry = {
  services: new Map(),
  routes: new Map(),
  engines: new Map(),
};

function registerService(name, service) {
  registry.services.set(name, service);
}

function registerRoute(name, route) {
  registry.routes.set(name, route);
}

function registerEngine(name, engine) {
  registry.engines.set(name, engine);
}

function getRegistry() {
  return registry;
}

module.exports = {
  organizations,
  registerService,
  registerRoute,
  registerEngine,
  getRegistry,
};
