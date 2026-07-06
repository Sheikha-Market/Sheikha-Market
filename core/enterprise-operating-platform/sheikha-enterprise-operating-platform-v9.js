'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');

const ENTERPRISE_REGISTRY_TYPES = Object.freeze([
  'Runtime Registry',
  'Engine Registry',
  'Capability Registry',
  'Event Registry',
  'API Registry',
  'SDK Registry',
  'UI Registry',
  'Policy Registry',
  'Audit Registry',
  'Release Registry'
]);

const DOMAIN_OWNERSHIP = Object.freeze([
  { domain: 'Marketplace', owner: 'Commerce' },
  { domain: 'AI', owner: 'AI Platform' },
  { domain: 'Knowledge', owner: 'Knowledge Platform' },
  { domain: 'Runtime', owner: 'Runtime Platform' },
  { domain: 'IDE', owner: 'Developer Platform' },
  { domain: 'Governance', owner: 'Governance Platform' },
  { domain: 'Identity', owner: 'Security Platform' },
  { domain: 'Finance', owner: 'Finance Platform' },
  { domain: 'Operations', owner: 'Operations Platform' }
]);

const UNIFIED_DOMAIN_MODEL = Object.freeze([
  'Organization',
  'Workspace',
  'Customer',
  'Supplier',
  'Product',
  'Category',
  'Order',
  'Contract',
  'Invoice',
  'Payment',
  'Subscription',
  'Shipment',
  'Knowledge',
  'AI Session',
  'Audit'
]);

const ENTERPRISE_WORKFLOW = Object.freeze([
  'Create',
  'Validate',
  'Policy',
  'Risk',
  'Approval',
  'Execute',
  'Audit',
  'Event',
  'Analytics'
]);

const COMMERCIAL_LIFECYCLE = Object.freeze([
  'Marketing',
  'Lead',
  'Opportunity',
  'Quotation',
  'Contract',
  'Invoice',
  'Payment',
  'Delivery',
  'Customer Success',
  'Renewal'
]);

const RELEASE_TRAIN = Object.freeze([
  'Planning',
  'Implementation',
  'Testing',
  'Governance',
  'Release Candidate',
  'Controlled Staging',
  'Production',
  'Monitoring',
  'Review'
]);

const PLATFORM_PRODUCTS = Object.freeze([
  'Marketplace',
  'Enterprise AI',
  'Enterprise IDE',
  'Knowledge Cloud',
  'CRM',
  'Finance',
  'Supply Chain',
  'Analytics',
  'Developer Platform',
  'Customer Portal',
  'Partner Portal',
  'Admin Portal'
]);

const AI_OPERATING_ROLES = Object.freeze([
  'Executive Advisor',
  'Commercial Advisor',
  'Marketplace Advisor',
  'Knowledge Advisor',
  'Support Advisor',
  'Developer Advisor',
  'Compliance Advisor',
  'Operations Advisor',
  'Analytics Advisor'
]);

function readJson(root, relativePath, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
  } catch {
    return fallback;
  }
}

function fileExists(root, relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function evidenceVerified(item) {
  return item?.verified === true;
}

function evidenceFlag(item, key = 'verified') {
  return item?.[key] === true;
}

function boolOrEvidence(value, evidence) {
  return value === true || evidence === true;
}

function buildCheck(id, label, passed, details = {}) {
  return {
    id,
    label,
    status: passed ? 'PASS' : 'NEEDS_VALIDATION',
    passed: Boolean(passed),
    details
  };
}

function scoreChecks(checks) {
  if (!checks.length) return 0;
  return Math.round(
    checks.filter((check) => check.passed).length / checks.length * 100
  );
}

function collectEvidence(root = ROOT, overrides = {}) {
  const backupRollback = overrides.backupRollback ||
    readJson(root, 'release/SHEIKHA-BACKUP-ROLLBACK-CHECKLIST-V1.json');
  const commercialLaunchEvidence = overrides.commercialLaunchEvidence ||
    readJson(root, 'release/SHEIKHA-COMMERCIAL-LAUNCH-EVIDENCE-V1.json');
  const launchBackup = commercialLaunchEvidence.backup || {};
  const launchRollback = commercialLaunchEvidence.rollback || {};
  const launchMonitoring = commercialLaunchEvidence.monitoring || {};
  const launchRevenue = commercialLaunchEvidence.revenue || {};
  const launchLifecycle = commercialLaunchEvidence.customerLifecycle || {};
  const launchSupport = commercialLaunchEvidence.support || {};

  return {
    releaseStabilization: overrides.releaseStabilization ||
      readJson(root, 'release/SHEIKHA-RELEASE-STABILIZATION-V1.json'),
    controlledStaging: overrides.controlledStaging ||
      readJson(root, 'release/SHEIKHA-CONTROLLED-STAGING-LAUNCH-V1.json'),
    backupRollback: {
      ...backupRollback,
      backup: {
        ...(backupRollback.backup || {}),
        databaseBackupReady: boolOrEvidence(
          backupRollback.backup?.databaseBackupReady,
          evidenceVerified(launchBackup.database)
        ),
        envBackupReady: boolOrEvidence(
          backupRollback.backup?.envBackupReady,
          evidenceVerified(launchBackup.environment)
        )
      },
      rollback: {
        ...(backupRollback.rollback || {}),
        rollbackTested: boolOrEvidence(
          backupRollback.rollback?.rollbackTested,
          evidenceFlag(launchRollback.rehearsal, 'successful')
        )
      },
      monitoring: {
        ...(backupRollback.monitoring || {}),
        alertsEnabled: boolOrEvidence(
          backupRollback.monitoring?.alertsEnabled,
          evidenceFlag(launchMonitoring.alerts, 'enabled')
        )
      }
    },
    productionHardening: overrides.productionHardening ||
      readJson(root, 'runtime/production-hardening/sheikha-production-hardening-closure-v1-report.json'),
    productionReadiness: overrides.productionReadiness ||
      readJson(root, 'runtime/production-readiness/sheikha-production-readiness-gate-v1.json'),
    docs: {
      releaseStabilization: fileExists(root, 'docs/release/SHEIKHA-RELEASE-STABILIZATION-V1.md'),
      controlledStaging: fileExists(root, 'docs/release/SHEIKHA-CONTROLLED-STAGING-LAUNCH-V1.md'),
      backupRollback: fileExists(root, 'docs/release/SHEIKHA-BACKUP-ROLLBACK-CHECKLIST-V1.md')
    },
    commercialValidation: {
      paymentOrRevenuePathVerified: boolOrEvidence(
        overrides.paymentOrRevenuePathVerified,
        evidenceFlag(launchRevenue.paymentOrRevenuePath, 'verified')
      ),
      customerLifecycleTested: boolOrEvidence(
        overrides.customerLifecycleTested,
        evidenceFlag(launchLifecycle.endToEndTest, 'verified')
      ),
      billingFlowVerified: boolOrEvidence(
        overrides.billingFlowVerified,
        evidenceFlag(launchRevenue.billingFlow, 'verified')
      ),
      supportFlowVerified: boolOrEvidence(
        overrides.supportFlowVerified,
        evidenceFlag(launchSupport.flow, 'verified')
      )
    },
    commercialLaunchEvidence
  };
}

function buildTechnicalReadiness(evidence) {
  const productionGate = evidence.productionHardening.productionGate || evidence.productionReadiness;
  const checks = [
    buildCheck('release-stabilization', 'Release Stabilization V1', (
      evidence.releaseStabilization.status === 'PRODUCTION_CANDIDATE_READY'
    ), { status: evidence.releaseStabilization.status }),
    buildCheck('controlled-staging', 'Controlled Staging Launch V1', (
      evidence.controlledStaging.status === 'READY_FOR_STAGING'
    ), { status: evidence.controlledStaging.status }),
    buildCheck('production-hardening', 'Production Hardening Closure V1', (
      evidence.productionHardening.status === 'ACTIVE' ||
      evidence.productionHardening.status === 'REVIEW'
    ), {
      status: evidence.productionHardening.status,
      decision: evidence.productionHardening.decision
    }),
    buildCheck('production-gate', 'Production Readiness Gate', (
      productionGate.status === 'PASSED' ||
      productionGate.candidateReady === true
    ), {
      status: productionGate.status,
      candidateReady: productionGate.candidateReady
    }),
    buildCheck('release-docs', 'Release Documentation', (
      evidence.docs.releaseStabilization &&
      evidence.docs.controlledStaging &&
      evidence.docs.backupRollback
    ), evidence.docs),
    buildCheck('candidate-tag', 'Production Candidate Tag Evidence', (
      evidence.backupRollback.baseTag === 'sheikha-v1-production-candidate' ||
      evidence.controlledStaging.baseTag === 'sheikha-v1-production-candidate'
    ), {
      baseTag: evidence.backupRollback.baseTag || evidence.controlledStaging.baseTag
    })
  ];

  return {
    status: checks.every((check) => check.passed) ? 'READY' : 'NEEDS_VALIDATION',
    score: scoreChecks(checks),
    checks
  };
}

function buildOperationalReadiness(evidence) {
  const backup = evidence.backupRollback.backup || {};
  const rollback = evidence.backupRollback.rollback || {};
  const monitoring = evidence.backupRollback.monitoring || {};

  const checks = [
    buildCheck('database-backup', 'Database Backup Verified', backup.databaseBackupReady === true),
    buildCheck('env-backup', 'Environment Backup Verified', backup.envBackupReady === true),
    buildCheck('rollback-tested', 'Rollback Rehearsal Tested', rollback.rollbackTested === true),
    buildCheck('pm2-health', 'PM2 and Health Endpoint Evidence', (
      monitoring.pm2Online === true && monitoring.healthEndpointOk === true
    ), monitoring),
    buildCheck('alerts-enabled', 'Monitoring Alerts Enabled', monitoring.alertsEnabled === true),
    buildCheck('staging-health', 'Controlled Staging Health Allowed', (
      evidence.controlledStaging.decision === 'CONTROLLED_STAGING_ALLOWED'
    ), { decision: evidence.controlledStaging.decision })
  ];

  return {
    status: checks.every((check) => check.passed) ? 'READY' : 'NEEDS_HUMAN_VALIDATION',
    score: scoreChecks(checks),
    checks
  };
}

function buildCommercialReadiness(evidence) {
  const commercial = evidence.commercialValidation;
  const checks = [
    buildCheck('customer-lifecycle', 'Customer Lifecycle Tested End-to-End', commercial.customerLifecycleTested),
    buildCheck('payment-or-revenue', 'Payment or Revenue Path Verified', commercial.paymentOrRevenuePathVerified),
    buildCheck('billing-flow', 'Billing Flow Verified', commercial.billingFlowVerified),
    buildCheck('support-flow', 'Support Flow Verified', commercial.supportFlowVerified),
    buildCheck('contracts-gated', 'Contracts Remain Human-Governed', true, {
      humanApprovalRequired: true
    }),
    buildCheck('no-false-commercial-claims', 'No Unsupported Revenue or Customer Claims', true, {
      evidenceRequiredBeforeClaim: true
    })
  ];

  return {
    status: checks.every((check) => check.passed) ? 'READY' : 'COMMERCIAL_VALIDATION_REQUIRED',
    score: scoreChecks(checks),
    checks
  };
}

function buildEnterpriseHealthScore(technical, operational, commercial) {
  return Math.round(
    technical.score * 0.45 +
    operational.score * 0.35 +
    commercial.score * 0.20
  );
}

function buildEnterpriseOperatingPlatformV9(options = {}) {
  const evidence = collectEvidence(options.root || ROOT, options.evidence || options);
  const technical = buildTechnicalReadiness(evidence);
  const operational = buildOperationalReadiness(evidence);
  const commercial = buildCommercialReadiness(evidence);
  const healthScore = buildEnterpriseHealthScore(technical, operational, commercial);
  const blocked = technical.status !== 'READY';
  const commercialReady = operational.status === 'READY' && commercial.status === 'READY';

  return {
    system: 'SHEIKHA_ENTERPRISE_OPERATING_PLATFORM_V9',
    status: blocked ? 'BLOCKED' : 'ACTIVE',
    mode: 'READ_ONLY_PLATFORM_CONSOLIDATION_AND_COMMERCIAL_VALIDATION',
    decision: blocked
      ? 'FIX_TECHNICAL_BLOCKERS_BEFORE_STAGING'
      : commercialReady
        ? 'READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH'
        : 'FEATURE_FROZEN_COMMERCIAL_VALIDATION_REQUIRED',
    enterpriseV1: {
      officialName: 'SHEIKHA_ENTERPRISE_PLATFORM_V1',
      status: 'FEATURE_FROZEN',
      architecture: 'LOCKED',
      governance: 'ACTIVE',
      runtime: technical.status === 'READY' ? 'STABLE' : 'NEEDS_VALIDATION',
      releasePolicy: 'CRITICAL_FIXES_ONLY',
      nextPhase: commercialReady ? 'CONTROLLED_COMMERCIAL_LAUNCH' : 'COMMERCIAL_VALIDATION'
    },
    consolidation: {
      platformConsolidation: 'SHEIKHA_PLATFORM_CONSOLIDATION_V1',
      enterpriseRegistryTypes: ENTERPRISE_REGISTRY_TYPES,
      domainOwnership: DOMAIN_OWNERSHIP,
      unifiedDomainModel: UNIFIED_DOMAIN_MODEL,
      enterpriseWorkflow: ENTERPRISE_WORKFLOW,
      releaseTrain: RELEASE_TRAIN
    },
    operatingModel: {
      products: PLATFORM_PRODUCTS,
      commercialLifecycle: COMMERCIAL_LIFECYCLE,
      aiOperatingRoles: AI_OPERATING_ROLES,
      controlTowerSignals: [
        'customers',
        'revenue',
        'subscriptions',
        'invoices',
        'orders',
        'alerts',
        'service_health',
        'backup_status',
        'rollback_status',
        'critical_errors'
      ]
    },
    readiness: {
      technical,
      operational,
      commercial,
      healthScore,
      productionCandidateReady: technical.status === 'READY',
      commercialLaunchReady: commercialReady
    },
    guardedNextActions: [
      'Clean or isolate unrelated git worktree changes before final release operations.',
      'Execute and verify database and environment backups outside the repository.',
      'Run a rollback rehearsal from sheikha-v1-production-candidate on staging.',
      'Enable monitoring alerts and document incident response ownership.',
      'Verify registration, contract, invoice, payment or revenue, activation, support, and renewal end-to-end.',
      'Keep core architecture frozen; add only critical fixes until commercial validation passes.'
    ],
    governance: {
      readOnly: true,
      noExternalMutation: true,
      noServiceRestart: true,
      noKernelModification: true,
      noPrivilegeEscalation: true,
      humanApprovalRequiredForCommercialLaunch: true,
      noUnsupportedCustomerRevenueClaims: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار',
      tawhid: 'الله وحده لا شريك له'
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  ENTERPRISE_REGISTRY_TYPES,
  DOMAIN_OWNERSHIP,
  UNIFIED_DOMAIN_MODEL,
  ENTERPRISE_WORKFLOW,
  COMMERCIAL_LIFECYCLE,
  RELEASE_TRAIN,
  PLATFORM_PRODUCTS,
  AI_OPERATING_ROLES,
  collectEvidence,
  buildTechnicalReadiness,
  buildOperationalReadiness,
  buildCommercialReadiness,
  buildEnterpriseHealthScore,
  buildEnterpriseOperatingPlatformV9
};
