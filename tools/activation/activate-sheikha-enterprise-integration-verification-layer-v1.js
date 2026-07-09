'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execSync } = require('node:child_process');

const reportPath = 'runtime/enterprise-integration/sheikha-enterprise-integration-verification-layer-v1-report.json';
const benchmarkReportPath = 'runtime/os-cloud-supercomputer/sheikha-live-compute-benchmark-v1-report.json';

function exists(filePath) {
  return fs.existsSync(filePath);
}

function safeReadJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function safeExecJson(command) {
  try {
    return JSON.parse(execSync(command, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }));
  } catch {
    return null;
  }
}

function getHttpStatus(url) {
  try {
    const code = execSync(`curl -s -o /dev/null -w "%{http_code}" ${url}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    return Number(code) || 0;
  } catch {
    return 0;
  }
}

function getHttpTiming(url) {
  try {
    const seconds = execSync(`curl -s -o /dev/null -w "%{time_total}" ${url}`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    return Number((Number(seconds) * 1000).toFixed(3)) || 0;
  } catch {
    return null;
  }
}

function getPm2Process(name) {
  const list = safeExecJson('pm2 jlist') || [];
  const proc = Array.isArray(list) ? list.find((item) => item?.name === name) : null;
  if (!proc) {
    return { found: false, status: 'not-found' };
  }
  return {
    found: true,
    status: proc.pm2_env?.status || 'unknown',
    restarts: proc.pm2_env?.restart_time ?? null,
    uptime: proc.pm2_env?.pm_uptime ?? null,
    memory: proc.monit?.memory ?? null,
    cpu: proc.monit?.cpu ?? null
  };
}

function scoreFromChecks(checks) {
  const values = Object.values(checks);
  const total = values.length;
  const passed = values.filter(Boolean).length;
  return {
    passed,
    total,
    score: total === 0 ? 0 : Math.round((passed / total) * 100)
  };
}

function buildLayer(name, checks, dependencies, details = {}) {
  const summary = scoreFromChecks(checks);
  return {
    name,
    status: summary.score === 100 ? 'READY' : summary.score >= 60 ? 'DEGRADED' : 'BLOCKED',
    score: summary.score,
    passed: summary.passed,
    total: summary.total,
    dependencies,
    checks,
    details,
    updatedAt: new Date().toISOString()
  };
}

function buildReport() {
  const identity = safeReadJson('runtime/identity/sheikha-active-identity-v2-report.json');
  const community = safeReadJson('runtime/community/sheikha-community-modeling-report.json');
  const readiness = safeReadJson('runtime/system/sheikha-production-readiness-report.json');
  const architecture = safeReadJson('runtime/system/sheikha-architecture-uplift-report.json');
  const osCloud = safeReadJson('runtime/os-cloud-supercomputer/sheikha-os-cloud-supercomputer-integration-v1-report.json');
  const benchmark = safeReadJson(benchmarkReportPath);
  const latency = {
    healthMs: getHttpTiming('http://127.0.0.1:8080/api/health'),
    metricsMs: getHttpTiming('http://127.0.0.1:8080/api/metrics'),
    performanceMs: getHttpTiming('http://127.0.0.1:8080/api/performance'),
    communityDashboardMs: getHttpTiming('http://127.0.0.1:8080/api/community/dashboard')
  };

  const layers = {
    os: buildLayer('OS', {
      serverPresent: exists('server.js'),
      packagePresent: exists('package.json'),
      pm2MainOnline: getPm2Process('sheikha-main-portal').status === 'online'
    }, [], {
      host: os.hostname(),
      platform: os.platform(),
      loadAverage: os.loadavg()
    }),
    cloud: buildLayer('Cloud', {
      healthEndpoint200: getHttpStatus('http://127.0.0.1:8080/api/health') === 200,
      metricsEndpoint200: getHttpStatus('http://127.0.0.1:8080/api/metrics') === 200,
      performanceEndpoint200: getHttpStatus('http://127.0.0.1:8080/api/performance') === 200
    }, ['OS'], {
      monitoringReady: true,
      scalingMode: 'LOCAL_RUNTIME_WITH_CLOUD_READY_GATE',
      latency
    }),
    supercomputer: buildLayer('Supercomputer', {
      contractPassed: osCloud?.status === 'PASSED',
      truthGatePresent: exists('runtime/production-truth-gate/sheikha-production-truth-gate-v4.json'),
      computeBenchmarkMeasured: benchmark?.status === 'PASSED'
    }, ['OS', 'Cloud'], {
      benchmark: {
        loadAverage: os.loadavg(),
        totalMemoryBytes: os.totalmem(),
        freeMemoryBytes: os.freemem(),
        cpuCount: os.cpus().length,
        jobsPerSecond: benchmark?.benchmark?.cpu?.jobsPerSecond ?? null,
        cpuDurationMs: benchmark?.benchmark?.cpu?.durationMs ?? null,
        ioWriteMs: benchmark?.benchmark?.io?.writeMs ?? null,
        ioReadMs: benchmark?.benchmark?.io?.readMs ?? null,
        note: benchmark
          ? 'Live compute benchmark is recorded under the governed truth gate.'
          : 'Live compute benchmark still required before physical supercomputer claims.'
      }
    }),
    runtime: buildLayer('Runtime', {
      runtimeStatus200: getHttpStatus('http://127.0.0.1:8080/api/runtime/status') === 200,
      governanceStatus200: getHttpStatus('http://127.0.0.1:8080/api/governance/status') === 200,
      readinessOperational: readiness?.checks?.operationalReady === true
    }, ['OS', 'Cloud'], {
      pm2: {
        mainPortal: getPm2Process('sheikha-main-portal'),
        identityAuto: getPm2Process('sheikha-identity-v2-auto'),
        communityCycle: getPm2Process('sheikha-community-modeling-cycle')
      }
    }),
    identity: buildLayer('Identity', {
      reportPresent: Boolean(identity),
      score100: identity?.score === 100,
      active: identity?.status === 'ACTIVE'
    }, ['Runtime'], {
      reportPath: 'runtime/identity/sheikha-active-identity-v2-report.json'
    }),
    community: buildLayer('Community', {
      reportPresent: Boolean(community),
      active: community?.status === 'KHAYR_ACTIVE',
      dashboard200: getHttpStatus('http://127.0.0.1:8080/api/community/dashboard') === 200
    }, ['Runtime', 'Identity'], {
      reportPath: 'runtime/community/sheikha-community-modeling-report.json'
    }),
    architecture: buildLayer('Architecture', {
      reportPresent: Boolean(architecture),
      dashboard200: getHttpStatus('http://127.0.0.1:8080/api/architecture/dashboard') === 200,
      layers200: getHttpStatus('http://127.0.0.1:8080/api/architecture/layers') === 200
    }, ['Runtime', 'Identity', 'Community']),
    inspector: buildLayer('Inspector', {
      executiveUi200: getHttpStatus('http://127.0.0.1:8080/executive-civilization-control-center/index.html') === 200,
      identityHealthPresent: exists('public/executive-civilization-control-center/identity.health.json'),
      identityTokensPresent: exists('public/executive-civilization-control-center/identity.tokens.json')
    }, ['Runtime', 'Identity', 'Architecture']),
    governance: buildLayer('Governance', {
      readinessReportPresent: Boolean(readiness),
      gitClean: readiness?.git?.clean === true,
      qualityReady: readiness?.checks?.qualityReady === true
    }, ['Runtime', 'Identity', 'Community', 'Architecture', 'Inspector']),
    executiveControlCenter: buildLayer('ExecutiveControlCenter', {
      ui200: getHttpStatus('http://127.0.0.1:8080/executive-civilization-control-center/index.html') === 200,
      identityHealthLinked: exists('public/executive-civilization-control-center/identity.health.json'),
      appPresent: exists('public/executive-civilization-control-center/app.js')
    }, ['Inspector', 'Governance']),
    production: buildLayer('Production', {
      productionReady: readiness?.status === 'PRODUCTION_READY',
      truthGate200: getHttpStatus('http://127.0.0.1:8080/api/production/truth-gate') === 200,
      releaseManifestPresent: exists('runtime/system/sheikha-release-candidate-manifest.json')
    }, ['Governance', 'ExecutiveControlCenter'])
  };

  const scoreBreakdown = Object.fromEntries(
    Object.entries(layers).map(([key, value]) => [key, value.score])
  );
  const overallScore = Math.round(
    Object.values(scoreBreakdown).reduce((sum, value) => sum + value, 0) / Object.keys(scoreBreakdown).length
  );

  const governanceCycle = [
    'الرؤية',
    'الهوية',
    'المعمارية',
    'العقود',
    'التنفيذ',
    'الاختبارات',
    'القياس',
    'التدقيق',
    'التحسين',
    'التقارير',
    'إعادة القياس'
  ];

  const kernelTopology = {
    root: 'SHEIKHA ROOT',
    kernels: [
      'Identity Kernel',
      'Governance Kernel',
      'Knowledge Kernel',
      'Market Kernel',
      'Commerce Kernel',
      'Community Kernel',
      'Infrastructure Kernel',
      'AI Kernel',
      'Runtime Kernel',
      'Cloud Kernel',
      'HPC Kernel',
      'Executive Kernel'
    ]
  };

  const unifiedRuntimeBus = {
    name: 'Unified Runtime Bus',
    mode: 'evidence-governed-kernel-coordination',
    channels: [
      'runtime_registry',
      'capability_registry',
      'master_log',
      'health_gate',
      'truth_gate',
      'inspector',
      'recovery_engine',
      'executive_control_center'
    ]
  };

  const unifiedVerificationFabric = {
    name: 'Unified Verification Fabric',
    stages: [
      'Health Verification',
      'Runtime Verification',
      'Security Verification',
      'Architecture Verification',
      'Performance Verification',
      'Evidence Verification',
      'Production Gate',
      'Executive Approval'
    ],
    evidenceBasedVerification: true,
    remeasurementRequired: true
  };

  const identityEngine = {
    name: 'Sheikha Identity Engine',
    domains: [
      'Visual Identity',
      'Writing Identity',
      'Design Identity',
      'Commercial Identity',
      'Knowledge Identity',
      'Runtime Identity',
      'API Identity',
      'Executive Identity'
    ],
    source: 'runtime/identity/sheikha-active-identity-v2-report.json'
  };

  const executiveCommandCenter = {
    chain: [
      'الرؤية',
      'الرسالة',
      'الأهداف',
      'المؤشرات',
      'الحوكمة',
      'المخاطر',
      'الأسواق',
      'العملاء',
      'المشروعات',
      'المعرفة',
      'التقارير',
      'القرارات',
      'التحسين المستمر'
    ]
  };

  return {
    system: 'SHEIKHA_ENTERPRISE_INTEGRATION_VERIFICATION_LAYER_V1',
    status: overallScore === 100 ? 'PRODUCTION_READY' : overallScore >= 80 ? 'STABILIZATION_REQUIRED' : 'REVIEW_REQUIRED',
    generatedAt: new Date().toISOString(),
    principle: 'الكتاب والسنة والصدق في الادعاء والقياس قبل الإعلان',
    overallScore,
    governanceCycle,
    kernelTopology,
    unifiedRuntimeBus,
    unifiedVerificationFabric,
    identityEngine,
    executiveCommandCenter,
    executiveHealthScore: scoreBreakdown,
    integrationGraph: {
      OS: ['Runtime', 'Cloud', 'Supercomputer'],
      Runtime: ['Identity', 'Community', 'Architecture', 'Inspector'],
      Cloud: ['APIs', 'Monitoring', 'Storage', 'Scaling'],
      Supercomputer: ['Compute', 'Batch', 'AI Jobs', 'Analytics', 'Simulation'],
      Governance: ['ExecutiveControlCenter', 'Production']
    },
    dependencyResolver: {
      Runtime: ['OS', 'Cloud'],
      Identity: ['Runtime'],
      Community: ['Runtime', 'Identity'],
      Architecture: ['Runtime', 'Identity', 'Community'],
      Inspector: ['Runtime', 'Identity', 'Architecture'],
      Governance: ['Runtime', 'Identity', 'Community', 'Architecture', 'Inspector'],
      ExecutiveControlCenter: ['Inspector', 'Governance'],
      Production: ['Governance', 'ExecutiveControlCenter']
    },
    layers,
    unifiedBenchmark: {
      cpuCount: os.cpus().length,
      loadAverage: os.loadavg(),
      totalMemoryBytes: os.totalmem(),
      freeMemoryBytes: os.freemem(),
      latencyHealthEndpointMs: latency.healthMs,
      latencyMetricsEndpointMs: latency.metricsMs,
      latencyPerformanceEndpointMs: latency.performanceMs,
      latencyCommunityDashboardMs: latency.communityDashboardMs,
      jobsPerSecond: benchmark?.benchmark?.cpu?.jobsPerSecond ?? null,
      cpuDurationMs: benchmark?.benchmark?.cpu?.durationMs ?? null,
      ioWriteMs: benchmark?.benchmark?.io?.writeMs ?? null,
      ioReadMs: benchmark?.benchmark?.io?.readMs ?? null,
      note: benchmark
        ? 'This layer includes live OS metrics, API latency, and governed local compute benchmark evidence.'
        : 'This layer records live OS metrics and API latency while awaiting governed benchmark evidence.'
    },
    recommendations: overallScore === 100
      ? ['Enterprise integration verification layer is ready.', 'Keep benchmarks evidence-based before any supercomputer claim.']
      : ['Resolve degraded layers before production claims.', 'Preserve Quran-Sunnah governance and measured evidence for all readiness claims.']
  };
}

function writeReport(report = buildReport()) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return report;
}

if (require.main === module) {
  console.log(JSON.stringify(writeReport(), null, 2));
}

module.exports = {
  buildLayer,
  buildReport,
  getPm2Process,
  scoreFromChecks,
  writeReport
};