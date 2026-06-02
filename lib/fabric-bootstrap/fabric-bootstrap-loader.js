const fs = require('fs');
const path = require('path');

function loadFabricRoutes(app) {

  const registryPath = path.join(
    process.cwd(),
    'runtime/fabric-bootstrap/sheikha-fabric-routes.json'
  );

  const registry = JSON.parse(
    fs.readFileSync(registryPath, 'utf8')
  );

  const routes = [...registry.routes]
    .sort((a, b) => b.priority - a.priority);

  const mounted = [];

  for (const route of routes) {

    try {

      const handler = require(
        path.join(process.cwd(), route.module)
      );

      app.use(route.mount, handler);

      mounted.push({
        name: route.name,
        mount: route.mount,
        status: 'mounted'
      });

      console.log(
        `✅ SHEIKHA FABRIC mounted: ${route.mount}`
      );

    } catch (error) {

      mounted.push({
        name: route.name,
        mount: route.mount,
        status: 'failed',
        error: error.message
      });

      console.warn(
        `⚠️ SHEIKHA FABRIC failed: ${route.mount}`,
        error.message
      );

    }

  }

  return mounted;
}

module.exports = {
  loadFabricRoutes
};
