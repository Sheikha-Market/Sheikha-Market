'use strict';

const fs = require('fs');
const path = require('path');
const {
  buildEnterpriseOperatingPlatformV9
} = require('../enterprise-operating-platform/sheikha-enterprise-operating-platform-v9');

const ROOT = path.join(__dirname, '..', '..');
const EVIDENCE_PATH = 'release/SHEIKHA-COMMERCIAL-LAUNCH-EVIDENCE-V1.json';

const REQUIRED_DOMAINS = Object.freeze([
  'backup.database',
  'backup.environment',
  'rollback.rehearsal',
  'monitoring.alerts',
  'revenue.paymentOrRevenuePath',
  'revenue.billingFlow',
  'revenue.contracts',
  'customerLifecycle.endToEndTest',
  'support.flow'
]);

function readJson(root, relativePath, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
  } catch {
    return fallback;
  }
}

function getPath(object, dottedPath) {
  return dottedPath
    .split('.')
    .reduce((value, key) => (value && value[key] !== undefined ? value[key] : undefined), object);
}

function checkEvidence(id, label, passed, details = {}) {
  return {
    id,
    label,
    status: passed ? 'PASS' : 'PENDING',
    passed: Boolean(passed),
    details
  };
}

function verified(value) {
  return value?.verified === true;
}

function successful(value) {
  return value?.successful === true;
}

function enabled(value) {
  return value?.enabled === true;
}

function humanApproved(value) {
  return value?.humanApproved === true;
}

function missingRequiredDomains(evidence) {
  return REQUIRED_DOMAINS.filter((domainPath) => !getPath(evidence, domainPath));
}

function buildCommercialLaunchValidation(options = {}) {
  const root = options.root || ROOT;
  const evidence = options.evidence || readJson(root, EVIDENCE_PATH);
  const missingDomains = missingRequiredDomains(evidence);
  const checks = [
    checkEvidence('database-backup', 'Database backup evidence verified', verified(evidence.backup?.database), {
      artifactReference: evidence.backup?.database?.artifactReference || ''
    }),
    checkEvidence('environment-backup', 'Environment backup evidence verified', verified(evidence.backup?.environment), {
      artifactReference: evidence.backup?.environment?.artifactReference || ''
    }),
    checkEvidence('rollback-rehearsal', 'Rollback rehearsal succeeded from production candidate tag', (
      successful(evidence.rollback?.rehearsal) &&
      evidence.rollback?.rehearsal?.tag === 'sheikha-v1-production-candidate'
    ), {
      tag: evidence.rollback?.rehearsal?.tag,
      environment: evidence.rollback?.rehearsal?.environment
    }),
    checkEvidence('monitoring-alerts', 'Monitoring alerts are enabled and owned', (
      enabled(evidence.monitoring?.alerts) &&
      Boolean(evidence.monitoring?.alerts?.owner)
    ), {
      owner: evidence.monitoring?.alerts?.owner || '',
      channels: evidence.monitoring?.alerts?.channels || []
    }),
    checkEvidence('revenue-path', 'Payment or revenue path verified', verified(evidence.revenue?.paymentOrRevenuePath), {
      mode: evidence.revenue?.paymentOrRevenuePath?.mode || 'not_configured',
      provider: evidence.revenue?.paymentOrRevenuePath?.provider || ''
    }),
    checkEvidence('billing-flow', 'Billing flow verified', verified(evidence.revenue?.billingFlow)),
    checkEvidence('contract-approval', 'Commercial contract template human-approved', humanApproved(evidence.revenue?.contracts), {
      templateReference: evidence.revenue?.contracts?.templateReference || ''
    }),
    checkEvidence('customer-lifecycle', 'Customer lifecycle tested end to end', verified(evidence.customerLifecycle?.endToEndTest), {
      stages: evidence.customerLifecycle?.endToEndTest?.stages || []
    }),
    checkEvidence('support-flow', 'Support flow and SLA verified', verified(evidence.support?.flow), {
      owner: evidence.support?.flow?.owner || '',
      slaReference: evidence.support?.flow?.slaReference || ''
    }),
    checkEvidence('governance-boundary', 'Commercial launch remains human-governed and no-harm', (
      evidence.governance?.noHarm === true &&
      evidence.governance?.humanApprovalRequiredForCommercialLaunch === true &&
      evidence.governance?.noSecretsInThisFile === true
    ), evidence.governance || {})
  ];
  const pending = checks.filter((check) => !check.passed);
  const enterprise = buildEnterpriseOperatingPlatformV9({
    root,
    evidence: {
      commercialLaunchEvidence: evidence
    }
  });
  const launchReady = missingDomains.length === 0 &&
    pending.length === 0 &&
    enterprise.readiness.commercialLaunchReady === true;

  return {
    system: 'SHEIKHA_COMMERCIAL_LAUNCH_VALIDATION_V1',
    status: launchReady ? 'ACTIVE' : 'PENDING_EVIDENCE',
    mode: 'GOVERNED_COMMERCIAL_LAUNCH_EVIDENCE_GATE',
    decision: launchReady
      ? 'READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH'
      : 'COMMERCIAL_LAUNCH_REMAINS_GATED',
    evidencePath: EVIDENCE_PATH,
    missingDomains,
    checks,
    pending,
    enterpriseOperatingPlatform: {
      system: enterprise.system,
      status: enterprise.status,
      decision: enterprise.decision,
      healthScore: enterprise.readiness.healthScore,
      productionCandidateReady: enterprise.readiness.productionCandidateReady,
      commercialLaunchReady: enterprise.readiness.commercialLaunchReady
    },
    readiness: {
      backupReady: checks[0].passed && checks[1].passed,
      rollbackReady: checks[2].passed,
      monitoringReady: checks[3].passed,
      revenueReady: checks[4].passed && checks[5].passed && checks[6].passed,
      customerLifecycleReady: checks[7].passed,
      supportReady: checks[8].passed,
      governanceReady: checks[9].passed,
      commercialLaunchReady: launchReady
    },
    guardedNextActions: pending.map((check) => check.label),
    governance: {
      readOnly: true,
      noExternalMutation: true,
      noServiceRestart: true,
      noKernelModification: true,
      noPrivilegeEscalation: true,
      noSecretsRequired: true,
      humanApprovalRequiredForCommercialLaunch: true,
      noUnsupportedRevenueClaims: true,
      noHarm: true,
      principle: 'لا ضرر ولا ضرار',
      tawhid: 'الله وحده لا شريك له'
    },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  EVIDENCE_PATH,
  REQUIRED_DOMAINS,
  buildCommercialLaunchValidation,
  missingRequiredDomains
};
