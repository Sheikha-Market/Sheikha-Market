'use strict';

const {evaluateLanguageProductRelease} = require('../core/language/sheikha-language-product-release-gate-v1');

function input() {
  return {
    foundation: {passed: true, nativeStack: {bareMetal: {physicalHardwareVerified: false}, languageBinding: {bytecodeExecutedInsideKernel: false}}},
    architecture: {advancedHostedArabicFoundation: {status: 'ADVANCED_HOSTED_ARABIC_FOUNDATION_VERIFIED'}, compiler: {nativeTargetAvailable: true, selfHosted: false, nativeObjectEvidence: {verified: true, linkedIntoKernelImage: true, runtimeCallVerified: false, kernelLogic: {uefiHandoffGuardGeneratedFromSheikha: true, controlledHaltModeGeneratedFromSheikha: true}}}},
    firmware: {evidence: {physicalNamedDeviceBootVerified: true}, actualFirmwareReleaseGate: {decision: 'RELEASE_DENY'}, readiness: {oemOdmCommercialReleaseReady: false}},
    testEvidence: {compilerAndVmTestsPassed: true, foundationTestsPassed: true, arabicLogicTestsPassed: true, kernelContractTestsPassed: true}
  };
}

describe('Sheikha Arabic language product release gate V1', () => {
  test('releases hosted products independently while blocking native kernel and firmware', () => {
    const report = evaluateLanguageProductRelease(input());
    expect(report.status).toBe('BOUNDED_PRODUCTS_READY_NATIVE_KERNEL_AND_FIRMWARE_BLOCKED');
    expect(report.releasableProductIds).toEqual([
      'SHEIKHA_HOSTED_ARABIC_APPLICATIONS',
      'SHEIKHA_ARABIC_GOVERNANCE_AND_ENGINEERING_PRODUCTS',
      'SHEIKHA_BARE_METAL_SEED_TRIAL',
      'SHEIKHA_NATIVE_LANGUAGE_OBJECT_SDK'
    ]);
    expect(report.products.find((p) => p.id === 'SHEIKHA_NATIVE_LANGUAGE_KERNEL').decision)
      .toBe('BLOCKED_SELF_HOSTING_AND_RUNTIME_BOOT_QUALIFICATION_REQUIRED');
    expect(report.products.find((p) => p.id === 'SHEIKHA_LANGUAGE_KERNEL_INTEGRATION_IMAGE').decision)
      .toBe('BUILD_CANDIDATE_QEMU_PENDING');
    expect(report.products.find((p) => p.id === 'SHEIKHA_OEM_ODM_FIRMWARE').decision).toBe('BLOCKED_BY_FIRMWARE_RELEASE_GATE');
  });

  test('detects stale foundation physical evidence without erasing either record', () => {
    const report = evaluateLanguageProductRelease(input());
    expect(report.evidenceDrift).toEqual({foundationPhysicalHardwareFlag: false, currentFirmwarePhysicalEvidence: true, staleFoundationPhysicalFlagDetected: true});
  });

  test('never turns hosted readiness into a complete native claim', () => {
    const report = evaluateLanguageProductRelease(input());
    expect(report.claimBoundary.nativeKernelWrittenEntirelyInSheikhaClaimed).toBe(false);
    expect(report.claimBoundary.productionFirmwareClaimed).toBe(false);
  });
});
