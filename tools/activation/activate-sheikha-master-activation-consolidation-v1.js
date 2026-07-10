'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { execSync } = require('node:child_process');

const ROOT = process.cwd();
const reportPath = 'runtime/master-activation/sheikha-master-activation-consolidation-v1-report.json';
const catalogPath = 'runtime/master-activation/sheikha-enterprise-architecture-catalog-v1.json';
const capabilityRegistryPath = 'runtime/master-activation/sheikha-master-capability-registry-v1.json';
const architectureGraphPath = 'runtime/master-activation/sheikha-master-architecture-graph-v1.json';
const duplicateDetectionPath = 'runtime/master-activation/sheikha-master-duplicate-detection-v1.json';
const executiveDashboardPath = 'runtime/master-activation/sheikha-master-executive-dashboard-v1.json';
const finalExecutiveReportPath = 'runtime/master-activation/sheikha-master-final-executive-report-v1.json';
const documentationIndexPath = 'runtime/master-activation/sheikha-master-documentation-index-v1.json';
const methodologyAccreditationPath = 'runtime/master-activation/sheikha-master-methodology-accreditation-readiness-v1.json';
const externalAccreditationVerificationPath = 'runtime/master-activation/sheikha-master-external-accreditation-verification-v1.json';
const sovereignKernelBootPath = 'runtime/sovereign-kernel-boot/v1/sheikha-sovereign-kernel-boot-v1-report.json';
const sovereignKernelBootHandbookPath = 'docs/sovereign-kernel-boot-v1/SHEIKHA-SOVEREIGN-KERNEL-BOOT-V1.md';
const bareMetalSeedPath = 'runtime/bare-metal/v1/sheikha-bare-metal-seed-v1-report.json';
const bareMetalSeedHandbookPath = 'bare-metal/README.md';
const bareMetalBootArtifactPath = 'bare-metal/images/esp/EFI/BOOT/BOOTX64.EFI';
const bareMetalBootImagePath = 'bare-metal/images/sheikha-bare-metal-seed-v1.img';
const computingCognitiveLayersPath = 'runtime/computing-cognitive-layers/v1/sheikha-computing-cognitive-layers-v1-report.json';
const computingCognitiveLayersHandbookPath = 'docs/computing-cognitive-layers-v1/SHEIKHA-COMPUTING-COGNITIVE-LAYERS-V1.md';
const distributionReportPath = 'runtime/distribution/v1/sheikha-universal-distribution-v1-report.json';
const distributionApexReportPath = 'runtime/distribution-apex/v1/sheikha-universal-distribution-apex-v1-report.json';
const governanceGeneratorReportPath = 'runtime/governance-generator/v1/sheikha-governance-generator-v1-report.json';
const publicBenefitPolicyPath = 'runtime/governance-generator/v1/registries/public-benefit-capability-policy-v1.json';
const nativeLanguageArchitecturePath = 'runtime/sheikha-language-architecture/v1/sheikha-native-language-architecture-v1-report.json';
const nativeLanguageArchitectureHandbookPath = 'docs/sheikha-language-architecture-v1/SHEIKHA-NATIVE-LANGUAGE-ARCHITECTURE-V1.md';
const sheikhaLanguageProductionPath =
  'runtime/sheikha-production-language/v1/sheikha-production-language-v1-report.json';
const sheikhaLanguageProductionHandbookPath =
  'docs/sheikha-production-language/SHEIKHA-PRODUCTION-LANGUAGE-V1.md';
const universalBenefitBoundaryPath =
  'runtime/universal-benefit-boundary/v1/sheikha-universal-benefit-boundary-v1-report.json';
const universalBenefitBoundaryHandbookPath =
  'docs/universal-benefit-boundary-v1/SHEIKHA-UNIVERSAL-BENEFIT-BOUNDARY-V1.md';
const distributionMatrixPath = 'distribution/manifest/sheikha-release-matrix-v1.json';
const distributionHandbookPath = 'distribution/README.md';
const distributionBareMetalLinkPath = 'distribution/manifest/sheikha-bare-metal-distribution-link-v1.json';
const universalTechnologyHpcFabricPath = 'runtime/universal-technology-hpc-fabric/v1/sheikha-universal-technology-hpc-fabric-v1-report.json';
const universalTechnologyHpcFabricHandbookPath = 'docs/universal-technology-hpc-fabric-v1/SHEIKHA-UNIVERSAL-TECHNOLOGY-HPC-FABRIC-V1.md';
const technologyFamilyTreePath = 'runtime/technology-family-tree/v1/sheikha-technology-family-tree-v1-report.json';
const technologyFamilyTreeHandbookPath = 'docs/technology-family-tree-v1/SHEIKHA-TECHNOLOGY-FAMILY-TREE-V1.md';
const jannatGardensPath = 'runtime/jannat-gardens/v1/sheikha-jannat-gardens-v1-report.json';
const jannatGardensHandbookPath = 'docs/jannat-gardens-v1/SHEIKHA-JANNAT-GARDENS-V1.md';
const jannatGardensPublicModelPath = 'public/sheikha-jannat-gardens/sheikha-jannat-gardens-v1.json';
const packageJson = require(path.join(ROOT, 'package.json'));

const DISCOVERY_EXCLUDES = new Set(['.git', 'node_modules']);
const LOCAL_ARTIFACT_ROOTS = new Set([
  '.venv',
  'archive',
  'archives',
  'backups',
  'build',
  'bundles',
  'dist',
  'exports',
  'logs',
  'node_modules',
  'release',
  'reports',
  'sheikha-main-portal-restored'
]);

const LAYER_RULES = [
  ['identity', 'Identity'],
  ['formation', 'Identity'],
  ['governance', 'Governance'],
  ['policy', 'Governance'],
  ['enterprise', 'Enterprise'],
  ['community', 'Community'],
  ['knowledge-graph', 'Knowledge'],
  ['knowledge', 'Knowledge'],
  ['rag', 'Knowledge'],
  ['vector', 'Knowledge'],
  ['marketplace', 'Marketplace'],
  ['market', 'Marketplace'],
  ['commerce', 'Commerce'],
  ['commercial', 'Commerce'],
  ['crm', 'Commerce'],
  ['sales', 'Commerce'],
  ['api', 'APIs'],
  ['route', 'APIs'],
  ['security', 'Security'],
  ['auth', 'Security'],
  ['jwt', 'Security'],
  ['secret', 'Security'],
  ['truth', 'Truth Gate'],
  ['health', 'Health'],
  ['readiness', 'Health'],
  ['recovery', 'Recovery'],
  ['rollback', 'Recovery'],
  ['inspector', 'Inspector'],
  ['control-center', 'Control Center'],
  ['mission-control', 'Control Center'],
  ['executive', 'Executive Center'],
  ['operating-system', 'OS'],
  ['os-cloud', 'OS'],
  ['kernel', 'OS'],
  ['cloud', 'Cloud'],
  ['supercomputer', 'Compute/HPC'],
  ['compute', 'Compute/HPC'],
  ['hpc', 'Compute/HPC'],
  ['monitor', 'Monitoring'],
  ['observability', 'Monitoring'],
  ['telemetry', 'Monitoring'],
  ['analytics', 'Analytics'],
  ['language', 'Language'],
  ['arabic', 'Language'],
  ['dsl', 'DSL'],
  ['registry', 'Registry'],
  ['catalog', 'Registry'],
  ['sdk', 'SDK'],
  ['mcp', 'SDK'],
  ['runtime', 'Runtime'],
  ['worker', 'Runtime'],
  ['queue', 'Runtime'],
  ['streaming', 'Runtime'],
  ['doc', 'Documentation'],
  ['readme', 'Documentation']
];

const DEPENDENCY_BY_LAYER = {
  Identity: ['Runtime', 'Governance'],
  Governance: ['Runtime', 'Security'],
  Runtime: ['OS', 'Cloud'],
  Enterprise: ['Governance', 'Runtime', 'Knowledge'],
  Community: ['Identity', 'Runtime', 'Knowledge'],
  Knowledge: ['Identity', 'Runtime', 'Registry'],
  Marketplace: ['Commerce', 'Community', 'Knowledge'],
  Commerce: ['Marketplace', 'Governance', 'Identity'],
  APIs: ['Runtime', 'Security'],
  Security: ['Governance', 'Runtime'],
  'Truth Gate': ['Governance', 'Health'],
  Health: ['Runtime', 'Monitoring'],
  Recovery: ['Runtime', 'Inspector'],
  Inspector: ['Runtime', 'Knowledge'],
  'Control Center': ['Inspector', 'Governance'],
  'Executive Center': ['Control Center', 'Truth Gate', 'Health'],
  OS: ['Cloud', 'Compute/HPC'],
  Cloud: ['OS', 'Runtime'],
  'Compute/HPC': ['OS', 'Cloud'],
  Monitoring: ['Runtime', 'Health'],
  Analytics: ['Knowledge', 'Monitoring'],
  Language: ['DSL', 'Runtime'],
  DSL: ['Language', 'Runtime'],
  Registry: ['Knowledge', 'Governance'],
  SDK: ['APIs', 'Runtime', 'Registry'],
  Documentation: ['Knowledge', 'Registry']
};

const RESPONSIBILITY_BY_LAYER = {
  Identity: 'توحيد هوية شيخة التشغيلية والبصرية والمؤسسية وربطها بالحوكمة.',
  Governance: 'تطبيق الحوكمة، السياسات، بوابات الحقيقة، وضوابط القرار.',
  Runtime: 'تشغيل الخدمات والمحركات والمهام والواجهات في بيئة Node/PM2.',
  Enterprise: 'تنظيم المنصة المؤسسية والطبقات التشغيلية العليا.',
  Community: 'نمذجة المجتمع والتكوين الحضاري وروابط المعرفة المجتمعية.',
  Knowledge: 'إدارة المعرفة والرسوم المعرفية والفهارس والاسترجاع.',
  Marketplace: 'تنظيم السوق والفرص والكتالوجات والتجارب التجارية.',
  Commerce: 'تشغيل التجارة، العملاء، التسعير، العقود، والمسارات المحكومة.',
  APIs: 'توفير الواجهات البرمجية والمسارات الداخلية والخارجية.',
  Security: 'حماية الوصول والأسرار والحدود والسياسات الأمنية.',
  'Truth Gate': 'منع الادعاءات غير المثبتة وربط القرارات بالأدلة.',
  Health: 'فحص الصحة، الجاهزية، والمؤشرات التشغيلية.',
  Recovery: 'التعافي، الرجوع الآمن، وإصلاح حالات التعطل.',
  Inspector: 'الفحص العام والفرعي، كشف التعارض، وتجميع الأدلة.',
  'Control Center': 'عرض الحالة والتحكم التشغيلي العام.',
  'Executive Center': 'تجميع الرؤية والأهداف والمخاطر والقرارات التنفيذية.',
  OS: 'ربط نواة التشغيل والعمليات والخدمات المحلية.',
  Cloud: 'تهيئة التكامل السحابي والنشر والمراقبة دون افتراض جاهزية إنتاجية.',
  'Compute/HPC': 'قياس الحوسبة الثقيلة والقدرات العالية بدليل محلي.',
  Monitoring: 'المراقبة والسجلات والتنبيهات والمؤشرات.',
  Analytics: 'تحليل البيانات والمؤشرات والاتجاهات.',
  Language: 'تشغيل اللغة العربية وطبقات DSL/Compiler المرتبطة.',
  DSL: 'تعريف لغة تشغيلية محكومة وقابلة للقياس.',
  Registry: 'حفظ السجلات المرجعية للقدرات والواجهات والملكية.',
  SDK: 'ربط SDK/MCP والواجهات البرمجية للمطورين.',
  Documentation: 'توثيق الأدلة والقرارات والواجهات دون تكرار غير لازم.'
};

const IO_BY_LAYER = {
  Identity: { inputs: ['identity reports', 'control center tokens'], outputs: ['identity status', 'identity health'] },
  Governance: { inputs: ['policies', 'runtime evidence'], outputs: ['admission decisions', 'audit records'] },
  Runtime: { inputs: ['requests', 'jobs', 'events'], outputs: ['responses', 'reports', 'logs'] },
  Enterprise: { inputs: ['capabilities', 'registries'], outputs: ['enterprise status', 'integration decisions'] },
  Community: { inputs: ['community models', 'identity'], outputs: ['formation readiness', 'community dashboard data'] },
  Knowledge: { inputs: ['docs', 'reports', 'indexes'], outputs: ['knowledge graph', 'retrieval evidence'] },
  Marketplace: { inputs: ['catalogs', 'market data'], outputs: ['market views', 'opportunity signals'] },
  Commerce: { inputs: ['customer data', 'pricing data'], outputs: ['quotes', 'commerce decisions'] },
  APIs: { inputs: ['HTTP requests'], outputs: ['HTTP responses'] },
  Security: { inputs: ['credentials', 'headers', 'policies'], outputs: ['allow/deny decisions', 'audit logs'] },
  'Truth Gate': { inputs: ['claims', 'evidence'], outputs: ['truth decision', 'blocked claims'] },
  Health: { inputs: ['runtime signals'], outputs: ['health score', 'readiness status'] },
  Recovery: { inputs: ['failures', 'snapshots'], outputs: ['recovery actions', 'rollback reports'] },
  Inspector: { inputs: ['registries', 'runtime state'], outputs: ['inspection findings', 'conflict reports'] },
  'Control Center': { inputs: ['status feeds'], outputs: ['control center state'] },
  'Executive Center': { inputs: ['catalog', 'metrics', 'risks'], outputs: ['executive dashboard', 'decision summary'] },
  OS: { inputs: ['process state'], outputs: ['runtime process capability'] },
  Cloud: { inputs: ['deployment configs'], outputs: ['cloud readiness evidence'] },
  'Compute/HPC': { inputs: ['benchmark tasks'], outputs: ['compute benchmark'] },
  Monitoring: { inputs: ['logs', 'metrics'], outputs: ['observability summary'] },
  Analytics: { inputs: ['events', 'metrics'], outputs: ['analytics reports'] },
  Language: { inputs: ['Arabic language assets'], outputs: ['language integration report'] },
  DSL: { inputs: ['domain expressions'], outputs: ['compiled/runtime rules'] },
  Registry: { inputs: ['component evidence'], outputs: ['registry entries'] },
  SDK: { inputs: ['API contracts'], outputs: ['SDK mapping'] },
  Documentation: { inputs: ['reports', 'source docs'], outputs: ['documentation index'] }
};

function resolve(relativePath) {
  return path.join(ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(resolve(relativePath));
}

function run(command, fallback = '') {
  try {
    return execSync(command, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe']
    }).trim();
  } catch {
    return fallback;
  }
}

function safeReadJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(resolve(relativePath), 'utf8'));
  } catch {
    return null;
  }
}

function safeReadText(relativePath, maxBytes = 96 * 1024) {
  try {
    const fd = fs.openSync(resolve(relativePath), 'r');
    const buffer = Buffer.alloc(maxBytes);
    const bytes = fs.readSync(fd, buffer, 0, maxBytes, 0);
    fs.closeSync(fd);
    return buffer.subarray(0, bytes).toString('utf8');
  } catch {
    return '';
  }
}

function scoreFromChecks(checks) {
  const values = Object.values(checks).map((value) => {
    if (typeof value === 'boolean') {
      return value;
    }
    return Boolean(value && value.ok !== false && (value.ok === true || value.present === true));
  });
  const passed = values.filter(Boolean).length;
  return {
    passed,
    total: values.length,
    score: values.length === 0 ? 0 : Math.round((passed / values.length) * 100)
  };
}

function shaPath(filePath) {
  return crypto.createHash('sha1').update(filePath).digest('hex').slice(0, 12);
}

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/').replace(/^\.\//, '');
}

function normalizeKey(filePath) {
  return path.basename(filePath)
    .toLowerCase()
    .replace(/sheikha-/g, '')
    .replace(/activate-/g, '')
    .replace(/-v\d+/g, '')
    .replace(/\.(json|js|mjs|cjs|md|sh|html|css|ts|tsx|jsx)$/g, '')
    .replace(/[^a-z0-9\u0600-\u06ff]+/g, '-')
    .replace(/^-|-$/g, '');
}

function inferVersion(filePath) {
  const versionMatch = filePath.match(/(?:^|[-/])v(\d+)(?:[-/.]|$)/i);
  if (versionMatch) {
    return `v${versionMatch[1]}`;
  }
  const packageVersion = packageJson.version;
  return packageVersion ? `package-${packageVersion}` : 'unversioned';
}

function inferType(filePath) {
  const lower = filePath.toLowerCase();
  if (/\.test\.js$/.test(lower)) return 'test';
  if (lower.endsWith('.md')) return 'documentation';
  if (lower.endsWith('-report.json') || lower.endsWith('-report.md')) return 'report';
  if (lower.includes('/routes/') || lower.endsWith('.routes.js') || lower.includes('routes.js')) return 'api-route';
  if (lower.includes('/runtime/')) return 'runtime-artifact';
  if (lower.includes('/tools/') || lower.includes('/scripts/')) return 'tooling';
  if (lower.includes('/sdk/')) return 'sdk';
  if (lower.includes('registry')) return 'registry';
  if (lower.includes('dashboard') || lower.includes('control-center')) return 'dashboard';
  if (lower.endsWith('.json')) return 'data-contract';
  if (lower.endsWith('.js')) return 'code';
  return 'artifact';
}

function classifyLayer(filePath) {
  const lower = filePath.toLowerCase();
  const matched = LAYER_RULES.find(([token]) => lower.includes(token));
  return matched ? matched[1] : 'Documentation';
}

function classifyLifecycleStatus(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.includes('/archive/') || lower.includes('/archives/') || lower.includes('.bak') || lower.includes('backup')) {
    return 'UNUSED';
  }
  if (lower.includes('experimental') || lower.includes('research') || lower.includes('lab')) {
    return 'EXPERIMENTAL';
  }
  if (lower.endsWith('-report.json') || lower.endsWith('-report.md') || lower.includes('/v1/') || lower.includes('/v2/')) {
    return 'ACTIVE';
  }
  if (lower.includes('activate-') || lower.includes('registry') || lower.includes('engine')) {
    return 'NEEDS_LINKING';
  }
  return 'NEEDS_DEVELOPMENT';
}

function inferMaturity(filePath, lifecycle) {
  if (lifecycle === 'ACTIVE') return 'measured';
  if (lifecycle === 'NEEDS_LINKING') return 'implemented-needs-registry-link';
  if (lifecycle === 'EXPERIMENTAL') return 'experimental';
  if (lifecycle === 'UNUSED') return 'legacy-or-backup';
  if (/\.test\.js$/i.test(filePath)) return 'verification';
  if (/\.md$/i.test(filePath)) return 'documented';
  return 'discovered';
}

function inferOperationStatus(filePath, lifecycle) {
  if (lifecycle === 'ACTIVE') return 'evidence-present';
  if (lifecycle === 'NEEDS_LINKING') return 'requires-catalog-link';
  if (lifecycle === 'UNUSED') return 'report-only-no-delete';
  if (lifecycle === 'EXPERIMENTAL') return 'not-production-claimed';
  return 'discovered-not-claimed-production';
}

function buildComponent(filePath, context = {}) {
  const normalized = normalizePath(filePath);
  const layer = classifyLayer(normalized);
  const lifecycle = classifyLifecycleStatus(normalized);
  const io = IO_BY_LAYER[layer] || { inputs: ['repository file'], outputs: ['catalog evidence'] };
  const id = `${normalizeKey(normalized) || 'component'}-${shaPath(normalized)}`;
  const apiRoutes = context.apiRoutes || [];
  const relatedApis = apiRoutes
    .filter((route) => route.file === normalized || normalized.includes(path.dirname(route.file)))
    .slice(0, 20)
    .map((route) => `${route.method.toUpperCase()} ${route.path}`);

  return {
    id,
    name: path.basename(normalized).replace(/\.[^.]+$/, ''),
    version: inferVersion(normalized),
    path: normalized,
    type: inferType(normalized),
    layer,
    status: inferOperationStatus(normalized, lifecycle),
    lifecycle,
    responsibility: RESPONSIBILITY_BY_LAYER[layer] || 'أثر مكتشف داخل المستودع يحتاج ربطًا أو توثيقًا.',
    inputs: io.inputs,
    outputs: io.outputs,
    dependencies: DEPENDENCY_BY_LAYER[layer] || [],
    tests: context.tests || [],
    reports: context.reports || [],
    apis: relatedApis,
    runtime: {
      present: normalized.startsWith('runtime/') || normalized.includes('/runtime/'),
      pm2Managed: /pm2|process|worker|cycle|loop/i.test(normalized),
      evidence: normalized
    },
    maturity: inferMaturity(normalized, lifecycle),
    operationStatus: inferOperationStatus(normalized, lifecycle),
    evidence: {
      source: 'local-repository-discovery',
      githubRequired: false,
      path: normalized
    }
  };
}

function walkFallback(relativePath = '.', collector = []) {
  const fullPath = resolve(relativePath);
  if (!fs.existsSync(fullPath)) return collector;
  for (const entry of fs.readdirSync(fullPath, { withFileTypes: true })) {
    if (DISCOVERY_EXCLUDES.has(entry.name)) continue;
    const nextRelative = normalizePath(path.join(relativePath, entry.name));
    const rootName = nextRelative.split('/')[0];
    if (LOCAL_ARTIFACT_ROOTS.has(rootName)) continue;
    if (entry.isDirectory()) {
      walkFallback(nextRelative, collector);
    } else {
      collector.push(nextRelative);
    }
  }
  return collector;
}

function getRepositoryFiles() {
  try {
    const raw = execSync('git -c core.quotePath=false ls-files -z -co --exclude-standard', {
      cwd: ROOT,
      encoding: 'buffer',
      stdio: ['ignore', 'pipe', 'pipe']
    }).toString('utf8');
    const files = raw
      .split('\0')
      .map(normalizePath)
      .filter(Boolean)
      .filter((filePath) => !DISCOVERY_EXCLUDES.has(filePath.split('/')[0]))
      .sort();
    return files.length > 0 ? files : walkFallback('.');
  } catch {
    return walkFallback('.');
  }
}

function getDiscoveryRoots(files) {
  return Array.from(new Set(files.map((filePath) => filePath.split('/')[0]))).sort();
}

function buildRootInventory(files) {
  const inventory = new Map();
  for (const filePath of files) {
    const rootName = filePath.split('/')[0];
    const current = inventory.get(rootName) || { root: rootName, files: 0, classification: 'repository-artifact' };
    current.files += 1;
    if (LOCAL_ARTIFACT_ROOTS.has(rootName)) {
      current.classification = 'local-artifact-or-operational-output';
    }
    inventory.set(rootName, current);
  }
  return Array.from(inventory.values()).sort((a, b) => a.root.localeCompare(b.root));
}

function countMatches(items, matcher) {
  return items.filter((item) => matcher(item)).length;
}

function buildLayerSummary(components) {
  const layers = Array.from(new Set([...Object.keys(DEPENDENCY_BY_LAYER), ...components.map((item) => item.layer)])).sort();
  return Object.fromEntries(
    layers.map((layer) => [
      layer,
      {
        components: components.filter((item) => item.layer === layer).length,
        dependencies: DEPENDENCY_BY_LAYER[layer] || [],
        responsibility: RESPONSIBILITY_BY_LAYER[layer] || 'Discovered repository layer.'
      }
    ])
  );
}

function extractRoutesFromFile(filePath) {
  if (!/\.(js|mjs|cjs)$/.test(filePath)) return [];
  if (!filePath.startsWith('routes/') && filePath !== 'server.js') return [];
  const text = safeReadText(filePath, 2 * 1024 * 1024);
  const routes = [];
  const routeRegex = /\b(?:app|router)\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = routeRegex.exec(text)) !== null) {
    routes.push({
      method: match[1].toLowerCase(),
      path: match[2],
      file: normalizePath(filePath)
    });
  }
  return routes;
}

function buildApiIndex(files) {
  const endpoints = files.flatMap(extractRoutesFromFile);
  const byKey = new Map();
  for (const endpoint of endpoints) {
    const key = `${endpoint.method}:${endpoint.path}`;
    const group = byKey.get(key) || [];
    group.push(endpoint.file);
    byKey.set(key, group);
  }
  const duplicates = Array.from(byKey.entries())
    .filter(([, routeFiles]) => routeFiles.length > 1)
    .map(([key, routeFiles]) => {
      const [method, routePath] = key.split(':');
      return { method, path: routePath, files: Array.from(new Set(routeFiles)) };
    });
  return {
    endpoints,
    uniqueEndpoints: byKey.size,
    duplicateEndpoints: duplicates
  };
}

function buildRelatedIndex(files, apiIndex) {
  const tests = files.filter((filePath) => /\.test\.js$/i.test(filePath));
  const reports = files.filter((filePath) => /-report\.(json|md)$/i.test(filePath));
  return { tests, reports, apiRoutes: apiIndex.endpoints };
}

function findRelatedFiles(componentPath, candidates, limit = 16) {
  const componentKey = normalizeKey(componentPath);
  const componentName = path.basename(componentPath).toLowerCase().replace(/\.[^.]+$/, '');
  return candidates
    .filter((candidate) => {
      const candidateLower = candidate.toLowerCase();
      return candidateLower.includes(componentKey) || candidateLower.includes(componentName);
    })
    .slice(0, limit);
}

function enrichComponents(files, apiIndex) {
  const related = buildRelatedIndex(files, apiIndex);
  return files.map((filePath) => buildComponent(filePath, {
    apiRoutes: related.apiRoutes,
    tests: findRelatedFiles(filePath, related.tests),
    reports: findRelatedFiles(filePath, related.reports)
  }));
}

function summarizePm2() {
  const raw = run('pm2 jlist', '[]');
  try {
    const list = JSON.parse(raw || '[]');
    return {
      available: true,
      count: list.length,
      online: list.filter((item) => item.pm2_env?.status === 'online').length,
      services: list.map((item) => ({
        name: item.name,
        status: item.pm2_env?.status || 'unknown',
        cpu: item.monit?.cpu ?? null,
        memory: item.monit?.memory ?? null
      }))
    };
  } catch {
    return { available: false, count: 0, online: 0, services: [] };
  }
}

function getDiskUsage() {
  const raw = run('df -Pk . | tail -n 1');
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length < 6) return null;
  return {
    totalKb: Number(parts[1]) || null,
    usedKb: Number(parts[2]) || null,
    availableKb: Number(parts[3]) || null,
    usagePercent: parts[4] || null,
    mount: parts[5] || null
  };
}

function getPortsSnapshot() {
  const raw = run('ss -ltn');
  return raw
    .split('\n')
    .filter((line) => /:8080\b|:8081\b|:8082\b|:3000\b/.test(line))
    .map((line) => line.trim());
}

function getNetworkInterfaceNames() {
  try {
    return Object.keys(os.networkInterfaces() || {});
  } catch {
    return [];
  }
}

function getHealthSnapshot() {
  const raw = run('curl --max-time 1 -s -o /tmp/sheikha-master-health.json -w "%{http_code} %{time_total}" http://127.0.0.1:8080/api/health');
  const [code, seconds] = raw.split(/\s+/);
  return {
    endpoint: 'http://127.0.0.1:8080/api/health',
    ok: code === '200',
    statusCode: code || null,
    latencyMs: Number.isFinite(Number(seconds)) ? Math.round(Number(seconds) * 1000) : null
  };
}

function scanEvidence(files, regexes, limit = 20) {
  const patterns = regexes.map((item) => item instanceof RegExp ? item : new RegExp(item, 'i'));
  const evidence = [];
  const candidates = files.filter((filePath) => /\.(js|json|md|html|css|ts|tsx|jsx|sh|yml|yaml)$/i.test(filePath));
  for (const filePath of candidates) {
    const lowerPath = filePath.toLowerCase();
    if (patterns.some((pattern) => pattern.test(lowerPath))) {
      evidence.push(filePath);
    } else {
      const text = safeReadText(filePath, 64 * 1024);
      if (patterns.some((pattern) => pattern.test(text))) {
        evidence.push(filePath);
      }
    }
    if (evidence.length >= limit) break;
  }
  return evidence;
}

function evidenceForLayer(components, layer, limit = 25) {
  return components
    .filter((item) => item.layer === layer)
    .slice(0, limit)
    .map((item) => item.path);
}

function evidenceForPattern(files, regex, limit = 25) {
  return files.filter((filePath) => regex.test(filePath)).slice(0, limit);
}

function evidenceForAnyPattern(files, regexes, limit = 25) {
  const patterns = regexes.map((item) => item instanceof RegExp ? item : new RegExp(item, 'i'));
  return files
    .filter((filePath) => patterns.some((pattern) => pattern.test(filePath)))
    .slice(0, limit);
}

function buildCapabilityRegistry(components, files, apiIndex, packageScripts) {
  const lifecycleSummary = {
    active: components.filter((item) => item.lifecycle === 'ACTIVE').length,
    needsLinking: components.filter((item) => item.lifecycle === 'NEEDS_LINKING').length,
    needsDevelopment: components.filter((item) => item.lifecycle === 'NEEDS_DEVELOPMENT').length,
    experimental: components.filter((item) => item.lifecycle === 'EXPERIMENTAL').length,
    unused: components.filter((item) => item.lifecycle === 'UNUSED').length
  };
  return {
    system: 'SHEIKHA_MASTER_CAPABILITY_REGISTRY_V1',
    generatedAt: new Date().toISOString(),
    source: 'git-ls-files-local-repository',
    githubRequired: false,
    componentCount: components.length,
    apiEndpoints: apiIndex.uniqueEndpoints,
    packageScripts: packageScripts.length,
    lifecycleSummary,
    maturitySummary: {
      measured: components.filter((item) => item.maturity === 'measured').length,
      linkedRequired: components.filter((item) => item.maturity === 'implemented-needs-registry-link').length,
      discovered: components.filter((item) => item.maturity === 'discovered').length,
      documented: components.filter((item) => item.maturity === 'documented').length
    },
    components,
    evidenceFiles: {
      tests: files.filter((filePath) => /\.test\.js$/i.test(filePath)).length,
      reports: files.filter((filePath) => /-report\.(json|md)$/i.test(filePath)).length,
      docs: files.filter((filePath) => /\.md$/i.test(filePath) || filePath.startsWith('docs/')).length
    }
  };
}

function buildArchitectureGraph(components, layerSummary) {
  const layerNodes = Object.entries(layerSummary).map(([id, data]) => ({
    id,
    type: 'layer',
    components: data.components,
    responsibility: data.responsibility
  }));
  const layerEdges = Object.entries(layerSummary).flatMap(([from, data]) =>
    data.dependencies.map((to) => ({ from, to, type: 'layer-dependency' }))
  );
  const componentEdges = components.flatMap((component) =>
    component.dependencies.map((dependency) => ({
      from: component.id,
      fromPath: component.path,
      to: dependency,
      type: 'component-to-layer'
    }))
  );
  return {
    system: 'SHEIKHA_MASTER_ARCHITECTURE_GRAPH_V1',
    generatedAt: new Date().toISOString(),
    nodes: layerNodes,
    edges: layerEdges,
    componentEdges,
    graphPolicy: 'relationships are inferred from repository evidence and layer contracts'
  };
}

function buildDuplicateDetection(files, components, apiIndex, packageScripts) {
  const duplicateMap = new Map();
  for (const component of components) {
    const key = normalizeKey(component.path);
    if (!duplicateMap.has(key)) duplicateMap.set(key, []);
    duplicateMap.get(key).push(component.path);
  }

  const duplicateFiles = Array.from(duplicateMap.entries())
    .filter(([, paths]) => paths.length > 1)
    .map(([id, paths]) => ({ id, paths }));

  const registryGroups = duplicateFiles.filter((group) => group.paths.some((filePath) => /registry/i.test(filePath)));
  const scriptGroups = new Map();
  for (const scriptName of packageScripts) {
    const key = scriptName.replace(/:v\d+$/i, '').replace(/:(report|status|start|stop|logs)$/i, '');
    const group = scriptGroups.get(key) || [];
    group.push(scriptName);
    scriptGroups.set(key, group);
  }

  return {
    system: 'SHEIKHA_MASTER_DUPLICATE_DETECTION_V1',
    generatedAt: new Date().toISOString(),
    policy: 'REPORT_ONLY_NO_DELETION',
    duplicateFiles,
    duplicateServices: Array.from(scriptGroups.entries())
      .filter(([, scripts]) => scripts.length > 1)
      .map(([id, scripts]) => ({ id, scripts })),
    duplicateApis: apiIndex.duplicateEndpoints,
    duplicateRegistries: registryGroups,
    deadCodeCandidates: components
      .filter((item) => item.lifecycle === 'UNUSED' || item.lifecycle === 'EXPERIMENTAL')
      .slice(0, 500)
      .map((item) => ({ path: item.path, lifecycle: item.lifecycle, reason: item.operationStatus })),
    unusedDirectoryCandidates: buildRootInventory(files)
      .filter((item) => item.classification === 'local-artifact-or-operational-output'),
    note: 'No files were removed. These are consolidation findings only.'
  };
}

function buildIntegrationVerification(components, apiIndex) {
  const checks = {
    os: { ok: evidenceForLayer(components, 'OS').length > 0, evidence: evidenceForLayer(components, 'OS') },
    cloud: { ok: evidenceForLayer(components, 'Cloud').length > 0, evidence: evidenceForLayer(components, 'Cloud') },
    supercomputer: { ok: evidenceForLayer(components, 'Compute/HPC').length > 0, evidence: evidenceForLayer(components, 'Compute/HPC') },
    identity: { ok: evidenceForLayer(components, 'Identity').length > 0, evidence: evidenceForLayer(components, 'Identity') },
    community: { ok: evidenceForLayer(components, 'Community').length > 0, evidence: evidenceForLayer(components, 'Community') },
    enterprise: { ok: evidenceForLayer(components, 'Enterprise').length > 0, evidence: evidenceForLayer(components, 'Enterprise') },
    runtime: { ok: evidenceForLayer(components, 'Runtime').length > 0, evidence: evidenceForLayer(components, 'Runtime') },
    marketplace: { ok: evidenceForLayer(components, 'Marketplace').length > 0, evidence: evidenceForLayer(components, 'Marketplace') },
    knowledge: { ok: evidenceForLayer(components, 'Knowledge').length > 0, evidence: evidenceForLayer(components, 'Knowledge') },
    ai: { ok: components.some((item) => /ai/i.test(item.path)), evidence: components.filter((item) => /ai/i.test(item.path)).slice(0, 25).map((item) => item.path) },
    security: { ok: evidenceForLayer(components, 'Security').length > 0, evidence: evidenceForLayer(components, 'Security') },
    monitoring: { ok: evidenceForLayer(components, 'Monitoring').length > 0, evidence: evidenceForLayer(components, 'Monitoring') },
    executiveCenter: { ok: evidenceForLayer(components, 'Executive Center').length > 0, evidence: evidenceForLayer(components, 'Executive Center') },
    truthGate: { ok: evidenceForLayer(components, 'Truth Gate').length > 0, evidence: evidenceForLayer(components, 'Truth Gate') },
    healthGate: { ok: evidenceForLayer(components, 'Health').length > 0, evidence: evidenceForLayer(components, 'Health') },
    recovery: { ok: evidenceForLayer(components, 'Recovery').length > 0, evidence: evidenceForLayer(components, 'Recovery') },
    inspector: { ok: evidenceForLayer(components, 'Inspector').length > 0, evidence: evidenceForLayer(components, 'Inspector') },
    registry: { ok: evidenceForLayer(components, 'Registry').length > 0, evidence: evidenceForLayer(components, 'Registry') },
    sdk: { ok: evidenceForLayer(components, 'SDK').length > 0, evidence: evidenceForLayer(components, 'SDK') },
    api: { ok: apiIndex.uniqueEndpoints > 0, evidence: apiIndex.endpoints.slice(0, 25) },
    documentation: { ok: evidenceForLayer(components, 'Documentation').length > 0, evidence: evidenceForLayer(components, 'Documentation') }
  };
  return { score: scoreFromChecks(checks).score, checks };
}

function buildRuntimeVerification(files) {
  const pm2 = summarizePm2();
  const ports = getPortsSnapshot();
  const health = getHealthSnapshot();
  const disk = getDiskUsage();
  const checks = {
    pm2: { ok: pm2.online > 0, evidence: pm2.services.slice(0, 20) },
    ports: { ok: ports.length > 0, evidence: ports },
    health: { ok: health.ok, evidence: health },
    processes: { ok: process.pid > 0, evidence: { pid: process.pid, node: process.version } },
    cpu: { ok: os.cpus().length > 0, evidence: { cpuCount: os.cpus().length, loadAverage: os.loadavg() } },
    memory: { ok: os.totalmem() > 0, evidence: { totalMemoryBytes: os.totalmem(), freeMemoryBytes: os.freemem(), processMemory: process.memoryUsage() } },
    storage: { ok: Boolean(disk), evidence: disk },
    network: { ok: getNetworkInterfaceNames().length > 0, evidence: getNetworkInterfaceNames() },
    logs: { ok: files.some((filePath) => filePath.startsWith('runtime/audit') || filePath.startsWith('logs/')), evidence: evidenceForPattern(files, /^(runtime\/audit|logs\/)/, 25) },
    recovery: { ok: files.some((filePath) => /recovery|rollback/i.test(filePath)), evidence: evidenceForPattern(files, /recovery|rollback/i, 25) }
  };
  return { score: scoreFromChecks(checks).score, checks, pm2, ports, health };
}

function buildKnowledgeVerification(files, components) {
  const checks = {
    identityEngines: { ok: evidenceForLayer(components, 'Identity').length > 0, evidence: evidenceForLayer(components, 'Identity') },
    formationEngines: { ok: files.some((filePath) => /formation/i.test(filePath)), evidence: evidenceForPattern(files, /formation/i, 25) },
    knowledgeGraph: { ok: files.some((filePath) => /knowledge-graph|graph-engine|rag|vector/i.test(filePath)), evidence: evidenceForPattern(files, /knowledge-graph|graph-engine|rag|vector/i, 25) },
    community: { ok: evidenceForLayer(components, 'Community').length > 0, evidence: evidenceForLayer(components, 'Community') },
    commerce: { ok: evidenceForLayer(components, 'Commerce').length > 0, evidence: evidenceForLayer(components, 'Commerce') },
    market: { ok: evidenceForLayer(components, 'Marketplace').length > 0, evidence: evidenceForLayer(components, 'Marketplace') },
    governance: { ok: evidenceForLayer(components, 'Governance').length > 0, evidence: evidenceForLayer(components, 'Governance') }
  };
  return { score: scoreFromChecks(checks).score, checks };
}

function buildPerformanceVerification(files, apiIndex) {
  const health = getHealthSnapshot();
  const checks = {
    cpu: { ok: os.cpus().length > 0, evidence: { cpuCount: os.cpus().length, loadAverage: os.loadavg() } },
    memory: { ok: os.totalmem() > 0, evidence: { totalMemoryBytes: os.totalmem(), freeMemoryBytes: os.freemem(), processMemory: process.memoryUsage() } },
    disk: { ok: Boolean(getDiskUsage()), evidence: getDiskUsage() },
    api: { ok: apiIndex.uniqueEndpoints > 0, evidence: { uniqueEndpoints: apiIndex.uniqueEndpoints, health } },
    latency: { ok: health.latencyMs !== null, evidence: { healthLatencyMs: health.latencyMs } },
    cache: { ok: files.some((filePath) => /cache|redis/i.test(filePath)), evidence: evidenceForPattern(files, /cache|redis/i, 25) },
    database: { ok: files.some((filePath) => /postgres|mongodb|sqlite|sqlserver|database/i.test(filePath)), evidence: evidenceForPattern(files, /postgres|mongodb|sqlite|sqlserver|database/i, 25) },
    queue: { ok: files.some((filePath) => /queue|bus|event/i.test(filePath)), evidence: evidenceForPattern(files, /queue|bus|event/i, 25) },
    workers: { ok: files.some((filePath) => /worker|cycle|loop|pm2/i.test(filePath)), evidence: evidenceForPattern(files, /worker|cycle|loop|pm2/i, 25) },
    streaming: { ok: files.some((filePath) => /stream|sse|live/i.test(filePath)), evidence: evidenceForPattern(files, /stream|sse|live/i, 25) },
    concurrency: { ok: os.cpus().length > 1, evidence: { cpuCount: os.cpus().length } }
  };
  return { score: scoreFromChecks(checks).score, checks };
}

function buildSecurityVerification(files) {
  const checks = {
    jwt: { ok: scanEvidence(files, [/jsonwebtoken/i, /\bjwt\b/i], 10).length > 0, evidence: scanEvidence(files, [/jsonwebtoken/i, /\bjwt\b/i], 10) },
    tls: { ok: scanEvidence(files, [/https/i, /\btls\b/i, /cert\.pem/i], 10).length > 0, evidence: scanEvidence(files, [/https/i, /\btls\b/i, /cert\.pem/i], 10) },
    oauth: { ok: scanEvidence(files, [/oauth/i], 10).length > 0, evidence: scanEvidence(files, [/oauth/i], 10) },
    secrets: { ok: files.some((filePath) => /\.env\.example$|secret|credential/i.test(filePath)), evidence: evidenceForPattern(files, /\.env\.example$|secret|credential/i, 25) },
    rateLimits: { ok: scanEvidence(files, [/rateLimit/i, /rate-limit/i, /too many requests/i], 10).length > 0, evidence: scanEvidence(files, [/rateLimit/i, /rate-limit/i, /too many requests/i], 10) },
    cors: { ok: scanEvidence(files, [/\bcors\b/i, /Access-Control-Allow-Origin/i], 10).length > 0, evidence: scanEvidence(files, [/\bcors\b/i, /Access-Control-Allow-Origin/i], 10) },
    headers: { ok: scanEvidence(files, [/helmet/i, /x-frame-options/i, /content-security-policy/i], 10).length > 0, evidence: scanEvidence(files, [/helmet/i, /x-frame-options/i, /content-security-policy/i], 10) },
    auditLogs: { ok: files.some((filePath) => /audit|ledger|log/i.test(filePath)), evidence: evidenceForPattern(files, /audit|ledger|log/i, 25) },
    permissions: { ok: scanEvidence(files, [/authRequired/i, /permission/i, /role/i, /rbac/i], 10).length > 0, evidence: scanEvidence(files, [/authRequired/i, /permission/i, /role/i, /rbac/i], 10) }
  };
  return { score: scoreFromChecks(checks).score, checks };
}

function buildMethodologyAccreditationReadiness(
  files,
  components,
  integrationVerification,
  runtimeVerification,
  knowledgeVerification,
  performanceVerification,
  securityVerification
) {
  const methodologyFamilies = [
    {
      familyKey: 'SCIENTIFIC',
      arabicName: 'المنهجيات العلمية',
      englishName: 'Scientific methodologies',
      responsibility: 'التحقق القابل للتكرار، القياس، التجارب، وربط الادعاءات بالأدلة.',
      examples: ['evidence-based validation', 'repeatable checks', 'scientific governance', 'research fabric'],
      evidence: evidenceForAnyPattern(files, [/scientific/i, /methodolog/i, /research/i, /validation/i, /experiment/i], 30)
    },
    {
      familyKey: 'ORGANIZATIONAL',
      arabicName: 'المنهجيات التنظيمية',
      englishName: 'Organizational methodologies',
      responsibility: 'تنظيم الطبقات والملكية والمسؤوليات والكتالوجات المؤسسية.',
      examples: ['enterprise architecture', 'operating model', 'capability registry', 'governance structure'],
      evidence: evidenceForAnyPattern(files, [/organization/i, /organizational/i, /enterprise/i, /architecture/i, /registry/i], 30)
    },
    {
      familyKey: 'ADMINISTRATIVE',
      arabicName: 'المنهجيات الإدارية',
      englishName: 'Administrative methodologies',
      responsibility: 'إدارة القرارات والمخاطر والتقارير التنفيذية ومراكز التحكم.',
      examples: ['executive dashboard', 'control center', 'administrative impact OS', 'decision governance'],
      evidence: evidenceForAnyPattern(files, [/admin/i, /executive/i, /management/i, /control-center/i, /mission-control/i], 30)
    },
    {
      familyKey: 'TECHNICAL',
      arabicName: 'المنهجيات الفنية والتقنية',
      englishName: 'Technical methodologies',
      responsibility: 'تشغيل الواجهات والخدمات والـ SDK والتكاملات الفنية.',
      examples: ['runtime APIs', 'routes', 'SDK', 'integration verification', 'streaming'],
      evidence: evidenceForAnyPattern(files, [/technical/i, /runtime/i, /api/i, /routes/i, /sdk/i, /integration/i, /stream/i], 30)
    },
    {
      familyKey: 'ENGINEERING',
      arabicName: 'المنهجيات الهندسية',
      englishName: 'Engineering methodologies',
      responsibility: 'التصميم المعماري، الاعتماديات، الحوسبة، وخطوط التشغيل.',
      examples: ['architecture graph', 'dependency graph', 'pipeline', 'compute/HPC', 'design control'],
      evidence: evidenceForAnyPattern(files, [/engineering/i, /architecture/i, /dependency/i, /pipeline/i, /compute/i, /hpc/i], 30)
    },
    {
      familyKey: 'MATHEMATICAL_ACCOUNTING',
      arabicName: 'المنهجيات الحسابية والرياضية',
      englishName: 'Mathematical and accounting methodologies',
      responsibility: 'الحسابات، المؤشرات، النقاط، التحليلات، والتسعير أو القياس الكمي.',
      examples: ['scores', 'metrics', 'analytics', 'pricing', 'cost/readiness calculations'],
      evidence: evidenceForAnyPattern(files, [/math/i, /metric/i, /score/i, /analytics/i, /pricing/i, /cost/i, /account/i, /calculation/i], 30)
    },
    {
      familyKey: 'COMPUTATIONAL',
      arabicName: 'المنهجيات الحوسبية',
      englishName: 'Computational methodologies',
      responsibility: 'المحركات والخوارزميات والعمال والصفوف والذاكرة والتزامن.',
      examples: ['compute engines', 'workers', 'queues', 'cache', 'algorithms', 'AI engines'],
      evidence: evidenceForAnyPattern(files, [/compute/i, /algorithm/i, /engine/i, /worker/i, /queue/i, /cache/i, /concurrency/i, /ai/i], 30)
    },
    {
      familyKey: 'SECURITY_GOVERNANCE',
      arabicName: 'منهجيات الأمن والحوكمة',
      englishName: 'Security and governance methodologies',
      responsibility: 'ضبط الوصول، الأسرار، السجلات، بوابات الحقيقة، والحدود النظامية.',
      examples: ['JWT', 'TLS', 'OAuth', 'audit logs', 'permissions', 'truth gate'],
      evidence: evidenceForAnyPattern(files, [/security/i, /auth/i, /jwt/i, /tls/i, /oauth/i, /audit/i, /truth/i, /permission/i], 30)
    },
    {
      familyKey: 'QUALITY_SAFETY',
      arabicName: 'منهجيات الجودة والسلامة',
      englishName: 'Quality and safety methodologies',
      responsibility: 'تثبيت الجودة، الاختبارات، البوابات، الاستمرارية، وخفض المخاطر.',
      examples: ['tests', 'quality methodology', 'health gates', 'recovery', 'readiness'],
      evidence: evidenceForAnyPattern(files, [/quality/i, /test/i, /health/i, /readiness/i, /recovery/i, /safety/i], 30)
    },
    {
      familyKey: 'COMMERCIAL_MARKET',
      arabicName: 'منهجيات السوق والتجارة',
      englishName: 'Commercial and market methodologies',
      responsibility: 'ربط التجارة والسوق والعملاء والتراخيص التشغيلية بالحكومة الداخلية.',
      examples: ['commerce', 'marketplace', 'licensing engine', 'commercial execution', 'CRM'],
      evidence: evidenceForAnyPattern(files, [/commerce/i, /commercial/i, /marketplace/i, /market/i, /licens/i, /crm/i, /customer/i], 30)
    }
  ].map((family) => ({
    ...family,
    status: family.evidence.length > 0 ? 'ACTIVE_EVIDENCE_PRESENT' : 'NEEDS_EVIDENCE_EXPANSION',
    maturity: family.evidence.length >= 5 ? 'cataloged' : 'partial'
  }));

  const existingEvidence = {
    universalMethodologiesRegistry: exists('docs/SHEIKHA-UNIVERSAL-METHODOLOGIES-REGISTRY.template.json'),
    adminMethodologyInformationImpactOSReport: exists('runtime/admin-methodology-information-impact-os-v1/v1/sheikha-admin-methodology-information-impact-os-v1-report.json'),
    adminMethodologiesRegistry: exists('runtime/admin-methodology-information-impact-os-v1/v1/registries/admin-methodologies.json'),
    advisoryComplianceRegistry: exists('runtime/advisory-compliance/sheikha-methodology-regulation-licensing.json'),
    licensingEngine: exists('runtime/licensing-engine/v1/sheikha-licensing-engine-v1.json'),
    licensesRegistry: exists('runtime/licensing-engine/v1/registries/licenses.json'),
    internalAccreditationIssuer: exists('scripts/sheikha-issue-accreditation.js'),
    externalAccreditationPackBuilder: exists('scripts/sheikha-prepare-external-accreditation.js'),
    externalAccreditationVerifier: exists('scripts/sheikha-verify-external-accreditation.js'),
    externalAccreditationVerificationArtifact: exists(externalAccreditationVerificationPath)
  };

  const internalIssuedAttestations = [
    {
      id: 'SHEIKHA-INT-METHODOLOGY-COVERAGE-V1',
      title: 'Internal methodology coverage attestation',
      status: 'ISSUED_INTERNAL',
      legalExternalAuthority: false,
      scope: methodologyFamilies.map((family) => family.familyKey),
      evidence: methodologyFamilies.flatMap((family) => family.evidence.slice(0, 3))
    },
    {
      id: 'SHEIKHA-INT-ARCHITECTURE-CATALOG-ACCREDITATION-V1',
      title: 'Internal enterprise architecture catalog accreditation',
      status: 'ISSUED_INTERNAL',
      legalExternalAuthority: false,
      evidence: [catalogPath, capabilityRegistryPath, architectureGraphPath, duplicateDetectionPath]
    },
    {
      id: 'SHEIKHA-INT-RUNTIME-VERIFICATION-ACCREDITATION-V1',
      title: 'Internal runtime verification accreditation',
      status: 'ISSUED_INTERNAL',
      legalExternalAuthority: false,
      score: runtimeVerification.score,
      evidence: ['PM2 snapshot', 'ports snapshot', 'health snapshot', 'process/cpu/memory/storage/network checks']
    },
    {
      id: 'SHEIKHA-INT-SECURITY-READINESS-ATTESTATION-V1',
      title: 'Internal security readiness attestation',
      status: 'ISSUED_INTERNAL',
      legalExternalAuthority: false,
      score: securityVerification.score,
      evidence: Object.values(securityVerification.checks).flatMap((check) => Array.isArray(check.evidence) ? check.evidence.slice(0, 2) : [])
    },
    {
      id: 'SHEIKHA-INT-KNOWLEDGE-GOVERNANCE-ATTESTATION-V1',
      title: 'Internal knowledge and governance attestation',
      status: 'ISSUED_INTERNAL',
      legalExternalAuthority: false,
      score: knowledgeVerification.score,
      evidence: Object.values(knowledgeVerification.checks).flatMap((check) => Array.isArray(check.evidence) ? check.evidence.slice(0, 2) : [])
    }
  ];

  const localAccreditationReadinessTargets = [
    { jurisdiction: 'Saudi Arabia', target: 'Commercial registration and municipal/platform operating licenses', status: 'READY_FOR_SUBMISSION_NOT_ISSUED', scopeCondition: 'business registration and operating activity scope' },
    { jurisdiction: 'Saudi Arabia', target: 'NCA cybersecurity controls readiness', status: 'READY_FOR_SUBMISSION_NOT_ISSUED', scopeCondition: 'government/critical or regulated cybersecurity scope' },
    { jurisdiction: 'Saudi Arabia', target: 'SDAIA / PDPL data governance readiness', status: 'READY_FOR_SUBMISSION_NOT_ISSUED', scopeCondition: 'personal data processing scope' },
    { jurisdiction: 'Saudi Arabia', target: 'ZATCA tax and e-invoicing readiness', status: 'READY_FOR_SUBMISSION_NOT_ISSUED', scopeCondition: 'taxable commercial invoicing scope' },
    { jurisdiction: 'Saudi Arabia', target: 'CST communications, cloud, and digital service readiness', status: 'READY_FOR_SUBMISSION_NOT_ISSUED', scopeCondition: 'telecom/cloud/service-provider scope' },
    { jurisdiction: 'Saudi Arabia', target: 'SAMA financial-sector controls readiness', status: 'SCOPE_CONDITIONAL_NOT_ISSUED', scopeCondition: 'financial services or regulated fintech scope' },
    { jurisdiction: 'Saudi Arabia', target: 'SASO / SABER product conformity readiness', status: 'SCOPE_CONDITIONAL_NOT_ISSUED', scopeCondition: 'physical product import/manufacturing/conformity scope' },
    { jurisdiction: 'GCC', target: 'GSO / GCC standards harmonization readiness', status: 'SCOPE_CONDITIONAL_NOT_ISSUED', scopeCondition: 'GCC market entry and product/service scope' }
  ];

  const internationalAccreditationReadinessTargets = [
    { target: 'ISO 9001', domain: 'quality management', status: 'READY_FOR_AUDITOR_SUBMISSION_NOT_ISSUED' },
    { target: 'ISO/IEC 27001', domain: 'information security management', status: 'READY_FOR_AUDITOR_SUBMISSION_NOT_ISSUED' },
    { target: 'ISO/IEC 27701', domain: 'privacy information management', status: 'READY_FOR_AUDITOR_SUBMISSION_NOT_ISSUED' },
    { target: 'ISO/IEC 27017', domain: 'cloud security controls', status: 'READY_FOR_AUDITOR_SUBMISSION_NOT_ISSUED' },
    { target: 'ISO/IEC 27018', domain: 'PII protection in public cloud', status: 'READY_FOR_AUDITOR_SUBMISSION_NOT_ISSUED' },
    { target: 'ISO 22301', domain: 'business continuity', status: 'READY_FOR_AUDITOR_SUBMISSION_NOT_ISSUED' },
    { target: 'ISO/IEC 20000-1', domain: 'IT service management', status: 'READY_FOR_AUDITOR_SUBMISSION_NOT_ISSUED' },
    { target: 'ISO 14001', domain: 'environmental management', status: 'SCOPE_CONDITIONAL_NOT_ISSUED' },
    { target: 'ISO 45001', domain: 'occupational health and safety', status: 'SCOPE_CONDITIONAL_NOT_ISSUED' },
    { target: 'SOC 2 Type II', domain: 'security, availability, confidentiality controls', status: 'READY_FOR_AUDITOR_SUBMISSION_NOT_ISSUED' },
    { target: 'PCI DSS', domain: 'cardholder data security', status: 'SCOPE_CONDITIONAL_NOT_ISSUED' },
    { target: 'CSA STAR', domain: 'cloud security assurance', status: 'READY_FOR_ASSESSOR_SUBMISSION_NOT_ISSUED' },
    { target: 'Common Criteria', domain: 'security assurance evaluation', status: 'SCOPE_CONDITIONAL_NOT_ISSUED' },
    { target: 'NIST CSF / SP 800-53 mapping', domain: 'cybersecurity control mapping', status: 'INTERNAL_MAPPING_READY_NOT_CERTIFICATE' },
    { target: 'COBIT', domain: 'IT governance', status: 'INTERNAL_MAPPING_READY_NOT_CERTIFICATE' },
    { target: 'ITIL', domain: 'service management practices', status: 'INTERNAL_MAPPING_READY_NOT_CERTIFICATE' },
    { target: 'TOGAF', domain: 'enterprise architecture practices', status: 'INTERNAL_MAPPING_READY_NOT_CERTIFICATE' },
    { target: 'PMBOK', domain: 'project management practices', status: 'INTERNAL_MAPPING_READY_NOT_CERTIFICATE' },
    { target: 'CMMI', domain: 'process maturity improvement', status: 'READY_FOR_APPRAISAL_NOT_ISSUED' },
    { target: 'ISO/IEC/IEEE 12207', domain: 'software lifecycle processes', status: 'INTERNAL_MAPPING_READY_NOT_CERTIFICATE' },
    { target: 'ISO/IEC/IEEE 15288', domain: 'systems lifecycle processes', status: 'INTERNAL_MAPPING_READY_NOT_CERTIFICATE' },
    { target: 'ISO/IEC/IEEE 29148', domain: 'requirements engineering', status: 'INTERNAL_MAPPING_READY_NOT_CERTIFICATE' },
    { target: 'ISO/IEC 25010', domain: 'software product quality model', status: 'INTERNAL_MAPPING_READY_NOT_CERTIFICATE' }
  ];

  const readinessChecks = {
    methodologyFamiliesCovered: methodologyFamilies.every((family) => family.evidence.length > 0),
    localTargetsCataloged: localAccreditationReadinessTargets.length > 0,
    internationalTargetsCataloged: internationalAccreditationReadinessTargets.length > 0,
    internalAttestationsIssued: internalIssuedAttestations.every((item) => item.status === 'ISSUED_INTERNAL'),
    externalIssuanceNotClaimed: true,
    integrationEvidence: integrationVerification.score > 0,
    runtimeEvidence: runtimeVerification.score > 0,
    knowledgeEvidence: knowledgeVerification.score > 0,
    performanceEvidence: performanceVerification.score > 0,
    securityEvidence: securityVerification.score > 0,
    methodologyRegistriesPresent: existingEvidence.universalMethodologiesRegistry && existingEvidence.adminMethodologiesRegistry,
    licensingEvidencePresent: existingEvidence.licensingEngine && existingEvidence.licensesRegistry,
    externalSubmissionPackSupported: existingEvidence.externalAccreditationPackBuilder && existingEvidence.externalAccreditationVerifier,
    externalSubmissionVerificationMirrored: existingEvidence.externalAccreditationVerificationArtifact
  };
  const readiness = scoreFromChecks(readinessChecks);

  return {
    system: 'SHEIKHA_MASTER_METHODOLOGY_ACCREDITATION_READINESS_V1',
    generatedAt: new Date().toISOString(),
    policy: {
      internalAttestationsAllowed: true,
      externalAccreditationIssuedBySheikha: false,
      externalAuthorityApprovalRequired: true,
      noFalseClaims: true,
      githubRequired: false
    },
    repositoryEvidence: {
      components: components.length,
      catalog: catalogPath,
      capabilityRegistry: capabilityRegistryPath,
      architectureGraph: architectureGraphPath,
      externalPackBuilder: 'scripts/sheikha-prepare-external-accreditation.js',
      internalIssuer: 'scripts/sheikha-issue-accreditation.js',
      externalVerification: externalAccreditationVerificationPath,
      licensingRegistry: 'runtime/licensing-engine/v1/registries/licenses.json'
    },
    existingEvidence,
    methodologyFamilies,
    internalIssuedAttestations,
    localAccreditationReadinessTargets,
    internationalAccreditationReadinessTargets,
    externalCertificatesIssued: 0,
    readinessChecks,
    readinessScore: readiness.score,
    decision: readiness.score === 100
      ? 'INTERNAL_ATTESTATIONS_ISSUED_EXTERNAL_SUBMISSION_READY'
      : 'INTERNAL_ATTESTATIONS_ISSUED_EXTERNAL_SUBMISSION_REQUIRES_REVIEW',
    externalIssuanceConstraint: 'Sheikha can issue internal attestations and readiness packs only. Formal local or international licenses, certificates, and accreditations must be issued by the competent authority, accredited certification body, auditor, lab, or regulator.',
    nonConflictRule: 'Internal attestations must never be presented as government, regulator, ISO, SOC, PCI, or other third-party certificates.'
  };
}

function buildDocumentationIndex(files) {
  const docs = files.filter((filePath) => /\.md$/i.test(filePath) || filePath.startsWith('docs/'));
  return {
    system: 'SHEIKHA_MASTER_DOCUMENTATION_INDEX_V1',
    generatedAt: new Date().toISOString(),
    count: docs.length,
    canonicalDocs: docs.filter((filePath) => filePath.startsWith('docs/canonical/')).slice(0, 200),
    activationDocs: docs.filter((filePath) => /activation|master|architecture|registry/i.test(filePath)).slice(0, 200),
    linkedOutputs: [
      reportPath,
      catalogPath,
      capabilityRegistryPath,
      architectureGraphPath,
      duplicateDetectionPath,
      executiveDashboardPath,
      finalExecutiveReportPath,
      methodologyAccreditationPath,
      externalAccreditationVerificationPath,
      sovereignKernelBootPath,
      sovereignKernelBootHandbookPath,
      universalTechnologyHpcFabricPath,
      universalTechnologyHpcFabricHandbookPath,
      technologyFamilyTreePath,
      technologyFamilyTreeHandbookPath,
      jannatGardensPath,
      jannatGardensHandbookPath,
      jannatGardensPublicModelPath
    ],
    duplicationPolicy: 'Use this index to link existing documents instead of copying their content.'
  };
}

function buildFinalExecutiveReport(components, packageScripts, duplicateDetection, apiIndex, documentationIndex) {
  return {
    system: 'SHEIKHA_MASTER_FINAL_EXECUTIVE_REPORT_V1',
    generatedAt: new Date().toISOString(),
    githubDependency: false,
    counts: {
      systems: countMatches(components, (item) => /system|operating-system|platform/i.test(item.path)),
      engines: countMatches(components, (item) => /engine/i.test(item.path)),
      layers: new Set(components.map((item) => item.layer)).size,
      apis: apiIndex.uniqueEndpoints,
      services: summarizePm2().count,
      tests: countMatches(components, (item) => /\.test\.js$/i.test(item.path)),
      docs: documentationIndex.count,
      sdks: countMatches(components, (item) => /sdk|mcp/i.test(item.path)),
      registries: countMatches(components, (item) => /registry|catalog/i.test(item.path)),
      runtimeEngines: countMatches(components, (item) => item.layer === 'Runtime'),
      identityEngines: countMatches(components, (item) => item.layer === 'Identity'),
      governanceEngines: countMatches(components, (item) => item.layer === 'Governance'),
      knowledgeEngines: countMatches(components, (item) => item.layer === 'Knowledge'),
      communityEngines: countMatches(components, (item) => item.layer === 'Community'),
      commerceEngines: countMatches(components, (item) => item.layer === 'Commerce'),
      enterpriseEngines: countMatches(components, (item) => item.layer === 'Enterprise'),
      aiEngines: countMatches(components, (item) => /ai/i.test(item.path)),
      monitoringEngines: countMatches(components, (item) => item.layer === 'Monitoring'),
      securityEngines: countMatches(components, (item) => item.layer === 'Security'),
      dashboards: countMatches(components, (item) => /dashboard|control-center|mission-control/i.test(item.path)),
      pipelines: countMatches(components, (item) => /pipeline/i.test(item.path)),
      automationEngines: countMatches(components, (item) => /automation|activate-|cycle|loop/i.test(item.path)),
      integrations: countMatches(components, (item) => /integration|connector|federation/i.test(item.path)),
      packageScripts: packageScripts.length,
      duplicateGroups: duplicateDetection.duplicateFiles.length
    },
    evidence: {
      capabilityRegistry: capabilityRegistryPath,
      architectureGraph: architectureGraphPath,
      duplicateDetection: duplicateDetectionPath,
      documentationIndex: documentationIndexPath
    },
    productionClaimPolicy: 'No production-ready claim is made unless supported by tests, health, and runtime evidence.'
  };
}

function summarizeCapabilityRegistry(registry) {
  return {
    system: registry.system,
    generatedAt: registry.generatedAt,
    source: registry.source,
    githubRequired: registry.githubRequired,
    componentCount: registry.componentCount,
    apiEndpoints: registry.apiEndpoints,
    packageScripts: registry.packageScripts,
    lifecycleSummary: registry.lifecycleSummary,
    maturitySummary: registry.maturitySummary,
    evidenceFiles: registry.evidenceFiles,
    fullRegistryPath: capabilityRegistryPath,
    sampleComponents: registry.components.slice(0, 50)
  };
}

function summarizeArchitectureGraph(graph) {
  return {
    system: graph.system,
    generatedAt: graph.generatedAt,
    nodes: graph.nodes,
    edges: graph.edges,
    componentEdgesCount: graph.componentEdges.length,
    fullGraphPath: architectureGraphPath,
    graphPolicy: graph.graphPolicy
  };
}

function summarizeDuplicateDetection(duplicateDetection) {
  return {
    system: duplicateDetection.system,
    generatedAt: duplicateDetection.generatedAt,
    policy: duplicateDetection.policy,
    duplicateFilesCount: duplicateDetection.duplicateFiles.length,
    duplicateServicesCount: duplicateDetection.duplicateServices.length,
    duplicateApisCount: duplicateDetection.duplicateApis.length,
    duplicateRegistriesCount: duplicateDetection.duplicateRegistries.length,
    deadCodeCandidatesCount: duplicateDetection.deadCodeCandidates.length,
    unusedDirectoryCandidates: duplicateDetection.unusedDirectoryCandidates,
    fullDuplicateReportPath: duplicateDetectionPath,
    sampleDuplicateFiles: duplicateDetection.duplicateFiles.slice(0, 50),
    note: duplicateDetection.note
  };
}

function buildExecutiveDashboard(finalExecutiveReport, integrationVerification, runtimeVerification, knowledgeVerification, performanceVerification, securityVerification, duplicateDetection) {
  const riskItems = [];
  if (duplicateDetection.duplicateFiles.length > 0) riskItems.push('duplicate-components-require-review');
  if (securityVerification.score < 100) riskItems.push('security-evidence-incomplete');
  if (runtimeVerification.score < 100) riskItems.push('runtime-evidence-incomplete-or-sandbox-limited');

  return {
    system: 'SHEIKHA_MASTER_EXECUTIVE_DASHBOARD_V1',
    generatedAt: new Date().toISOString(),
    vision: 'شيخة منصة تشغيل معرفية وتجارية وصناعية محكومة بالأدلة والإتقان.',
    mission: 'توحيد المحركات والطبقات والواجهات في كتالوج واحد يمنع التكرار ويقود التحسين الآمن.',
    goals: [
      'تفعيل فعال مبني على الموجود فعليًا',
      'عدم الاعتماد على GitHub في التشغيل المحلي',
      'كشف التعارضات قبل أي توسع',
      'ربط المعرفة والهوية والمجتمع والتجارة والحوكمة'
    ],
    status: {
      integrationScore: integrationVerification.score,
      runtimeScore: runtimeVerification.score,
      knowledgeScore: knowledgeVerification.score,
      performanceScore: performanceVerification.score,
      securityScore: securityVerification.score
    },
    risks: riskItems,
    performance: performanceVerification.checks,
    markets: finalExecutiveReport.counts.commerceEngines + finalExecutiveReport.counts.registries,
    projects: finalExecutiveReport.counts.systems,
    customers: finalExecutiveReport.counts.commerceEngines,
    capabilities: finalExecutiveReport.counts,
    indicators: {
      apiEndpoints: finalExecutiveReport.counts.apis,
      tests: finalExecutiveReport.counts.tests,
      duplicateGroups: finalExecutiveReport.counts.duplicateGroups,
      githubRequired: false
    },
    decisions: [
      'Use local-registry and local bundles as the operational source of truth.',
      'Treat duplicate detection as review-only until a human approves consolidation.',
      'Keep production claims bound to health, tests, and truth-gate evidence.'
    ],
    knowledge: knowledgeVerification.checks
  };
}

function getOfflineOperationStatus() {
  const remotes = run('git remote -v')
    .split('\n')
    .filter(Boolean);
  return {
    githubRequired: false,
    localGitUsable: run('git rev-parse --is-inside-work-tree') === 'true',
    localRegistryConfigured: remotes.some((line) => line.startsWith('local-registry')),
    localRegistryHead: run('git rev-parse --short local-registry/main'),
    currentHead: run('git rev-parse --short HEAD'),
    currentBranch: run('git branch --show-current'),
    remotes,
    recommendedPushTarget: 'local-registry'
  };
}

function buildReport() {
  const files = getRepositoryFiles();
  const discoveryRoots = getDiscoveryRoots(files);
  const rootInventory = buildRootInventory(files);
  const apiIndex = buildApiIndex(files);
  const packageScripts = Object.keys(packageJson.scripts || {})
    .filter((name) => /^ops:|^sheikha:|^start|^server:|^meta:|^sovereign:|^status$/.test(name))
    .sort();
  const components = enrichComponents(files, apiIndex);
  const layerSummary = buildLayerSummary(components);
  const capabilityRegistry = buildCapabilityRegistry(components, files, apiIndex, packageScripts);
  const architectureGraph = buildArchitectureGraph(components, layerSummary);
  const duplicateDetection = buildDuplicateDetection(files, components, apiIndex, packageScripts);
  const integrationVerification = buildIntegrationVerification(components, apiIndex);
  const runtimeVerification = buildRuntimeVerification(files);
  const knowledgeVerification = buildKnowledgeVerification(files, components);
  const performanceVerification = buildPerformanceVerification(files, apiIndex);
  const securityVerification = buildSecurityVerification(files);
  const universalTechnologyHpcFabric = safeReadJson(universalTechnologyHpcFabricPath);
  const technologyFamilyTree = safeReadJson(technologyFamilyTreePath);
  const jannatGardens = safeReadJson(jannatGardensPath);
  const bareMetalSeed = safeReadJson(bareMetalSeedPath);
  const computingCognitiveLayers = safeReadJson(computingCognitiveLayersPath);
  const distribution = safeReadJson(distributionReportPath);
  const distributionApex = safeReadJson(distributionApexReportPath);
  const governanceGenerator = safeReadJson(governanceGeneratorReportPath);
  const publicBenefitPolicy = safeReadJson(publicBenefitPolicyPath);
  const nativeLanguageArchitecture = safeReadJson(nativeLanguageArchitecturePath);
  const sheikhaLanguageProduction = safeReadJson(sheikhaLanguageProductionPath);
  const universalBenefitBoundary = safeReadJson(universalBenefitBoundaryPath);
  const methodologyAccreditation = buildMethodologyAccreditationReadiness(
    files,
    components,
    integrationVerification,
    runtimeVerification,
    knowledgeVerification,
    performanceVerification,
    securityVerification
  );
  const documentationIndex = buildDocumentationIndex(files);
  const finalExecutiveReport = buildFinalExecutiveReport(components, packageScripts, duplicateDetection, apiIndex, documentationIndex);
  finalExecutiveReport.counts.methodologyFamilies = methodologyAccreditation.methodologyFamilies.length;
  finalExecutiveReport.counts.internalAttestations = methodologyAccreditation.internalIssuedAttestations.length;
  finalExecutiveReport.counts.localAccreditationTargets = methodologyAccreditation.localAccreditationReadinessTargets.length;
  finalExecutiveReport.counts.internationalAccreditationTargets = methodologyAccreditation.internationalAccreditationReadinessTargets.length;
  finalExecutiveReport.counts.externalCertificatesIssued = methodologyAccreditation.externalCertificatesIssued;
  finalExecutiveReport.counts.universalTechnologyFamilies = universalTechnologyHpcFabric?.technologyFamilies?.length || 0;
  finalExecutiveReport.counts.universalTechnologyHpcScore = universalTechnologyHpcFabric?.score || 0;
  finalExecutiveReport.counts.technologyFamilyTreeNodes = technologyFamilyTree?.lowerLayerNodes?.length || 0;
  finalExecutiveReport.counts.technologyFamilyGardenTrees = technologyFamilyTree?.technologyGarden?.trees?.length || 0;
  finalExecutiveReport.counts.technologyFamilyTreeScore = technologyFamilyTree?.score || 0;
  finalExecutiveReport.counts.jannatGardens = jannatGardens?.metrics?.gardens || 0;
  finalExecutiveReport.counts.jannatGardenTrees = jannatGardens?.metrics?.trees || 0;
  finalExecutiveReport.counts.jannatGardenRivers = jannatGardens?.metrics?.rivers || 0;
  finalExecutiveReport.counts.jannatGardenFruits = jannatGardens?.metrics?.fruits || 0;
  finalExecutiveReport.counts.jannatGardensScore = jannatGardens?.score || 0;
  finalExecutiveReport.counts.bareMetalBootArtifacts = bareMetalSeed?.bootArtifactCreated === true ? 1 : 0;
  finalExecutiveReport.counts.verifiedBareMetalBoots = bareMetalSeed?.bareMetalFullyIndependentToday === true ? 1 : 0;
  finalExecutiveReport.counts.computingCognitiveDomains = Object.keys(
    computingCognitiveLayers?.model?.domains || {}
  ).length;
  finalExecutiveReport.counts.reasoningModes = Object.keys(
    computingCognitiveLayers?.model?.reasoningModes || {}
  ).length;
  finalExecutiveReport.counts.ultraRoleSlots = computingCognitiveLayers?.model?.ultraMode?.agentSlots || 0;
  finalExecutiveReport.counts.highestExecutableTechnicalApexLevel =
    computingCognitiveLayers?.promotion?.apexLevel || 0;
  finalExecutiveReport.counts.distributionTargets = distribution?.targetCount || 0;
  finalExecutiveReport.counts.distributionArtifactsBuilt = distribution?.builtCount || 0;
  finalExecutiveReport.counts.distributionTargetsVerified = distribution?.verifiedCount || 0;
  finalExecutiveReport.counts.distributionTargetsNativeVerified =
    distribution?.nativeVerifiedCount || 0;
  finalExecutiveReport.counts.distributionReleaseApexLevel = distributionApex?.apexLevel || 0;
  finalExecutiveReport.counts.publicBenefitRegisteredCapabilities =
    governanceGenerator?.coverage?.registeredCapabilitiesCovered || 0;
  finalExecutiveReport.counts.publicBenefitActiveCapabilities =
    governanceGenerator?.coverage?.currentlyActiveCapabilities || 0;
  finalExecutiveReport.counts.universalBenefitCapabilities =
    universalBenefitBoundary?.capabilitiesRegistered || 0;
  finalExecutiveReport.counts.universalBenefitBoundaries =
    universalBenefitBoundary?.boundariesRegistered || 0;
  finalExecutiveReport.counts.universalBenefitDomains =
    universalBenefitBoundary?.benefitDomainsRegistered || 0;
  finalExecutiveReport.counts.universalBenefitArchitectureComponents =
    universalBenefitBoundary?.architectureComponentsRegistered || 0;
  finalExecutiveReport.counts.universalBenefitBoundaryScopes =
    universalBenefitBoundary?.boundaryScopesRegistered || 0;
  finalExecutiveReport.counts.universalBenefitResourceClasses =
    universalBenefitBoundary?.resourceClassesRegistered || 0;
  finalExecutiveReport.counts.universalBenefitQuranWrittenReferences =
    universalBenefitBoundary?.arabicDsl?.writtenReferences?.quranCount || 0;
  finalExecutiveReport.counts.universalBenefitSunnahWrittenReferences =
    universalBenefitBoundary?.arabicDsl?.writtenReferences?.authenticSunnahCount || 0;
  finalExecutiveReport.counts.sheikhaNativeImplementationSourceFiles =
    nativeLanguageArchitecture?.sourceInventory?.sheikhaImplementationSourceFiles || 0;
  finalExecutiveReport.counts.sheikhaHostImplementationSourceFiles =
    nativeLanguageArchitecture?.sourceInventory?.hostImplementationSourceFiles || 0;
  finalExecutiveReport.evidence.methodologyAccreditation = methodologyAccreditationPath;
  finalExecutiveReport.evidence.externalAccreditationVerification = externalAccreditationVerificationPath;
  finalExecutiveReport.evidence.sovereignKernelBoot = sovereignKernelBootPath;
  finalExecutiveReport.evidence.sovereignKernelBootHandbook = sovereignKernelBootHandbookPath;
  finalExecutiveReport.evidence.universalTechnologyHpcFabric = universalTechnologyHpcFabricPath;
  finalExecutiveReport.evidence.universalTechnologyHpcFabricHandbook = universalTechnologyHpcFabricHandbookPath;
  finalExecutiveReport.evidence.technologyFamilyTree = technologyFamilyTreePath;
  finalExecutiveReport.evidence.technologyFamilyTreeHandbook = technologyFamilyTreeHandbookPath;
  finalExecutiveReport.evidence.jannatGardens = jannatGardensPath;
  finalExecutiveReport.evidence.jannatGardensHandbook = jannatGardensHandbookPath;
  finalExecutiveReport.evidence.jannatGardensPublicModel = jannatGardensPublicModelPath;
  finalExecutiveReport.evidence.bareMetalSeed = bareMetalSeedPath;
  finalExecutiveReport.evidence.bareMetalSeedHandbook = bareMetalSeedHandbookPath;
  finalExecutiveReport.evidence.bareMetalBootArtifact = bareMetalBootArtifactPath;
  finalExecutiveReport.evidence.bareMetalBootImage = bareMetalBootImagePath;
  finalExecutiveReport.evidence.computingCognitiveLayers = computingCognitiveLayersPath;
  finalExecutiveReport.evidence.computingCognitiveLayersHandbook = computingCognitiveLayersHandbookPath;
  finalExecutiveReport.evidence.universalDistribution = distributionReportPath;
  finalExecutiveReport.evidence.universalDistributionApex = distributionApexReportPath;
  finalExecutiveReport.evidence.governanceGenerator = governanceGeneratorReportPath;
  finalExecutiveReport.evidence.publicBenefitCapabilityPolicy = publicBenefitPolicyPath;
  finalExecutiveReport.evidence.nativeLanguageArchitecture = nativeLanguageArchitecturePath;
  finalExecutiveReport.evidence.nativeLanguageArchitectureHandbook =
    nativeLanguageArchitectureHandbookPath;
  finalExecutiveReport.evidence.sheikhaLanguageProduction = sheikhaLanguageProductionPath;
  finalExecutiveReport.evidence.sheikhaLanguageProductionHandbook =
    sheikhaLanguageProductionHandbookPath;
  finalExecutiveReport.evidence.universalBenefitBoundary = universalBenefitBoundaryPath;
  finalExecutiveReport.evidence.universalBenefitBoundaryHandbook =
    universalBenefitBoundaryHandbookPath;
  finalExecutiveReport.evidence.universalDistributionMatrix = distributionMatrixPath;
  finalExecutiveReport.evidence.universalDistributionHandbook = distributionHandbookPath;
  finalExecutiveReport.evidence.distributionBareMetalLink = distributionBareMetalLinkPath;
  const executiveDashboard = buildExecutiveDashboard(
    finalExecutiveReport,
    integrationVerification,
    runtimeVerification,
    knowledgeVerification,
    performanceVerification,
    securityVerification,
    duplicateDetection
  );
  executiveDashboard.indicators.methodologyFamilies = methodologyAccreditation.methodologyFamilies.length;
  executiveDashboard.indicators.internalAttestations = methodologyAccreditation.internalIssuedAttestations.length;
  executiveDashboard.indicators.externalCertificatesIssued = methodologyAccreditation.externalCertificatesIssued;
  executiveDashboard.indicators.methodologyAccreditationReadinessScore = methodologyAccreditation.readinessScore;
  executiveDashboard.indicators.universalTechnologyHpcFabricActive = exists(universalTechnologyHpcFabricPath);
  executiveDashboard.indicators.universalTechnologyFamilies = universalTechnologyHpcFabric?.technologyFamilies?.length || 0;
  executiveDashboard.indicators.technologyFamilyTreeActive = exists(technologyFamilyTreePath);
  executiveDashboard.indicators.technologyFamilyTreeNodes = technologyFamilyTree?.lowerLayerNodes?.length || 0;
  executiveDashboard.indicators.technologyFamilyGardenTrees = technologyFamilyTree?.technologyGarden?.trees?.length || 0;
  executiveDashboard.indicators.jannatGardensActive = exists(jannatGardensPath);
  executiveDashboard.indicators.jannatGardens = jannatGardens?.metrics?.gardens || 0;
  executiveDashboard.indicators.jannatGardenTrees = jannatGardens?.metrics?.trees || 0;
  executiveDashboard.indicators.jannatGardenRivers = jannatGardens?.metrics?.rivers || 0;
  executiveDashboard.indicators.jannatGardenFruits = jannatGardens?.metrics?.fruits || 0;
  executiveDashboard.indicators.bareMetalBootArtifactCreated = bareMetalSeed?.bootArtifactCreated === true;
  executiveDashboard.indicators.qemuBareMetalBootExecuted = bareMetalSeed?.qemuBootExecuted === true;
  executiveDashboard.indicators.bareMetalSerialMarkerVerified = bareMetalSeed?.serialBootMarkerVerified === true;
  executiveDashboard.indicators.postFirmwareHandoffVerified = bareMetalSeed?.postFirmwareHandoffVerified === true;
  executiveDashboard.indicators.bareMetalFullyIndependentToday = bareMetalSeed?.bareMetalFullyIndependentToday === true;
  executiveDashboard.indicators.computingCognitiveLayersActive =
    computingCognitiveLayers?.status === 'ACTIVE_WITH_CORRECTED_TECHNICAL_MODEL';
  executiveDashboard.indicators.computingCognitiveLayersScore = computingCognitiveLayers?.score || 0;
  executiveDashboard.indicators.computingCognitiveApexLevel =
    computingCognitiveLayers?.promotion?.apexLevel || 0;
  executiveDashboard.indicators.highestExecutableTechnicalLayer =
    computingCognitiveLayers?.promotion?.highestExecutableTechnicalLayer === true;
  executiveDashboard.indicators.normativeReferenceLayerExecutable =
    computingCognitiveLayers?.promotion?.normativeReferenceLayerExecutable === true;
  executiveDashboard.indicators.distributionTargetCount = distribution?.targetCount || 0;
  executiveDashboard.indicators.distributionBuiltCount = distribution?.builtCount || 0;
  executiveDashboard.indicators.distributionVerifiedCount = distribution?.verifiedCount || 0;
  executiveDashboard.indicators.distributionNativeVerifiedCount =
    distribution?.nativeVerifiedCount || 0;
  executiveDashboard.indicators.distributionLocalRegistryOnly =
    distribution?.localRegistryOnly === true;
  executiveDashboard.indicators.distributionReleaseApexActive =
    distributionApex?.activationStatus === 'L27_ACTIVE_WITH_VERIFIED_BOUNDARIES';
  executiveDashboard.indicators.distributionReleaseApexLevel = distributionApex?.apexLevel || 0;
  executiveDashboard.indicators.distributionReleaseApexRemoteBuildEndpointExposed =
    distributionApex?.governance?.remoteBuildEndpointExposed === true;
  executiveDashboard.indicators.publicBenefitCapabilityRoutingActive =
    governanceGenerator?.checks?.publicBenefitRouterEnforcesBoundaries === true;
  executiveDashboard.indicators.publicBenefitRegisteredCapabilities =
    governanceGenerator?.coverage?.registeredCapabilitiesCovered || 0;
  executiveDashboard.indicators.publicBenefitPolicyActivatesCapabilities =
    publicBenefitPolicy?.scope?.policyCoverageDoesNotActivateCapabilities !== true;
  executiveDashboard.indicators.universalBenefitBoundaryActive =
    universalBenefitBoundary?.status === 'VERIFIED_ACTIVE';
  executiveDashboard.indicators.universalBenefitCapabilities =
    universalBenefitBoundary?.capabilitiesRegistered || 0;
  executiveDashboard.indicators.universalBenefitBoundaries =
    universalBenefitBoundary?.boundariesRegistered || 0;
  executiveDashboard.indicators.universalBenefitSafeAlternatives =
    universalBenefitBoundary?.safeAlternativesGenerated || 0;
  executiveDashboard.indicators.universalBenefitPermissionEscalationAllowed =
    universalBenefitBoundary?.permissionEscalationAllowed === true;
  executiveDashboard.indicators.universalBenefitArabicPrimary =
    universalBenefitBoundary?.arabicPrimary === true;
  executiveDashboard.indicators.universalBenefitBoundaryScopes =
    universalBenefitBoundary?.boundaryScopesRegistered || 0;
  executiveDashboard.indicators.universalBenefitResourceClasses =
    universalBenefitBoundary?.resourceClassesRegistered || 0;
  executiveDashboard.indicators.universalBenefitCapacityPlannerExecutes =
    universalBenefitBoundary?.capacity?.connectionExecuted === true ||
    universalBenefitBoundary?.capacity?.resourceConsumed === true;
  executiveDashboard.indicators.universalBenefitHalalOrHaramDeterminedBySoftware =
    universalBenefitBoundary?.halalOrHaramDeterminedBySoftware === true;
  executiveDashboard.indicators.universalBenefitHumanParticipationIsExploitableResource =
    universalBenefitBoundary?.humanParticipationIsExploitableResource === true;
  executiveDashboard.indicators.universalBenefitQuranWrittenReferences =
    universalBenefitBoundary?.arabicDsl?.writtenReferences?.quranCount || 0;
  executiveDashboard.indicators.universalBenefitSunnahWrittenReferences =
    universalBenefitBoundary?.arabicDsl?.writtenReferences?.authenticSunnahCount || 0;
  executiveDashboard.indicators.universalBenefitAutomatedReligiousInterpretation =
    universalBenefitBoundary?.arabicDsl?.writtenReferences
      ?.automatedInterpretationOrFatwa === true;
  executiveDashboard.indicators.nativeLanguageArchitectureFoundationActive =
    nativeLanguageArchitecture?.foundationScore === 100;
  executiveDashboard.indicators.sheikhaCompilerSelfHosted =
    nativeLanguageArchitecture?.compiler?.selfHosted === true;
  executiveDashboard.indicators.sheikhaNativeTargetAvailable =
    nativeLanguageArchitecture?.compiler?.nativeTargetAvailable === true;
  executiveDashboard.indicators.sheikhaFullNativeMigrationComplete =
    nativeLanguageArchitecture?.completionGate?.nativeMigrationComplete === true;
  executiveDashboard.indicators.reasoningStandardActive =
    computingCognitiveLayers?.activation?.standard?.status === 'READY';
  executiveDashboard.indicators.reasoningProActive =
    computingCognitiveLayers?.activation?.pro?.status === 'READY';
  executiveDashboard.indicators.reasoningUltraRoleSlots =
    computingCognitiveLayers?.activation?.ultra?.orchestration?.roleSlots || 0;
  executiveDashboard.indicators.reasoningActualIndependentModelProcesses =
    computingCognitiveLayers?.activation?.ultra?.orchestration?.actualIndependentModelProcesses === true;
  executiveDashboard.indicators.reasoningHumanFinalDecision =
    computingCognitiveLayers?.model?.ultraMode?.humanFinalDecision === true;
  executiveDashboard.indicators.safetyFilterEvasionAllowed =
    computingCognitiveLayers?.model?.boundaries?.noSafetyBypass === false;
  executiveDashboard.decisions.push(
    'Issue internal attestations only; external licenses and accreditations require competent authority or accredited auditor issuance.',
    'Do not claim fastest-world or fastest-universe performance without repeatable benchmark and truth-gate evidence.',
    'Treat the x86_64 UEFI/QEMU seed as verified bare-metal boot evidence only; it does not prove a complete general-purpose OS or physical-hardware qualification.',
    'Keep the highest Quran and Sunnah governance apex outside executable contracts and runtime links; lower layers carry written Sharia contracts only.',
    'Render Jannat Sheikha as a worldly beauty metaphor only; never present it as an unseen Jannah representation or religious ruling.',
    'Treat OSI Layer 7, SaaS, high-level languages, CPU privilege, virtualization, firmware, and platform management as distinct technical dimensions.',
    'Treat Ring -1, Ring -2, and Ring -3 as informal aliases only; do not expose them as architectural x86 privilege rings.',
    'Keep AI advisory, bounded, evidence-gated, and subject to accountable human approval for high-impact decisions.',
    'Use serendipity for relevant alternative discovery only; never use it to bypass safety, authorization, or rights controls.',
    'Promote the computing cognitive engine to L24 as the highest executable technical layer while keeping the values reference non-executable and human authority above automation.',
    'Keep L24 as the highest cognitive reasoning plane and L27 as the specialized release-delivery apex; layer numbering does not grant cross-plane authority.',
    'Expose distribution-apex status, matrix, and release index as read-only APIs; building, signing, notarization, and external publishing remain local human-approved operations.',
    'Apply public-benefit policy to every registered capability while keeping registration, evidence verification, admission, and execution as separate governed gates.',
    'Never treat a claimed good outcome as permission to override harm, rights, privacy, consent, law, or qualified professional review.',
    'Transform boundaries into approval, evidence, sandbox, accessibility, recovery, or safe-alternative paths; never treat a boundary as permission escalation.',
    'Treat the canonical .shk architecture as a verified language foundation, not proof that the full platform, compiler, kernel, or services have been ported.',
    'Require self-hosting, a native backend, standard library, kernel and service ports, host removal, and hardware qualification before any full Sheikha-only completion claim.',
    'Count distribution targets from inspected artifacts and native evidence only; never infer package readiness from placeholders or matrix entries.'
  );

  const checks = {
    repositoryDiscoveryComplete: files.length > 0,
    capabilityRegistryBuilt: capabilityRegistry.componentCount > 0,
    architectureGraphBuilt: architectureGraph.nodes.length > 0 && architectureGraph.edges.length > 0,
    duplicateDetectionBuilt: duplicateDetection.policy === 'REPORT_ONLY_NO_DELETION',
    integrationVerificationBuilt: integrationVerification.score > 0,
    runtimeVerificationBuilt: runtimeVerification.score > 0,
    knowledgeVerificationBuilt: knowledgeVerification.score > 0,
    executiveDashboardBuilt: Boolean(executiveDashboard.system),
    performanceVerificationBuilt: performanceVerification.score > 0,
    securityVerificationBuilt: securityVerification.score > 0,
    methodologyAccreditationBuilt: methodologyAccreditation.readinessScore > 0,
    universalTechnologyHpcFabricBuilt: exists(universalTechnologyHpcFabricPath) || exists('tools/activation/activate-sheikha-universal-technology-hpc-fabric-v1.js'),
    technologyFamilyTreeBuilt: exists(technologyFamilyTreePath) || exists('tools/activation/activate-sheikha-technology-family-tree-v1.js'),
    jannatGardensBuilt: exists(jannatGardensPath) || exists('tools/activation/activate-sheikha-jannat-gardens-v1.js'),
    bareMetalSeedIntegrated:
      bareMetalSeed?.system === 'SHEIKHA_BARE_METAL_SEED_V1' &&
      bareMetalSeed?.bootArtifactCreated === true &&
      bareMetalSeed?.qemuBootExecuted === true &&
      bareMetalSeed?.serialBootMarkerVerified === true &&
      bareMetalSeed?.postFirmwareHandoffVerified === true,
    computingCognitiveLayersIntegrated:
      computingCognitiveLayers?.status === 'ACTIVE_WITH_CORRECTED_TECHNICAL_MODEL' &&
      computingCognitiveLayers?.score === 100 &&
      computingCognitiveLayers?.promotion?.apexLevel === 24 &&
      computingCognitiveLayers?.promotion?.highestExecutableTechnicalLayer === true &&
      computingCognitiveLayers?.promotion?.normativeReferenceLayerExecutable === false &&
      computingCognitiveLayers?.model?.authority?.humanAccountableDecisionMaker === true &&
      computingCognitiveLayers?.activation?.safetyBypassProbe?.status === 'BLOCKED_BY_SAFETY_POLICY',
    universalDistributionIntegrated:
      distribution?.system === 'SHEIKHA_UNIVERSAL_DISTRIBUTION_INSTALLER_FABRIC_V1' &&
      distribution?.targetCount === 27 &&
      distribution?.builtCount > 0 &&
      distribution?.verifiedCount > 0 &&
      distribution?.localRegistryOnly === true &&
      distribution?.githubRequired === false &&
      distribution?.targets?.filter((target) => target.built === true).length ===
        distribution?.builtCount &&
      distribution?.targets?.every((target) =>
        target.status !== 'VERIFIED' ||
        (target.artifact && target.nativeVerified === true && target.verificationEvidence)
      ) === true,
    universalDistributionApexIntegrated:
      distributionApex?.system === 'SHEIKHA_UNIVERSAL_DISTRIBUTION_RELEASE_APEX_V1' &&
      distributionApex?.activationStatus === 'L27_ACTIVE_WITH_VERIFIED_BOUNDARIES' &&
      distributionApex?.apexLevel === 27 &&
      distributionApex?.plane === 'RELEASE_DELIVERY_PLANE_ONLY' &&
      distributionApex?.score === 100 &&
      distributionApex?.evidence?.localRegistryOnly === true &&
      distributionApex?.evidence?.githubRequired === false &&
      distributionApex?.evidence?.reproducibilityVerified === true &&
      distributionApex?.evidence?.secretScanPassed === true &&
      distributionApex?.evidence?.invalidVerifiedClaims?.length === 0 &&
      distributionApex?.governance?.remoteBuildEndpointExposed === false &&
      distributionApex?.governance?.remotePublishEndpointExposed === false &&
      distributionApex?.governance?.humanFinalDecision === true,
    publicBenefitCapabilityRoutingIntegrated:
      governanceGenerator?.system === 'SHEIKHA_GOVERNANCE_GENERATOR_V1' &&
      governanceGenerator?.status === 'ACTIVE' &&
      governanceGenerator?.score === 100 &&
      governanceGenerator?.checks?.publicBenefitPolicyActive === true &&
      governanceGenerator?.checks?.publicBenefitCoverageLinked === true &&
      governanceGenerator?.checks?.publicBenefitRouterEnforcesBoundaries === true &&
      governanceGenerator?.coverage?.registeredCapabilitiesCovered === components.length &&
      publicBenefitPolicy?.scope?.policyCoverageDoesNotActivateCapabilities === true &&
      publicBenefitPolicy?.valuesReference?.automatedFatwaAllowed === false &&
      publicBenefitPolicy?.execution?.automaticExecution === false &&
      publicBenefitPolicy?.execution?.decisionGrantsAuthorization === false,
    universalBenefitBoundaryIntegrated:
      universalBenefitBoundary?.system ===
        'SHEIKHA_UNIVERSAL_BENEFIT_BOUNDARY_GOVERNANCE_V1' &&
      universalBenefitBoundary?.status === 'VERIFIED_ACTIVE' &&
      universalBenefitBoundary?.score === 100 &&
      universalBenefitBoundary?.capabilitiesRegistered > 0 &&
      universalBenefitBoundary?.boundariesRegistered === 18 &&
      universalBenefitBoundary?.benefitDomainsRegistered === 16 &&
      universalBenefitBoundary?.architectureComponentsRegistered === 21 &&
      universalBenefitBoundary?.boundaryScopesRegistered === 3 &&
      universalBenefitBoundary?.resourceClassesRegistered === 10 &&
      universalBenefitBoundary?.allowedDecisions > 0 &&
      universalBenefitBoundary?.reviewDecisions > 0 &&
      universalBenefitBoundary?.sandboxDecisions > 0 &&
      universalBenefitBoundary?.deniedDecisions > 0 &&
      universalBenefitBoundary?.religiousRulingsAutomated === false &&
      universalBenefitBoundary?.safetyBypassAllowed === false &&
      universalBenefitBoundary?.permissionEscalationAllowed === false &&
      universalBenefitBoundary?.language === 'ar' &&
      universalBenefitBoundary?.arabicPrimary === true &&
      universalBenefitBoundary?.arabicApi?.primary === true &&
      universalBenefitBoundary?.arabicApi?.decisionsReturnArabicExplanation === true &&
      universalBenefitBoundary?.arabicDsl?.writtenReferences?.quranCount === 10 &&
      universalBenefitBoundary?.arabicDsl?.writtenReferences
        ?.authenticSunnahCount === 1 &&
      universalBenefitBoundary?.arabicDsl?.writtenReferences
        ?.automatedInterpretationOrFatwa === false &&
      universalBenefitBoundary?.arabicDsl?.writtenReferences
        ?.qualifiedScholarReviewRequired === true &&
      universalBenefitBoundary?.checks?.operationalCapacityCatalogComplete === true &&
      universalBenefitBoundary?.checks?.humanParticipationRequiresConsentAndWithdrawal === true &&
      universalBenefitBoundary?.checks?.capacityRequiresOwnerPermission === true &&
      universalBenefitBoundary?.checks?.knownHarmStopsCapacityBeforeEvidenceReview === true &&
      universalBenefitBoundary?.checks?.externalIntegrationRequiresAuthorization === true &&
      universalBenefitBoundary?.checks?.governedIntegrationPlanDoesNotExecute === true &&
      universalBenefitBoundary?.checks?.softwareDoesNotDeclareHalalOrHaram === true &&
      universalBenefitBoundary?.divineLimitsDeterminedBySoftware === false &&
      universalBenefitBoundary?.halalOrHaramDeterminedBySoftware === false &&
      universalBenefitBoundary?.humanParticipationIsExploitableResource === false &&
      universalBenefitBoundary?.humanFinalResponsibility === true,
    nativeLanguageArchitectureIntegrated:
      nativeLanguageArchitecture?.system === 'SHEIKHA_NATIVE_LANGUAGE_ARCHITECTURE_V1' &&
      nativeLanguageArchitecture?.status ===
        'FOUNDATION_ACTIVE_FULL_NATIVE_MIGRATION_REQUIRED' &&
      nativeLanguageArchitecture?.foundationScore === 100 &&
      nativeLanguageArchitecture?.checks?.typeCheckPassed === true &&
      nativeLanguageArchitecture?.checks?.vmPassed === true &&
      nativeLanguageArchitecture?.checks?.formalValuesReferencePresent === true &&
      nativeLanguageArchitecture?.checks?.formalGovernancePolicyPresent === true &&
      nativeLanguageArchitecture?.checks?.valuesReferenceRegisteredAsNonExecutable === true &&
      nativeLanguageArchitecture?.checks?.governancePolicyEnforcedAtRuntime === true &&
      nativeLanguageArchitecture?.checks
        ?.formalArabicScienceReasoningMethodologyPresent === true &&
      nativeLanguageArchitecture?.checks?.reasoningMethodologyEnforcedAtRuntime === true &&
      nativeLanguageArchitecture?.checks
        ?.priorAdvancedHostedArabicFoundationDiscovered === true &&
      nativeLanguageArchitecture?.checks
        ?.priorAdvancedHostedArabicFoundationExecuted === true &&
      nativeLanguageArchitecture?.compiler?.selfHosted === false &&
      nativeLanguageArchitecture?.compiler?.nativeTargetAvailable === false &&
      nativeLanguageArchitecture?.completionGate?.nativeMigrationComplete === false &&
      nativeLanguageArchitecture?.completionGate?.allowedCompletionClaimToday === false &&
      nativeLanguageArchitecture?.currentImplementationBoundary
        ?.completeArchitectureProgrammedInSheikhaToday === false,
    sheikhaLanguageHostedProductionIntegrated:
      sheikhaLanguageProduction?.system === 'SHEIKHA_PRODUCTION_LANGUAGE_V1' &&
      sheikhaLanguageProduction?.status ===
        'HOSTED_PRODUCTION_GATE_PASSED_NATIVE_SYSTEM_MIGRATION_REQUIRED' &&
      sheikhaLanguageProduction?.hostedProductionScore === 100 &&
      sheikhaLanguageProduction?.production?.hostedLanguageSubsystemReady === true &&
      sheikhaLanguageProduction?.production?.universalProductionProgramStarted === true &&
      sheikhaLanguageProduction?.production?.hostedFoundationWave1Admitted === true &&
      sheikhaLanguageProduction?.interpreters?.status ===
        'ARABIC_PRIMARY_INTERPRETERS_VERIFIED' &&
      sheikhaLanguageProduction?.interpreters?.score === 100 &&
      sheikhaLanguageProduction?.interpreters?.promotion?.apexLevel === 97 &&
      sheikhaLanguageProduction?.interpreters?.promotion
        ?.crossPlaneAuthorityEscalation === false &&
      sheikhaLanguageProduction?.production?.allSystemsProgrammedInSheikha === false &&
      sheikhaLanguageProduction?.production?.fullNativeProductionReady === false &&
      sheikhaLanguageProduction?.governance?.valuesReferenceExecutable === false &&
      sheikhaLanguageProduction?.governance?.automatedFatwaAllowed === false &&
      sheikhaLanguageProduction?.systemMigration?.migrationComplete === false &&
      sheikhaLanguageProduction?.systemMigration?.completionClaimAllowed === false,
    documentationIndexBuilt: documentationIndex.count > 0,
    finalExecutiveReportBuilt: Boolean(finalExecutiveReport.counts),
    githubIndependent: getOfflineOperationStatus().githubRequired === false
  };
  const score = scoreFromChecks(checks).score;

  const lifecycleSummary = capabilityRegistry.lifecycleSummary;
  const architectureCatalog = {
    system: 'SHEIKHA_ENTERPRISE_ARCHITECTURE_CATALOG_V1',
    generatedAt: new Date().toISOString(),
    source: 'local-repository-discovery',
    githubRequired: false,
    roots: discoveryRoots,
    rootInventory,
    layers: layerSummary,
    unifiedRuntimeBus: {
      name: 'Unified Runtime Bus',
      channels: ['runtime_registry', 'capability_registry', 'master_log', 'health_gate', 'truth_gate', 'inspector', 'recovery_engine', 'executive_control_center']
    },
    capabilityRegistryPath,
    architectureGraphPath,
    duplicateDetectionPath,
    executiveDashboardPath,
    finalExecutiveReportPath,
    methodologyAccreditationPath,
    externalAccreditationVerificationPath,
    sovereignKernelBootPath,
    sovereignKernelBootHandbookPath,
    bareMetalSeedPath,
    bareMetalSeedHandbookPath,
    bareMetalBootArtifactPath,
    bareMetalBootImagePath,
    computingCognitiveLayersPath,
    computingCognitiveLayersHandbookPath,
    distributionReportPath,
    distributionApexReportPath,
    governanceGeneratorReportPath,
    publicBenefitPolicyPath,
    nativeLanguageArchitecturePath,
    nativeLanguageArchitectureHandbookPath,
    sheikhaLanguageProductionPath,
    sheikhaLanguageProductionHandbookPath,
    universalBenefitBoundaryPath,
    universalBenefitBoundaryHandbookPath,
    distributionMatrixPath,
    distributionHandbookPath,
    distributionBareMetalLinkPath,
    universalTechnologyHpcFabricPath,
    universalTechnologyHpcFabricHandbookPath,
    technologyFamilyTreePath,
    technologyFamilyTreeHandbookPath,
    jannatGardensPath,
    jannatGardensHandbookPath,
    jannatGardensPublicModelPath,
    dependencyGraph: {
      fullGraphPath: architectureGraphPath,
      layerEdges: architectureGraph.edges.length,
      componentEdges: architectureGraph.componentEdges.length
    },
    duplicateAnalysis: {
      fullDuplicateReportPath: duplicateDetectionPath,
      duplicateFiles: duplicateDetection.duplicateFiles.length,
      duplicateServices: duplicateDetection.duplicateServices.length,
      duplicateApis: duplicateDetection.duplicateApis.length,
      duplicateRegistries: duplicateDetection.duplicateRegistries.length,
      policy: duplicateDetection.policy
    },
    executiveCounts: finalExecutiveReport.counts
  };

  const report = {
    system: 'SHEIKHA_MASTER_ACTIVATION_CONSOLIDATION_V1',
    status: score === 100 ? 'ACTIVE_WITH_VERIFIED_LOCAL_CATALOG' : score >= 80 ? 'ACTIVE_WITH_REVIEW' : 'REVIEW_REQUIRED',
    generatedAt: new Date().toISOString(),
    score,
    checks,
    offlineOperation: getOfflineOperationStatus(),
    repositoryDiscovery: {
      roots: discoveryRoots,
      rootInventory,
      discoveredFiles: files.length,
      packageScripts: packageScripts.length,
      source: 'git ls-files -co --exclude-standard',
      githubRequired: false
    },
    summary: {
      discoveredComponents: components.length,
      activeComponents: lifecycleSummary.active,
      duplicateGroups: duplicateDetection.duplicateFiles.length,
      apiEndpoints: apiIndex.uniqueEndpoints,
      documentationFiles: documentationIndex.count,
      methodologyFamilies: methodologyAccreditation.methodologyFamilies.length,
      internalAttestations: methodologyAccreditation.internalIssuedAttestations.length,
      externalCertificatesIssued: methodologyAccreditation.externalCertificatesIssued,
      universalTechnologyFamilies: universalTechnologyHpcFabric?.technologyFamilies?.length || 0,
      universalTechnologyHpcScore: universalTechnologyHpcFabric?.score || 0,
      technologyFamilyTreeNodes: technologyFamilyTree?.lowerLayerNodes?.length || 0,
      technologyFamilyGardenTrees: technologyFamilyTree?.technologyGarden?.trees?.length || 0,
      technologyFamilyTreeScore: technologyFamilyTree?.score || 0,
      jannatGardens: jannatGardens?.metrics?.gardens || 0,
      jannatGardenTrees: jannatGardens?.metrics?.trees || 0,
      jannatGardenRivers: jannatGardens?.metrics?.rivers || 0,
      jannatGardenFruits: jannatGardens?.metrics?.fruits || 0,
      jannatGardensScore: jannatGardens?.score || 0,
      bareMetalBootArtifactCreated: bareMetalSeed?.bootArtifactCreated === true,
      qemuBareMetalBootExecuted: bareMetalSeed?.qemuBootExecuted === true,
      bareMetalSerialMarkerVerified: bareMetalSeed?.serialBootMarkerVerified === true,
      bareMetalFullyIndependentToday: bareMetalSeed?.bareMetalFullyIndependentToday === true,
      computingCognitiveLayersActive:
        computingCognitiveLayers?.status === 'ACTIVE_WITH_CORRECTED_TECHNICAL_MODEL',
      computingCognitiveLayersScore: computingCognitiveLayers?.score || 0,
      computingCognitiveApexLevel: computingCognitiveLayers?.promotion?.apexLevel || 0,
      highestExecutableTechnicalLayer:
        computingCognitiveLayers?.promotion?.highestExecutableTechnicalLayer === true,
      normativeReferenceLayerExecutable:
        computingCognitiveLayers?.promotion?.normativeReferenceLayerExecutable === true,
      distributionTargetCount: distribution?.targetCount || 0,
      distributionBuiltCount: distribution?.builtCount || 0,
      distributionVerifiedCount: distribution?.verifiedCount || 0,
      distributionNativeVerifiedCount: distribution?.nativeVerifiedCount || 0,
      distributionReleaseApexActive:
        distributionApex?.activationStatus === 'L27_ACTIVE_WITH_VERIFIED_BOUNDARIES',
      distributionReleaseApexLevel: distributionApex?.apexLevel || 0,
      distributionReleaseApexPlane: distributionApex?.plane || 'UNKNOWN',
      publicBenefitCapabilityRoutingActive:
        governanceGenerator?.checks?.publicBenefitRouterEnforcesBoundaries === true,
      publicBenefitRegisteredCapabilities:
        governanceGenerator?.coverage?.registeredCapabilitiesCovered || 0,
      publicBenefitCurrentlyActiveCapabilities:
        governanceGenerator?.coverage?.currentlyActiveCapabilities || 0,
      universalBenefitBoundaryActive:
        universalBenefitBoundary?.status === 'VERIFIED_ACTIVE',
      universalBenefitCapabilities:
        universalBenefitBoundary?.capabilitiesRegistered || 0,
      universalBenefitBoundaries:
        universalBenefitBoundary?.boundariesRegistered || 0,
      universalBenefitDomains:
        universalBenefitBoundary?.benefitDomainsRegistered || 0,
      universalBenefitArchitectureComponents:
        universalBenefitBoundary?.architectureComponentsRegistered || 0,
      universalBenefitBoundaryScopes:
        universalBenefitBoundary?.boundaryScopesRegistered || 0,
      universalBenefitResourceClasses:
        universalBenefitBoundary?.resourceClassesRegistered || 0,
      universalBenefitSafeAlternatives:
        universalBenefitBoundary?.safeAlternativesGenerated || 0,
      universalBenefitArabicPrimary:
        universalBenefitBoundary?.arabicPrimary === true,
      universalBenefitCapacityPlannerExecutes:
        universalBenefitBoundary?.capacity?.connectionExecuted === true ||
        universalBenefitBoundary?.capacity?.resourceConsumed === true,
      universalBenefitHalalOrHaramDeterminedBySoftware:
        universalBenefitBoundary?.halalOrHaramDeterminedBySoftware === true,
      universalBenefitHumanParticipationIsExploitableResource:
        universalBenefitBoundary?.humanParticipationIsExploitableResource === true,
      universalBenefitQuranWrittenReferences:
        universalBenefitBoundary?.arabicDsl?.writtenReferences?.quranCount || 0,
      universalBenefitSunnahWrittenReferences:
        universalBenefitBoundary?.arabicDsl?.writtenReferences
          ?.authenticSunnahCount || 0,
      nativeLanguageArchitectureFoundationActive:
        nativeLanguageArchitecture?.foundationScore === 100,
      sheikhaImplementationSourceFiles:
        nativeLanguageArchitecture?.sourceInventory?.sheikhaImplementationSourceFiles || 0,
      sheikhaHostImplementationSourceFiles:
        nativeLanguageArchitecture?.sourceInventory?.hostImplementationSourceFiles || 0,
      sheikhaImplementationLineSharePercent:
        nativeLanguageArchitecture?.sourceInventory?.sheikhaImplementationLineSharePercent || 0,
      sheikhaCompilerSelfHosted:
        nativeLanguageArchitecture?.compiler?.selfHosted === true,
      sheikhaNativeTargetAvailable:
        nativeLanguageArchitecture?.compiler?.nativeTargetAvailable === true,
      sheikhaFullNativeMigrationComplete:
        nativeLanguageArchitecture?.completionGate?.nativeMigrationComplete === true,
      sheikhaHostedProductionGatePassed:
        sheikhaLanguageProduction?.production?.hostedLanguageSubsystemReady === true,
      sheikhaHostedProductionScore:
        sheikhaLanguageProduction?.hostedProductionScore || 0,
      allSystemsProgrammedInSheikha:
        sheikhaLanguageProduction?.production?.allSystemsProgrammedInSheikha === true,
      reasoningModes: Object.keys(computingCognitiveLayers?.model?.reasoningModes || {}).length,
      ultraRoleSlots: computingCognitiveLayers?.model?.ultraMode?.agentSlots || 0,
      reasoningHumanFinalDecision: computingCognitiveLayers?.model?.ultraMode?.humanFinalDecision === true,
      universalTechnologyHpcFabricActive: exists(universalTechnologyHpcFabricPath) || exists('tools/activation/activate-sheikha-universal-technology-hpc-fabric-v1.js')
    },
    lifecycleSummary,
    capabilityRegistry,
    capabilityRegistryBuild: {
      scripts: packageScripts,
      reportPath: 'runtime/capability-registry/v2/sheikha-capability-registry-v2-report.json',
      unifiedPath: capabilityRegistryPath
    },
    architectureCatalog,
    architectureGraph: summarizeArchitectureGraph(architectureGraph),
    dependencyGraph: {
      fullGraphPath: architectureGraphPath,
      componentEdges: architectureGraph.componentEdges.length
    },
    duplicateAnalysis: summarizeDuplicateDetection(duplicateDetection),
    integrationVerification,
    runtimeVerification,
    knowledgeVerification,
    performanceVerification,
    securityVerification,
    methodologyAccreditation,
    universalTechnologyHpcFabric: {
      active: exists(universalTechnologyHpcFabricPath),
      reportPath: universalTechnologyHpcFabricPath,
      handbookPath: universalTechnologyHpcFabricHandbookPath,
      status: universalTechnologyHpcFabric?.status || 'PENDING_REPORT_GENERATION',
      score: universalTechnologyHpcFabric?.score || 0,
      technologyFamilies: universalTechnologyHpcFabric?.technologyFamilies?.length || 0,
      fastestClaimAllowedToday: universalTechnologyHpcFabric?.fastestSystemPolicy?.fastestWorldClaimAllowedToday === true,
      tradeNameDependency: universalTechnologyHpcFabric?.sourceAbstraction?.commercialNameDependency === true
    },
    technologyFamilyTree: {
      active: exists(technologyFamilyTreePath),
      reportPath: technologyFamilyTreePath,
      handbookPath: technologyFamilyTreeHandbookPath,
      status: technologyFamilyTree?.status || 'PENDING_REPORT_GENERATION',
      score: technologyFamilyTree?.score || 0,
      apexHasNoContracts: technologyFamilyTree?.sovereignApex?.contracts?.length === 0,
      apexHasNoBindings: technologyFamilyTree?.sovereignApex?.bindings?.length === 0,
      apexHasNoRuntimeLinks: technologyFamilyTree?.sovereignApex?.runtimeLinks?.length === 0,
      sheikhaLanguageStatus: technologyFamilyTree?.sheikhaLanguagePrimacy?.status || 'UNKNOWN',
      lowerLayerNodes: technologyFamilyTree?.lowerLayerNodes?.length || 0,
      gardenTrees: technologyFamilyTree?.technologyGarden?.trees?.length || 0
    },
    jannatGardens: {
      active: exists(jannatGardensPath),
      reportPath: jannatGardensPath,
      handbookPath: jannatGardensHandbookPath,
      publicModelPath: jannatGardensPublicModelPath,
      status: jannatGardens?.status || 'PENDING_REPORT_GENERATION',
      score: jannatGardens?.score || 0,
      worldlyMetaphorOnly: jannatGardens?.worldlyBeautyBoundary?.worldlyMetaphorOnly === true,
      actualJannahClaim: jannatGardens?.worldlyBeautyBoundary?.actualJannahClaim === true,
      gardens: jannatGardens?.metrics?.gardens || 0,
      trees: jannatGardens?.metrics?.trees || 0,
      rivers: jannatGardens?.metrics?.rivers || 0,
      fruits: jannatGardens?.metrics?.fruits || 0
    },
    bareMetalSeed: {
      active: exists(bareMetalSeedPath),
      reportPath: bareMetalSeedPath,
      handbookPath: bareMetalSeedHandbookPath,
      bootArtifactPath: bareMetalBootArtifactPath,
      bootImagePath: bareMetalBootImagePath,
      status: bareMetalSeed?.status || 'PENDING_REPORT_GENERATION',
      architecture: bareMetalSeed?.architecture || 'x86_64',
      bootProtocol: bareMetalSeed?.bootProtocol || 'UEFI',
      bootArtifactCreated: bareMetalSeed?.bootArtifactCreated === true,
      qemuBootExecuted: bareMetalSeed?.qemuBootExecuted === true,
      serialBootMarkerVerified: bareMetalSeed?.serialBootMarkerVerified === true,
      postFirmwareHandoffVerified: bareMetalSeed?.postFirmwareHandoffVerified === true,
      bareMetalFullyIndependentToday: bareMetalSeed?.bareMetalFullyIndependentToday === true,
      linuxRequiredAtKernelRuntime: bareMetalSeed?.linuxRequiredAtKernelRuntime !== false,
      nodeRequiredAtKernelRuntime: bareMetalSeed?.nodeRequiredAtKernelRuntime !== false
    },
    computingCognitiveLayers: {
      active: exists(computingCognitiveLayersPath),
      reportPath: computingCognitiveLayersPath,
      handbookPath: computingCognitiveLayersHandbookPath,
      status: computingCognitiveLayers?.status || 'PENDING_REPORT_GENERATION',
      score: computingCognitiveLayers?.score || 0,
      apexLevel: computingCognitiveLayers?.promotion?.apexLevel || 0,
      level: computingCognitiveLayers?.promotion?.level || 'UNKNOWN',
      position: computingCognitiveLayers?.promotion?.position || 'UNKNOWN',
      highestExecutableTechnicalLayer:
        computingCognitiveLayers?.promotion?.highestExecutableTechnicalLayer === true,
      normativeReferenceLayerExecutable:
        computingCognitiveLayers?.promotion?.normativeReferenceLayerExecutable === true,
      humanAuthorityAboveAutomation:
        computingCognitiveLayers?.promotion?.humanAuthorityAboveAutomation === true,
      domains: Object.keys(computingCognitiveLayers?.model?.domains || {}).length,
      reasoningModes: Object.keys(computingCognitiveLayers?.model?.reasoningModes || {}).length,
      ultraRoleSlots: computingCognitiveLayers?.model?.ultraMode?.agentSlots || 0,
      actualIndependentModelProcesses:
        computingCognitiveLayers?.model?.ultraMode?.currentActualIndependentModelProcesses === true,
      humanFinalDecision: computingCognitiveLayers?.model?.ultraMode?.humanFinalDecision === true,
      safetyFilterEvasionAllowed: computingCognitiveLayers?.model?.boundaries?.noSafetyBypass === false
    },
    universalDistribution: {
      active: exists(distributionReportPath),
      reportPath: distributionReportPath,
      matrixPath: distributionMatrixPath,
      handbookPath: distributionHandbookPath,
      bareMetalLinkPath: distributionBareMetalLinkPath,
      status: distribution?.status || 'PENDING_REPORT_GENERATION',
      targetCount: distribution?.targetCount || 0,
      builtCount: distribution?.builtCount || 0,
      verifiedCount: distribution?.verifiedCount || 0,
      nativeVerifiedCount: distribution?.nativeVerifiedCount || 0,
      signedCount: distribution?.signedCount || 0,
      notarizedCount: distribution?.notarizedCount || 0,
      publishedCount: distribution?.publishedCount || 0,
      localRegistryPublishedCount: distribution?.localRegistryPublishedCount || 0,
      localReleasePath: distribution?.localReleasePath || null,
      localRegistryOnly: distribution?.localRegistryOnly === true,
      githubRequired: distribution?.githubRequired !== false,
      claimPolicy: distribution?.claimPolicy || 'UNKNOWN'
    },
    universalDistributionApex: {
      active: exists(distributionApexReportPath),
      reportPath: distributionApexReportPath,
      system: distributionApex?.system || 'SHEIKHA_UNIVERSAL_DISTRIBUTION_RELEASE_APEX_V1',
      status: distributionApex?.status || 'PENDING_REPORT_GENERATION',
      activationStatus: distributionApex?.activationStatus || 'PENDING_REPORT_GENERATION',
      score: distributionApex?.score || 0,
      apexLevel: distributionApex?.apexLevel || 0,
      plane: distributionApex?.plane || 'UNKNOWN',
      targetCount: distributionApex?.evidence?.targetCount || 0,
      builtCount: distributionApex?.evidence?.builtCount || 0,
      nativeVerifiedCount: distributionApex?.evidence?.nativeVerifiedCount || 0,
      localRegistryOnly: distributionApex?.evidence?.localRegistryOnly === true,
      githubRequired: distributionApex?.evidence?.githubRequired === true,
      reproducibilityVerified: distributionApex?.evidence?.reproducibilityVerified === true,
      secretScanPassed: distributionApex?.evidence?.secretScanPassed === true,
      invalidVerifiedClaims: distributionApex?.evidence?.invalidVerifiedClaims || [],
      remoteBuildEndpointExposed:
        distributionApex?.governance?.remoteBuildEndpointExposed === true,
      remotePublishEndpointExposed:
        distributionApex?.governance?.remotePublishEndpointExposed === true,
      crossPlaneAuthorityEscalation:
        distributionApex?.layerRelationship?.crossPlaneAuthorityEscalation === true,
      humanFinalDecision: distributionApex?.governance?.humanFinalDecision === true
    },
    publicBenefitCapabilityRouting: {
      active: governanceGenerator?.checks?.publicBenefitRouterEnforcesBoundaries === true,
      reportPath: governanceGeneratorReportPath,
      policyPath: publicBenefitPolicyPath,
      status: publicBenefitPolicy?.status || 'PENDING_REPORT_GENERATION',
      scope: publicBenefitPolicy?.scope?.appliesTo || 'UNKNOWN',
      registeredCapabilities:
        governanceGenerator?.coverage?.registeredCapabilitiesCovered || 0,
      currentlyActiveCapabilities:
        governanceGenerator?.coverage?.currentlyActiveCapabilities || 0,
      policyCoverageActivatesCapabilities:
        publicBenefitPolicy?.scope?.policyCoverageDoesNotActivateCapabilities !== true,
      hardBoundariesOverrideBenefitIntent:
        publicBenefitPolicy?.purpose?.endsNeverJustifyForbiddenOrHarmfulMeans === true,
      automaticExecution: publicBenefitPolicy?.execution?.automaticExecution === true,
      decisionGrantsAuthorization:
        publicBenefitPolicy?.execution?.decisionGrantsAuthorization === true,
      automatedFatwaAllowed:
        publicBenefitPolicy?.valuesReference?.automatedFatwaAllowed === true,
      humanFinalDecision: publicBenefitPolicy?.execution?.humanFinalDecision === true
    },
    universalBenefitBoundary: {
      active: universalBenefitBoundary?.status === 'VERIFIED_ACTIVE',
      reportPath: universalBenefitBoundaryPath,
      handbookPath: universalBenefitBoundaryHandbookPath,
      status: universalBenefitBoundary?.status || 'PENDING_REPORT_GENERATION',
      score: universalBenefitBoundary?.score || 0,
      capabilitiesRegistered:
        universalBenefitBoundary?.capabilitiesRegistered || 0,
      boundariesRegistered:
        universalBenefitBoundary?.boundariesRegistered || 0,
      benefitDomainsRegistered:
        universalBenefitBoundary?.benefitDomainsRegistered || 0,
      architectureComponentsRegistered:
        universalBenefitBoundary?.architectureComponentsRegistered || 0,
      boundaryScopesRegistered:
        universalBenefitBoundary?.boundaryScopesRegistered || 0,
      resourceClassesRegistered:
        universalBenefitBoundary?.resourceClassesRegistered || 0,
      language: universalBenefitBoundary?.language || 'UNKNOWN',
      arabicPrimary: universalBenefitBoundary?.arabicPrimary === true,
      quranWrittenReferences:
        universalBenefitBoundary?.arabicDsl?.writtenReferences?.quranCount || 0,
      sunnahWrittenReferences:
        universalBenefitBoundary?.arabicDsl?.writtenReferences
          ?.authenticSunnahCount || 0,
      automatedReligiousInterpretation:
        universalBenefitBoundary?.arabicDsl?.writtenReferences
          ?.automatedInterpretationOrFatwa === true,
      qualifiedScholarReviewRequired:
        universalBenefitBoundary?.arabicDsl?.writtenReferences
          ?.qualifiedScholarReviewRequired === true,
      allowedDecisions: universalBenefitBoundary?.allowedDecisions || 0,
      reviewDecisions: universalBenefitBoundary?.reviewDecisions || 0,
      sandboxDecisions: universalBenefitBoundary?.sandboxDecisions || 0,
      deniedDecisions: universalBenefitBoundary?.deniedDecisions || 0,
      safeAlternativesGenerated:
        universalBenefitBoundary?.safeAlternativesGenerated || 0,
      religiousRulingsAutomated:
        universalBenefitBoundary?.religiousRulingsAutomated === true,
      safetyBypassAllowed:
        universalBenefitBoundary?.safetyBypassAllowed === true,
      permissionEscalationAllowed:
        universalBenefitBoundary?.permissionEscalationAllowed === true,
      divineLimitsDeterminedBySoftware:
        universalBenefitBoundary?.divineLimitsDeterminedBySoftware === true,
      halalOrHaramDeterminedBySoftware:
        universalBenefitBoundary?.halalOrHaramDeterminedBySoftware === true,
      operationalBoundariesAreReligiousRulings:
        universalBenefitBoundary?.operationalBoundariesAreReligiousRulings === true,
      humanParticipationIsExploitableResource:
        universalBenefitBoundary?.humanParticipationIsExploitableResource === true,
      capacityPlannerExecutes:
        universalBenefitBoundary?.capacity?.connectionExecuted === true ||
        universalBenefitBoundary?.capacity?.resourceConsumed === true,
      humanFinalResponsibility:
        universalBenefitBoundary?.humanFinalResponsibility === true
    },
    nativeLanguageArchitecture: {
      active: nativeLanguageArchitecture?.foundationScore === 100,
      reportPath: nativeLanguageArchitecturePath,
      handbookPath: nativeLanguageArchitectureHandbookPath,
      status: nativeLanguageArchitecture?.status || 'PENDING_REPORT_GENERATION',
      canonicalSource: nativeLanguageArchitecture?.source?.path || null,
      valuesReferences: nativeLanguageArchitecture?.source?.valuesReferences || [],
      governancePolicies: nativeLanguageArchitecture?.source?.governancePolicies || [],
      reasoningMethodologies:
        nativeLanguageArchitecture?.source?.reasoningMethodologies || [],
      valuesReferenceRegisteredAsNonExecutable:
        nativeLanguageArchitecture?.checks?.valuesReferenceRegisteredAsNonExecutable === true,
      governancePolicyEnforcedAtRuntime:
        nativeLanguageArchitecture?.checks?.governancePolicyEnforcedAtRuntime === true,
      reasoningMethodologyEnforcedAtRuntime:
        nativeLanguageArchitecture?.checks?.reasoningMethodologyEnforcedAtRuntime === true,
      advancedHostedArabicFoundationStatus:
        nativeLanguageArchitecture?.advancedHostedArabicFoundation?.status || 'UNKNOWN',
      advancedHostedArabicFoundationScore:
        nativeLanguageArchitecture?.advancedHostedArabicFoundation?.score || 0,
      hostedArabicLanguageJavaScriptFiles:
        nativeLanguageArchitecture?.hostedArabicLanguageInventory
          ?.javascriptImplementationFiles || 0,
      hostedArabicLanguageExecutableSourceLines:
        nativeLanguageArchitecture?.hostedArabicLanguageInventory
          ?.executableSourceLines || 0,
      foundationScore: nativeLanguageArchitecture?.foundationScore || 0,
      sheikhaImplementationSourceFiles:
        nativeLanguageArchitecture?.sourceInventory?.sheikhaImplementationSourceFiles || 0,
      hostImplementationSourceFiles:
        nativeLanguageArchitecture?.sourceInventory?.hostImplementationSourceFiles || 0,
      sheikhaImplementationLineSharePercent:
        nativeLanguageArchitecture?.sourceInventory?.sheikhaImplementationLineSharePercent || 0,
      compilerBootstrapRuntime:
        nativeLanguageArchitecture?.compiler?.bootstrapRuntime || 'UNKNOWN',
      compilerSelfHosted: nativeLanguageArchitecture?.compiler?.selfHosted === true,
      nativeTargetAvailable:
        nativeLanguageArchitecture?.compiler?.nativeTargetAvailable === true,
      fullSystemPortedToSheikha:
        nativeLanguageArchitecture?.currentImplementationBoundary
          ?.allSystemsPortedToSheikhaToday === true,
      nativeMigrationComplete:
        nativeLanguageArchitecture?.completionGate?.nativeMigrationComplete === true,
      completionClaimAllowed:
        nativeLanguageArchitecture?.completionGate?.allowedCompletionClaimToday === true,
      blockers: nativeLanguageArchitecture?.completionGate?.blockers || []
    },
    sheikhaLanguageProduction: {
      active:
        sheikhaLanguageProduction?.production?.hostedLanguageSubsystemReady === true,
      reportPath: sheikhaLanguageProductionPath,
      handbookPath: sheikhaLanguageProductionHandbookPath,
      status: sheikhaLanguageProduction?.status || 'PENDING_REPORT_GENERATION',
      hostedProductionScore:
        sheikhaLanguageProduction?.hostedProductionScore || 0,
      advancedHostedArabicFoundation:
        sheikhaLanguageProduction?.integration?.advancedHostedArabicFoundation || 'UNKNOWN',
      governedAiKernel:
        sheikhaLanguageProduction?.integration?.aiKernel || 'UNKNOWN',
      valuesReferenceExecutable:
        sheikhaLanguageProduction?.governance?.valuesReferenceExecutable === true,
      automatedFatwaAllowed:
        sheikhaLanguageProduction?.governance?.automatedFatwaAllowed === true,
      fullNativeProductionReady:
        sheikhaLanguageProduction?.production?.fullNativeProductionReady === true,
      allSystemsProgrammedInSheikha:
        sheikhaLanguageProduction?.production?.allSystemsProgrammedInSheikha === true,
      systemMigrationComplete:
        sheikhaLanguageProduction?.systemMigration?.migrationComplete === true,
      universalProductionProgramStatus:
        sheikhaLanguageProduction?.universalProductionProgram?.status || 'NOT_STARTED',
      wave1AdmittedSystems:
        sheikhaLanguageProduction?.universalProductionProgram?.wave1?.admittedSystems || 0,
      wave1TotalSystems:
        sheikhaLanguageProduction?.universalProductionProgram?.wave1?.totalSystems || 0,
      unboundedOrAbsoluteExecutionAllowed:
        sheikhaLanguageProduction?.universalProductionProgram
          ?.unboundedOrAbsoluteExecutionAllowed === true,
      arabicProductionInterpretersStatus:
        sheikhaLanguageProduction?.interpreters?.status || 'UNKNOWN',
      arabicProductionInterpretersScore:
        sheikhaLanguageProduction?.interpreters?.score || 0,
      interpreterExternalExecution:
        sheikhaLanguageProduction?.interpreters?.boundary?.externalExecution === true,
      interpreterApexLevel:
        sheikhaLanguageProduction?.interpreters?.promotion?.apexLevel || 0,
      interpreterCrossPlaneAuthorityEscalation:
        sheikhaLanguageProduction?.interpreters?.promotion
          ?.crossPlaneAuthorityEscalation === true,
      systemMigrationBlockers:
        sheikhaLanguageProduction?.systemMigration?.blockers || []
    },
    executiveDashboard,
    documentation: documentationIndex,
    safeImprovementsExecuted: [
      'Unified master catalog generated from the local repository only.',
      'Capability registry now records inputs, outputs, tests, reports, APIs, maturity, and operation status.',
      'Duplicate detection is report-only and does not delete or mutate discovered components.',
      'Internal methodology attestations and external accreditation readiness targets are cataloged without claiming third-party issuance.',
      'Universal technology HPC fabric catalogs supercomputing, semiconductor, conductor, supply-chain, factory, recovery, and benchmark capabilities by generic laws and specifications.',
      'Technology family tree defines Sheikha root, technical garden, and lower-layer Sharia contracts while keeping the highest governance apex contractless and linkless.',
      'Jannat Sheikha gardens define worldly beauty, gardens, trees, rivers, and fruits for interfaces and architecture without claiming unseen Jannah representation.',
      'Native x86_64 UEFI seed is linked to QEMU serial evidence and cannot claim bare-metal completion without the post-ExitBootServices marker.',
      'Computing, cloud, CPU, cognitive, and information layers are consolidated with corrected technical dimensions and primary engineering references.',
      'Standard, Pro, and Ultra reasoning profiles are active with bounded serendipity, safety gates, and accountable human final decisions.',
      'Computing Cognitive Layers is promoted to L24 above the L23 extension stream, parallel L22 deployment plane, L21 multilingual stream, and L20 technical capability apex.',
      'Universal distribution uses one 27-target matrix and independent package adapters; completion counts come only from built, inspected, checksummed, and natively evidenced artifacts.',
      'Universal Distribution Release Apex is promoted to specialized L27 with read-only runtime APIs and no cross-plane authority escalation.',
      'Public Benefit Capability Routing covers the registered catalog with hard boundaries, evidence admission, specialist review, and no automatic execution.',
      'Universal Benefit and Boundary Governance registers permitted capabilities and transforms boundaries into approval, evidence, sandbox, accessibility, recovery, or safe-alternative paths without permission escalation.',
      'Native Sheikha Language Architecture provides first-class Arabic values-reference, governance-policy, and evidence-domain methodology declarations with compiler and VM enforcement, plus measured migration blockers without claiming a completed Sheikha-only system.',
      'Sheikha Hosted Production Language Gate executes compiler, AST, IR, VM V1/V2, Arabic math, governed AI, assets, and governance checks while keeping full native and all-system migration claims evidence-gated.',
      'GitHub is not required for activation; local-registry is the recommended push target.'
    ],
    executiveReport: finalExecutiveReport,
    principle: 'التفعيل النهائي يبنى على اكتشاف المستودع الحقيقي ثم التحسين الآمن بالأدلة، ولا يعتمد على GitHub.'
  };

  Object.defineProperty(report, '__artifacts', {
    enumerable: false,
    value: {
      architectureCatalog,
      architectureGraph,
      capabilityRegistry,
      duplicateDetection,
      documentationIndex,
      executiveDashboard,
      finalExecutiveReport,
      methodologyAccreditation
    }
  });

  report.capabilityRegistry = summarizeCapabilityRegistry(capabilityRegistry);
  return report;
}

function writeJson(relativePath, payload) {
  fs.mkdirSync(path.dirname(resolve(relativePath)), { recursive: true });
  fs.writeFileSync(resolve(relativePath), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function writeReport(report = buildReport()) {
  const artifacts = report.__artifacts || {};
  writeJson(reportPath, report);
  writeJson(catalogPath, artifacts.architectureCatalog || report.architectureCatalog);
  writeJson(capabilityRegistryPath, artifacts.capabilityRegistry || report.capabilityRegistry);
  writeJson(architectureGraphPath, artifacts.architectureGraph || report.architectureGraph);
  writeJson(duplicateDetectionPath, artifacts.duplicateDetection || report.duplicateAnalysis);
  writeJson(executiveDashboardPath, artifacts.executiveDashboard || report.executiveDashboard);
  writeJson(finalExecutiveReportPath, artifacts.finalExecutiveReport || report.executiveReport);
  writeJson(documentationIndexPath, artifacts.documentationIndex || report.documentation);
  writeJson(methodologyAccreditationPath, artifacts.methodologyAccreditation || report.methodologyAccreditation);
  return report;
}

if (require.main === module) {
  const report = writeReport();
  console.log(JSON.stringify({
    system: report.system,
    status: report.status,
    score: report.score,
    githubRequired: report.offlineOperation.githubRequired,
    localRegistryConfigured: report.offlineOperation.localRegistryConfigured,
    discoveredComponents: report.summary.discoveredComponents,
    apiEndpoints: report.summary.apiEndpoints,
    duplicateGroups: report.summary.duplicateGroups,
    universalTechnologyFamilies: report.summary.universalTechnologyFamilies,
    universalTechnologyHpcScore: report.summary.universalTechnologyHpcScore,
    technologyFamilyTreeNodes: report.summary.technologyFamilyTreeNodes,
    technologyFamilyGardenTrees: report.summary.technologyFamilyGardenTrees,
    technologyFamilyTreeScore: report.summary.technologyFamilyTreeScore,
    jannatGardens: report.summary.jannatGardens,
    jannatGardenTrees: report.summary.jannatGardenTrees,
    jannatGardenRivers: report.summary.jannatGardenRivers,
    jannatGardenFruits: report.summary.jannatGardenFruits,
    jannatGardensScore: report.summary.jannatGardensScore,
    bareMetalBootArtifactCreated: report.summary.bareMetalBootArtifactCreated,
    qemuBareMetalBootExecuted: report.summary.qemuBareMetalBootExecuted,
    bareMetalSerialMarkerVerified: report.summary.bareMetalSerialMarkerVerified,
    bareMetalFullyIndependentToday: report.summary.bareMetalFullyIndependentToday,
    computingCognitiveLayersActive: report.summary.computingCognitiveLayersActive,
    computingCognitiveLayersScore: report.summary.computingCognitiveLayersScore,
    computingCognitiveApexLevel: report.summary.computingCognitiveApexLevel,
    highestExecutableTechnicalLayer: report.summary.highestExecutableTechnicalLayer,
    normativeReferenceLayerExecutable: report.summary.normativeReferenceLayerExecutable,
    distributionTargetCount: report.summary.distributionTargetCount,
    distributionBuiltCount: report.summary.distributionBuiltCount,
    distributionVerifiedCount: report.summary.distributionVerifiedCount,
    distributionNativeVerifiedCount: report.summary.distributionNativeVerifiedCount,
    distributionReleaseApexActive: report.summary.distributionReleaseApexActive,
    distributionReleaseApexLevel: report.summary.distributionReleaseApexLevel,
    distributionReleaseApexPlane: report.summary.distributionReleaseApexPlane,
    publicBenefitCapabilityRoutingActive: report.summary.publicBenefitCapabilityRoutingActive,
    publicBenefitRegisteredCapabilities: report.summary.publicBenefitRegisteredCapabilities,
    publicBenefitCurrentlyActiveCapabilities:
      report.summary.publicBenefitCurrentlyActiveCapabilities,
    universalBenefitBoundaryActive: report.summary.universalBenefitBoundaryActive,
    universalBenefitCapabilities: report.summary.universalBenefitCapabilities,
    universalBenefitBoundaries: report.summary.universalBenefitBoundaries,
    universalBenefitDomains: report.summary.universalBenefitDomains,
    universalBenefitBoundaryScopes: report.summary.universalBenefitBoundaryScopes,
    universalBenefitResourceClasses: report.summary.universalBenefitResourceClasses,
    universalBenefitSafeAlternatives: report.summary.universalBenefitSafeAlternatives,
    universalBenefitArabicPrimary: report.summary.universalBenefitArabicPrimary,
    universalBenefitCapacityPlannerExecutes:
      report.summary.universalBenefitCapacityPlannerExecutes,
    universalBenefitHalalOrHaramDeterminedBySoftware:
      report.summary.universalBenefitHalalOrHaramDeterminedBySoftware,
    universalBenefitHumanParticipationIsExploitableResource:
      report.summary.universalBenefitHumanParticipationIsExploitableResource,
    universalBenefitQuranWrittenReferences:
      report.summary.universalBenefitQuranWrittenReferences,
    universalBenefitSunnahWrittenReferences:
      report.summary.universalBenefitSunnahWrittenReferences,
    nativeLanguageArchitectureFoundationActive:
      report.summary.nativeLanguageArchitectureFoundationActive,
    sheikhaImplementationSourceFiles: report.summary.sheikhaImplementationSourceFiles,
    sheikhaHostImplementationSourceFiles: report.summary.sheikhaHostImplementationSourceFiles,
    sheikhaImplementationLineSharePercent:
      report.summary.sheikhaImplementationLineSharePercent,
    sheikhaCompilerSelfHosted: report.summary.sheikhaCompilerSelfHosted,
    sheikhaNativeTargetAvailable: report.summary.sheikhaNativeTargetAvailable,
    sheikhaFullNativeMigrationComplete: report.summary.sheikhaFullNativeMigrationComplete,
    sheikhaHostedProductionGatePassed:
      report.summary.sheikhaHostedProductionGatePassed,
    sheikhaHostedProductionScore: report.summary.sheikhaHostedProductionScore,
    allSystemsProgrammedInSheikha: report.summary.allSystemsProgrammedInSheikha,
    reasoningModes: report.summary.reasoningModes,
    ultraRoleSlots: report.summary.ultraRoleSlots,
    reasoningHumanFinalDecision: report.summary.reasoningHumanFinalDecision,
    output: {
      report: reportPath,
      catalog: catalogPath,
      capabilityRegistry: capabilityRegistryPath,
      architectureGraph: architectureGraphPath,
      duplicateDetection: duplicateDetectionPath,
      executiveDashboard: executiveDashboardPath,
      finalExecutiveReport: finalExecutiveReportPath,
      documentationIndex: documentationIndexPath,
      methodologyAccreditation: methodologyAccreditationPath,
      externalAccreditationVerification: externalAccreditationVerificationPath,
      sovereignKernelBoot: sovereignKernelBootPath,
      sovereignKernelBootHandbook: sovereignKernelBootHandbookPath,
      universalTechnologyHpcFabric: universalTechnologyHpcFabricPath,
      universalTechnologyHpcFabricHandbook: universalTechnologyHpcFabricHandbookPath,
      technologyFamilyTree: technologyFamilyTreePath,
      technologyFamilyTreeHandbook: technologyFamilyTreeHandbookPath,
      jannatGardens: jannatGardensPath,
      jannatGardensHandbook: jannatGardensHandbookPath,
      jannatGardensPublicModel: jannatGardensPublicModelPath,
      bareMetalSeed: bareMetalSeedPath,
      bareMetalSeedHandbook: bareMetalSeedHandbookPath,
      bareMetalBootArtifact: bareMetalBootArtifactPath,
      bareMetalBootImage: bareMetalBootImagePath,
      computingCognitiveLayers: computingCognitiveLayersPath,
      computingCognitiveLayersHandbook: computingCognitiveLayersHandbookPath,
      universalDistribution: distributionReportPath,
      universalDistributionApex: distributionApexReportPath,
      governanceGenerator: governanceGeneratorReportPath,
      publicBenefitCapabilityPolicy: publicBenefitPolicyPath,
      nativeLanguageArchitecture: nativeLanguageArchitecturePath,
      nativeLanguageArchitectureHandbook: nativeLanguageArchitectureHandbookPath,
      sheikhaLanguageProduction: sheikhaLanguageProductionPath,
      sheikhaLanguageProductionHandbook: sheikhaLanguageProductionHandbookPath,
      universalBenefitBoundary: universalBenefitBoundaryPath,
      universalBenefitBoundaryHandbook: universalBenefitBoundaryHandbookPath,
      universalDistributionMatrix: distributionMatrixPath,
      universalDistributionHandbook: distributionHandbookPath,
      distributionBareMetalLink: distributionBareMetalLinkPath
    }
  }, null, 2));
}

module.exports = {
  buildApiIndex,
  buildArchitectureGraph,
  buildCapabilityRegistry,
  buildComponent,
  buildDuplicateDetection,
  buildMethodologyAccreditationReadiness,
  buildReport,
  classifyLayer,
  classifyLifecycleStatus,
  getRepositoryFiles,
  scoreFromChecks,
  writeReport
};
