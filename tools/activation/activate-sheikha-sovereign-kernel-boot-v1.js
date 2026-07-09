'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = process.cwd();
const reportPath = 'runtime/sovereign-kernel-boot/v1/sheikha-sovereign-kernel-boot-v1-report.json';
const handbookPath = 'docs/sovereign-kernel-boot-v1/SHEIKHA-SOVEREIGN-KERNEL-BOOT-V1.md';

function resolve(relativePath) {
  return path.join(ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(resolve(relativePath));
}

function readJson(relativePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(resolve(relativePath), 'utf8'));
  } catch {
    return fallback;
  }
}

function scoreFromChecks(checks) {
  const values = Object.values(checks);
  const passed = values.filter(Boolean).length;
  return {
    passed,
    total: values.length,
    score: values.length === 0 ? 0 : Math.round((passed / values.length) * 100)
  };
}

function routeEvidence() {
  const serverText = exists('server.js') ? fs.readFileSync(resolve('server.js'), 'utf8') : '';
  const routePatterns = [
    '/',
    '/marketplace',
    '/api/health',
    '/api/stores',
    '/api/stores-by-specialty',
    '/api/sheikha/live/chat/v1',
    '/api/marketplace/capabilities'
  ];

  return routePatterns.map((route) => ({
    route,
    present: serverText.includes(`'${route}'`) || serverText.includes(`"${route}"`) || serverText.includes(route)
  }));
}

function buildReport() {
  const packageJson = readJson('package.json', { scripts: {}, engines: {} });
  const languageContract = readJson('runtime/sheikha-language-integration/sheikha-language-integration-v1.json', {});
  const masterActivation = readJson('runtime/master-activation/sheikha-master-activation-consolidation-v1-report.json', {});
  const islamicKernelReport = readJson('runtime/islamic-ai-kernel/v1/sheikha-islamic-ai-kernel-v1-report.json', null);
  const routes = routeEvidence();

  const checks = {
    islamicAiKernelCore: exists('core/islamic-ai-kernel/sheikha-islamic-ai-kernel-v1.js'),
    islamicAiActivationTool: exists('tools/activation/activate-sheikha-islamic-ai-kernel-v1.js'),
    runtimeKernel: exists('runtime/kernel/sheikha-runtime-kernel.js'),
    governanceKernel: exists('runtime/governance/governance-kernel.json'),
    quranSunnahGovernance: exists('runtime/quran-sunnah-governance/sheikha-quran-sunnah-governance.json') || exists('docs/sharia-governance-fabric/SHEIKHA-SHARIA-GOVERNANCE-FABRIC-V1.md'),
    sheikhaLanguageContract: languageContract.status === 'ACTIVE',
    sheikhaLanguageCompiler: exists('sheikha-language/compiler/sheikha-compiler.js'),
    sheikhaLanguageRuntime: exists('js/sheikha-language-runtime.js') || exists('runtime/sheikha-language-stack/sheikha-language-stack.js'),
    masterActivationCatalog: masterActivation.status === 'ACTIVE_WITH_VERIFIED_LOCAL_CATALOG',
    marketplaceOperatingSystem: exists('runtime/marketplace-operating-system-v1/v1/sheikha-marketplace-operating-system-v1-report.json'),
    websiteFrontendRoutes: routes.filter((item) => item.present).length >= 4,
    packageSurface: exists('routes/arabic-package-manager-fabric/sheikha-arabic-package-manager-fabric-routes.js') && Boolean(packageJson.scripts?.package),
    laptopBootScript: exists('scripts/sheikha-os-boot.sh'),
    bareMetalSeed: exists('scripts/bare-metal-minimal/boot.asm') && exists('scripts/bare-metal-minimal/kernel.c'),
    recoveryEngine: exists('runtime/recovery/sheikha-recovery-engine.js'),
    recoveryHealthRoutes: exists('routes/recovery-health/sheikha-recovery-health-routes.js'),
    operationalReadinessRecovery: exists('tools/release/sheikha-operational-readiness-v1.sh')
  };
  const score = scoreFromChecks(checks);

  const report = {
    system: 'SHEIKHA_SOVEREIGN_KERNEL_BOOT_V1',
    generatedAt: new Date().toISOString(),
    status: score.score === 100 ? 'ACTIVE_WITH_SOVEREIGN_BOOT_CATALOG' : 'ACTIVE_WITH_REVIEW',
    score: score.score,
    checks,
    governanceKernel: {
      reference: {
        quran: true,
        authenticSunnah: true,
        noDivineAuthorityClaim: true,
        noRevelationClaim: true,
        noInfallibilityClaim: true,
        noIndependentFatwa: true,
        scholarReviewForReligiousRulings: true,
        humanReviewForHighImpact: true
      },
      principles: [
        'الصدق',
        'الأمانة',
        'العدل',
        'الإحسان',
        'لا ضرر ولا ضرار',
        'حفظ الحقوق',
        'التوثيق والبيّنة',
        'المراجعة البشرية في القرارات العالية الأثر'
      ],
      aiRole: 'governed_decision_support_and_coding_runtime',
      decision: 'KERNEL_FUSED_WITH_ISLAMIC_GOVERNANCE_AND_AI_SUPPORT'
    },
    sheikhaLanguagePrimacy: {
      status: languageContract.status === 'ACTIVE' ? 'ACTIVE_AS_FOUNDATIONAL_PROGRAMMING_CONTRACT' : 'NEEDS_LANGUAGE_CONTRACT_REVIEW',
      mandatoryForNewSystems: true,
      mode: languageContract.mode || 'ARABIC_DSL_GOVERNED_PROGRAMMING_INTEGRATION',
      principle: 'كل نظام جديد داخل شيخة يبدأ بعقد لغة شيخة: مواصفة، حوكمة، workflow، عقد، تنفيذ، ثم ترجمة آمنة عند الحاجة.',
      layers: languageContract.languageLayers || [],
      integrationTargets: languageContract.integrationTargets || [],
      blockedClaims: languageContract.blockedClaims || [],
      compilerEvidence: [
        'sheikha-language/compiler/sheikha-compiler.js',
        'sheikha-language/compiler/sheikha-runner.js',
        'sheikha-language/specifications/language-spec-registry.json',
        'runtime/sheikha-programming-language-core/sheikha-programming-language-core.json'
      ].filter(exists)
    },
    fromScratchBoundary: {
      applicationKernelBuiltFromSheikhaContracts: true,
      higherBusinessLogicSystemRequired: false,
      hostBootstrapRequiredToday: true,
      hostBootstrapSubstrate: ['Linux or compatible OS', 'Node.js runtime', 'PM2 optional process manager'],
      bareMetalFullyIndependentToday: false,
      bareMetalSeedPresent: checks.bareMetalSeed,
      truthPolicy: 'لا يتم ادعاء نظام bare-metal مستقل كامل حتى توجد اختبارات إقلاع وملفات صورة وتشغيل على عتاد/VM موثقة.',
      roadmapTarget: 'Sheikha-first boot chain where Sheikha Language contracts generate runtime services, recovery, stores, and governance before external adapters.'
    },
    frontendAndStores: {
      status: checks.websiteFrontendRoutes ? 'READY_FOR_LOCAL_FRONTEND_SMOKE' : 'ROUTES_REQUIRE_REVIEW',
      routes,
      surfaces: [
        { name: 'website', path: '/', evidence: 'server.js' },
        { name: 'marketplace', path: '/marketplace', evidence: 'server.js' },
        { name: 'storesApi', path: '/api/stores', evidence: 'server.js' },
        { name: 'storesBySpecialtyApi', path: '/api/stores-by-specialty', evidence: 'server.js' },
        { name: 'liveChat', path: '/api/sheikha/live/chat/v1', evidence: 'routes/live-realtime-fabric' },
        { name: 'arabicPackageManager', path: '/api/sheikha/arabic-package-manager-fabric', evidence: 'routes/arabic-package-manager-fabric' },
        { name: 'vscodeExtensionPackage', path: 'sheikha-vscode-extension', evidence: 'package script: package' }
      ]
    },
    laptopBootReadiness: {
      status: checks.laptopBootScript ? 'READY_FOR_HOSTED_LAPTOP_BOOT' : 'BOOT_SCRIPT_MISSING',
      hostRequirements: {
        node: packageJson.engines?.node || '^20.0.0',
        pm2: packageJson.engines?.pm2 || 'optional',
        memory: '8GB minimum, 16GB+ recommended',
        storage: 'SSD recommended',
        network: 'optional for local-only mode; required for external integrations'
      },
      commands: [
        'npm install',
        'npm run -s ops:sovereign-kernel-boot:v1',
        'npm run -s ops:master-activation:consolidation:v1',
        'npm run server:restart',
        'curl -s http://127.0.0.1:8080/api/health'
      ]
    },
    recoveryPlaybook: {
      status: checks.recoveryEngine && checks.recoveryHealthRoutes ? 'ACTIVE_RECOVERY_PATH' : 'RECOVERY_REVIEW_REQUIRED',
      stages: [
        'detect: health, logs, runtime report, event-loop symptoms',
        'isolate: stop risky automation and preserve evidence',
        'restore: recover package/server/runtime snapshots to temporary location first',
        'repair: run targeted tests and truth-gate checks',
        'restart: pm2 restart sheikha-main-portal --update-env',
        'verify: health endpoint, stores API, marketplace, live chat SSE',
        'document: write recovery report and link to master activation'
      ],
      commands: [
        'npm run -s ops:runtime:doctor',
        'bash tools/release/sheikha-operational-readiness-v1.sh',
        'npm test -- --runInBand tests/sheikha-sovereign-kernel-boot-v1.test.js',
        'pm2 restart sheikha-main-portal --update-env'
      ]
    },
    roadmap: [
      { phase: 1, name: 'Hosted Sovereign Kernel', status: 'ACTIVE', output: 'Node/Linux hosted Sheikha kernel with Islamic AI governance and language contract.' },
      { phase: 2, name: 'Sheikha Language First Runtime', status: 'ACTIVE_CONTRACT_NEEDS_MORE_COMPILER_COVERAGE', output: 'All new systems start from .shk/spec contracts and compile/adapt downward.' },
      { phase: 3, name: 'Frontend and Store Surface Activation', status: 'READY_FOR_LOCAL_SMOKE', output: 'Website, marketplace, stores APIs, package surfaces, and apps verified locally.' },
      { phase: 4, name: 'Portable Laptop Boot Pack', status: 'READY_FOR_HOSTED_BOOT_PACKAGING', output: 'One-command local laptop boot with recovery handbook.' },
      { phase: 5, name: 'Bare-Metal/VM Boot Chain', status: 'SEED_PRESENT_NOT_CLAIMED_COMPLETE', output: 'Minimal boot.asm/kernel.c evolves into tested VM image.' },
      { phase: 6, name: 'Full Sheikha-Native System', status: 'ROADMAP', output: 'Sheikha Language controls boot, services, stores, recovery, governance, and AI adapters.' }
    ],
    outputs: {
      report: reportPath,
      handbook: handbookPath
    },
    principle: 'النواة مدمجة بالحوكمة الإسلامية والذكاء الصناعي، ولغة شيخة هي عقد البرمجة الأساسي؛ لا ادعاء لاستقلال bare-metal كامل قبل دليله.'
  };

  return report;
}

function writeJson(relativePath, payload) {
  fs.mkdirSync(path.dirname(resolve(relativePath)), { recursive: true });
  fs.writeFileSync(resolve(relativePath), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function buildHandbook(report) {
  return [
    '# SHEIKHA Sovereign Kernel Boot V1',
    '',
    `Status: ${report.status}`,
    `Score: ${report.score}`,
    '',
    '## Kernel Covenant',
    '',
    '- المرجعية القيمية: الكتاب والسنة الصحيحة.',
    '- الذكاء الصناعي أداة تحليل ودعم وتنفيذ محكوم، لا يدعي الوحي ولا العصمة ولا يصدر فتوى مستقلة.',
    '- القرارات العالية الأثر تحتاج مراجعة بشرية، والمسائل الدينية تحتاج مراجعة أهل الاختصاص.',
    '',
    '## Sheikha Language First',
    '',
    'كل نظام جديد يبدأ من عقد لغة شيخة: مواصفة، حوكمة، workflow، عقد، تنفيذ، ثم ترجمة آمنة عند الحاجة.',
    '',
    '## Hosted Laptop Boot',
    '',
    '```bash',
    'npm install',
    'npm run -s ops:sovereign-kernel-boot:v1',
    'npm run -s ops:master-activation:consolidation:v1',
    'npm run server:restart',
    'curl -s http://127.0.0.1:8080/api/health',
    '```',
    '',
    '## Frontend Smoke',
    '',
    '```bash',
    'curl -I http://127.0.0.1:8080/',
    'curl -I http://127.0.0.1:8080/marketplace',
    'curl -s http://127.0.0.1:8080/api/stores',
    'curl -s http://127.0.0.1:8080/api/stores-by-specialty',
    '```',
    '',
    '## Recovery',
    '',
    '1. Detect: افحص الصحة والسجلات.',
    '2. Isolate: أوقف المسارات الخطرة واحفظ الأدلة.',
    '3. Restore: اختبر الاستعادة في /tmp أولًا.',
    '4. Repair: شغّل الاختبارات المستهدفة.',
    '5. Restart: أعد تشغيل PM2.',
    '6. Verify: افحص الصحة والمتاجر واللايف.',
    '7. Document: حدّث تقرير التعافي.',
    '',
    '## Truth Boundary',
    '',
    'تشغيل شيخة الحالي هو hosted sovereign kernel فوق مضيف محلي. لا يُدّعى استقلال bare-metal كامل حتى تكتمل اختبارات صورة إقلاع موثقة.',
    ''
  ].join('\n');
}

function writeReport(report = buildReport()) {
  writeJson(reportPath, report);
  fs.mkdirSync(path.dirname(resolve(handbookPath)), { recursive: true });
  fs.writeFileSync(resolve(handbookPath), buildHandbook(report), 'utf8');
  return report;
}

if (require.main === module) {
  const report = writeReport();
  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    score: report.score,
    sheikhaLanguage: report.sheikhaLanguagePrimacy.status,
    frontend: report.frontendAndStores.status,
    laptopBoot: report.laptopBootReadiness.status,
    recovery: report.recoveryPlaybook.status,
    bareMetalFullyIndependentToday: report.fromScratchBoundary.bareMetalFullyIndependentToday,
    outputs: report.outputs,
    host: {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memoryGB: Math.round(os.totalmem() / 1024 / 1024 / 1024)
    }
  }, null, 2));
}

module.exports = {
  buildHandbook,
  buildReport,
  scoreFromChecks,
  writeReport
};
