#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SYSTEM_RUNTIME_DIR = path.join(ROOT, 'runtime', 'system');
const READINESS_REPORT_PATH = path.join(SYSTEM_RUNTIME_DIR, 'sheikha-production-readiness-report.json');
const RC_MANIFEST_PATH = path.join(SYSTEM_RUNTIME_DIR, 'sheikha-release-candidate-manifest.json');
const SELF_GENERATED_GIT_IGNORE = new Set([
  path.relative(ROOT, READINESS_REPORT_PATH),
  path.relative(ROOT, RC_MANIFEST_PATH)
]);

const args = new Set(process.argv.slice(2));
const runFull = args.has('--full');
const strictMode = args.has('--strict');

function run(command) {
  try {
    const stdout = execSync(command, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim();
    return { ok: true, code: 0, stdout, stderr: '' };
  } catch (error) {
    return {
      ok: false,
      code: typeof error.status === 'number' ? error.status : 1,
      stdout: error.stdout ? String(error.stdout).trim() : '',
      stderr: error.stderr ? String(error.stderr).trim() : String(error.message || '').trim()
    };
  }
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function readJsonFile(relativePath) {
  try {
    const fullPath = path.join(ROOT, relativePath);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch {
    return null;
  }
}

function getHttpCode(url) {
  const result = run(`curl -s -o /dev/null -w "%{http_code}" "${url}"`);
  const code = Number(result.stdout || 0);
  return { ok: code === 200, code };
}

function getPm2Status() {
  const result = run('pm2 jlist');
  const list = parseJson(result.stdout);
  if (!result.ok || !Array.isArray(list)) {
    return {
      ok: false,
      services: {},
      rawError: result.stderr || 'Unable to parse pm2 jlist output'
    };
  }

  const findService = (name) => {
    const proc = list.find((item) => item.name === name);
    if (!proc) {
      return { found: false, name, status: 'missing', restarts: null, uptime: null };
    }
    return {
      found: true,
      name,
      status: proc.pm2_env?.status || 'unknown',
      restarts: Number(proc.pm2_env?.restart_time || 0),
      uptime: proc.pm2_env?.pm_uptime || null
    };
  };

  const services = {
    mainPortal: findService('sheikha-main-portal'),
    identityAuto: findService('sheikha-identity-v2-auto'),
    communityCycle: findService('sheikha-community-modeling-cycle')
  };

  const ok = Object.values(services).every((svc) => svc.found && svc.status === 'online');
  return { ok, services, rawError: null };
}

function summarizeGitStatus() {
  const result = run('git status --porcelain');
  const lines = result.stdout
    ? result.stdout
        .split('\n')
        .filter(Boolean)
        .filter((line) => {
          const filePath = line.slice(3).trim();
          return !SELF_GENERATED_GIT_IGNORE.has(filePath);
        })
    : [];

  const statusCounts = {
    added: 0,
    modified: 0,
    deleted: 0,
    renamed: 0,
    untracked: 0,
    conflicted: 0,
    other: 0
  };
  const byTopDirectory = {};

  for (const line of lines) {
    const raw = line.slice(0, 2);
    const filePath = line.slice(3).trim();
    const top = filePath.includes('/') ? filePath.split('/')[0] : '(root)';
    byTopDirectory[top] = (byTopDirectory[top] || 0) + 1;

    if (raw === '??') {
      statusCounts.untracked += 1;
      continue;
    }
    if (raw.includes('A')) {
      statusCounts.added += 1;
    }
    if (raw.includes('M')) {
      statusCounts.modified += 1;
    }
    if (raw.includes('D')) {
      statusCounts.deleted += 1;
    }
    if (raw.includes('R')) {
      statusCounts.renamed += 1;
    }
    if (raw.includes('U')) {
      statusCounts.conflicted += 1;
    }
    if (!/[AMDRU\?]/.test(raw)) {
      statusCounts.other += 1;
    }
  }

  const totalChanges = lines.length;
  const topDirectories = Object.entries(byTopDirectory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([dir, count]) => ({ dir, count }));

  return {
    clean: totalChanges === 0,
    totalChanges,
    statusCounts,
    topDirectories
  };
}

function runOptionalQualityChecks() {
  const checks = [];
  if (!runFull) {
    return checks;
  }

  const summarizeFailure = (result, fallback) => {
    const combined = `${result.stderr || ''}\n${result.stdout || ''}`
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const priorityPatterns = [/^FAIL\b/i, /error/i, /failed/i, /not found/i];
    for (const pattern of priorityPatterns) {
      const line = combined.find((entry) => pattern.test(entry));
      if (line) {
        return line;
      }
    }

    return combined[0] || fallback;
  };

  const lint = run('npm run -s lint');
  checks.push({
    name: 'lint',
    ok: lint.ok,
    code: lint.code,
    summary: lint.ok ? 'lint passed' : summarizeFailure(lint, 'lint failed')
  });

  const test = run('npm run -s test -- --runInBand');
  checks.push({
    name: 'test',
    ok: test.ok,
    code: test.code,
    summary: test.ok ? 'test passed' : summarizeFailure(test, 'test failed')
  });

  return checks;
}

function main() {
  fs.mkdirSync(SYSTEM_RUNTIME_DIR, { recursive: true });

  const endpoints = [
    '/api/health',
    '/api/identity/status',
    '/api/runtime/status',
    '/api/governance/status',
    '/api/production/truth-gate',
    '/api/metrics',
    '/api/performance',
    '/api/community/dashboard',
    '/api/community/types',
    '/api/community/tools',
    '/executive-civilization-control-center/index.html'
  ];

  const endpointChecks = endpoints.map((route) => {
    const url = `http://127.0.0.1:8080${route}`;
    const probe = getHttpCode(url);
    return { route, url, code: probe.code, ok: probe.ok };
  });

  const pm2 = getPm2Status();
  const identityReport = readJsonFile('runtime/identity/sheikha-active-identity-v2-report.json');
  const communityReport = readJsonFile('runtime/community/sheikha-community-modeling-report.json');

  const identityReady = Boolean(identityReport && identityReport.status === 'ACTIVE' && Number(identityReport.score || 0) >= 95);
  const communityReady = Boolean(
    communityReport &&
    communityReport.status === 'KHAYR_ACTIVE' &&
    communityReport.modeling &&
    communityReport.modeling.formationReady === true
  );
  const endpointsReady = endpointChecks.every((item) => item.ok);

  const qualityChecks = runOptionalQualityChecks();
  const qualityReady = qualityChecks.length === 0 ? null : qualityChecks.every((item) => item.ok);

  const operationalReady = pm2.ok && endpointsReady && identityReady && communityReady;
  const gitSummary = summarizeGitStatus();

  const overallStatus = operationalReady
    ? (gitSummary.clean && (qualityReady === null || qualityReady) ? 'PRODUCTION_READY' : 'STABILIZATION_REQUIRED')
    : 'CHECK_REQUIRED';

  const report = {
    system: 'SHEIKHA_PRODUCTION_READINESS_GATE_V1',
    status: overallStatus,
    generatedAt: new Date().toISOString(),
    mode: runFull ? 'full' : 'quick',
    checks: {
      operationalReady,
      pm2Ready: pm2.ok,
      endpointsReady,
      identityReady,
      communityReady,
      qualityReady
    },
    pm2,
    endpoints: endpointChecks,
    reports: {
      identity: identityReport
        ? {
            status: identityReport.status,
            score: Number(identityReport.score || 0),
            generatedAt: identityReport.generatedAt || null
          }
        : null,
      community: communityReport
        ? {
            status: communityReport.status,
            generatedAt: communityReport.generatedAt || null,
            communityTypes: Number(communityReport.modeling?.communityTypes || 0),
            digitalTools: Number(communityReport.modeling?.digitalTools || 0),
            formationReady: communityReport.modeling?.formationReady === true
          }
        : null
    },
    qualityChecks,
    git: gitSummary,
    recommendations: [
      operationalReady ? 'Operational gate passed.' : 'Operational gate needs attention (PM2/APIs/identity/community).',
      gitSummary.clean ? 'Git workspace is clean.' : 'Git workspace has pending changes; split into logical feature batches before release.',
      qualityReady === false ? 'Quality checks failed; fix lint/test before release candidate.' : 'Quality checks are acceptable for current mode.'
    ]
  };

  const releaseCandidateManifest = {
    system: 'SHEIKHA_RELEASE_CANDIDATE_MANIFEST_V1',
    generatedAt: new Date().toISOString(),
    candidate: {
      eligible: operationalReady && gitSummary.clean && (qualityReady === null || qualityReady),
      status: overallStatus,
      versionHint: process.env.npm_package_version || null,
      gate: {
        operationalReady,
        qualityReady,
        cleanWorkspace: gitSummary.clean
      }
    },
    deploymentReadiness: {
      pm2: pm2.ok,
      endpoints: endpointsReady,
      identity: identityReady,
      community: communityReady
    },
    artifacts: {
      readinessReport: path.relative(ROOT, READINESS_REPORT_PATH),
      monitorCommand: 'npm run -s ops:community:modeling:monitor',
      readinessCommand: runFull
        ? 'npm run -s ops:production:readiness:full'
        : 'npm run -s ops:production:readiness'
    }
  };

  fs.writeFileSync(READINESS_REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  fs.writeFileSync(RC_MANIFEST_PATH, `${JSON.stringify(releaseCandidateManifest, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify(report, null, 2));
  console.log(`\nReadiness report: ${path.relative(ROOT, READINESS_REPORT_PATH)}`);
  console.log(`Release manifest: ${path.relative(ROOT, RC_MANIFEST_PATH)}`);

  if (strictMode && !operationalReady) {
    process.exit(1);
  }
}

main();
