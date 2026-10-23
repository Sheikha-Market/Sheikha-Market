'use strict';

function evaluateLanguageProductRelease({foundation, architecture, firmware, testEvidence}) {
  const checks = {
    compilerAndVmTestsPassed: testEvidence.compilerAndVmTestsPassed === true,
    foundationTestsPassed: testEvidence.foundationTestsPassed === true,
    arabicLogicTestsPassed: testEvidence.arabicLogicTestsPassed === true,
    kernelContractTestsPassed: testEvidence.kernelContractTestsPassed === true,
    foundationCompilationPassed: foundation.passed === true,
    advancedHostedArabicVerified: architecture.advancedHostedArabicFoundation?.status === 'ADVANCED_HOSTED_ARABIC_FOUNDATION_VERIFIED',
    nativeTargetAvailable: architecture.compiler?.nativeTargetAvailable === true,
    nativeObjectDigestVerified: architecture.compiler?.nativeObjectEvidence?.verified === true,
    nativeObjectLinkedIntoKernelImage: architecture.compiler?.nativeObjectEvidence?.linkedIntoKernelImage === true,
    nativeObjectRuntimeCallVerified: architecture.compiler?.nativeObjectEvidence?.runtimeCallVerified === true,
    sheikhaGeneratedKernelLogicVerified:
      architecture.compiler?.nativeObjectEvidence?.kernelLogic?.uefiHandoffGuardGeneratedFromSheikha === true &&
      architecture.compiler?.nativeObjectEvidence?.kernelLogic?.controlledHaltModeGeneratedFromSheikha === true &&
      architecture.compiler?.nativeObjectEvidence?.runtimeCallVerified === true,
    compilerSelfHosted: architecture.compiler?.selfHosted === true,
    sheikhaBytecodeRunsInKernel: foundation.nativeStack?.languageBinding?.bytecodeExecutedInsideKernel === true,
    physicalBareMetalBootVerified: firmware.evidence?.physicalNamedDeviceBootVerified === true,
    firmwareProductionReleaseAllowed: firmware.actualFirmwareReleaseGate?.decision === 'RELEASE_ALLOW',
    oemFirmwareReady: firmware.readiness?.oemOdmCommercialReleaseReady === true
  };

  const products = [
    {
      id: 'SHEIKHA_HOSTED_ARABIC_APPLICATIONS',
      decision: checks.compilerAndVmTestsPassed && checks.foundationTestsPassed && checks.arabicLogicTestsPassed && checks.foundationCompilationPassed
        ? 'RELEASE_CANDIDATE' : 'BLOCKED',
      targets: ['BYTECODE_VM', 'JSON_IR', 'JAVASCRIPT', 'PYTHON', 'PHP'],
      boundary: 'HOST_RUNTIME_REQUIRED_FOR_BUILD_AND_EXECUTION'
    },
    {
      id: 'SHEIKHA_ARABIC_GOVERNANCE_AND_ENGINEERING_PRODUCTS',
      decision: checks.advancedHostedArabicVerified && checks.compilerAndVmTestsPassed
        ? 'RELEASE_CANDIDATE' : 'BLOCKED',
      targets: ['DOCUMENTS', 'PLANS', 'POLICY_CONTRACTS', 'AUDITABLE_REPORTS'],
      boundary: 'HIGH_IMPACT_OUTPUT_REQUIRES_HUMAN_REVIEW'
    },
    {
      id: 'SHEIKHA_BARE_METAL_SEED_TRIAL',
      decision: checks.kernelContractTestsPassed && checks.physicalBareMetalBootVerified
        ? 'PHYSICAL_TRIAL_VERIFIED_READ_ONLY' : 'BLOCKED',
      targets: ['X86_64_UEFI_USB_IMAGE'],
      boundary: 'CONTROLLED_HALT_NOT_GENERAL_PURPOSE_OS'
    },
    {
      id: 'SHEIKHA_NATIVE_LANGUAGE_OBJECT_SDK',
      decision: checks.nativeTargetAvailable && checks.nativeObjectDigestVerified
        ? 'RELEASE_CANDIDATE' : 'BLOCKED_NATIVE_OBJECT_REQUIRED',
      targets: ['X86_64_ELF_RELOCATABLE_OBJECT', 'FREESTANDING_C11_SOURCE'],
      boundary: 'LINKABLE_METADATA_OBJECT_NOT_BOOTABLE_KERNEL_OR_FIRMWARE'
    },
    {
      id: 'SHEIKHA_LANGUAGE_KERNEL_INTEGRATION_IMAGE',
      decision: checks.nativeObjectLinkedIntoKernelImage && !checks.nativeObjectRuntimeCallVerified
        ? 'BUILD_CANDIDATE_QEMU_PENDING'
        : (checks.nativeObjectRuntimeCallVerified ? 'QEMU_TRIAL_VERIFIED' : 'BLOCKED'),
      targets: ['X86_64_UEFI_FAT12_IMAGE'],
      boundary: checks.sheikhaGeneratedKernelLogicVerified
        ? 'PARTIAL_KERNEL_LOGIC_GENERATED_FROM_SHEIKHA_AND_QEMU_VERIFIED_NOT_FULL_KERNEL'
        : 'NEW_V1_IMAGE_NOT_COVERED_BY_PRIOR_V2_PHYSICAL_BOOT_EVIDENCE'
    },
    {
      id: 'SHEIKHA_NATIVE_LANGUAGE_KERNEL',
      decision: checks.nativeTargetAvailable && checks.compilerSelfHosted && checks.sheikhaBytecodeRunsInKernel
        ? 'RELEASE_CANDIDATE'
        : (checks.nativeObjectLinkedIntoKernelImage
          ? 'BLOCKED_SELF_HOSTING_AND_RUNTIME_BOOT_QUALIFICATION_REQUIRED'
          : 'BLOCKED_NATIVE_BACKEND_REQUIRED'),
      targets: ['NATIVE_KERNEL_OBJECTS'],
      boundary: 'CURRENT_KERNEL_BACKEND_IS_FREESTANDING_C11'
    },
    {
      id: 'SHEIKHA_OEM_ODM_FIRMWARE',
      decision: checks.firmwareProductionReleaseAllowed && checks.oemFirmwareReady
        ? 'COMMERCIAL_RELEASE_ALLOWED' : 'BLOCKED_BY_FIRMWARE_RELEASE_GATE',
      targets: ['NAMED_BOARD_FIRMWARE', 'OEM_ODM_RELEASE'],
      boundary: 'TPM_SECURE_BOOT_RECOVERY_SIGNING_AND_RELEASE_EVIDENCE_REQUIRED'
    }
  ];
  const releasableProducts = products.filter((product) => [
    'RELEASE_CANDIDATE',
    'PHYSICAL_TRIAL_VERIFIED_READ_ONLY',
    'QEMU_TRIAL_VERIFIED',
    'COMMERCIAL_RELEASE_ALLOWED'
  ].includes(product.decision));
  return {
    schemaVersion: '1.0.0',
    system: 'SHEIKHA_ARABIC_LANGUAGE_PRODUCT_RELEASE_GATE_V1',
    language: 'لغة شيخة البرمجية',
    status: releasableProducts.length > 0 ? 'BOUNDED_PRODUCTS_READY_NATIVE_KERNEL_AND_FIRMWARE_BLOCKED' : 'ALL_PRODUCTS_BLOCKED',
    checks,
    products,
    releasableProductIds: releasableProducts.map((product) => product.id),
    evidenceDrift: {
      foundationPhysicalHardwareFlag: foundation.nativeStack?.bareMetal?.physicalHardwareVerified === true,
      currentFirmwarePhysicalEvidence: checks.physicalBareMetalBootVerified,
      staleFoundationPhysicalFlagDetected: foundation.nativeStack?.bareMetal?.physicalHardwareVerified === false && checks.physicalBareMetalBootVerified
    },
    claimBoundary: {
      completeGeneralPurposeLanguageClaimed: false,
      boundedNativeObjectSdkClaimed: checks.nativeTargetAvailable && checks.nativeObjectDigestVerified,
      nativeKernelWrittenEntirelyInSheikhaClaimed: false,
      productionFirmwareClaimed: false,
      productsMayBeReleasedIndependently: true
    }
  };
}

module.exports = {evaluateLanguageProductRelease};
