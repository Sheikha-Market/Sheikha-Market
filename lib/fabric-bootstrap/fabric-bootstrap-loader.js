const fs = require('fs');
const path = require('path');

function resolveModule(modulePath) {
  const cleaned = String(modulePath || '').replace(/^\.\//, '');
  return path.join(process.cwd(), cleaned);
}

function loadFabricRoutes(app) {
  const registryPath = path.join(
    process.cwd(),
    'runtime/fabric-bootstrap/sheikha-fabric-routes.json'
  );

  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const routes = [...registry.routes].sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const mounted = [];
  const failed = [];

  for (const route of routes) {
    try {
      const handler = require(resolveModule(route.module));
      app.use(route.mount, handler);

      mounted.push({
        name: route.name,
        mount: route.mount,
        status: 'mounted'
      });

      console.log(`✅ SHEIKHA FABRIC mounted: ${route.name} -> ${route.mount}`);
    } catch (error) {
      failed.push({
        name: route.name,
        mount: route.mount,
        status: 'failed',
        error: error.message
      });

      console.warn(`⚠️ SHEIKHA FABRIC failed: ${route.name} -> ${route.mount}: ${error.message}`);
    }
  }

  return {
    success: failed.length === 0,
    bootstrap: registry.bootstrap,
    mounted,
    failed
  };
}

module.exports = { loadFabricRoutes };
