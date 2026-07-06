'use strict';

const fs = require('fs');
const { execSync } = require('child_process');

function sh(cmd) {
  return execSync(cmd, {
    encoding: 'utf8'
  }).trim();
}

function safeJson(cmd) {
  try {
    return JSON.parse(sh(cmd));
  } catch (e) {
    return {
      status: 'ERROR',
      error: e.message
    };
  }
}

const drift = safeJson(
  'node tools/drift/sheikha-runtime-drift-detector.js'
);

const admission = safeJson(
  'node tools/governance/runtime-admission-controller.js'
);

const protectedRuntime = safeJson(
  'node tools/governance/protected-runtime-enforcer.js'
);

const integrity = safeJson(
  'node tools/governance/runtime-integrity-verifier.js'
);

const healthy =
  drift.status === 'NO_DRIFT' &&
  admission.status === 'ACTIVE' &&
  protectedRuntime.forbiddenFiles.length === 0;

const payload = {
  supervisor: 'SHEIKHA_RUNTIME_HEALTH_SUPERVISOR',
  status: healthy ? 'HEALTHY' : 'DEGRADED',
  generatedAt: new Date().toISOString(),
  principle: 'لا ضرر ولا ضرار',
  drift: drift.status,
  governance: admission.status,
  protectedRuntime: protectedRuntime.status,
  integrity: integrity.status || 'ACTIVE'
};

const ts =
  new Date()
    .toISOString()
    .replace(/[:.]/g, '-');

const out =
  `runtime/health/reports/health-${ts}.json`;

fs.writeFileSync(
  out,
  JSON.stringify(payload, null, 2)
);

console.log(JSON.stringify({
  status: payload.status,
  report: out
}, null, 2));

process.exit(healthy ? 0 : 1);
