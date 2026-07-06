'use strict';

const {
  PRODUCT_FACTORY_FLOW,
  ORGANIZATION_FACTORY_FLOW,
  COMMERCE_PLATFORM_FLOW,
  SDK_PLATFORM_LANGUAGES,
  RELEASE_TRAIN_STAGES,
  buildEnterpriseOperatingSystemV13,
  validateEnterpriseOperatingSystemV13
} = require('../core/enterprise-operating-system-v13/sheikha-enterprise-operating-system-v13');

function enterpriseOperatingModel(commercialLaunchReady = false) {
  return {
    status: 'ACTIVE',
    decision: commercialLaunchReady
      ? 'OPERATING_MODEL_ACTIVE_READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH'
      : 'OPERATING_MODEL_ACTIVE_FEATURE_FROZEN_COMMERCIAL_VALIDATION_REQUIRED',
    linkedLayers: {
      enterpriseReferenceSystemV1: 'ACTIVE',
      enterpriseConstitutionV1: 'ACTIVE',
      enterpriseOperatingSystemV11: 'ACTIVE',
      commercialLaunchReady,
      currentReleaseStage: commercialLaunchReady ? 'Controlled Staging' : 'Release Candidate'
    }
  };
}

function findProgram(report, name) {
  return report.programs.find((program) => program.name === name);
}

describe('Sheikha Enterprise Operating System V13', () => {
  test('turns Sheikha into a governed multi-product enterprise OS', () => {
    const report = buildEnterpriseOperatingSystemV13({
      enterpriseOperatingModel: enterpriseOperatingModel(false)
    });

    expect(report.system).toBe('SHEIKHA_ENTERPRISE_OPERATING_SYSTEM_V13');
    expect(report.status).toBe('ACTIVE');
    expect(report.phase).toBe('PRODUCT_OPERATIONS_PHASE');
    expect(report.decision).toBe(
      'ENTERPRISE_OS_V13_ACTIVE_CORE_FROZEN_PRODUCT_OPERATIONS_READY_COMMERCIAL_EVIDENCE_REQUIRED'
    );
    expect(report.productHostModel.composition).toContain('Products');
    expect(report.productHostModel.composition).toContain('Marketplace');
    expect(report.enforcement.infrastructureExpansionFrozen).toBe(true);
    expect(report.governance.noHarm).toBe(true);
  });

  test('defines all enterprise product, commerce, SDK, and release programs', () => {
    const report = buildEnterpriseOperatingSystemV13({
      enterpriseOperatingModel: enterpriseOperatingModel(false)
    });
    const validation = validateEnterpriseOperatingSystemV13(report);

    expect(validation.status).toBe('PASSED');
    expect(validation.programs).toBe(15);
    expect(validation.capabilities).toBeGreaterThan(100);
    expect(findProgram(report, 'Enterprise Product Factory').capabilities).toEqual(PRODUCT_FACTORY_FLOW);
    expect(findProgram(report, 'Enterprise Organization Factory').capabilities).toEqual(ORGANIZATION_FACTORY_FLOW);
    expect(findProgram(report, 'Enterprise Commerce Platform').capabilities).toEqual(COMMERCE_PLATFORM_FLOW);
    expect(findProgram(report, 'Enterprise SDK Platform').capabilities).toEqual(SDK_PLATFORM_LANGUAGES);
    expect(findProgram(report, 'Enterprise Release Train').capabilities).toEqual(RELEASE_TRAIN_STAGES);
  });

  test('keeps commercial launch gated until evidence is ready', () => {
    const report = buildEnterpriseOperatingSystemV13({
      enterpriseOperatingModel: enterpriseOperatingModel(false)
    });
    const financial = findProgram(report, 'Enterprise Financial Platform');

    expect(report.linkedLayers.commercialLaunchReady).toBe(false);
    expect(financial.status).toBe('EVIDENCE_PENDING');
    expect(report.enforcement.commercialLaunchRequiresEvidenceGate).toBe(true);
  });

  test('promotes decision when commercial evidence is ready', () => {
    const report = buildEnterpriseOperatingSystemV13({
      enterpriseOperatingModel: enterpriseOperatingModel(true)
    });

    expect(report.decision).toBe('ENTERPRISE_OS_V13_ACTIVE_READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH');
    expect(report.linkedLayers.commercialLaunchReady).toBe(true);
    expect(report.programs.every((program) => program.status === 'ACTIVE')).toBe(true);
  });
});
