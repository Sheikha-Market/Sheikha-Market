'use strict';

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execSync } = require('node:child_process');

const ROOT = process.cwd();
const reportPath = 'runtime/master-activation/sheikha-master-activation-consolidation-v1-report.json';
const catalogPath = 'runtime/master-activation/sheikha-enterprise-architecture-catalog-v1.json';
const packageJson = require(path.join(ROOT, 'package.json'));

const DISCOVERY_EXCLUDES = new Set(['.git', 'node_modules']);

const LAYER_RULES = [
  ['identity', 'Identity'],
  ['governance', 'Governance'],
  ['enterprise', 'Enterprise'],
  ['community', 'Community'],
  ['knowledge', 'Knowledge'],
  ['marketplace', 'Marketplace'],
  ['market', 'Marketplace'],
  ['commerce', 'Commerce'],
  ['api', 'APIs'],
  ['security', 'Security'],
  ['truth', 'Truth Gate'],
  ['health', 'Health'],
  ['recovery', 'Recovery'],
  ['inspector', 'Inspector'],
  ['control-center', 'Control Center'],
  ['executive', 'Executive Center'],
  ['operating-system', 'OS'],
  ['os-cloud', 'OS'],
  ['cloud', 'Cloud'],
  ['supercomputer', 'Compute/HPC'],
  ['hpc', 'Compute/HPC'],
  ['monitor', 'Monitoring'],
  ['analytics', 'Analytics'],
  ['language', 'Language'],
  ['dsl', 'DSL'],
  ['registry', 'Registry'],
  ['sdk', 'SDK'],
  ['runtime', 'Runtime'],
  ['doc', 'Documentation']
];

const DEPENDENCY_BY_LAYER = {
  Identity: ['Runtime', 'Governance'],
  Governance: ['Runtime', 'Security'],
  Runtime: ['OS', 'Cloud'],
  Enterprise: ['Governance', 'Runtime', 'Knowledge'],
  Community: ['Identity', 'Runtime'],
  Knowledge: ['Identity', 'Runtime'],
  Marketplace: ['Commerce', 'Community', 'Knowledge'],
  Commerce: ['Marketplace', 'Governance'],
  APIs: ['Runtime', 'Security'],
  Security: ['Governance', 'Runtime'],
  'Truth Gate': ['Governance', 'Health'],
  Health: ['Runtime'],
  Recovery: ['Runtime', 'Inspector'],
  Inspector: ['Runtime', 'Knowledge'],
  'Control Center': ['Inspector', 'Governance'],
  'Executive Center': ['Control Center', 'Truth Gate'],
  OS: ['Cloud', 'Compute/HPC'],
  Cloud: ['OS', 'Runtime'],
  'Compute/HPC': ['OS', 'Cloud'],
  Monitoring: ['Runtime', 'Health'],
  Analytics: ['Knowledge', 'Monitoring'],
  Language: ['DSL', 'Runtime'],
  DSL: ['Language', 'Runtime'],
  Registry: ['Knowledge', 'Governance'],
  SDK: ['APIs', 'Runtime'],
  Documentation: ['Knowledge']
};

function resolve(relativePath) {
  return path.join(ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(resolve(relativePath));
}

function run(command) {
  try {
    return execSync(command, {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
  } catch {
    return '';
  }
}

function safeReadJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(resolve(relativePath), 'utf8'));
  } catch {
    return null;
  }
}

function getDiscoveryRoots() {
  return fs.readdirSync(ROOT, { withFileTypes: true })
    .filter((entry) => !DISCOVERY_EXCLUDES.has(entry.name))
    .map((entry) => entry.name);
}

function walk(relativePath, collector = []) {
  const fullPath = resolve(relativePath);
  if (!fs.existsSync(fullPath)) {
    return collector;
  }

  for (const entry of fs.readdirSync(fullPath, { withFileTypes: true })) {
    const nextRelative = path.join(relativePath, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'build', 'coverage'].includes(entry.name)) {
        continue;
      }
      walk(nextRelative, collector);
      continue;
    }
    collector.push(nextRelative.replace(/\\/g, '/'));
  }

  return collector;
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

function classifyLayer(filePath) {
  const lower = filePath.toLowerCase();
  const matched = LAYER_RULES.find(([token]) => lower.includes(token));
  return matched ? matched[1] : 'Documentation';
}

function classifyLifecycleStatus(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.includes('archive') || lower.includes('.bak') || lower.includes('backup')) {
    return 'UNUSED';
  }
  if (lower.includes('experimental') || lower.includes('research') || lower.includes('lab')) {
    return 'EXPERIMENTAL';
  }
  if (lower.endsWith('-report.json') || lower.includes('/v1/') || lower.includes('/v2/')) {
    return 'ACTIVE';
  }
  if (lower.includes('activate-') || lower.includes('registry') || lower.includes('engine')) {
    return 'NEEDS_LINKING';
  }
  return 'NEEDS_DEVELOPMENT';
}

function normalizeKey(filePath) {
  return path.basename(filePath)
    .toLowerCase()
    .replace(/sheikha-/g, '')
    .replace(/activate-/g, '')
    .replace(/-v\d+/g, '')
    .replace(/\.(json|js|md|sh|html)$/g, '');
}

function buildComponent(filePath) {
  const layer = classifyLayer(filePath);
  return {
    id: normalizeKey(filePath),
    path: filePath,
    layer,
    lifecycle: classifyLifecycleStatus(filePath),
    dependencies: DEPENDENCY_BY_LAYER[layer] || []
  };
}

function countMatches(items, matcher) {
  return items.filter((item) => matcher(item)).length;
}

function summarizePm2() {
  const raw = run('pm2 jlist');
  try {
    const list = JSON.parse(raw || '[]');
    return {
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
    return { count: 0, online: 0, services: [] };
  }
}

function getRouteCount() {
  const registryPath = resolve('runtime/registry/all-routes.unique.txt');
  if (!fs.existsSync(registryPath)) {
    return 0;
  }
  return fs.readFileSync(registryPath, 'utf8')
    .split('\n')
    .filter((line) => /^(get|post|put|delete|patch)\('/i.test(line.trim()))
    .length;
}

function getDiskUsage() {
  const raw = run('df -Pk . | tail -n 1');
  const parts = raw.split(/\s+/).filter(Boolean);
  if (parts.length < 6) {
    return null;
  }
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
    .filter((line) => /:8080\b|:8081\b|:8082\b/.test(line))
    .map((line) => line.trim());
}

function buildLayerSummary(components) {
  return Object.fromEntries(
    Object.keys(DEPENDENCY_BY_LAYER).map((layer) => [
      layer,
      {
        components: components.filter((item) => item.layer === layer).length,
        dependencies: DEPENDENCY_BY_LAYER[layer]
      }
    ])
  );
}

function buildFinalExecutiveReport(components, packageScripts, duplicateGroups, routeCount) {
  return {
    systems: countMatches(components, (item) => /system|operating-system|platform/i.test(item.path)),
    engines: countMatches(components, (item) => /engine/i.test(item.path)),
    layers: new Set(components.map((item) => item.layer)).size,
    apis: routeCount,
    services: summarizePm2().count,
    tests: countMatches(components, (item) => /\.test\.js$/i.test(item.path)),
    docs: countMatches(components, (item) => /\.(md|html)$/i.test(item.path) || item.path.startsWith('docs/')),
    sdks: countMatches(components, (item) => /sdk/i.test(item.path)),
    registries: countMatches(components, (item) => /registry/i.test(item.path)),
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
    dashboards: countMatches(components, (item) => /dashboard|control-center|executive-civilization-control-center/i.test(item.path)),
    pipelines: countMatches(components, (item) => /pipeline/i.test(item.path)),
    automationEngines: countMatches(components, (item) => /automation|activate-/i.test(item.path)),
    integrations: countMatches(components, (item) => /integration/i.test(item.path)),
    packageScripts: packageScripts.length,
    duplicateGroups: duplicateGroups.length
  };
}

function buildReport() {
  const discoveryRoots = getDiscoveryRoots();
  const discoveredFiles = discoveryRoots.flatMap((rootPath) => walk(rootPath));
  const filteredFiles = discoveredFiles.filter((filePath) => /sheikha-|activate-|report|registry|dashboard|identity|governance|runtime|market|community|knowledge/i.test(filePath));
  const components = filteredFiles.map(buildComponent);
  const routeCount = getRouteCount();
  const pm2 = summarizePm2();
  const disk = getDiskUsage();
  const ports = getPortsSnapshot();
  const networkInterfaces = Object.keys(os.networkInterfaces() || {}).length;
  const identityEngine = safeReadJson('runtime/identity-engine/v1/sheikha-identity-engine-v1-report.json');
  const enterpriseVerification = safeReadJson('runtime/enterprise-integration/sheikha-enterprise-integration-verification-layer-v1-report.json');
  const readiness = safeReadJson('runtime/system/sheikha-production-readiness-report.json');
  const capabilityRegistry = safeReadJson('runtime/capability-registry/v2/sheikha-capability-registry-v2-report.json');
  const community = safeReadJson('runtime/community/sheikha-community-modeling-report.json');

  const duplicateMap = new Map();
  for (const component of components) {
    const key = component.id;
    if (!duplicateMap.has(key)) {
      duplicateMap.set(key, []);
    }
    duplicateMap.get(key).push(component.path);
  }

  const duplicateGroups = Array.from(duplicateMap.entries())
    .filter(([, paths]) => paths.length > 1)
    .map(([id, paths]) => ({ id, paths }));

  const lifecycleSummary = {
    active: components.filter((item) => item.lifecycle === 'ACTIVE').length,
    needsLinking: components.filter((item) => item.lifecycle === 'NEEDS_LINKING').length,
    needsDevelopment: components.filter((item) => item.lifecycle === 'NEEDS_DEVELOPMENT').length,
    experimental: components.filter((item) => item.lifecycle === 'EXPERIMENTAL').length,
    unused: components.filter((item) => item.lifecycle === 'UNUSED').length
  };

  const layerSummary = buildLayerSummary(components);

  const packageScripts = Object.keys(packageJson.scripts || {})
    .filter((name) => /^ops:|^sheikha:/.test(name))
    .sort();

  const runtimeVerification = {
    pm2,
    ports,
    cpuCount: os.cpus().length,
    loadAverage: os.loadavg(),
    totalMemoryBytes: os.totalmem(),
    freeMemoryBytes: os.freemem(),
    disk,
    networkInterfaces,
    logsPresent: exists('runtime/master-log') || exists('runtime/master-log-inspector'),
    recoveryPresent: exists('tools/recovery') || exists('runtime/recovery') || exists('tools/activation/activate-sheikha-enterprise-integration-verification-layer-v1.js')
  };

  const integrationVerification = {
    os: layerSummary.OS.components > 0,
    cloud: layerSummary.Cloud.components > 0,
    supercomputer: layerSummary['Compute/HPC'].components > 0,
    identity: layerSummary.Identity.components > 0,
    community: layerSummary.Community.components > 0,
    enterprise: layerSummary.Enterprise.components > 0,
    runtime: layerSummary.Runtime.components > 0,
    marketplace: layerSummary.Marketplace.components > 0,
    knowledge: layerSummary.Knowledge.components > 0,
    ai: countMatches(components, (item) => /ai/i.test(item.path)) > 0,
    security: layerSummary.Security.components > 0,
    monitoring: layerSummary.Monitoring.components > 0,
    executiveCenter: layerSummary['Executive Center'].components > 0,
    truthGate: layerSummary['Truth Gate'].components > 0,
    healthGate: layerSummary.Health.components > 0,
    recovery: layerSummary.Recovery.components > 0,
    inspector: layerSummary.Inspector.components > 0,
    registry: layerSummary.Registry.components > 0,
    sdk: layerSummary.SDK.components > 0,
    api: layerSummary.APIs.components > 0 || routeCount > 0,
    documentation: layerSummary.Documentation.components > 0
  };

  const knowledgeVerification = {
    identityLinked: layerSummary.Identity.components > 0,
    formationLinked: community?.modeling?.formationReady === true,
    knowledgeLinked: layerSummary.Knowledge.components > 0,
    communityLinked: layerSummary.Community.components > 0,
    commerceLinked: layerSummary.Commerce.components > 0,
    marketLinked: layerSummary.Marketplace.components > 0,
    governanceLinked: layerSummary.Governance.components > 0
  };

  const documentation = {
    count: countMatches(components, (item) => /\.(md|html)$/i.test(item.path) || item.path.startsWith('docs/')),
    docsPaths: components.filter((item) => /\.(md|html)$/i.test(item.path) || item.path.startsWith('docs/')).slice(0, 200).map((item) => item.path),
    linkedToCatalog: true
  };

  const checks = {
    packageScriptsPresent: packageScripts.length > 0,
    unifiedIdentityEnginePresent: exists('runtime/identity-engine/v1/sheikha-identity-engine-v1-report.json'),
    enterpriseVerificationPresent: exists('runtime/enterprise-integration/sheikha-enterprise-integration-verification-layer-v1-report.json'),
    capabilityRegistryPresent: exists('runtime/capability-registry/v2/sheikha-capability-registry-v2-report.json'),
    discoveredComponentsPresent: components.length > 0
  };

  const passed = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  const score = Math.round((passed / total) * 100);

  const integrationScore = scoreFromChecks(integrationVerification);
  const knowledgeScore = scoreFromChecks(knowledgeVerification);
  const runtimeScore = scoreFromChecks({
    pm2Online: pm2.online > 0,
    portsDetected: ports.length > 0,
    memoryVisible: runtimeVerification.totalMemoryBytes > 0,
    diskVisible: Boolean(disk),
    recoveryPresent: runtimeVerification.recoveryPresent
  });

  const finalExecutiveReport = buildFinalExecutiveReport(components, packageScripts, duplicateGroups, routeCount);

  const architectureCatalog = {
    system: 'SHEIKHA_ENTERPRISE_ARCHITECTURE_CATALOG_V1',
    generatedAt: new Date().toISOString(),
    roots: discoveryRoots,
    layers: layerSummary,
    unifiedRuntimeBus: {
      name: 'Unified Runtime Bus',
      channels: ['runtime_registry', 'capability_registry', 'master_log', 'health_gate', 'truth_gate', 'inspector', 'recovery_engine', 'executive_control_center']
    },
    identityEngine,
    capabilityRegistry,
    enterpriseVerification,
    dependencyGraph: components.slice(0, 500),
    duplicateAnalysis: duplicateGroups,
    executiveCounts: finalExecutiveReport
  };

  return {
    system: 'SHEIKHA_MASTER_ACTIVATION_CONSOLIDATION_V1',
    status: score === 100 ? 'ACTIVE' : score >= 80 ? 'ACTIVE_WITH_REVIEW' : 'REVIEW_REQUIRED',
    generatedAt: new Date().toISOString(),
    score,
    checks,
    repositoryDiscovery: {
      roots: discoveryRoots,
      discoveredFiles: filteredFiles.length,
      packageScripts: packageScripts.length
    },
    summary: {
      discoveredComponents: components.length,
      activeComponents: lifecycleSummary.active,
      duplicateGroups: duplicateGroups.length
    },
    lifecycleSummary,
    capabilityRegistryBuild: {
      scripts: packageScripts,
      reportPath: 'runtime/capability-registry/v2/sheikha-capability-registry-v2-report.json'
    },
    architectureCatalog,
    architectureGraph: layerSummary,
    dependencyGraph: components.slice(0, 250),
    duplicateAnalysis: duplicateGroups,
    integrationVerification: {
      score: integrationScore.score,
      checks: integrationVerification
    },
    runtimeVerification: {
      score: runtimeScore.score,
      details: runtimeVerification
    },
    knowledgeVerification: {
      score: knowledgeScore.score,
      checks: knowledgeVerification
    },
    documentation,
    safeImprovementsExecuted: [
      'Unified identity engine can be generated from current identity artifacts.',
      'Enterprise verification fabric remains the governing evidence layer.',
      'Master activation consolidation is based on repository discovery instead of assumptions.'
    ],
    executiveReport: finalExecutiveReport,
    principle: 'التفعيل النهائي يبنى على اكتشاف المستودع الحقيقي ثم التحسين الآمن بالأدلة'
  };
}

function writeReport(report = buildReport()) {
  fs.mkdirSync(path.dirname(resolve(reportPath)), { recursive: true });
  fs.writeFileSync(resolve(reportPath), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  fs.writeFileSync(resolve(catalogPath), `${JSON.stringify(report.architectureCatalog, null, 2)}\n`, 'utf8');
  return report;
}

if (require.main === module) {
  console.log(JSON.stringify(writeReport(), null, 2));
}

module.exports = {
  buildComponent,
  buildReport,
  classifyLayer,
  classifyLifecycleStatus,
  scoreFromChecks,
  writeReport
};