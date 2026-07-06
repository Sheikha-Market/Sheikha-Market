'use strict';

const {
  ENTERPRISE_REGISTRY_TYPES,
  buildEnterpriseOperatingPlatformV9
} = require('../core/enterprise-operating-platform/sheikha-enterprise-operating-platform-v9');

function readyEvidence(overrides = {}) {
  return {
    releaseStabilization: { status: 'PRODUCTION_CANDIDATE_READY' },
    controlledStaging: {
      status: 'READY_FOR_STAGING',
      baseTag: 'sheikha-v1-production-candidate',
      decision: 'CONTROLLED_STAGING_ALLOWED'
    },
    backupRollback: {
      baseTag: 'sheikha-v1-production-candidate',
      backup: {
        databaseBackupReady: true,
        envBackupReady: true,
        pm2DumpSaved: true,
        repositoryTagReady: true
      },
      rollback: {
        rollbackTag: 'sheikha-v1-production-candidate',
        rollbackCommandDocumented: true,
        rollbackTested: true
      },
      monitoring: {
        pm2Online: true,
        healthEndpointOk: true,
        alertsEnabled: true
      }
    },
    productionHardening: {
      status: 'ACTIVE',
      decision: 'PRODUCTION_CANDIDATE_READY',
      productionGate: {
        status: 'PASSED',
        candidateReady: true
      }
    },
    productionReadiness: {
      status: 'PASSED',
      candidateReady: true
    },
    docs: {
      releaseStabilization: true,
      controlledStaging: true,
      backupRollback: true
    },
    paymentOrRevenuePathVerified: true,
    customerLifecycleTested: true,
    billingFlowVerified: true,
    supportFlowVerified: true,
    ...overrides
  };
}

describe('Sheikha Enterprise Operating Platform V9', () => {
  test('consolidates the platform into one governed operating model', () => {
    const report = buildEnterpriseOperatingPlatformV9({
      evidence: readyEvidence()
    });

    expect(report.system).toBe('SHEIKHA_ENTERPRISE_OPERATING_PLATFORM_V9');
    expect(report.status).toBe('ACTIVE');
    expect(report.decision).toBe('READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH');
    expect(report.enterpriseV1.status).toBe('FEATURE_FROZEN');
    expect(report.enterpriseV1.releasePolicy).toBe('CRITICAL_FIXES_ONLY');
    expect(report.readiness.commercialLaunchReady).toBe(true);
    expect(report.governance.noHarm).toBe(true);
    expect(ENTERPRISE_REGISTRY_TYPES).toContain('Release Registry');
    expect(report.consolidation.unifiedDomainModel).toContain('Payment');
  });

  test('keeps commercial launch gated when backup, rollback, or payment evidence is missing', () => {
    const evidence = readyEvidence({
      backupRollback: {
        baseTag: 'sheikha-v1-production-candidate',
        backup: {
          databaseBackupReady: false,
          envBackupReady: false,
          pm2DumpSaved: true,
          repositoryTagReady: true
        },
        rollback: {
          rollbackTag: 'sheikha-v1-production-candidate',
          rollbackCommandDocumented: true,
          rollbackTested: false
        },
        monitoring: {
          pm2Online: true,
          healthEndpointOk: true,
          alertsEnabled: false
        }
      },
      paymentOrRevenuePathVerified: false,
      customerLifecycleTested: false,
      billingFlowVerified: false,
      supportFlowVerified: false
    });
    const report = buildEnterpriseOperatingPlatformV9({ evidence });

    expect(report.status).toBe('ACTIVE');
    expect(report.decision).toBe('FEATURE_FROZEN_COMMERCIAL_VALIDATION_REQUIRED');
    expect(report.readiness.productionCandidateReady).toBe(true);
    expect(report.readiness.commercialLaunchReady).toBe(false);
    expect(report.readiness.operational.status).toBe('NEEDS_HUMAN_VALIDATION');
    expect(report.readiness.commercial.status).toBe('COMMERCIAL_VALIDATION_REQUIRED');
  });
});
