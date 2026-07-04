'use strict';

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(process.env.HOME || '', '.pm2', 'logs');

const forbiddenPatterns = [
  /is not defined/i,
  /circular dependency/i,
  /missed execution/i,
  /too many unstable restarts/i,
  /errored/i
];

function readLogs() {
  if (!fs.existsSync(LOG_DIR)) return [];
  return fs.readdirSync(LOG_DIR)
    .filter((file) => file.endsWith('.log'))
    .flatMap((file) => {
      const full = path.join(LOG_DIR, file);
      const text = fs.readFileSync(full, 'utf8');
      return text.split('\n').slice(-200).map((line) => ({ file, line }));
    });
}

function evaluateProductionReadiness(lines = readLogs()) {
  const findings = [];

  for (const entry of lines) {
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(entry.line)) {
        findings.push({
          file: entry.file,
          pattern: String(pattern),
          line: entry.line
        });
      }
    }
  }

  return {
    system: 'SHEIKHA_PRODUCTION_READINESS_GATE_V1',
    status: findings.length ? 'BLOCKED' : 'PASSED',
    productionReady: findings.length === 0,
    findings,
    requiredBeforeProfitLaunch: [
      'clean_pm2_logs',
      'stable_health_checks',
      'backup_ready',
      'rollback_ready',
      'payment_or_revenue_path_verified',
      'monitoring_enabled'
    ],
    safety: {
      noHarm: true,
      noExternalMutation: true,
      governedProductionGate: true
    }
  };
}

if (require.main === module) {
  const result = evaluateProductionReadiness();
  fs.mkdirSync('runtime/production-readiness', { recursive: true });
  fs.writeFileSync(
    'runtime/production-readiness/sheikha-production-readiness-gate-v1.json',
    JSON.stringify(result, null, 2)
  );
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.productionReady ? 0 : 1);
}

module.exports = {
  evaluateProductionReadiness
};
