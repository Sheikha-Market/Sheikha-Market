'use strict';

function registerRuntimeContracts(app, context = {}) {
  const {
    fs,
    path,
    processVersion,
    runtimeCore,
    ring,
    gitMetadata,
    fingerprintStatus,
    env,
    port,
    observability
  } = context;

  app.get('/api/live', (req, res) => {
    res.json({
      success: true,
      live: true,
      pid: process.pid,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/health', (req, res) => {
    const mem = process.memoryUsage();
    const heapUsedMB = Math.round(mem.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(mem.heapTotal / 1024 / 1024);
    const rssMB = Math.round(mem.rss / 1024 / 1024);
    const heapPercent = Math.round((mem.heapUsed / mem.heapTotal) * 100);

    const memoryOk = rssMB < 512 && (heapTotalMB < 100 || heapPercent < 85);

    const checks = {
      server: true,
      database: fs.existsSync(path.join(__dirname, '..', '..', 'data', 'users.json')),
      memory: memoryOk
    };

    const healthy = checks.server && checks.database;
    const status = healthy ? (memoryOk ? 'healthy' : 'degraded') : 'unhealthy';

    res.status(healthy ? 200 : 503).json({
      success: healthy,
      status,
      checks,
      memoryDetails: {
        heapUsed: heapUsedMB + ' MB',
        heapTotal: heapTotalMB + ' MB',
        rss: rssMB + ' MB',
        heapPercent: heapPercent + '%',
        threshold: '85% heap / 512MB RSS'
      },
      security: {
        helmet: !!env.helmet,
        compression: !!env.compression,
        rateLimiting: !!env.rateLimit,
        inputSanitization: true,
        cors: 'restricted'
      },
      service: 'sheikha-main-portal',
      uptime: Math.floor(process.uptime()) + 's',
      node: processVersion,
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/ready', (req, res) => {
    res.json({
      success: true,
      ready: true,
      uptime: Date.now() - (env.serverStartTime || Date.now()),
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/version', (req, res) => {
    res.json({
      success: true,
      service: 'sheikha-main-portal',
      node: processVersion,
      ring,
      branch: gitMetadata.branch,
      commit: gitMetadata.commit,
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/runtime', (req, res) => {
    const expectedNode = env.NODE_VERSION || null;
    const activeNode = processVersion.replace(/^v/, '');
    const nodeMatches = expectedNode ? activeNode === expectedNode : null;

    res.json({
      success: true,
      ring,
      runtime: {
        node: processVersion,
        expectedNode,
        nodeMatches,
        pm2Runtime: env.PM2_RUNTIME || null,
        port: Number(port || env.PORT || 8080),
        suppressOptionalWarnings: env.SHEIKHA_SUPPRESS_OPTIONAL_WARNINGS,
        strictFingerprint: env.SHEIKHA_RUNTIME_STRICT_FINGERPRINT
      },
          core: runtimeCore ? runtimeCore.status() : null,
      fingerprint: fingerprintStatus,
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/sheikha-node/status', (req, res) => {
    const expectedNode = env.NODE_VERSION || null;
    const activeNode = processVersion.replace(/^v/, '');
    const nodeMatches = expectedNode ? activeNode === expectedNode : null;

    res.json({
      success: true,
      migrated: true,
      target: '/api/runtime',
      ring,
      runtime: {
        node: processVersion,
        expectedNode,
        nodeMatches,
        pm2Runtime: env.PM2_RUNTIME || null,
        port: Number(port || env.PORT || 8080)
      },
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/observability/summary', (req, res) => {
    if (!observability || typeof observability.summarize !== 'function') {
      return res.status(503).json({
        success: false,
        error: 'observability_unavailable',
        timestamp: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      ring,
      ...observability.summarize(),
      timestamp: new Date().toISOString()
    });
  });
}

module.exports = { registerRuntimeContracts };
