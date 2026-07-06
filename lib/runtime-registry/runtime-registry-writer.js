const fs = require('node:fs');
const path = require('node:path');

function tracesPath() {
  const dir = path.join(process.cwd(), 'runtime', 'runtime-registry');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return path.join(dir, 'traces.json');
}

function _readTraces() {
  const p = tracesPath();
  try {
    if (!fs.existsSync(p)) return [];
    return JSON.parse(fs.readFileSync(p, 'utf8') || '[]');
  } catch (err) {
    console.error('[RuntimeRegistry] Error reading traces:', err.message);
    return [];
  }
}

function _writeTraces(traces) {
  const p = tracesPath();
  fs.writeFileSync(p, JSON.stringify(traces, null, 2), 'utf8');
  return p;
}

function appendRegistryTrace(entry = {}) {
  const traces = _readTraces();
  const now = new Date().toISOString();
  const trace = {
    traceId: `rt-${Date.now()}`,
    timestamp: now,
    source: entry.source || 'SHEIKHA_RECOVERY_HEALTH',
    type: entry.type || 'recovery-trace',
    message: entry.message || 'registry trace',
    data: entry.data || {},
    ...entry
  };

  traces.push(trace);
  _writeTraces(traces);

  return {
    success: true,
    traceId: trace.traceId,
    path: tracesPath(),
    storedAt: now
  };
}

module.exports = {
  appendRegistryTrace,
  _readTraces,
  _writeTraces
};
