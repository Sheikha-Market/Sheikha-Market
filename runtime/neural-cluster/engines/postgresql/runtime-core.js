const fs = require('fs');
const path = require('path');
const {
  health: postgresqlHealth,
  isEnabled: isPostgreSQLEnabled
} = require('../../../../lib/database/postgresql/postgresql-connection-manager');

function readRuntimeBlueprint() {
  const blueprintPath = path.join(
    process.cwd(),
    'runtime/neural-cluster/engines/postgresql/runtime-core.json'
  );

  const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));

  return {
    success: true,
    engine: blueprint.engine,
    phase: blueprint.phase,
    governance: blueprint.governance,
    architecture: blueprint.architecture,
    orchestration: blueprint.orchestration,
    runtime: {
      status: blueprint.runtime?.status || 'planned',
      host: process.env.PGHOST || process.env.POSTGRES_HOST || 'not-configured',
      port: process.env.PGPORT || process.env.POSTGRES_PORT || '5432',
      database:
        process.env.POSTGRES_DATABASE ||
        process.env.PGDATABASE ||
        process.env.POSTGRES_DB ||
        'not-configured'
    },
    timestamp: new Date().toISOString()
  };
}

async function getPostgreSQLRuntimeCoreStatus() {
  try {
    const status = readRuntimeBlueprint();
    const live = await postgresqlHealth();
    const enabled = isPostgreSQLEnabled();
    const governanceReady = Boolean(status.governance?.required);
    const routingReady = status.architecture?.routing === 'governance-first';
    const runtimeCoreReady = status.runtime.status === 'planned' || status.runtime.status === 'active';
    const liveReady = enabled ? live.success : true;

    return {
      ...status,
      success: governanceReady && routingReady && runtimeCoreReady && liveReady,
      enabled,
      live,
      readiness: {
        governance: governanceReady,
        routing: routingReady,
        runtimeCore: runtimeCoreReady,
        liveConnection: liveReady
      }
    };
  } catch (error) {
    return {
      success: false,
      engine: 'postgresql-runtime-core',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = {
  getPostgreSQLRuntimeCoreStatus
};