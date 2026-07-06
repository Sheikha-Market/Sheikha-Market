function extractRoutes(app) {
  const routes = [];

  function scan(stack, prefix = '') {
    stack.forEach((layer) => {
      if (layer.route) {
        const methods = Object.keys(layer.route.methods)
          .map((m) => m.toUpperCase());

        routes.push({
          path: prefix + layer.route.path,
          methods
        });
      } else if (layer.name === 'router' && layer.handle.stack) {
        scan(layer.handle.stack, prefix);
      }
    });
  }

  if (app && app._router && app._router.stack) {
    scan(app._router.stack);
  }

  return routes;
}

module.exports = {
  extractRoutes
};
