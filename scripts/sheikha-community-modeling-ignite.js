#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');

const LOCAL_DASHBOARD_URL = 'http://127.0.0.1:8080/api/community/dashboard';
const LOCAL_TYPES_URL = 'http://127.0.0.1:8080/api/community/types';
const LOCAL_TOOLS_URL = 'http://127.0.0.1:8080/api/community/tools';

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

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

function readJsonFromCurl(url) {
  const probe = run(`curl -sS ${url}`);
  if (!probe.ok || !probe.output) {
    return { ok: false, raw: probe.output, data: null };
  }

  try {
    return { ok: true, raw: probe.output, data: JSON.parse(probe.output) };
  } catch {
    return { ok: false, raw: probe.output, data: null };
  }
}

function readJsonWithRetry(url, attempts = 20, delayMs = 500) {
  let last = { ok: false, raw: '', data: null };
  for (let i = 0; i < attempts; i += 1) {
    last = readJsonFromCurl(url);
    if (last.ok && last.data && last.data.success === true) {
      return last;
    }
    sleep(delayMs);
  }
  return last;
}

function ensureServerUp() {
  const statusProbe = run('pm2 describe sheikha-main-portal > /dev/null 2>&1');
  if (!statusProbe.ok) {
    return run('pm2 start ecosystem.config.js --only sheikha-main-portal && pm2 save');
  }
  return run('pm2 restart sheikha-main-portal --update-env && pm2 save');
}

function main() {
  const projectRoot = process.cwd();
  const runtimeDir = path.join(projectRoot, 'runtime', 'community');
  const reportPath = path.join(runtimeDir, 'sheikha-community-modeling-report.json');
  fs.mkdirSync(runtimeDir, { recursive: true });

  const serverStep = ensureServerUp();
  const dashboard = readJsonWithRetry(LOCAL_DASHBOARD_URL);
  const types = readJsonWithRetry(LOCAL_TYPES_URL);
  const tools = readJsonWithRetry(LOCAL_TOOLS_URL);

  const dashboardOk = Boolean(dashboard.data && dashboard.data.success === true);
  const typesOk = Boolean(types.data && types.data.success === true);
  const toolsOk = Boolean(tools.data && tools.data.success === true);

  const communityTypes = dashboardOk && dashboard.data.summary
    ? dashboard.data.summary.communityTypes
    : Array.isArray(types.data?.data)
      ? types.data.data.length
      : 0;

  const digitalTools = dashboardOk && dashboard.data.summary
    ? dashboard.data.summary.digitalTools
    : Array.isArray(tools.data?.data)
      ? tools.data.data.length
      : 0;

  const report = {
    system: 'SHEIKHA_COMMUNITY_MODELING_IGNITE_V1',
    status: serverStep.ok && dashboardOk && typesOk && toolsOk ? 'KHAYR_ACTIVE' : 'NEEDS_ATTENTION',
    generatedAt: new Date().toISOString(),
    steps: {
      server: serverStep,
      dashboard: { ok: dashboardOk, url: LOCAL_DASHBOARD_URL },
      types: { ok: typesOk, url: LOCAL_TYPES_URL },
      tools: { ok: toolsOk, url: LOCAL_TOOLS_URL }
    },
    modeling: {
      communityTypes,
      digitalTools,
      formationReady: dashboardOk && communityTypes > 0
    },
    note: dashboardOk && typesOk && toolsOk
      ? 'Community modeling and formation are active and healthy.'
      : 'Some community APIs are not active yet. Review server logs and runtime blocks.'
  };

  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

  if (report.status !== 'KHAYR_ACTIVE') {
    process.exit(1);
  }
}

main();
