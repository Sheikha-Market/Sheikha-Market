const fs = require('fs');
const path = require('path');

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
      const resolvedModule = path.join(
        process.cwd(),
        route.module.replace(/^\.\//, '')
      );

      console.log(
        '[SHEIKHA FABRIC]',
        route.name,
        route.mount,
        resolvedModule
      );

      const routeModule = require(resolvedModule);

      app.use(route.mount, routeModule);

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
        error: error.stack || error.message
      });

      console.error(
        '[SHEIKHA FABRIC ERROR]',
        route.name,
        error.stack
      );
    }
  }

  return mounted;
}

module.exports = { loadFabricRoutes };
