'use strict';

const path = require('path');

const {
  domainDashboardDefaults,
  withDomainDashboardDefaults
} = require('../contracts/sheikha-domain-data-contracts-v1');
const {
  governedResolveEngine,
  registerOptionalEngineStubs
} = require('../engine-registry/sheikha-governed-engine-registry-v2');
const {
  allOptionalEngineAliases
} = require('../optional-engine-contract-fabric/sheikha-optional-engine-data-contracts-v14');
const {
  bootSheikhaRuntime
} = require('../runtime/boot-manager/sheikha-runtime-boot-manager');
const {
  evaluateProductionReadiness
} = require('../../tools/production/sheikha-production-readiness-gate-v1');

const ROOT = path.join(__dirname, '..', '..');

const REQUIRED_DOMAIN_KEYS = Object.freeze([
  'salvageYards',
  'historicalEras',
  'leadershipPrinciples',
  'preciousMetals',
  'commercialActivities',
  'officialDocTemplates',
  'archiveCategories',
  'govPlatforms',
  'metalCategories',
  'saudiPlatforms',
  'metalsTracked',
  'propheticMeasures',
  'quranicLogicPrinciples',
  'cosmicMeasures',
  'fusionDomains',
  'learningDomains',
  'walaaFoundations',
  'historicalNetworks'
]);

const SAFE_OPTIONAL_SEGMENTS = Object.freeze([
  'getGovPlatforms',
  'getCarrierPortIntegration',
  'getSheikhaDocs',
  'getOperationManagement',
  'getAnalytics'
]);

const DEPENDENCY_MODULES = Object.freeze([
  './core/enterprise/sheikha-enterprise-inspector-v3',
  './runtime/chat-fabric/sheikha-unified-chat-fabric-v1',
  './runtime/conversation-engine/sheikha-conversation-engine-v1',
  './runtime/vital-chat-apex/v1/sheikha-vital-chat-apex-v1'
]);

function checkDomainDataContracts() {
  const merged = withDomainDashboardDefaults({ label: 'Production Hardening Probe' });
  const missing = REQUIRED_DOMAIN_KEYS.filter((key) => !(key in merged));

  return {
    name: 'Enterprise Data Contract Fabric V1',
    status: missing.length ? 'BLOCKED' : 'ACTIVE',
    checkedKeys: REQUIRED_DOMAIN_KEYS.length,
    missing,
    defaultKeys: Object.keys(domainDashboardDefaults).length
  };
}

function checkEngineRegistrationMigration() {
  const registry = registerOptionalEngineStubs();
  const engineResults = allOptionalEngineAliases.map((alias) => {
    const result = governedResolveEngine(alias);
    const dashboard = result.instance.getDashboard();

    return {
      alias,
      status: result.status,
      safe: Boolean(
        dashboard &&
        dashboard.stats &&
        dashboard.saudi &&
        Array.isArray(dashboard.logistics.ports) &&
        Array.isArray(dashboard.accounting.chartOfAccounts) &&
        Array.isArray(dashboard.trust.trustPillars)
      )
    };
  });

  const unsafe = engineResults.filter((item) => !item.safe);

  return {
    name: 'Engine Registration Migration V1',
    status: unsafe.length ? 'BLOCKED' : 'ACTIVE',
    registryStatus: registry.status,
    registeredOptionalStubs: registry.registeredOptionalStubs,
    totalAliases: engineResults.length,
    unsafe
  };
}

async function collectDependencyWarnings() {
  const warnings = [];
  const listener = (warning) => {
    warnings.push([
      warning.name,
      warning.message,
      warning.stack
    ].filter(Boolean).join('\n'));
  };

  process.on('warning', listener);

  DEPENDENCY_MODULES.forEach((modulePath) => {
    require(path.join(ROOT, modulePath));
  });

  await new Promise((resolve) => setImmediate(resolve));
  process.off('warning', listener);

  return warnings;
}

async function checkInspectorDependencyRefactor() {
  const warnings = await collectDependencyWarnings();
  const circularWarnings = warnings.filter((warning) => (
    /circular dependency/i.test(warning) ||
    /collectEnterpriseInspector|compactInspectorContext/.test(warning)
  ));

  return {
    name: 'Inspector Dependency Refactor V1',
    status: circularWarnings.length ? 'BLOCKED' : 'ACTIVE',
    checkedModules: DEPENDENCY_MODULES.length,
    warnings: circularWarnings
  };
}

function checkRuntimeBootstrapValidation() {
  try {
    const boot = bootSheikhaRuntime();

    return {
      name: 'Runtime Bootstrap Validation V1',
      status: boot.status === 'KERNEL_READY' ? 'ACTIVE' : 'BLOCKED',
      bootStatus: boot.status,
      layers: Object.keys(boot.layers || {}).length,
      events: boot.events || []
    };
  } catch (error) {
    return {
      name: 'Runtime Bootstrap Validation V1',
      status: 'BLOCKED',
      error: error.message
    };
  }
}

function checkOptionalEngineSegments() {
  registerOptionalEngineStubs();
  const result = governedResolveEngine('GPE');
  const segments = SAFE_OPTIONAL_SEGMENTS.map((methodName) => {
    const response = result.instance[methodName]();

    return {
      methodName,
      success: response.success === true,
      status: response.status,
      governed: response.governance?.noHarm === true
    };
  });

  const unsafe = segments.filter((segment) => !segment.success || !segment.governed);

  return {
    name: 'Optional Engine Segment Contracts V1',
    status: unsafe.length ? 'BLOCKED' : 'ACTIVE',
    segments
  };
}

async function buildProductionHardeningClosure(options = {}) {
  const checks = [
    checkDomainDataContracts(),
    checkEngineRegistrationMigration(),
    await checkInspectorDependencyRefactor(),
    checkRuntimeBootstrapValidation(),
    checkOptionalEngineSegments()
  ];
  const productionGate = evaluateProductionReadiness(options.logLines);
  const blockers = checks.filter((check) => check.status !== 'ACTIVE');
  const hardBlocked = blockers.length > 0 || productionGate.status === 'BLOCKED';
  const review = !hardBlocked && productionGate.status === 'REVIEW';

  return {
    system: 'SHEIKHA_PRODUCTION_HARDENING_CLOSURE_V1',
    status: hardBlocked ? 'BLOCKED' : review ? 'REVIEW' : 'ACTIVE',
    mode: 'READ_ONLY_PRODUCTION_CANDIDATE_VALIDATION',
    decision: hardBlocked
      ? 'PRODUCTION_CANDIDATE_BLOCKED'
      : review
        ? 'PRODUCTION_CANDIDATE_REVIEW'
        : 'PRODUCTION_CANDIDATE_READY',
    checks,
    productionGate,
    readiness: {
      enterpriseDataContracts: checks[0].status === 'ACTIVE',
      engineRegistrationMigration: checks[1].status === 'ACTIVE',
      inspectorDependencyRefactor: checks[2].status === 'ACTIVE',
      runtimeBootstrapValidation: checks[3].status === 'ACTIVE',
      optionalEngineSegments: checks[4].status === 'ACTIVE',
      productionGateCandidateReady: productionGate.candidateReady === true,
      noBlockers: !hardBlocked
    },
    governance: {
      readOnly: true,
      noExternalMutation: true,
      noServiceRestart: true,
      noKernelModification: true,
      noPrivilegeEscalation: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار',
      tawhid: 'الله وحده لا شريك له'
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  REQUIRED_DOMAIN_KEYS,
  SAFE_OPTIONAL_SEGMENTS,
  checkDomainDataContracts,
  checkEngineRegistrationMigration,
  checkInspectorDependencyRefactor,
  checkRuntimeBootstrapValidation,
  checkOptionalEngineSegments,
  buildProductionHardeningClosure
};
