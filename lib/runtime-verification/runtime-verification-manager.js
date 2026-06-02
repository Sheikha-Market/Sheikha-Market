const fs = require('fs');
const path = require('path');

function loadVerification() {
  const file = path.join(
    process.cwd(),
    'runtime/runtime-verification/sheikha-runtime-verification.json'
  );

  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function buildRuntimeVerification() {
  const verification = loadVerification();

  return {
    success: true,
    verification: verification.verification,
    status: verification.status,
    mode: verification.mode,
    checks: verification.checks,
    rules: verification.rules,
    runtime: {
      node: process.version,
      pid: process.pid,
      uptime: process.uptime()
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  buildRuntimeVerification
};
