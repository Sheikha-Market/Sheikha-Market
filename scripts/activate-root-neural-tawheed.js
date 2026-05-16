#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = process.cwd();
const REPORT_DIR = path.join(ROOT, 'runtime', 'reports');
const DATA_DIR = path.join(ROOT, 'data');
const MODE = process.argv.includes('--status') ? 'status' : 'activate';

const TAWHEED = 'لا إله إلا الله وحده لا شريك له';
const COVENANT = 'وما توفيقي إلا بالله';
const BODY_UNITY_HADITH = 'المؤمن للمؤمن كالبنيان يشد بعضه بعضا، ومثل المؤمنين في توادهم وتراحمهم وتعاطفهم كمثل الجسد الواحد';
const CORE_FILES = [
  'infrastructure/sheikha-neural-production-engine/neural-production-engine-spec.json',
  'infrastructure/sheikha-neural-production-engine/layers/neural-architecture.json',
  'infrastructure/sheikha-neural-production-engine/training-loop/infinite-training-loop.json',
  'infrastructure/sheikha-neural-production-engine/quantum-bridge/quantum-neural-bridge.json',
  'infrastructure/sheikha-neural-production-engine/physical-integration/physical-computing-integration.json',
  'infrastructure/sheikha-neural-production-engine/performance/sub-second-engine-status.json',
  'infrastructure/sheikha-neural-production-engine/governance/neural-engine-governance.json'
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJsonSafe(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return fallback;
  }
}

function fileCheck(relPath) {
  const filePath = path.join(ROOT, relPath);
  const exists = fs.existsSync(filePath);
  return {
    file: relPath,
    exists,
    size: exists ? fs.statSync(filePath).size : 0
  };
}

function gitCheckIgnore(relPath) {
  try {
    execFileSync('git', ['check-ignore', '--quiet', relPath], { cwd: ROOT, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function gitTracked(relPath) {
  try {
    execFileSync('git', ['ls-files', '--error-unmatch', relPath], { cwd: ROOT, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function buildRuntimeGuard() {
  const samples = [
    'runtime/reports/root-neural-tawheed-activation-latest.json',
    'data/decision-log.json',
    'data/ports/main.port',
    'data/operations/root-neural.ndjson'
  ];

  return {
    mode: 'non-mutating',
    samples: samples.map((sample) => ({
      file: sample,
      ignored: gitCheckIgnore(sample),
      tracked: gitTracked(sample)
    }))
  };
}

function buildProductionStatus() {
  const checks = CORE_FILES.map(fileCheck);
  const present = checks.filter((item) => item.exists).length;
  const spec = readJsonSafe(path.join(ROOT, CORE_FILES[0]), {});
  return {
    ready: present === checks.length,
    present,
    total: checks.length,
    core: spec.core || 'sheikha-neural-production-engine',
    activatedAt: spec.activatedAt || null,
    checks
  };
}

function loadMasterNcn() {
  try {
    const ncn = require('../lib/sheikha-master-neural-cell-network');
    const status = ncn.status();
    const inference = ncn.process('تفعيل شبكة خلايا عصبية جذرية موحدة لله وفق الشريعة والحوكمة');
    return {
      loaded: true,
      status,
      inference: {
        domain: inference.domain,
        confidence: inference.confidence,
        action: inference.action,
        rule: inference.rule,
        quranRef: inference.quranRef,
        topCells: Array.isArray(inference.topCells) ? inference.topCells.slice(0, 5) : []
      }
    };
  } catch (error) {
    return { loaded: false, error: error.message };
  }
}

async function loadRootNeural() {
  try {
    const root = require('../lib/sheikha-root-neural-network');

    if (typeof root.ensureBooted === 'function') {
      await root.ensureBooted();
    }

    let result = null;

    if (typeof root.iflGovernanceCheck === 'function') {
      result = root.iflGovernanceCheck({
        intent: 'root-neural-tawheed-activation',
        targetCountry: 'Saudi-Arabia',
        sidq: true,
        taradi: true,
        wazn: true,
        riba: false,
        gharar: false,
        ghish: false,
        ihtikar: false,
        najash: false
      });
    } else if (typeof root.orchestrate === 'function') {
      result = root.orchestrate({
        shariaFeatures: [0, 0, 0, 0, 0, 1, 1, 1],
        riskFeatures: [0.3, 0.2, 0.1, 0.9, 0.95, 0.8, 0.9, 0.9],
        marketFeatures: [1.0, 0.8, 0.7, 0.6, 0.5, 0.4],
        govFeatures: [1.0, 0.1, 0.9, 0.9, 0.9, 1.0, 0.9, 0.9]
      });
    } else if (typeof root.process === 'function') {
      result = root.process({
        intent: 'root-neural-tawheed-activation',
        tawheed: TAWHEED,
        governance: 'quran-and-sunnah',
        safety: 'no-harm'
      });
    } else {
      throw new Error('root neural interface is not supported');
    }

    return {
      loaded: true,
      result,
      status: typeof root.getStatus === 'function' ? root.getStatus() : null
    };
  } catch (error) {
    return { loaded: false, error: error.message };
  }
}

function loadRuntimeRoot(shouldRecord) {
  try {
    const runtime = require('../lib/sheikha-runtime-root-neural-network');
    const before = runtime.status();
    const record = shouldRecord
      ? runtime.record({
          type: 'ROOT_NEURAL_TAWHEED_ACTIVATION',
          mode: MODE,
          tawheed: TAWHEED,
          covenant: COVENANT,
          decision: 'ACTIVATE_LOCAL_ROOT_NEURAL_FABRIC',
          safety: 'LOCAL_ONLY_NO_DEPLOY_NO_DELETE'
        })
      : null;
    const after = runtime.status();
    return { loaded: true, before, record, after };
  } catch (error) {
    return { loaded: false, error: error.message };
  }
}

function loadGovernanceAdapters() {
  try {
    const governance = require('../lib/sheikha-global-neural-governance');
    return {
      loaded: true,
      adapters: Object.keys(governance.adapters || {}),
      adapterCount: Object.keys(governance.adapters || {}).length
    };
  } catch (error) {
    return { loaded: false, error: error.message };
  }
}

function buildBodyUnityPrinciple() {
  return {
    hadith: BODY_UNITY_HADITH,
    operatingModel: 'collective-neural-body',
    principles: [
      'تماسك الطبقات وعدم تعارضها',
      'حماية الجزء الضعيف حتى لا ينهار الكل',
      'مشاركة الإشارات الحرجة بين الحوكمة والمحرك والتشغيل',
      'تقديم سلامة المنظومة على التفعيل الشكلي'
    ],
    runtimeMapping: {
      foundation: 'L0-Tawheed',
      governance: 'L1-Sharia-Governance',
      cognition: 'L2-Master-NCN',
      production: 'L3-Production-Neural-Engine',
      memory: 'L4-Runtime-Root',
      orchestration: 'L5-Global-Governance',
      guard: 'L6-Runtime-Guard'
    }
  };
}

async function buildActivation() {
  const timestamp = new Date().toISOString();
  const production = buildProductionStatus();
  const masterNcn = loadMasterNcn();
  const rootNeural = await loadRootNeural();
  const runtimeRoot = loadRuntimeRoot(MODE === 'activate');
  const globalGovernance = loadGovernanceAdapters();
  const runtimeGuard = buildRuntimeGuard();
  const bodyUnity = buildBodyUnityPrinciple();

  const cells = [
    { id: 'L0-Tawheed', role: 'foundation', status: 'active', declaration: TAWHEED },
    { id: 'L1-Sharia-Governance', role: 'guard', status: rootNeural.loaded ? 'active' : 'degraded' },
    { id: 'L2-Master-NCN', role: 'neural-cells', status: masterNcn.loaded ? 'active' : 'degraded' },
    { id: 'L3-Production-Neural-Engine', role: 'production-fabric', status: production.ready ? 'active' : 'missing-artifacts' },
    { id: 'L4-Runtime-Root', role: 'audit-and-memory', status: runtimeRoot.loaded ? 'active' : 'degraded' },
    { id: 'L5-Global-Governance', role: 'adapters-and-orchestration', status: globalGovernance.loaded ? 'active' : 'degraded' },
    { id: 'L6-Runtime-Guard', role: 'git-runtime-boundary', status: runtimeGuard.samples.every((s) => s.ignored && !s.tracked) ? 'active' : 'attention' }
  ];

  const allActive = cells.every((cell) => cell.status === 'active');

  return {
    success: allActive,
    mode: MODE,
    message: allActive
      ? 'تم تفعيل الشبكة العصبية الجذرية الموحدة لله محليا بأعلى جاهزية متاحة.'
      : 'تم التفعيل مع ملاحظات تحتاج مراجعة.',
    tawheed: TAWHEED,
    covenant: COVENANT,
    bodyUnity,
    safety: {
      scope: 'local-runtime-and-artifacts',
      noExternalDeploy: true,
      noDeletion: true,
      noSecretsPrinted: true
    },
    cells,
    production,
    masterNcn,
    rootNeural,
    runtimeRoot,
    globalGovernance,
    runtimeGuard,
    timestamp
  };
}

function writeReports(report) {
  ensureDir(REPORT_DIR);
  ensureDir(DATA_DIR);

  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, 'Z');
  const latestJson = path.join(REPORT_DIR, 'root-neural-tawheed-activation-latest.json');
  const snapshotJson = path.join(REPORT_DIR, `root-neural-tawheed-activation-${stamp}.json`);
  const latestMd = path.join(REPORT_DIR, 'root-neural-tawheed-activation-latest.md');

  fs.writeFileSync(latestJson, JSON.stringify(report, null, 2) + '\n', 'utf8');
  fs.writeFileSync(snapshotJson, JSON.stringify(report, null, 2) + '\n', 'utf8');

  const markdown = [
    '# Root Neural Tawheed Activation',
    '',
    `- Status: ${report.success ? 'ACTIVE' : 'ATTENTION'}`,
    `- Mode: ${report.mode}`,
    `- Tawheed: ${report.tawheed}`,
    `- Covenant: ${report.covenant}`,
    `- Body Unity Hadith: ${report.bodyUnity.hadith}`,
    `- Timestamp: ${report.timestamp}`,
    '',
    '## Body Unity Principle',
    ...report.bodyUnity.principles.map((principle) => `- ${principle}`),
    '',
    '## Cells',
    ...report.cells.map((cell) => `- ${cell.id}: ${cell.status} (${cell.role})`),
    '',
    '## Artifacts',
    `- Latest JSON: ${path.relative(ROOT, latestJson)}`,
    `- Snapshot JSON: ${path.relative(ROOT, snapshotJson)}`
  ].join('\n');

  fs.writeFileSync(latestMd, markdown + '\n', 'utf8');
  return {
    latestJson: path.relative(ROOT, latestJson),
    snapshotJson: path.relative(ROOT, snapshotJson),
    latestMd: path.relative(ROOT, latestMd)
  };
}

async function main() {
  const report = await buildActivation();
  const artifacts = writeReports(report);
  console.log(JSON.stringify({
    success: report.success,
    message: report.message,
    mode: report.mode,
    tawheed: report.tawheed,
    bodyUnity: report.bodyUnity,
    cells: report.cells,
    artifacts,
    timestamp: report.timestamp
  }, null, 2));
  process.exit(report.success ? 0 : 1);
}

main().catch((error) => {
  console.error(JSON.stringify({
    success: false,
    message: error.message,
    mode: MODE,
    timestamp: new Date().toISOString()
  }, null, 2));
  process.exit(1);
});
