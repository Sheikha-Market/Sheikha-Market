'use strict';

const fs = require('fs');
const cp = require('child_process');

function sh(cmd, timeout = 8000) {
  try {
    return cp.execSync(cmd, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout
    }).trim();
  } catch (error) {
    return String(error.stdout || error.stderr || error.message || '').trim();
  }
}

function parseBackends(configText = '') {
  const lines = String(configText).split('\n');
  const backends = [];
  let current = null;

  for (const line of lines) {
    const backend = line.match(/^backend\s+([A-Za-z0-9_-]+)/);
    if (backend) {
      current = {
        name: backend[1],
        servers: [],
        checks: [],
        raw: []
      };
      backends.push(current);
      continue;
    }

    if (!current) continue;
    current.raw.push(line.trim());

    const server = line.match(/server\s+(\S+)\s+(\S+)/);
    if (server) {
      current.servers.push({
        name: server[1],
        target: server[2],
        port: (server[2].match(/:(\d+)/) || [])[1] || null
      });
    }

    if (/option httpchk|http-check|check/.test(line)) {
      current.checks.push(line.trim());
    }
  }

  return backends;
}

function inspectBackends(configPath = '/etc/haproxy/haproxy.cfg') {
  const config = fs.existsSync(configPath) ? fs.readFileSync(configPath, 'utf8') : '';
  const backends = parseBackends(config);

  const inspected = backends.map((backend) => {
    const servers = backend.servers.map((server) => {
      const code = server.port
        ? sh(`curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:${server.port}/api/health || true`)
        : '000';

      return {
        ...server,
        healthCode: code,
        status: code === '200' ? 'ACTIVE' : 'UNREACHABLE'
      };
    });

    const active = servers.some((s) => s.status === 'ACTIVE');

    return {
      name: backend.name,
      status: active ? 'ACTIVE' : 'ATTENTION',
      servers,
      checks: backend.checks,
      risk: active ? 'LOW' : 'BACKEND_NO_ACTIVE_SERVER',
      recommendedAction: active ? 'OBSERVE' : 'VERIFY_BACKEND_TARGET_OR_DISABLE_UNUSED_BACKEND'
    };
  });

  const attention = inspected.filter((b) => b.status !== 'ACTIVE');

  return {
    success: true,
    engine: 'SHEIKHA_BACKEND_REGISTRY_INTELLIGENCE_V1',
    status: 'ACTIVE',
    generatedAt: new Date().toISOString(),
    backendCount: inspected.length,
    attentionCount: attention.length,
    decision: attention.length ? 'ATTENTION' : 'HEALTHY',
    backends: inspected,
    governance: {
      readOnlyInspection: true,
      noConfigMutationWithoutBackup: true,
      noBackendDeletionAutomatically: true,
      humanReviewForTopologyChanges: true
    }
  };
}

module.exports = { parseBackends, inspectBackends };
