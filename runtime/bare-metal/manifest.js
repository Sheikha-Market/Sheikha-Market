'use strict';

function freeze(value) {
  for (const child of Object.values(value)) {
    if (child && typeof child === 'object') freeze(child);
  }
  return Object.freeze(value);
}

function target(name, type) {
  return {
    name, type, status: 'TARGET_NOT_QUALIFIED',
    fullOsSupportVerified: false, systemModificationAllowed: false,
    editingScope: 'AUTHORIZED_PROJECT_FILES_ONLY'
  };
}

module.exports = freeze({
  id: 'SHEIKHA_BARE_METAL_MANIFEST_V1',
  schemaVersion: '1.0',
  type: 'PLATFORM_TARGET_MANIFEST',
  base: 'لا إله إلا الله محمد رسول الله',
  status: 'LOCAL_SOFTWARE_CONTRACT',
  layers: {
    pop_os: target('Pop!_OS', 'linux'),
    microsoft: target('Windows', 'windows'),
    linux: target('Linux', 'linux'),
    apple: target('macOS', 'darwin'),
    ubuntu: target('Ubuntu', 'linux'),
    bare_metal: target('Native boot target', 'bare_metal')
  },
  programming: {
    language: 'Sheikha managed language',
    hostRuntime: 'Node.js',
    pipeline: ['SOURCE', 'LEXER', 'PARSER_AST', 'TYPECHECK', 'IR', 'BYTECODE', 'GOVERNED_VM'],
    mode: 'FIXED_LOCAL_SELF_TEST',
    liveAdapters: false,
    shellExecution: false,
    arbitraryCodeExecution: false,
    nativeSelfHostingVerified: false
  },
  ai: {
    placement: 'SEPARATE_SERVICE_WITH_BOUNDED_KERNEL_INTERFACE',
    mode: 'DESCRIPTOR_AND_RESEARCH_PLANNING_ONLY',
    providerConnected: false, modelInferenceExecuted: false, trainingExecuted: false,
    agiOrAsiVerified: false
  },
  governance: {
    reference: 'QURAN_AND_SUNNAH',
    values: ['JUSTICE', 'TRUST', 'BENEFIT', 'NO_HARM', 'TRUTHFUL_EVIDENCE'],
    automatedReligiousCertification: false,
    qualifiedHumanReviewRequired: true,
    externalAuthorityGranted: false,
    hardwareExecutionAllowed: false,
    productionDeploymentAllowed: false
  },
  evidence: {
    bootExecutedThisSession: false,
    bareMetalBootVerified: false,
    physicalHardwareQualified: false,
    universalCompatibility: false,
    allSciencesIntegrated: false,
    productionReady: false
  },
  seal: null
});
