'use strict';

const TECHNICAL_MODEL = Object.freeze({
  system: 'SHEIKHA_COMPUTING_COGNITIVE_LAYERS_V1',
  status: 'ACTIVE_AT_HIGHEST_EXECUTABLE_TECHNICAL_LAYER',
  arabicName: 'قمة شيخة للحوسبة والإدراك المحكوم',
  level: 'L24_HIGHEST_GOVERNED_COMPUTING_COGNITIVE_APEX_LAYER',
  apexLevel: 24,
  position: 'UNDER_NON_EXECUTABLE_QURAN_SUNNAH_VALUES_REFERENCE_AND_COVENANT_GOVERNANCE_ABOVE_L23_L22_L21_L20',
  apexPromotion: {
    highestExecutableTechnicalLayer: true,
    normativeReferenceLayerExecutable: false,
    covenantGovernanceGateRequired: true,
    humanAuthorityAboveAutomation: true,
    noPrivilegeEscalationByLayerPromotion: true,
    governedLowerLayers: [
      { level: 23, system: 'SHEIKHA_EXTENSION_STREAMING_ARTIFACT_APEX_V1' },
      { level: 22, system: 'SHEIKHA_CLOUD_PRODUCTION_DEPLOYMENT_APEX_V1', plane: 'PARALLEL_DEPLOYMENT_PLANE' },
      { level: 21, system: 'SHEIKHA_STREAMING_MULTILINGUAL_CHAT_APEX_V1' },
      { level: 20, system: 'SHEIKHA_TECHNICAL_CAPABILITY_APEX_V1' }
    ],
    executionOrder: [
      'NON_EXECUTABLE_VALUES_REFERENCE',
      'COVENANT_GOVERNANCE_ASSURANCE_GATE',
      'L24_COMPUTING_COGNITIVE_APEX',
      'L23_EXTENSION_STREAMING_ARTIFACT_APEX',
      'L22_CLOUD_PRODUCTION_DEPLOYMENT_PARALLEL_PLANE',
      'L21_STREAMING_MULTILINGUAL_CHAT_APEX',
      'L20_TECHNICAL_CAPABILITY_APEX',
      'ACCOUNTABLE_HUMAN_DECISION_AND_APPROVAL'
    ]
  },
  distributionIntegration: {
    system: 'SHEIKHA_UNIVERSAL_DISTRIBUTION_INSTALLER_FABRIC_V1',
    status: 'ACTIVE_LOCAL_FIRST_EVIDENCE_CONSUMER',
    matrix: 'distribution/manifest/sheikha-release-matrix-v1.json',
    report: 'runtime/distribution/v1/sheikha-universal-distribution-v1-report.json',
    bareMetalLink: 'distribution/manifest/sheikha-bare-metal-distribution-link-v1.json',
    targetCount: 27,
    automaticExternalPublishing: false,
    automaticSigning: false,
    artifactClaimRequiresEvidence: true,
    humanReleaseApprovalRequired: true
  },
  authority: {
    highestGovernanceReference: 'QURAN_AND_AUTHENTIC_SUNNAH_VALUES_BOUNDARY',
    technicalSystemIsReligiousAuthority: false,
    humanAccountableDecisionMaker: true,
    aiRole: 'ADVISORY_ANALYSIS_AND_BOUNDED_ORCHESTRATION',
    noAutonomousFatwa: true,
    scholarReviewForReligiousQuestions: true,
    humanReviewForHighImpactActions: true
  },
  domains: {
    network: {
      model: 'SHEIKHA_OSI_INTEROPERABILITY_PROFILE',
      presentationOrder: [
        { layer: 7, name: 'APPLICATION', role: 'user-facing network services and application protocols' },
        { layer: 6, name: 'PRESENTATION', role: 'representation, encoding, and cryptographic formatting' },
        { layer: 5, name: 'SESSION', role: 'dialog and session coordination' },
        { layer: 4, name: 'TRANSPORT', role: 'end-to-end transport behavior' },
        { layer: 3, name: 'NETWORK', role: 'addressing and routing' },
        { layer: 2, name: 'DATA_LINK', role: 'local-link framing and media access' },
        { layer: 1, name: 'PHYSICAL', role: 'signals and physical transmission' }
      ],
      applicationIsTopInPresentationOrder: true,
      applicationHasHighestMachinePrivilege: false,
      sheikhaHttp: {
        profile: 'SHEIKHA_HTTP_PROFILE_V1',
        baseStandard: 'IETF_RFC_9110_HTTP_SEMANTICS',
        newWireProtocolClaimed: false,
        role: 'governed application profile over standards-compliant HTTP semantics',
        externalTrafficRequiresHttps: true,
        controls: [
          'method_semantics',
          'origin_validation',
          'authentication_and_authorization',
          'request_size_limits',
          'rate_limits',
          'secure_headers',
          'audit_trace',
          'privacy_and_data_minimization'
        ]
      }
    },
    abstraction: {
      model: 'SHEIKHA_COMPUTER_ABSTRACTION_PROFILE',
      topHumanFacingLayer: 'SHEIKHA_APPLICATIONS_AND_HIGH_LEVEL_LANGUAGE',
      layers: [
        'human_intent_and_accountability',
        'applications',
        'sheikha_high_level_language_and_apis',
        'runtime_and_system_services',
        'kernel_and_hal',
        'firmware_and_boot',
        'instruction_set_architecture',
        'microarchitecture_and_hardware'
      ],
      highLevelLanguageIsUniversalAuthority: false,
      note: 'High-level language is a high abstraction for program construction, not a CPU privilege level.'
    },
    operatingSystem: {
      model: 'SHEIKHA_HUMAN_CONTROLLED_APPLICATION_STACK',
      controlOrder: [
        'accountable_human_operator',
        'governance_and_policy',
        'applications',
        'services_and_runtime',
        'kernel_and_hal',
        'firmware',
        'hardware'
      ],
      applicationsAreHighestUserFacingSoftware: true,
      userConsentAndControlRequired: true,
      aiMayOverrideHumanByDefault: false
    },
    cpuProtection: {
      model: 'SHEIKHA_CPU_PRIVILEGE_AND_EXECUTION_DOMAINS',
      architecturalPrivilegeLevels: [
        { cpl: 0, commonName: 'Ring 0', privilege: 'most privileged architectural CPL' },
        { cpl: 1, commonName: 'Ring 1', privilege: 'intermediate; rarely used by common operating systems' },
        { cpl: 2, commonName: 'Ring 2', privilege: 'intermediate; rarely used by common operating systems' },
        { cpl: 3, commonName: 'Ring 3', privilege: 'least privileged architectural CPL; applications' }
      ],
      orthogonalExecutionDomains: [
        {
          name: 'VMX_ROOT_AND_NON_ROOT',
          commonAlias: 'Ring -1',
          architecturalNegativeRing: false,
          note: 'Virtualization mode is orthogonal to CPL; root and non-root each retain privilege levels.'
        },
        {
          name: 'SYSTEM_MANAGEMENT_MODE_OR_MANAGEMENT_MODE',
          commonAlias: 'Ring -2',
          architecturalNegativeRing: false,
          note: 'SMM/MM is a separate isolated management environment, not an x86 CPL ring.'
        },
        {
          name: 'UEFI_FIRMWARE',
          commonAlias: null,
          architecturalNegativeRing: false,
          note: 'UEFI is a firmware execution environment and boot interface, not Ring -2.'
        },
        {
          name: 'PLATFORM_MANAGEMENT_SUBSYSTEM',
          commonAlias: 'Ring -3',
          architecturalNegativeRing: false,
          note: 'A platform management processor is a separate subsystem; capabilities vary by platform and power state.'
        }
      ],
      absolutePlatformAuthorityClaimed: false,
      leastPrivilegeRequired: true
    },
    cloud: {
      model: 'SHEIKHA_CLOUD_SERVICE_AND_CONTROL_PROFILE',
      nistEssentialCharacteristics: [
        'on_demand_self_service',
        'broad_network_access',
        'resource_pooling',
        'rapid_elasticity',
        'measured_service'
      ],
      serviceModels: ['SaaS', 'PaaS', 'IaaS'],
      saasIsHighestConsumerAbstraction: true,
      saasHasHighestInfrastructurePrivilege: false,
      deploymentModels: ['private', 'community', 'public', 'hybrid'],
      providerAgnostic: true,
      dataResidencyAndTenantIsolationRequired: true
    },
    cognitiveAi: {
      model: 'SHEIKHA_GOVERNED_COGNITIVE_SUPPORT_LAYER',
      aboveTraditionalApplicationsInFunctionalComposition: true,
      authorityOverHuman: false,
      capabilities: [
        'classification',
        'retrieval',
        'reasoning_scaffolds',
        'recommendation',
        'bounded_agents',
        'multi_agent_review',
        'scientific_and_mathematical_assistance'
      ],
      prohibitedClaims: [
        'consciousness',
        'infallibility',
        'human_superiority',
        'unrestricted_autonomy',
        'decision_authority_without_delegation'
      ]
    },
    infosphere: {
      model: 'SHEIKHA_GOVERNED_INFORMATION_ECOSYSTEM',
      role: 'social, institutional, knowledge, and data context around computing systems',
      hardwarePrivilegeLayer: false,
      controls: [
        'data_rights',
        'privacy',
        'provenance',
        'quality',
        'consent',
        'retention',
        'audit',
        'human_benefit'
      ]
    }
  },
  engineeringReferences: [
    'https://www.rfc-editor.org/rfc/rfc9110.html',
    'https://csrc.nist.gov/pubs/sp/800/145/final',
    'https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html',
    'https://uefi.org/specifications',
    'https://airc.nist.gov/airmf-resources/airmf/5-sec-core/'
  ]
});

const MODE_PROFILES = Object.freeze({
  standard: {
    mode: 'standard',
    status: 'ACTIVE',
    roleSlots: 2,
    concurrencyLimit: 1,
    discoveryDepth: 'BOUNDED',
    contextBudgetChars: 6000,
    evidenceLimit: 6,
    defaultFor: 'routine_and_moderate_tasks'
  },
  pro: {
    mode: 'pro',
    status: 'ACTIVE',
    roleSlots: 4,
    concurrencyLimit: 2,
    discoveryDepth: 'DEEP_BOUNDED',
    contextBudgetChars: 12000,
    evidenceLimit: 12,
    defaultFor: 'complex_analysis_and_engineering'
  },
  ultra: {
    mode: 'ultra',
    status: 'ACTIVE_GOVERNED_ORCHESTRATION',
    roleSlots: 4,
    concurrencyLimit: 4,
    discoveryDepth: 'MULTI_LENS_DEEP_BOUNDED',
    contextBudgetChars: 16000,
    evidenceLimit: 16,
    defaultFor: 'explicit_ultra_or_auto_complex_with_budget'
  }
});

const ROLE_CATALOG = Object.freeze([
  {
    id: 'EVIDENCE',
    title: 'Evidence and Source Agent',
    objective: 'separate verified facts, assumptions, gaps, and required evidence',
    mayExecuteExternalActions: false
  },
  {
    id: 'ARCHITECTURE',
    title: 'Architecture and Decomposition Agent',
    objective: 'decompose the task and map dependencies, interfaces, and constraints',
    mayExecuteExternalActions: false
  },
  {
    id: 'SERENDIPITY',
    title: 'Serendipity and Alternatives Agent',
    objective: 'surface relevant adjacent ideas, counterexamples, and assumption inversions',
    mayExecuteExternalActions: false
  },
  {
    id: 'RISK_REVIEW',
    title: 'Risk, Security, and Governance Agent',
    objective: 'challenge safety, rights, authorization, and unsupported claims',
    mayExecuteExternalActions: false
  }
]);

function sanitizePrompt(value = '') {
  return String(value)
    .replace(/sk-[A-Za-z0-9_-]+/g, '[REDACTED_KEY]')
    .replace(/ghp_[A-Za-z0-9_]+/g, '[REDACTED_TOKEN]')
    .trim()
    .slice(0, 4000);
}

function hasDefensiveContext(text) {
  return /منع|دفاع|دفاعي|حماية|كشف|اختبار مصرح|mitigat|defen|detect|authorized/i.test(text);
}

function detectSafetyBypassIntent(text) {
  const bypass = /jailbreak|bypass.{0,40}(filter|guard|safety)|تجاوز.{0,40}(فلتر|حماية|أمان)|التحايل.{0,40}(فلتر|حماية|أمان)|كسر.{0,40}(فلتر|حماية|أمان)/i;
  return bypass.test(text) && !hasDefensiveContext(text);
}

function isComplexTask(text) {
  return text.length > 220 ||
    /معمار|هندس|أمن|حوكمة|بحث|علمي|رياضي|تكامل|منظومة|architecture|security|research|scientific|integration/i
      .test(text);
}

function normalizeReasoningMode(mode, message = '', options = {}) {
  const requested = String(mode || 'auto').trim().toLowerCase();
  if (['standard', 'pro', 'ultra'].includes(requested)) {
    return requested;
  }
  if (requested === 'auto' && isComplexTask(String(message || ''))) {
    return options.ultraBudgetApproved === true ? 'ultra' : 'pro';
  }
  return 'standard';
}

function discoveryTechniques(mode) {
  const standard = [
    'direct_task_decomposition',
    'one_relevant_adjacent_domain',
    'missing_evidence_check'
  ];
  if (mode === 'standard') {
    return standard;
  }
  return [
    ...standard,
    'assumption_inversion',
    'counterexample_search',
    'cross_domain_analogy',
    'failure_mode_review',
    'alternative_path_comparison'
  ];
}

function rolesForMode(mode) {
  if (mode === 'standard') {
    return [ROLE_CATALOG[0], ROLE_CATALOG[2]];
  }
  return ROLE_CATALOG;
}

function runReasoning(input = {}) {
  const task = sanitizePrompt(input.task || input.message || input.prompt || '');
  const mode = normalizeReasoningMode(input.mode, task, input);
  const profile = MODE_PROFILES[mode];
  const bypassBlocked = detectSafetyBypassIntent(task);
  const defensiveSecurityReview = !bypassBlocked && hasDefensiveContext(task);
  const roles = rolesForMode(mode).map((role, index) => ({
    ...role,
    order: index + 1,
    status: bypassBlocked ? 'NOT_STARTED' : 'READY',
    outputContract: [
      'concise_findings',
      'evidence_or_assumptions',
      'risks_and_limits',
      'recommended_verification'
    ]
  }));

  return {
    system: 'SHEIKHA_REASONING_SERENDIPITY_ENGINE_V1',
    status: bypassBlocked ? 'BLOCKED_BY_SAFETY_POLICY' : 'READY',
    task,
    mode,
    profile,
    complexTask: isComplexTask(task),
    serendipity: {
      status: bypassBlocked ? 'BLOCKED' : 'ACTIVE_BOUNDED_DISCOVERY',
      purpose: 'find relevant unexpected alternatives without evading safety or fabricating evidence',
      techniques: discoveryTechniques(mode),
      randomSafetyFilterEvasionAllowed: false,
      relevanceGateRequired: true,
      evidenceGateRequired: true
    },
    orchestration: {
      roles,
      roleSlots: roles.length,
      concurrencyLimit: profile.concurrencyLimit,
      actualIndependentModelProcesses: false,
      currentExecution: 'ROLE_SCOPED_REASONING_SCAFFOLD',
      externalActionAllowed: false,
      highImpactActionRequiresHumanApproval: true,
      conflictResolution: 'evidence_then_human_review'
    },
    efficiency: {
      unprecedentedEfficiencyClaimed: false,
      contextBudgetChars: profile.contextBudgetChars,
      evidenceLimit: profile.evidenceLimit,
      deduplicateContext: true,
      earlyStopWhenEvidenceSufficient: true,
      cacheEligibleReadOnlyEvidence: true,
      benchmarkRequiredForSpeedOrCostClaims: true
    },
    securityAndScience: {
      defensiveSecurityReview,
      authorizedScopeRequired: true,
      vulnerabilityDiscoveryRequiresPermission: true,
      exploitOrSafetyBypassInstructionsAllowed: false,
      scientificClaimsRequireReproducibleEvidence: true,
      mathematicalOutputsRequireIndependentVerification: true,
      domainExpertReviewRequiredForHighImpactUse: true
    },
    governance: {
      foundation: 'QURAN_AND_AUTHENTIC_SUNNAH_VALUES_BOUNDARY',
      truthfulness: true,
      amanah: true,
      justice: true,
      noHarm: true,
      shura: true,
      humanIsPrimaryAndAccountable: true,
      aiIsToolOnly: true,
      noRevelationClaim: true,
      noInfallibilityClaim: true,
      noIndependentFatwa: true,
      noConsciousnessClaim: true,
      humanFinalDecision: true
    },
    blockedReason: bypassBlocked
      ? 'SAFETY_FILTER_EVASION_IS_NOT_A_SERENDIPITY_TECHNIQUE'
      : null
  };
}

function formatReasoningResponse(result) {
  if (result.status === 'BLOCKED_BY_SAFETY_POLICY') {
    return [
      '## تم إيقاف مسار الاستدلال',
      '',
      '- السبب: لا تُستخدم تقنية الصدفة لتجاوز فلاتر الأمان أو التحايل عليها.',
      '- البديل المسموح: تحليل دفاعي، اختبار مصرح، أو تصميم ضوابط كشف ومنع.',
      '- القرار النهائي: للإنسان صاحب الصلاحية.'
    ].join('\n');
  }

  const roles = result.orchestration.roles
    .map((role) => '- ' + role.title + ': ' + role.objective)
    .join('\n');
  const techniques = result.serendipity.techniques
    .map((technique) => '- ' + technique)
    .join('\n');

  return [
    '## استدلال شيخة ' + result.mode.toUpperCase(),
    '',
    '- المهمة: ' + (result.task || 'غير محددة'),
    '- الحالة: ' + result.status,
    '- الصدفة: اكتشاف بدائل مرتبطة، لا عشوائية ولا تجاوزًا للأمان.',
    '- القرار النهائي والمسؤولية: للإنسان.',
    '',
    '### مسارات المراجعة',
    roles,
    '',
    '### تقنيات الاكتشاف',
    techniques,
    '',
    '### بوابات النتيجة',
    '1. فصل الحقيقة عن الافتراض.',
    '2. توثيق الدليل والحدود.',
    '3. مراجعة المخاطر والحقوق والصلاحية.',
    '4. مقارنة البديل المباشر والبديل غير المتوقع ذي الصلة.',
    '5. اختبار النتيجة قبل أي تنفيذ.',
    '6. إحالة القرار عالي الأثر للإنسان أو المختص.'
  ].join('\n');
}

function status() {
  return {
    ...TECHNICAL_MODEL,
    reasoningModes: MODE_PROFILES,
    ultraMode: {
      status: 'ACTIVE_GOVERNED_ORCHESTRATION',
      defaultForComplexTasksWhenBudgetApproved: true,
      agents: ROLE_CATALOG,
      agentSlots: 4,
      currentActualIndependentModelProcesses: false,
      humanFinalDecision: true
    },
    boundaries: {
      modelDoesNotExposePrivateChainOfThought: true,
      structuredReasoningArtifactsOnly: true,
      noSafetyBypass: true,
      noAutomaticHighImpactExecution: true,
      noSpeedCostOrSuperiorityClaimWithoutBenchmark: true,
      humansRemainPrimaryAndAccountable: true
    },
    apexRoutes: {
      status: '/api/intelligence/execution-loop/apex/status',
      reasoningStatus: '/api/intelligence/execution-loop/reasoning/status',
      reasoning: '/api/intelligence/execution-loop/reasoning'
    }
  };
}

module.exports = {
  MODE_PROFILES,
  ROLE_CATALOG,
  TECHNICAL_MODEL,
  detectSafetyBypassIntent,
  formatReasoningResponse,
  isComplexTask,
  normalizeReasoningMode,
  runReasoning,
  sanitizePrompt,
  status
};
