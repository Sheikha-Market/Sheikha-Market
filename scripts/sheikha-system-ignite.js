#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

function run(command) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { ok: true, output: output.trim() };
  } catch (error) {
    return {
      ok: false,
      output: ((error.stdout || '') + (error.stderr || '')).trim(),
      status: typeof error.status === 'number' ? error.status : 1
    };
  }
}

function parsePm2Status(name) {
  const info = run('pm2 jlist');
  if (!info.ok) {
    return { name, status: 'unknown' };
  }
  try {
    const rows = JSON.parse(info.output || '[]');
    const proc = Array.isArray(rows) ? rows.find((p) => p?.name === name) : null;
    if (!proc) {
      return { name, status: 'not-found' };
    }
    return {
      name,
      status: proc.pm2_env?.status || 'unknown',
      restarts: proc.pm2_env?.restart_time ?? null,
      uptime: proc.pm2_env?.pm_uptime ?? null
    };
  } catch {
    return { name, status: 'unknown' };
  }
}

function main() {
  const root = process.cwd();
  const runtimeDir = path.join(root, 'runtime', 'system');
  const reportPath = path.join(runtimeDir, 'sheikha-system-ignite-report.json');
  fs.mkdirSync(runtimeDir, { recursive: true });

  const steps = [
    { key: 'serverRestart', command: 'pm2 describe sheikha-main-portal > /dev/null 2>&1 && pm2 restart sheikha-main-portal --update-env || pm2 start ecosystem.config.js --only sheikha-main-portal' },
    { key: 'identityAutoStart', command: 'npm run -s sheikha:identity:v2:auto:pm2:start' },
    { key: 'identityBuild', command: 'npm run -s sheikha:identity:v2:build' },
    { key: 'identityHealth', command: 'npm run -s sheikha:identity:v2:health:one' },
    { key: 'accreditationAutoStart', command: 'npm run -s sheikha:accreditation:external:auto:pm2:start' },
    { key: 'accreditationVerify', command: 'npm run -s sheikha:accreditation:external:verify:latest' }
  ];

  const results = {};
  for (const step of steps) {
    results[step.key] = run(step.command);
  }

  const localUrl = 'http://127.0.0.1:8080/executive-civilization-control-center/index.html';
  const domainUrl = 'https://www.sheikha.top';

  const localCheck = run(`curl -s -o /tmp/sheikha_local_ignite_check.html -w "%{http_code}" ${localUrl}`);
  const domainCheck = run(`curl -s -o /tmp/sheikha_domain_ignite_check.html -w "%{http_code}" ${domainUrl}`);

  const localCode = Number(localCheck.output || 0);
  const domainCode = Number(domainCheck.output || 0);

  const pm2 = {
    mainPortal: parsePm2Status('sheikha-main-portal'),
    identityAuto: parsePm2Status('sheikha-identity-v2-auto'),
    accreditationAuto: parsePm2Status('sheikha-accreditation-external-auto')
  };

  const allStepsOk = Object.values(results).every((r) => r.ok);
  const localOk = localCode === 200;
  const domainOk = domainCode === 200;
  const pm2Ok = [pm2.mainPortal, pm2.identityAuto, pm2.accreditationAuto].every((p) => p.status === 'online');

  const report = {
    system: 'SHEIKHA_SYSTEM_IGNITE_PACKAGE_V1',
    status: allStepsOk && localOk && domainOk && pm2Ok ? 'ACTIVE' : 'DEGRADED',
    generatedAt: new Date().toISOString(),
    urls: {
      local: { url: localUrl, code: localCode, ok: localOk },
      domain: { url: domainUrl, code: domainCode, ok: domainOk }
    },
    pm2,
    steps: results,
    recommendation: allStepsOk && localOk && domainOk && pm2Ok
      ? 'System is live. Keep PM2 loops running.'
      : 'Review failed steps and pm2 logs before claiming full activation.'
  };

  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (report.status !== 'ACTIVE') {
    process.exit(1);
  }
}

main();
