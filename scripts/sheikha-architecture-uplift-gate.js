#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const SYSTEM_RUNTIME_DIR = path.join(ROOT, 'runtime', 'system');
const READINESS_REPORT_PATH = path.join(SYSTEM_RUNTIME_DIR, 'sheikha-production-readiness-report.json');
const ARCH_UPLIFT_REPORT_PATH = path.join(SYSTEM_RUNTIME_DIR, 'sheikha-architecture-uplift-report.json');

const args = new Set(process.argv.slice(2));
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

function readJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function getHttpCode(url) {
  const result = run(`curl -s -o /dev/null -w "%{http_code}" "${url}"`);
  const code = Number(result.stdout || 0);
  return { ok: code === 200, code };
}

function boolToScore(value, okScore = 100, failScore = 35) {
  return value ? okScore : failScore;
}

function main() {
  fs.mkdirSync(SYSTEM_RUNTIME_DIR, { recursive: true });

  const readiness = readJson(READINESS_REPORT_PATH);

  const architectureEndpoints = [
    '/api/architecture/dashboard',
    '/api/architecture/layers',
    '/api/architecture/apis',
    '/api/sheikha/computer-architecture/global-status'
  ];

  const controlPlaneEndpoints = [
    '/api/runtime/status',
    '/api/governance/status',
    '/api/metrics',
    '/api/performance'
  ];

  const observatoryEndpoints = [
    '/executive-civilization-control-center/index.html',
    '/api/community/dashboard',
    '/api/community/types',
    '/api/community/tools'
  ];

  const architectureChecks = architectureEndpoints.map((route) => {
    const url = `http://127.0.0.1:8080${route}`;
    const probe = getHttpCode(url);
    return { route, url, ok: probe.ok, code: probe.code };
  });

  const controlPlaneChecks = controlPlaneEndpoints.map((route) => {
    const url = `http://127.0.0.1:8080${route}`;
    const probe = getHttpCode(url);
    return { route, url, ok: probe.ok, code: probe.code };
  });

  const observatoryChecks = observatoryEndpoints.map((route) => {
    const url = `http://127.0.0.1:8080${route}`;
    const probe = getHttpCode(url);
    return { route, url, ok: probe.ok, code: probe.code };
  });

  const architectureApiReady = architectureChecks.every((check) => check.ok);
  const controlPlaneReady = controlPlaneChecks.every((check) => check.ok);
  const observatoryReady = observatoryChecks.every((check) => check.ok);

  const operationalReady = Boolean(readiness?.checks?.operationalReady);
  const qualityReady = readiness?.checks?.qualityReady === true;
  const gitClean = Boolean(readiness?.git?.clean);

  const foundationLayer = {
    score: boolToScore(operationalReady),
    status: operationalReady ? 'READY' : 'NEEDS_ATTENTION',
    evidence: {
      operationalReady,
      pm2Ready: Boolean(readiness?.checks?.pm2Ready),
      endpointsReady: Boolean(readiness?.checks?.endpointsReady)
    }
  };

  const knowledgeGraphLayer = {
    score: boolToScore(architectureApiReady, 100, 40),
    status: architectureApiReady ? 'ACTIVE' : 'PARTIAL',
    evidence: {
      architectureApis: architectureChecks
    }
  };

  const controlPlaneLayer = {
    score: boolToScore(controlPlaneReady, 100, 45),
    status: controlPlaneReady ? 'ACTIVE' : 'PARTIAL',
    evidence: {
      controlPlaneApis: controlPlaneChecks
    }
  };

  const observatoryLayer = {
    score: boolToScore(observatoryReady, 100, 45),
    status: observatoryReady ? 'ACTIVE' : 'PARTIAL',
    evidence: {
      observatoryApis: observatoryChecks
    }
  };

  const releaseGovernanceLayer = {
    score: Math.round((boolToScore(qualityReady, 100, 40) + boolToScore(gitClean, 100, 25)) / 2),
    status: qualityReady && gitClean ? 'READY_FOR_RC' : qualityReady ? 'STABILIZATION_REQUIRED' : 'QUALITY_REQUIRED',
    evidence: {
      qualityReady,
      gitClean,
      totalChanges: Number(readiness?.git?.totalChanges || 0)
    }
  };

  const layers = {
    foundationLayer,
    knowledgeGraphLayer,
    controlPlaneLayer,
    observatoryLayer,
    releaseGovernanceLayer
  };

  const layerScores = Object.values(layers).map((layer) => Number(layer.score || 0));
  const totalScore = Math.round(layerScores.reduce((acc, score) => acc + score, 0) / Math.max(layerScores.length, 1));

  const tier = totalScore >= 95
    ? 'ENTERPRISE_APEX'
    : totalScore >= 85
      ? 'ENTERPRISE_STRONG'
      : totalScore >= 70
        ? 'ENTERPRISE_ADVANCING'
        : 'ENTERPRISE_FOUNDATIONAL';

  const report = {
    system: 'SHEIKHA_ARCHITECTURE_UPLIFT_GATE_V1',
    generatedAt: new Date().toISOString(),
    score: totalScore,
    tier,
    status: totalScore >= 85 ? 'UPLIFT_HIGH' : totalScore >= 70 ? 'UPLIFT_MEDIUM' : 'UPLIFT_REQUIRED',
    layers,
    recommendations: [
      architectureApiReady ? 'Knowledge graph and architecture APIs are active.' : 'Activate architecture APIs for full enterprise knowledge graph.',
      controlPlaneReady ? 'Control plane APIs are healthy.' : 'Strengthen runtime/control-plane API reliability.',
      observatoryReady ? 'Executive observatory is live.' : 'Improve executive observability endpoints.',
      qualityReady ? 'Quality gate is healthy.' : 'Run full readiness and fix lint/test failures.',
      gitClean ? 'Workspace is clean for release candidate.' : 'Split remaining changes into release batches before final RC.'
    ]
  };

  fs.writeFileSync(ARCH_UPLIFT_REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(JSON.stringify(report, null, 2));
  console.log(`\nArchitecture uplift report: ${path.relative(ROOT, ARCH_UPLIFT_REPORT_PATH)}`);

  if (strictMode && totalScore < 85) {
    process.exit(1);
  }
}

main();
