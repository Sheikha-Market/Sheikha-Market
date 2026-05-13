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
  registerService,
  registerRoute,
  registerEngine,
  getRegistry,
};
