const OPTIONAL_AI_STATUS_ROUTES = Object.freeze([
  Object.freeze({
    mount: '/api/research/agi-asi-science-fabric',
    module: '../../routes/agi-asi-research-science-fabric/status.routes.js'
  }),
  Object.freeze({
    mount: '/api/intelligence/integration-fabric',
    module: '../../routes/intelligence-integration-fabric/status.routes.js'
  }),
  Object.freeze({
    mount: '/api/sdk-fabric-mcp/integration',
    module: '../../routes/sdk-fabric-mcp-integration/status.routes.js'
  })
]);

const OPTIONAL_AI_STATUS_MOUNTS = Object.freeze(
  OPTIONAL_AI_STATUS_ROUTES.map((route) => route.mount)
);

function mountOptionalAiStatusRoutes(app, {
  env = process.env,
  loadRouter = require,
  logger = console
} = {}) {
  const result = { enabled: env.SHEIKHA_ENABLE_ALL_ENGINES === 'true', mounted: [], failed: [] };
  if (!result.enabled) return result;

  // These are read-only saved reports, not live engine activation.
  for (const route of OPTIONAL_AI_STATUS_ROUTES) {
    try {
      app.use(route.mount, loadRouter(route.module));
      result.mounted.push(route.mount);
      logger.log(`[AI status] Mounted read-only reports: ${route.mount}`);
    } catch (error) {
      result.failed.push(route.mount);
      logger.warn(`[AI status] Mount failed: ${route.mount}`, error.message);
    }
  }
  return result;
}

module.exports = { OPTIONAL_AI_STATUS_MOUNTS, mountOptionalAiStatusRoutes };
