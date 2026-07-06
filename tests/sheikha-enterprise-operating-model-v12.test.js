'use strict';

const {
  ENTERPRISE_OPERATING_CHAIN,
  PLATFORM_GOVERNANCE_BOARD_SCOPE,
  OFFICIAL_ARCHITECTURE_MAP,
  COMPONENT_LIFECYCLE_STATES,
  PRODUCTION_READINESS_GATE,
  COMMERCIAL_OPERATING_FLOW,
  buildEnterpriseOperatingModelV12,
  validateEnterpriseOperatingModel
} = require('../core/enterprise-operating-model/sheikha-enterprise-operating-model-v12');

function enterpriseReferenceSystem(commercialLaunchReady = false) {
  return {
    status: 'ACTIVE',
    decision: commercialLaunchReady
      ? 'REFERENCE_SYSTEM_ACTIVE_READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH'
      : 'REFERENCE_SYSTEM_ACTIVE_COMMERCIAL_EVIDENCE_REQUIRED',
    linkedLayers: {
      enterpriseConstitutionV1: 'ACTIVE',
      enterpriseOperatingSystemV11: 'ACTIVE',
      commercialLaunchReady,
      currentReleaseStage: commercialLaunchReady ? 'Controlled Staging' : 'Release Candidate'
    }
  };
}

describe('Sheikha Enterprise Operating Model V12', () => {
  test('moves Sheikha into enterprise operations phase above the reference system', () => {
    const report = buildEnterpriseOperatingModelV12({
      enterpriseReferenceSystem: enterpriseReferenceSystem(false)
    });

    expect(report.system).toBe('SHEIKHA_ENTERPRISE_OPERATING_MODEL_V12');
    expect(report.status).toBe('ACTIVE');
    expect(report.phase).toBe('ENTERPRISE_OPERATIONS_PHASE');
    expect(report.decision).toBe('OPERATING_MODEL_ACTIVE_FEATURE_FROZEN_COMMERCIAL_VALIDATION_REQUIRED');
    expect(report.enterpriseOperatingChain).toEqual(ENTERPRISE_OPERATING_CHAIN);
    expect(report.platformGovernanceBoard.scope).toEqual(PLATFORM_GOVERNANCE_BOARD_SCOPE);
    expect(report.officialArchitectureMap).toEqual(OFFICIAL_ARCHITECTURE_MAP);
    expect(report.enforcement.featureFreezeForCurrentRelease).toBe(true);
    expect(report.governance.noHarm).toBe(true);
  });

  test('validates domain governance, lifecycle, readiness, and commercial flow', () => {
    const report = buildEnterpriseOperatingModelV12({
      enterpriseReferenceSystem: enterpriseReferenceSystem(false)
    });
    const validation = validateEnterpriseOperatingModel(report);

    expect(validation.status).toBe('PASSED');
    expect(report.domainGovernance.length).toBeGreaterThanOrEqual(12);
    expect(report.componentLifecycle.map((item) => item.state)).toEqual(COMPONENT_LIFECYCLE_STATES);
    expect(report.productionReadinessGate).toEqual(PRODUCTION_READINESS_GATE);
    expect(report.commercialOperatingFlow).toEqual(COMMERCIAL_OPERATING_FLOW);
    expect(report.operationsCenter.sections).toHaveLength(3);
    expect(validation.requirements).toBeGreaterThan(140);
  });

  test('promotes operating model decision when commercial evidence is ready', () => {
    const report = buildEnterpriseOperatingModelV12({
      enterpriseReferenceSystem: enterpriseReferenceSystem(true)
    });

    expect(report.decision).toBe('OPERATING_MODEL_ACTIVE_READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH');
    expect(report.linkedLayers.commercialLaunchReady).toBe(true);
    expect(report.roadmapPrograms.every((program) => program.status === 'ACTIVE')).toBe(true);
  });
});
