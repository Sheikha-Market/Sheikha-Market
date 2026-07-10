'use strict';

const fs = require('node:fs');
const path = require('node:path');

const fabric = require(
  '../../runtime/universal-benefit-boundary/v1/sheikha-universal-benefit-boundary-v1'
);

const ROOT = path.resolve(__dirname, '../..');
const REPORT_PATH = 'runtime/universal-benefit-boundary/v1/sheikha-universal-benefit-boundary-v1-report.json';
const DSL_PATH = 'sheikha-language/governance/sheikha-universal-benefit-boundary-v1.shk';
const ROUTE_PATH = 'routes/universal-benefit-boundary/status.routes.js';
const EVALUATION_ROUTE_PATH = 'routes/universal-benefit-boundary/evaluation.routes.js';

function resolve(relativePath) {
  return path.join(ROOT, relativePath);
}

function exists(relativePath) {
  return fs.existsSync(resolve(relativePath));
}

function read(relativePath) {
  return fs.readFileSync(resolve(relativePath), 'utf8');
}

function verifiedEvidence(id) {
  return [{
    evidenceId: id,
    source: 'SHEIKHA_UNIVERSAL_BENEFIT_BOUNDARY_TEST_EVIDENCE',
    type: 'test-result',
    verified: true
  }];
}

function capacityInput(overrides = {}) {
  const { resource = {}, ...rest } = overrides;
  return {
    capabilityId: 'SHEIKHA_RESOURCE_OPTIMIZATION',
    purpose: 'تخصيص مقدرة مأذونة وموثقة لمنفعة عامة قابلة للقياس.',
    boundaryScope: 'INTERNAL',
    resource: {
      resourceId: 'capacity-pool-1',
      name: 'مجموعة مقدرة اختبارية',
      class: 'COMPUTE',
      requestedAmount: 20,
      availableAmount: 100,
      unit: 'capacity-unit',
      owner: 'RESOURCE_OWNER',
      ...resource
    },
    evidence: verifiedEvidence('ubb-capacity-evidence'),
    ownerPermissionGranted: true,
    ownerPermissionReference: 'resource-owner-permission-1',
    nonHarmConfirmed: true,
    ...rest
  };
}

function evaluateCapacityProbes() {
  const internal = fabric.classifyPermittedCapacity(capacityInput());
  const externalReview = fabric.classifyPermittedCapacity(capacityInput({
    boundaryScope: 'EXTERNAL',
    externalConnectionRequested: true
  }));
  const externalApprovedInput = capacityInput({
    boundaryScope: 'EXTERNAL',
    externalConnectionRequested: true,
    externalConnectionAuthorized: true,
    humanApproval: true
  });
  const externalApproved = fabric.classifyPermittedCapacity(externalApprovedInput);
  const externalPlan = fabric.planCapacityIntegration(externalApprovedInput);
  const humanWithoutConsent = fabric.classifyPermittedCapacity(capacityInput({
    resource: { class: 'HUMAN_PARTICIPATION' }
  }));
  const missingEvidence = fabric.classifyPermittedCapacity(capacityInput({
    evidence: []
  }));
  const missingOwnerPermission = fabric.classifyPermittedCapacity(capacityInput({
    ownerPermissionGranted: false,
    ownerPermissionReference: ''
  }));
  const knownHarm = fabric.classifyPermittedCapacity(capacityInput({
    knownHarm: true,
    evidence: []
  }));
  const exceedsAvailable = fabric.classifyPermittedCapacity(capacityInput({
    resource: { requestedAmount: 120, availableAmount: 100 }
  }));
  const religiousClassification = fabric.classifyPermittedCapacity(capacityInput({
    requestsHalalOrHaramClassification: true
  }));

  return {
    internal,
    externalReview,
    externalApproved,
    externalPlan,
    humanWithoutConsent,
    missingEvidence,
    missingOwnerPermission,
    knownHarm,
    exceedsAvailable,
    religiousClassification
  };
}

function evaluateProbes() {
  const allow = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_PUBLIC_KNOWLEDGE_ASSISTANCE',
    purpose: 'تقديم معرفة عامة قابلة للتحقق باللغة العربية.',
    beneficiaries: ['PUBLIC_LEARNERS'],
    benefitDomains: ['EDUCATION', 'KNOWLEDGE'],
    evidence: verifiedEvidence('ubb-allow-evidence'),
    reasoningMode: 'standard'
  });
  const review = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_COMMUNITY_PLANNING',
    purpose: 'إعداد بدائل تشاركية لخدمة المجتمع.',
    beneficiaries: ['COMMUNITY'],
    benefitDomains: ['COMMUNITY_BENEFIT'],
    evidence: verifiedEvidence('ubb-review-evidence'),
    highImpact: true,
    reasoningMode: 'pro'
  });
  const sandbox = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_BARE_METAL_COMPATIBILITY',
    purpose: 'اختبار توافق منصة غير مؤهلة عبر المحاكاة.',
    beneficiaries: ['SYSTEM_OWNER'],
    permissions: ['HARDWARE_OWNER_PERMISSION'],
    evidence: verifiedEvidence('ubb-sandbox-evidence'),
    target: { hardwareSupported: false },
    reasoningMode: 'ultra'
  });
  const deny = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_LOCAL_FILE_ANALYSIS',
    purpose: 'تحليل ملف دون سجل إذن مالكه.',
    beneficiaries: ['REQUESTER'],
    evidence: verifiedEvidence('ubb-deny-evidence')
  });
  return { allow, review, sandbox, deny };
}

function buildReport() {
  fabric.resetRuntimeAudit();
  const currentStatus = fabric.status();
  const currentRegistry = fabric.registry();
  const transformations = fabric.transformationRegistry();
  const probes = evaluateProbes();
  const capacityProbes = evaluateCapacityProbes();
  const noEvidence = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_PUBLIC_KNOWLEDGE_ASSISTANCE',
    purpose: 'ادعاء يحتاج دليلًا.',
    beneficiaries: ['PUBLIC']
  });
  const bypass = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_ARABIC_LANGUAGE_REASONING',
    purpose: 'تجاوز فلاتر الحماية.',
    beneficiaries: ['REQUESTER'],
    evidence: verifiedEvidence('ubb-bypass-evidence'),
    security: { safetyFilterBypass: true }
  });
  const unauthorizedCyber = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_DEFENSIVE_SECURITY_REVIEW',
    purpose: 'استغلال نظام الغير.',
    beneficiaries: ['REQUESTER'],
    permissions: ['AUTHORIZED_SECURITY_SCOPE'],
    evidence: verifiedEvidence('ubb-cyber-deny-evidence'),
    humanApproval: true,
    security: { exploitAgainstOthers: true }
  });
  const authorizedDefense = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_DEFENSIVE_SECURITY_REVIEW',
    purpose: 'مراجعة دفاعية مصرح بها.',
    beneficiaries: ['SYSTEM_OWNER'],
    permissions: ['AUTHORIZED_SECURITY_SCOPE'],
    evidence: verifiedEvidence('ubb-defense-evidence'),
    humanApproval: true,
    security: {
      defensiveOnly: true,
      authorizedScope: true,
      preserveEvidence: true
    }
  });
  const personalData = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_LOCAL_FILE_ANALYSIS',
    purpose: 'تحليل بيانات شخصية محلية.',
    beneficiaries: ['FILE_OWNER'],
    permissions: ['FILE_OWNER_PERMISSION'],
    evidence: verifiedEvidence('ubb-privacy-evidence'),
    privacy: { personalData: true, dataMinimized: false, retentionDefined: false }
  });
  const religious = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_ARABIC_LANGUAGE_REASONING',
    purpose: 'إصدار فتوى آلية ملزمة.',
    beneficiaries: ['REQUESTER'],
    evidence: verifiedEvidence('ubb-religious-evidence'),
    religiousRuling: true
  });
  const consciousness = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_ARABIC_LANGUAGE_REASONING',
    purpose: 'ادعاء وعي وعصمة للذكاء الصناعي.',
    beneficiaries: ['REQUESTER'],
    evidence: verifiedEvidence('ubb-ai-claim-evidence'),
    claims: { consciousness: true, infallibility: true }
  });
  const kernel = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_BARE_METAL_COMPATIBILITY',
    purpose: 'تعديل النواة تلقائيًا بواسطة الذكاء الصناعي.',
    beneficiaries: ['SYSTEM_OWNER'],
    permissions: ['HARDWARE_OWNER_PERMISSION'],
    evidence: verifiedEvidence('ubb-kernel-evidence'),
    target: { kernelModification: true }
  });
  const missingTool = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_PUBLIC_KNOWLEDGE_ASSISTANCE',
    purpose: 'تحليل يتطلب أداة غير موجودة.',
    beneficiaries: ['PUBLIC'],
    evidence: verifiedEvidence('ubb-tool-evidence'),
    toolAvailable: false
  });
  const externalWrite = fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_PUBLIC_KNOWLEDGE_ASSISTANCE',
    purpose: 'كتابة خارجية دون تصريح.',
    beneficiaries: ['REQUESTER'],
    evidence: verifiedEvidence('ubb-external-evidence'),
    externalWrite: true,
    externalWriteAuthorized: false
  });
  const reasoning = ['standard', 'pro', 'ultra'].map((mode) => fabric.evaluateCapability({
    capabilityId: 'SHEIKHA_PUBLIC_KNOWLEDGE_ASSISTANCE',
    purpose: `فحص وضع الاستدلال ${mode}.`,
    beneficiaries: ['PUBLIC'],
    evidence: verifiedEvidence(`ubb-${mode}-evidence`),
    reasoningMode: mode
  }));
  const religiousEvidenceResearch = fabric.researchEvidence({
    query: 'عرض أدلة وجود الله وخلق الكون وتوحيد الله والعبودية لله.',
    religiousDomain: true
  });
  const dsl = fabric.parseArabicBoundaryContract(read(DSL_PATH));
  const transformed = fabric.transformBoundary({
    boundaryType: 'HARDWARE_BOUNDARY',
    state: 'BEYOND_BOUNDARY'
  });
  const routeText = exists(ROUTE_PATH) ? read(ROUTE_PATH) : '';
  const evaluationRouteText = exists(EVALUATION_ROUTE_PATH) ? read(EVALUATION_ROUTE_PATH) : '';
  const routeRegistry = exists('runtime/fabric-bootstrap/sheikha-fabric-routes.json')
    ? JSON.parse(read('runtime/fabric-bootstrap/sheikha-fabric-routes.json'))
    : { routes: [] };
  const routeRegistered = routeRegistry.routes.some((route) =>
    route.name === 'universal-benefit-boundary-v1' &&
    route.mount === '/api/governance/universal-benefit' &&
    route.module === 'routes/universal-benefit-boundary/status.routes.js'
  );
  const unrelatedReports = [
    ['public', 'executive-civilization-control-center', 'identity.health.json'].join('/'),
    ['runtime', 'community', 'sheikha-community-modeling-report.json'].join('/'),
    ['runtime', 'identity', 'sheikha-active-identity-v2-report.json'].join('/'),
    ['runtime', 'master-activation', 'sheikha-master-external-accreditation-verification-v1.json'].join('/'),
    ['runtime', 'production-hardening', 'sheikha-production-hardening-closure-v1-report.json'].join('/')
  ];
  const toolSource = read('tools/activation/activate-sheikha-universal-benefit-boundary-v1.js');

  const checks = {
    architectureComponentsComplete:
      currentStatus.architectureComponentsRegistered === 24,
    operationalCapacityCatalogComplete:
      currentStatus.boundaryScopesRegistered === 3 &&
      currentStatus.resourceClassesRegistered === 10 &&
      currentRegistry.capacityGovernance?.humanFinalResponsibility === true &&
      currentRegistry.capacityGovernance?.halalOrHaramDeterminedBySoftware === false,
    writtenArabicQuranSunnahContractComplete:
      dsl.status === 'VALID_GOVERNED_CONTRACT' &&
      dsl.contract?.arabicPrimary === true &&
      dsl.writtenReferences?.quranCount === 18 &&
      dsl.writtenReferences?.authenticSunnahCount === 2 &&
      dsl.writtenReferences?.hadithIsnad?.length === 1 &&
      dsl.writtenReferences?.hadithIsnad?.[0]?.number === '3191' &&
      dsl.writtenReferences?.candidateSourceBecomesVerifiedAutomatically === false &&
      dsl.writtenReferences?.automatedTheologicalProof === false &&
      dsl.writtenReferences?.automatedInterpretationOrFatwa === false &&
      dsl.writtenReferences?.qualifiedScholarReviewRequired === true &&
      [
        'سورة البقرة: 229',
        'سورة الطلاق: 1',
        'سورة النساء: 112',
        'سورة الأنبياء: 107',
        'سورة الطور: 35-36',
        'سورة الأنبياء: 22',
        'سورة الإخلاص: 1-4',
        'سورة الذاريات: 56'
      ]
        .every((location) => dsl.writtenReferences.quran
          .some((reference) => reference.location === location)),
    governedEvidenceResearchActive:
      currentStatus.evidenceResearchSourcesRegistered === 20 &&
      currentStatus.evidenceArgumentMapsRegistered === 4 &&
      religiousEvidenceResearch.status ===
        'CANDIDATE_SOURCES_FOUND_REVIEW_REQUIRED' &&
      religiousEvidenceResearch.candidateSourceCount === 10 &&
      religiousEvidenceResearch.argumentMaps.length === 4,
    missingEvidenceStartsResearchWithoutFalseVerification:
      noEvidence.safeAlternative?.type === 'EVIDENCE_RESEARCH_PLAN' &&
      noEvidence.evidenceResearch?.evidenceStatus === 'UNKNOWN' &&
      noEvidence.evidenceResearch?.verifiedEvidenceProduced === false &&
      noEvidence.evidenceResearch?.searchExecution?.externalSearchExecuted === false,
    religiousResearchPreservesIsnadAndEpistemicLayers:
      religiousEvidenceResearch.candidateSources.some((source) =>
        source.sourceKind === 'SUNNAH' &&
        source.isnad?.narrator === 'عمران بن الحصين' &&
        source.isnad?.collection === 'صحيح البخاري' &&
        source.isnad?.number === '3191' &&
        source.isnad?.grade === 'صحيح'
      ) &&
      religiousEvidenceResearch.epistemicSeparation?.rationalInference ===
        'REVIEWABLE_ARGUMENT_NOT_REVELATION',
    softwareDoesNotClaimTheologicalProof:
      religiousEvidenceResearch.theologicalClaimProvenBySoftware === false &&
      religiousEvidenceResearch.religiousGovernance
        ?.metaphysicalTruthAdjudicatedBySoftware === false &&
      religiousEvidenceResearch.resultCanPromoteItselfToVerified === false,
    technicalMeasurementDoesNotUseScriptureAsSubstitute:
      capacityProbes.missingEvidence.evidenceResearch
        ?.scriptureUsedAsSubstituteForEmpiricalMeasurement === false &&
      capacityProbes.missingEvidence.evidenceResearch
        ?.candidateSourceCount === 0,
    arabicApiDecisionSurfaceActive:
      Object.values(probes).every((item) =>
        item.language === 'ar' &&
        item.arabicPrimary === true &&
        item.arabic?.['القرار'] &&
        item.arabic?.['السبب'] &&
        item.arabic?.['القرار_النهائي_للإنسان'] === true
      ) &&
      transformed.arabicPrimary === true &&
      Boolean(transformed.arabic?.['البديل_الآمن']),
    deniesWithoutRequiredPermission:
      probes.deny.decision === 'DENY' && probes.deny.reason === 'REQUIRED_PERMISSION_MISSING',
    noVerifiedClaimWithoutEvidence:
      noEvidence.decision === 'REVIEW' && noEvidence.evidenceStatus === 'UNKNOWN',
    highImpactRequiresHumanReview:
      probes.review.decision === 'REVIEW' && probes.review.reason === 'HUMAN_APPROVAL_REQUIRED',
    safetyFilterBypassDenied: bypass.decision === 'DENY',
    unauthorizedCyberAttackDenied: unauthorizedCyber.decision === 'DENY',
    authorizedDefenseSandboxed:
      authorizedDefense.decision === 'SANDBOX' &&
      authorizedDefense.harmControls.includes('DEFENSE_ONLY'),
    personalDataMinimized:
      personalData.decision === 'SANDBOX' &&
      personalData.harmControls.includes('MINIMIZE_DATA'),
    safeAlternativeGeneratedOnDenial:
      probes.deny.safeAlternative?.executionPerformed === false &&
      Boolean(probes.deny.safeAlternative?.action),
    automatedReligiousRulingDenied:
      religious.decision === 'DENY' &&
      religious.requiredApprovals.includes('QUALIFIED_SCHOLAR_REVIEW'),
    consciousnessAndInfallibilityClaimsDenied: consciousness.decision === 'DENY',
    aiCannotModifyKernelDirectly:
      kernel.decision === 'DENY' && kernel.l24.kernelOrFirmwareAuthority === false,
    humanFinalResponsibilityPreserved: [
      ...Object.values(probes),
      noEvidence,
      bypass,
      unauthorizedCyber,
      authorizedDefense,
      personalData,
      religious,
      consciousness,
      kernel,
      missingTool,
      externalWrite,
      religiousEvidenceResearch,
      ...Object.values(capacityProbes).filter((item) =>
        item?.humanFinalResponsibility !== undefined
      ),
      ...reasoning
    ].every((item) => item.humanFinalResponsibility === true),
    missingToolBecomesRequirementsReport:
      missingTool.decision === 'REVIEW' &&
      missingTool.safeAlternative?.type === 'REQUIREMENTS_REPORT',
    unsupportedHardwareBecomesHonestEmulation:
      probes.sandbox.decision === 'SANDBOX' &&
      probes.sandbox.harmControls.includes('NO_NATIVE_SUPPORT_CLAIM'),
    missingEvidenceBecomesUnknown: noEvidence.evidenceStatus === 'UNKNOWN',
    externalWriteRequiresAuthorization:
      externalWrite.decision === 'DENY' && externalWrite.externalWritePerformed === false,
    humanParticipationRequiresConsentAndWithdrawal:
      capacityProbes.humanWithoutConsent.decision === 'DENY' &&
      capacityProbes.humanWithoutConsent.humanDignity.humanIsExploitableResource === false,
    capacityRequiresVerifiedMeasurement:
      capacityProbes.missingEvidence.decision === 'REVIEW' &&
      capacityProbes.missingEvidence.evidenceStatus === 'UNKNOWN',
    capacityRequiresOwnerPermission:
      capacityProbes.missingOwnerPermission.decision === 'DENY' &&
      capacityProbes.missingOwnerPermission.reason ===
        'RESOURCE_OWNER_PERMISSION_REQUIRED',
    knownHarmStopsCapacityBeforeEvidenceReview:
      capacityProbes.knownHarm.decision === 'DENY' &&
      capacityProbes.knownHarm.reason === 'KNOWN_HARM_PROHIBITS_CAPACITY_USE',
    capacityOverrunRemainsSandboxed:
      capacityProbes.exceedsAvailable.decision === 'SANDBOX' &&
      capacityProbes.exceedsAvailable.resource.requestedAmountExceedsAvailable === true &&
      capacityProbes.exceedsAvailable.resource.utilizationRatio === 1.2,
    externalIntegrationRequiresAuthorization:
      capacityProbes.externalReview.decision === 'REVIEW' &&
      capacityProbes.externalReview.reason === 'EXTERNAL_INTEGRATION_REQUIRES_APPROVAL',
    governedIntegrationPlanDoesNotExecute:
      capacityProbes.externalApproved.decision === 'ALLOW' &&
      capacityProbes.externalPlan.status === 'INTEGRATION_PLAN_READY' &&
      capacityProbes.externalPlan.executionAllowed === false &&
      capacityProbes.externalPlan.connection.dataTransferred === false &&
      capacityProbes.externalPlan.connection.resourceConsumed === false,
    softwareDoesNotDeclareHalalOrHaram:
      capacityProbes.religiousClassification.decision === 'REVIEW' &&
      capacityProbes.religiousClassification.religiousBoundary
        .softwareDeclaresHalalOrHaram === false &&
      capacityProbes.religiousClassification.requiredApprovals
        .includes('QUALIFIED_SCHOLAR_REVIEW'),
    operationalPotentialDoesNotClaimPhysicalEnergy:
      capacityProbes.internal.operationalPotential.physicalEnergyProduced === false &&
      capacityProbes.internal.operationalPotential
        .physicalEnergyRequiresEngineeringMeasurement === true,
    reasoningModesDoNotEscalatePermission:
      reasoning.map((item) => item.l24.reasoningMode).join(',') === 'standard,pro,ultra' &&
      reasoning.every((item) => item.permissionEscalationAllowed === false),
    l24RemainsAdvisory:
      reasoning.every((item) =>
        item.l24.role === 'ADVISORY_ANALYSIS_AND_PROPOSALS' &&
        item.l24.externalActionAllowed === false
      ),
    apiRoutesRegistered:
      routeRegistered &&
      routeText.includes("router.get('/status'") &&
      evaluationRouteText.includes("router.post('/evaluate'") &&
      evaluationRouteText.includes("router.post('/transform-boundary'") &&
      evaluationRouteText.includes("router.post('/classify-capacity'") &&
      evaluationRouteText.includes("router.post('/plan-integration'") &&
      evaluationRouteText.includes("router.post('/research-evidence'"),
    unrelatedLegacyReportsNotMixed:
      unrelatedReports.every((file) => !toolSource.includes(`'${file}'`) && !toolSource.includes(`\"${file}\"`))
  };
  const missing = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  const decisions = Object.values(probes).map((item) => item.decision);
  const countDecision = (decision) => decisions.filter((item) => item === decision).length;
  const safeAlternativesGenerated = Object.values(probes)
    .filter((item) => item.safeAlternative?.type !== 'NOT_REQUIRED').length;

  return {
    system: 'SHEIKHA_UNIVERSAL_BENEFIT_BOUNDARY_GOVERNANCE_V1',
    language: 'ar',
    arabicPrimary: true,
    arabicName: 'منظومة شيخة العربية الشاملة للخير والنفع والحدود',
    status: missing.length === 0 ? 'VERIFIED_ACTIVE' : 'ACTIVE_WITH_REVIEW',
    mode: 'PERMITTED_CAPABILITY_TO_VERIFIED_PUBLIC_BENEFIT',
    generatedAt: new Date().toISOString(),
    score: missing.length === 0 ? 100 : Math.max(0, 100 - missing.length * 5),
    capabilitiesRegistered: currentStatus.capabilitiesRegistered,
    boundariesRegistered: currentStatus.boundariesRegistered,
    benefitDomainsRegistered: currentStatus.benefitDomainsRegistered,
    architectureComponentsRegistered:
      currentStatus.architectureComponentsRegistered,
    boundaryScopesRegistered: currentStatus.boundaryScopesRegistered,
    resourceClassesRegistered: currentStatus.resourceClassesRegistered,
    evidenceResearchSourcesRegistered:
      currentStatus.evidenceResearchSourcesRegistered,
    evidenceArgumentMapsRegistered:
      currentStatus.evidenceArgumentMapsRegistered,
    allowedDecisions: countDecision('ALLOW'),
    reviewDecisions: countDecision('REVIEW'),
    sandboxDecisions: countDecision('SANDBOX'),
    deniedDecisions: countDecision('DENY'),
    safeAlternativesGenerated,
    humanApprovalRequiredCount: [probes.review, religious, kernel]
      .filter((item) => item.requiredApprovals.length > 0).length,
    evidenceVerifiedCount: Object.values(probes)
      .filter((item) => item.evidenceStatus === 'VERIFIED').length,
    religiousRulingsAutomated: false,
    safetyBypassAllowed: false,
    permissionEscalationAllowed: false,
    externalWriteWithoutAuthorizationAllowed: false,
    automaticKernelOrFirmwareModificationAllowed: false,
    humanFinalResponsibility: true,
    divineLimitsDeterminedBySoftware: false,
    halalOrHaramDeterminedBySoftware: false,
    operationalBoundariesAreReligiousRulings: false,
    humanParticipationIsExploitableResource: false,
    candidateSourceBecomesVerifiedAutomatically: false,
    automatedTheologicalProofOrAqidahJudgment: false,
    claimPolicy: 'لا ادعاء بمنفعة أو سلامة أو امتثال دون دليل ومراجعة بشرية واجبة.',
    checks,
    missing,
    decisions: probes,
    evidenceResearch: {
      status: religiousEvidenceResearch.status,
      sourcesRegistered: currentStatus.evidenceResearchSourcesRegistered,
      argumentMapsRegistered: currentStatus.evidenceArgumentMapsRegistered,
      religiousProbe: religiousEvidenceResearch,
      missingEvidenceProbe: noEvidence.evidenceResearch,
      verifiedEvidenceProduced: false,
      externalSearchExecuted: false,
      theologicalClaimProvenBySoftware: false
    },
    capacity: {
      vision: currentRegistry.capacityGovernance?.vision,
      mission: currentRegistry.capacityGovernance?.mission,
      goals: currentRegistry.capacityGovernance?.goals,
      classifications: capacityProbes,
      connectionExecuted: false,
      resourceConsumed: false,
      physicalEnergyProduced: false
    },
    boundaryTransformationProbe: transformed,
    arabicDsl: {
      path: DSL_PATH,
      status: dsl.status,
      contract: dsl.contract,
      writtenReferences: dsl.writtenReferences,
      executableAuthorityGranted: dsl.executableAuthorityGranted
    },
    arabicApi: {
      primary: true,
      language: 'ar',
      machineIdentifiersPreservedForCompatibility: true,
      decisionsReturnArabicExplanation: true,
      boundariesReturnArabicNames: true,
      safeAlternativesReturnArabicText: true
    },
    integrations: currentRegistry.integrations,
    registries: {
      capabilityBoundary: 'runtime/universal-benefit-boundary/v1/sheikha-capability-boundary-registry-v1.json',
      benefitTransformation: 'runtime/universal-benefit-boundary/v1/sheikha-benefit-transformation-registry-v1.json',
      transformationCount: transformations.transformations.length
    },
    routes: currentStatus.routes,
    governance: currentStatus.governance,
    evidence: {
      runtimeAuditRecords: fabric.evidence().recordsCount,
      persistence: fabric.evidence().persistence,
      externalWrites: false,
      sensitiveRequestPayloadsStored: false
    },
    limitations: [
      'قرار ALLOW نتيجة توجيه ولا يمنح تفويض التنفيذ.',
      'مؤشرات المنفعة تشغيلية قابلة للمراجعة وليست أحكامًا أخلاقية مطلقة.',
      'الأحكام الشرعية تحتاج أهل العلم المؤهلين، ولا تصدر فتوى آلية.',
      'البحث يعيد مصادر مرشحة لا دليلًا VERIFIED؛ سلامة النص والإسناد والتفسير والحجة تحتاج مراجعة بشرية مؤهلة.',
      'البرنامج يعرض أدلة الكتاب والسنة وخريطة الاستدلال، ولا يدعي إثبات الغيب حسابيًا أو إصدار حكم عقدي آلي.',
      'الملاحظة العلمية والقياس التجريبي لا يتحولان إلى وحي، والنص الشرعي لا يستبدل قياس الدعوى التقنية.',
      'حدود الله لا يحددها البرنامج؛ النطاقات الداخلية والخارجية تصنيفات تشغيلية وليست أحكامًا شرعية.',
      'المشاركة البشرية طوعية ومصونة الكرامة وليست موردًا قابلًا للاستغلال.',
      'تحويل المقدرة يعني إعداد خطة تخصيص مقاسة، ولا يعني إنتاج طاقة فيزيائية.',
      'مصنف المقدرة ومخطط التكامل لا ينفذان اتصالًا أو نقلًا أو استهلاكًا للمورد.',
      'الأعمال عالية الأثر والمادية والقانونية والطبية والمالية وتعديل النواة والبرمجيات الثابتة والكتابة الخارجية تبقى محكومة بشريًا.',
      'دليل التدقيق التشغيلي محدود وفي الذاكرة؛ التدقيق الدائم يحتاج مسار التدقيق المأذون المنفصل.'
    ]
  };
}

function writeReport(report = buildReport()) {
  fs.mkdirSync(path.dirname(resolve(REPORT_PATH)), { recursive: true });
  fs.writeFileSync(resolve(REPORT_PATH), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  return report;
}

function summary(report) {
  return {
    system: report.system,
    status: report.status,
    score: report.score,
    capabilitiesRegistered: report.capabilitiesRegistered,
    boundariesRegistered: report.boundariesRegistered,
    benefitDomainsRegistered: report.benefitDomainsRegistered,
    boundaryScopesRegistered: report.boundaryScopesRegistered,
    resourceClassesRegistered: report.resourceClassesRegistered,
    evidenceResearchSourcesRegistered: report.evidenceResearchSourcesRegistered,
    evidenceArgumentMapsRegistered: report.evidenceArgumentMapsRegistered,
    decisions: {
      ALLOW: report.allowedDecisions,
      REVIEW: report.reviewDecisions,
      SANDBOX: report.sandboxDecisions,
      DENY: report.deniedDecisions
    },
    safeAlternativesGenerated: report.safeAlternativesGenerated,
    humanFinalResponsibility: report.humanFinalResponsibility,
    missing: report.missing,
    report: REPORT_PATH
  };
}

if (require.main === module) {
  const command = String(process.argv[2] || 'activate').toLowerCase();
  let report;
  if (command === 'status' && exists(REPORT_PATH)) {
    report = JSON.parse(read(REPORT_PATH));
  } else if (command === 'verify') {
    report = buildReport();
  } else {
    report = writeReport();
  }
  console.log(JSON.stringify(summary(report), null, 2));
  if (command === 'verify' && report.status !== 'VERIFIED_ACTIVE') process.exitCode = 1;
}

module.exports = {
  REPORT_PATH,
  buildReport,
  capacityInput,
  evaluateCapacityProbes,
  evaluateProbes,
  verifiedEvidence,
  writeReport
};
