'use strict';

const {
  ENTERPRISE_LIFECYCLE_STAGES,
  PORTFOLIO_AREAS,
  ADR_FIELDS,
  ENTERPRISE_KPI_REGISTRY,
  OPERATIONAL_VERIFICATION_GATES,
  buildEnterpriseLifecycleV21,
  validateEnterpriseLifecycleV21
} = require('../core/enterprise-lifecycle-v21/sheikha-enterprise-lifecycle-v21');

function enterprisePlatform(commercialLaunchReady = false) {
  return {
    status: 'ACTIVE',
    decision: commercialLaunchReady
      ? 'ENTERPRISE_PLATFORM_V20_ACTIVE_READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH'
      : 'ENTERPRISE_PLATFORM_V20_ACTIVE_KERNEL_FROZEN_PLATFORM_MATURITY_READY_COMMERCIAL_EVIDENCE_REQUIRED',
    linkedLayers: {
      enterpriseOperatingSystemV13: 'ACTIVE',
      enterpriseOperatingModelV12: 'ACTIVE',
      enterpriseReferenceSystemV1: 'ACTIVE',
      enterpriseConstitutionV1: 'ACTIVE',
      commercialLaunchReady,
      currentReleaseStage: commercialLaunchReady ? 'Controlled Staging' : 'Release Candidate'
    }
  };
}

describe('Sheikha Enterprise Lifecycle V21', () => {
  test('activates lifecycle governance above Enterprise Platform V20', () => {
    const report = buildEnterpriseLifecycleV21({
      enterprisePlatform: enterprisePlatform(false)
    });

    expect(report.system).toBe('SHEIKHA_ENTERPRISE_LIFECYCLE_V21');
    expect(report.status).toBe('ACTIVE');
    expect(report.phase).toBe('PRODUCTION_CANDIDATE_LIFECYCLE_GOVERNANCE');
    expect(report.decision).toBe(
      'ENTERPRISE_LIFECYCLE_ACTIVE_PRODUCTION_CANDIDATE_OPERATIONAL_EVIDENCE_REQUIRED'
    );
    expect(report.lifecycleStages).toEqual(ENTERPRISE_LIFECYCLE_STAGES);
    expect(report.portfolioManagement.map((item) => item.area)).toEqual(PORTFOLIO_AREAS);
    expect(report.architectureDecisionRecords.requiredFields).toEqual(ADR_FIELDS);
    expect(report.governance.noHarm).toBe(true);
  });

  test('validates portfolio, risk, KPI, release, compliance, and operational gates', () => {
    const report = buildEnterpriseLifecycleV21({
      enterprisePlatform: enterprisePlatform(false)
    });
    const validation = validateEnterpriseLifecycleV21(report);

    expect(validation.status).toBe('PASSED');
    expect(validation.lifecycleStages).toBe(13);
    expect(validation.portfolioAreas).toBe(9);
    expect(validation.risks).toBe(4);
    expect(validation.kpis).toBe(
      Object.values(ENTERPRISE_KPI_REGISTRY).reduce((total, metrics) => total + metrics.length, 0)
    );
    expect(report.operationalVerificationGates.map((gate) => gate.gate))
      .toEqual(OPERATIONAL_VERIFICATION_GATES);
    expect(validation.requirements).toBeGreaterThan(120);
  });

  test('does not claim production ready without operational evidence', () => {
    const report = buildEnterpriseLifecycleV21({
      enterprisePlatform: enterprisePlatform(false)
    });

    expect(report.readiness.productionCandidate).toBe(true);
    expect(report.readiness.productionReady).toBe(false);
    expect(report.readiness.pendingOperationalGates).toContain('Business Flow Verification');
    expect(report.enforcement.noProductionReadyClaimWithoutEvidence).toBe(true);
  });

  test('promotes to production ready only when all gates and commercial evidence pass', () => {
    const report = buildEnterpriseLifecycleV21({
      enterprisePlatform: enterprisePlatform(true),
      operationalEvidence: {
        coreVerified: true,
        runtimeVerified: true,
        architectureVerified: true,
        securityVerified: true,
        businessflowVerified: true,
        operationsVerified: true,
        productionReady: true,
        commercialReady: true
      }
    });

    expect(report.decision).toBe('ENTERPRISE_LIFECYCLE_ACTIVE_PRODUCTION_READY');
    expect(report.readiness.productionReady).toBe(true);
    expect(report.readiness.pendingOperationalGates).toHaveLength(0);
  });
});
