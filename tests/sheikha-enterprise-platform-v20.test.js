'use strict';

const {
  PLATFORM_KERNEL_SCOPE,
  CAPABILITY_CATALOG,
  OFFICIAL_DOMAINS,
  UNIFIED_CONTRACT_GROUPS,
  UNIFIED_REGISTRY_GROUPS,
  COMMERCE_REVENUE_FLOW,
  PLATFORM_MATURITY_GATES,
  buildEnterprisePlatformV20,
  validateEnterprisePlatformV20
} = require('../core/enterprise-platform-v20/sheikha-enterprise-platform-v20');

function enterpriseOperatingSystem(commercialLaunchReady = false) {
  return {
    status: 'ACTIVE',
    decision: commercialLaunchReady
      ? 'ENTERPRISE_OS_V13_ACTIVE_READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH'
      : 'ENTERPRISE_OS_V13_ACTIVE_CORE_FROZEN_PRODUCT_OPERATIONS_READY_COMMERCIAL_EVIDENCE_REQUIRED',
    linkedLayers: {
      enterpriseOperatingModelV12: 'ACTIVE',
      enterpriseReferenceSystemV1: 'ACTIVE',
      enterpriseConstitutionV1: 'ACTIVE',
      commercialLaunchReady,
      currentReleaseStage: commercialLaunchReady ? 'Controlled Staging' : 'Release Candidate'
    }
  };
}

describe('Sheikha Enterprise Platform V20', () => {
  test('activates a stable enterprise platform maturity model above V13', () => {
    const report = buildEnterprisePlatformV20({
      enterpriseOperatingSystem: enterpriseOperatingSystem(false)
    });

    expect(report.system).toBe('SHEIKHA_ENTERPRISE_PLATFORM_V20');
    expect(report.status).toBe('ACTIVE');
    expect(report.phase).toBe('PLATFORM_OPERATIONS_AND_MATURITY_PHASE');
    expect(report.decision).toBe(
      'ENTERPRISE_PLATFORM_V20_ACTIVE_KERNEL_FROZEN_PLATFORM_MATURITY_READY_COMMERCIAL_EVIDENCE_REQUIRED'
    );
    expect(report.platformKernel).toEqual(PLATFORM_KERNEL_SCOPE);
    expect(report.enforcement.kernelMustRemainSmallAndStable).toBe(true);
    expect(report.governance.noHarm).toBe(true);
  });

  test('defines capabilities, official domains, unified contracts, and unified registry', () => {
    const report = buildEnterprisePlatformV20({
      enterpriseOperatingSystem: enterpriseOperatingSystem(false)
    });
    const validation = validateEnterprisePlatformV20(report);

    expect(validation.status).toBe('PASSED');
    expect(report.capabilityPlatform).toHaveLength(CAPABILITY_CATALOG.length);
    expect(report.domainPlatform.map((domain) => domain.name)).toEqual(OFFICIAL_DOMAINS);
    expect(report.unifiedContracts.map((contract) => contract.path)).toEqual(
      UNIFIED_CONTRACT_GROUPS.map((group) => `contracts/${group}/`)
    );
    expect(report.unifiedRegistry.map((registry) => registry.group)).toEqual(UNIFIED_REGISTRY_GROUPS);
    expect(validation.requirements).toBeGreaterThan(140);
  });

  test('keeps commerce and production gated by maturity evidence', () => {
    const report = buildEnterprisePlatformV20({
      enterpriseOperatingSystem: enterpriseOperatingSystem(false)
    });

    expect(report.platformServices.commercePlatform).toEqual(COMMERCE_REVENUE_FLOW);
    expect(report.maturityGates).toEqual(PLATFORM_MATURITY_GATES);
    expect(report.linkedLayers.commercialLaunchReady).toBe(false);
    expect(report.enforcement.commercialLaunchRequiresEvidenceGate).toBe(true);
    expect(report.enforcement.operationsMustProveBackupRecoveryMonitoring).toBe(true);
  });

  test('promotes decision when controlled commercial evidence is ready', () => {
    const report = buildEnterprisePlatformV20({
      enterpriseOperatingSystem: enterpriseOperatingSystem(true)
    });

    expect(report.decision).toBe('ENTERPRISE_PLATFORM_V20_ACTIVE_READY_FOR_CONTROLLED_COMMERCIAL_LAUNCH');
    expect(report.linkedLayers.commercialLaunchReady).toBe(true);
  });
});
