#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const { execSync } = require('node:child_process');

const COMMUNITY_REPORT = 'runtime/community/sheikha-community-modeling-report.json';
const IDENTITY_REPORT = 'runtime/identity/sheikha-active-identity-v2-report.json';

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

function readJson(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return { ok: true, data: JSON.parse(data) };
  } catch {
    return { ok: false, data: null };
  }
}

function getPm2Status(name) {
  const raw = run('pm2 jlist');
  if (!raw.ok) {
    return { name, status: 'unknown' };
  }

  try {
    const list = JSON.parse(raw.output || '[]');
    const p = Array.isArray(list) ? list.find((item) => item?.name === name) : null;
    if (!p) {
      return { name, status: 'not-found' };
    }
    return {
      name,
      status: p.pm2_env?.status || 'unknown',
      restarts: p.pm2_env?.restart_time ?? null,
      uptime: p.pm2_env?.pm_uptime ?? null
    };
  } catch {
    return { name, status: 'unknown' };
  }
}

function checkApi(url) {
  const r = run(`curl -sS ${url}`);
  if (!r.ok || !r.output) {
    return { url, ok: false };
  }

  try {
    const data = JSON.parse(r.output);
    return {
      url,
      ok: data?.success === true,
      sample: {
        success: data?.success === true,
        status: data?.status || null
      }
    };
  } catch {
    return { url, ok: false };
  }
}

function main() {
  const pm2 = {
    mainPortal: getPm2Status('sheikha-main-portal'),
    identityAuto: getPm2Status('sheikha-identity-v2-auto'),
    communityCycle: getPm2Status('sheikha-community-modeling-cycle')
  };

  const communityReport = readJson(COMMUNITY_REPORT);
  const identityReport = readJson(IDENTITY_REPORT);

  const apis = {
    dashboard: checkApi('http://127.0.0.1:8080/api/community/dashboard'),
    types: checkApi('http://127.0.0.1:8080/api/community/types'),
    tools: checkApi('http://127.0.0.1:8080/api/community/tools')
  };

  const allPm2Online = [pm2.mainPortal, pm2.identityAuto, pm2.communityCycle].every((p) => p.status === 'online');
  const allApisOk = [apis.dashboard, apis.types, apis.tools].every((a) => a.ok);
  const communityOk = communityReport.ok && communityReport.data?.status === 'KHAYR_ACTIVE';
  const identityOk = identityReport.ok && identityReport.data?.status === 'ACTIVE';

  const result = {
    system: 'SHEIKHA_COMMUNITY_MODELING_MONITOR_V1',
    status: allPm2Online && allApisOk && communityOk && identityOk ? 'READY' : 'CHECK_REQUIRED',
    generatedAt: new Date().toISOString(),
    pm2,
    reports: {
      community: communityReport.ok
        ? {
            status: communityReport.data?.status || null,
            generatedAt: communityReport.data?.generatedAt || null,
            communityTypes: communityReport.data?.modeling?.communityTypes ?? null,
            digitalTools: communityReport.data?.modeling?.digitalTools ?? null,
            formationReady: communityReport.data?.modeling?.formationReady ?? null
          }
        : { status: 'missing' },
      identity: identityReport.ok
        ? {
            status: identityReport.data?.status || null,
            score: identityReport.data?.score ?? null,
            generatedAt: identityReport.data?.generatedAt || null
          }
        : { status: 'missing' }
    },
    apis
  };

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (result.status !== 'READY') {
    process.exit(1);
  }
}

main();
