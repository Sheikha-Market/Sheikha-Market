'use strict';

const fs = require('fs');
const { execSync } = require('child_process');

function run(cmd) {
  try {
    return {
      ok: true,
      output: execSync(cmd, {
        encoding: 'utf8'
      }).trim()
    };
  } catch (e) {
    return {
      ok: false,
      output: e.stdout
        ? e.stdout.toString()
        : '',
      error: e.message
    };
  }
}

const checks = {
  drift:
    run('node tools/drift/sheikha-runtime-drift-detector.js'),

  health:
    run('node tools/health/sheikha-runtime-health-supervisor.js'),

  admission:
    run('node tools/governance/runtime-admission-controller.js'),

  protectedRuntime:
    run('node tools/governance/protected-runtime-enforcer.js')
};

const healthy =
  checks.drift.ok &&
  checks.health.ok &&
  checks.admission.ok &&
  checks.protectedRuntime.ok;

const payload = {
  runtime:
    'SHEIKHA_AUTONOMOUS_GOVERNANCE_LOOP',

  status:
    healthy ? 'STABLE' : 'ATTENTION_REQUIRED',

  generatedAt:
    new Date().toISOString(),

  principle:
    'لا ضرر ولا ضرار'
};

const ts =
  new Date()
    .toISOString()
    .replace(/[:.]/g, '-');

const out =
  `runtime/automation/reports/governance-loop-${ts}.json`;

fs.writeFileSync(
  out,
  JSON.stringify({
    payload,
    checks
  }, null, 2)
);

console.log(JSON.stringify({
  status: payload.status,
  report: out
}, null, 2));

process.exit(healthy ? 0 : 1);
