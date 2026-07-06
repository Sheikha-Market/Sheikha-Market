'use strict';

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = process.env.SHEIKHA_ROOT || process.cwd();
const OUT_DIR = path.join(ROOT, 'runtime/reports/continuous-inspector');
const LATEST = path.join(OUT_DIR, 'latest.json');

function sh(cmd, timeout = 10000) {
  try {
    return cp.execSync(cmd, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout
    }).trim();
  } catch (error) {
    return String(error.stdout || error.stderr || error.message || '').trim();
  }
}

function httpCode(url) {
  return sh(`curl -s -o /dev/null -w "%{http_code}" ${url} || true`, 8000);
}

function collect() {
  const report = {
    success: true,
    inspector: 'SHEIKHA_CONTINUOUS_INSPECTOR_V1',
    status: 'ACTIVE',
    generatedAt: new Date().toISOString(),
    runtime: {
      localHealth: httpCode('http://127.0.0.1:8080/api/health'),
      publicHealth: httpCode('https://sheikha.top/api/health'),
      unifiedChatStatus: httpCode('https://sheikha.top/api/sheikha/unified-chat/status'),
      intelligentInspector: httpCode('https://sheikha.top/api/sheikha/intelligent-inspector/v1/status')
    },
    services: {
      sheikhaMain: sh('systemctl is-active sheikha-main || true'),
      sheikhaRuntime: sh('systemctl is-active sheikha-runtime || true'),
      haproxy: sh('systemctl is-active haproxy || true'),
      ollama: sh('systemctl is-active ollama || true')
    },
    ports: {
      node8080: sh("ss -lntp | grep ':8080' || true"),
      ollama11434: sh("ss -lntp | grep ':11434' || true")
    },
    git: {
      branch: sh('git rev-parse --abbrev-ref HEAD || true'),
      status: sh('git status --short || true'),
      head: sh('git log -1 --pretty=format:"%h %s" || true')
    },
    logs: {
      haproxyWarnings: Number(sh("journalctl -u haproxy -n 200 --no-pager | grep -Ec 'DOWN|no server available|Layer7 timeout' || true")) || 0,
      mainErrors: Number(sh("journalctl -u sheikha-main -n 200 --no-pager | grep -Ec 'ERROR|Error|Exception|internal_error' || true")) || 0
    }
  };

  const problems = [];

  if (report.runtime.localHealth !== '200') problems.push('LOCAL_HEALTH_NOT_200');
  if (report.runtime.publicHealth !== '200') problems.push('PUBLIC_HEALTH_NOT_200');
  if (report.runtime.unifiedChatStatus !== '200') problems.push('UNIFIED_CHAT_NOT_200');
  if (report.services.haproxy !== 'active') problems.push('HAPROXY_NOT_ACTIVE');
  if (report.services.sheikhaMain !== 'active') problems.push('SHEIKHA_MAIN_NOT_ACTIVE');
  if (report.logs.mainErrors > 0) problems.push('SHEIKHA_MAIN_ERRORS_PRESENT');
  if (report.logs.haproxyWarnings > 10) problems.push('HAPROXY_HEALTH_FLAP_WARNINGS');

  report.decision = problems.length ? 'ATTENTION' : 'HEALTHY';
  report.problems = problems;
  report.governance = {
    destructiveActionsBlocked: true,
    secretsBlocked: true,
    safeAutoRepairOnly: true,
    highImpactRequiresHumanReview: true
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(LATEST, JSON.stringify(report, null, 2) + '\n');

  return report;
}

module.exports = { collect };
