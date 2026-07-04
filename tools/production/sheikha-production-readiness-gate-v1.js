'use strict';

const fs = require('fs');
const path = require('path');

const LOG_DIR = path.join(process.env.HOME || '', '.pm2', 'logs');
const ACTIVE_PM2_APPS = Object.freeze([
  'sheikha-main-portal',
  'sheikha-proxy-8082',
  'sheikha-universal-api'
]);

const blockingPatterns = [
  /is not defined/i,
  /circular dependency/i,
  /Cannot read properties of undefined/i,
  /too many unstable restarts/i,
  /errored/i
];

const reviewPatterns = [
  /missed execution/i
];

function isCurrentPm2Log(file) {
  if (file.includes('__')) return false;

  return ACTIVE_PM2_APPS.some((appName) => (
    file === `${appName}-error.log` ||
    file === `${appName}-out.log` ||
    new RegExp(`^${appName}-(?:error|out)-\\d+\\.log$`).test(file)
  ));
}

function logGroupKey(file) {
  const match = file.match(/^(.*?)-(error|out)(?:-\d+)?\.log$/);
  return match ? `${match[1]}:${match[2]}` : file;
}

function selectActiveLogFiles(files) {
  const selected = new Map();

  files
    .filter(isCurrentPm2Log)
    .forEach((file) => {
      const full = path.join(LOG_DIR, file);
      const stats = fs.statSync(full);
      const key = logGroupKey(file);
      const current = selected.get(key);

      if (!current || stats.mtimeMs > current.mtimeMs) {
        selected.set(key, { file, mtimeMs: stats.mtimeMs });
      }
    });

  return [...selected.values()].map((entry) => entry.file);
}

function readLogs(options = {}) {
  const maxLines = options.maxLines || 200;
  if (!fs.existsSync(LOG_DIR)) return [];

  const files = selectActiveLogFiles(
    fs.readdirSync(LOG_DIR).filter((file) => file.endsWith('.log'))
  );

  return files
    .flatMap((file) => {
      const full = path.join(LOG_DIR, file);
      const text = fs.readFileSync(full, 'utf8');
      return text.split('\n').slice(-maxLines).map((line) => ({ file, line }));
    });
}

function evaluateProductionReadiness(lines = readLogs(), options = {}) {
  const findings = [];
  const maxFindings = options.maxFindings || 100;
  const summary = {
    blockers: 0,
    review: 0,
    total: 0,
    suppressed: 0
  };

  function addFinding(finding) {
    if (finding.severity === 'BLOCKER') summary.blockers += 1;
    if (finding.severity === 'REVIEW') summary.review += 1;
    summary.total += 1;

    if (findings.length < maxFindings) {
      findings.push(finding);
    } else {
      summary.suppressed += 1;
    }
  }

  for (const entry of lines) {
    for (const pattern of blockingPatterns) {
      if (pattern.test(entry.line)) {
        addFinding({
          severity: 'BLOCKER',
          file: entry.file,
          pattern: String(pattern),
          line: entry.line
        });
      }
    }

    for (const pattern of reviewPatterns) {
      if (pattern.test(entry.line)) {
        addFinding({
          severity: 'REVIEW',
          file: entry.file,
          pattern: String(pattern),
          line: entry.line
        });
      }
    }
  }

  return {
    system: 'SHEIKHA_PRODUCTION_READINESS_GATE_V1',
    status: summary.blockers ? 'BLOCKED' : summary.review ? 'REVIEW' : 'PASSED',
    productionReady: summary.total === 0,
    candidateReady: summary.blockers === 0,
    findings,
    summary,
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
  blockingPatterns,
  evaluateProductionReadiness,
  isCurrentPm2Log,
  readLogs,
  selectActiveLogFiles
};
