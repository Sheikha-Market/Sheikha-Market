'use strict';

const os = require('os');

function scoreService(service = {}) {
  if (service.status === 'ACTIVE' || service.status === 'READY') return 100;
  if (service.status === 'DEGRADED') return 70;
  return 0;
}

function buildRuntimeHealthReport(input = {}) {
  const services = [
    { id: 'ui-shell', status: input.uiShell || 'ACTIVE' },
    { id: 'workspace', status: input.workspace || 'ACTIVE' },
    { id: 'navigation', status: input.navigation || 'ACTIVE' },
    { id: 'context-engine', status: input.context || 'ACTIVE' },
    { id: 'event-bus', status: input.eventBus || 'ACTIVE' },
    { id: 'governance', status: input.governance || 'ACTIVE' }
  ];

  const scored = services.map((service) => ({
    ...service,
    score: scoreService(service)
  }));

  const overallScore = Math.round(
    scored.reduce((sum, service) => sum + service.score, 0) / scored.length
  );

  return {
    system: 'SHEIKHA_RUNTIME_HEALTH_ENGINE_V1',
    status: overallScore >= 90 ? 'HEALTHY' : 'DEGRADED',
    overallScore,
    mode: 'UNIFIED_RUNTIME_HEALTH_MONITORING',
    services: scored,
    host: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      loadavg: os.loadavg()
    },
    safety: {
      readOnly: true,
      noExternalMutation: true,
      noServiceRestart: true,
      noHarm: true
    }
  };
}

module.exports = {
  scoreService,
  buildRuntimeHealthReport
};
