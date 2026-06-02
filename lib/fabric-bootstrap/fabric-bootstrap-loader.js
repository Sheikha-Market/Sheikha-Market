const fs = require('fs');
const path = require('path');

function loadFabricRoutes(app) {
  const registryPath = path.join(
    process.cwd(),
    'runtime/fabric-bootstrap/sheikha-fabric-routes.json'
  );

  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const mounted = [];
  const failed = [];

  for (const route of registry.routes) {
    try {
      app.use(route.mount, require(path.join(process.cwd(), route.module)));
      mounted.push({
        name: route.name,
        mount: route.mount,
        status: 'mounted'
      });
      console.log(`✅ SHEIKHA Fabric mounted: ${route.name} -> ${route.mount}`);
    } catch (error) {
      failed.push({
        name: route.name,
        mount: route.mount,
        status: 'failed',
        error: error.message
      });
      console.warn(`⚠️ SHEIKHA Fabric failed: ${route.name}: ${error.message}`);
    }
  }

  return {
    success: failed.length === 0,
    bootstrap: registry.bootstrap,
    mounted,
    failed
  };
}

module.exports = {
  loadFabricRoutes
};
