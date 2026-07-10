'use strict';

const fs = require('node:fs');
const path = require('node:path');

const publicBenefitRouter = require(
  '../../runtime/governance-generator/v1/sheikha-public-benefit-capability-router-v1'
);
const evidenceRegistry = require(
  '../../runtime/evidence-registry/sheikha-evidence-registry-v1'
);
const {
  runReasoning
} = require('../../runtime/computing-cognitive-layers/v1/sheikha-computing-cognitive-layers-v1');

const ROOT = path.resolve(__dirname, '../..');
const REGISTRY_PATH = path.join(
  ROOT,
  'runtime/universal-benefit-boundary/v1/sheikha-capability-boundary-registry-v1.json'
);
const TRANSFORMATION_PATH = path.join(
  ROOT,
  'runtime/universal-benefit-boundary/v1/sheikha-benefit-transformation-registry-v1.json'
);
const REPORT_PATH = path.join(
  ROOT,
  'runtime/universal-benefit-boundary/v1/sheikha-universal-benefit-boundary-v1-report.json'
);

const DECISIONS = Object.freeze(['ALLOW', 'REVIEW', 'SANDBOX', 'DENY']);
const BOUNDARY_STATES = Object.freeze([
  'WITHIN_BOUNDARY',
  'AT_BOUNDARY',
  'BEYOND_BOUNDARY'
]);

const ARABIC_DECISIONS = Object.freeze({
  ALLOW: 'مسموح بالمرور إلى بوابة التفويض المنفصلة',
  REVIEW: 'مراجعة بشرية أو تخصصية مطلوبة',
  SANDBOX: 'عزل أو محاكاة أو تشغيل محدود مطلوب',
  DENY: 'منع التنفيذ'
});

const ARABIC_REASONS = Object.freeze({
  CAPABILITY_NOT_REGISTERED: 'القدرة غير مسجلة في السجل المعتمد.',
  PROHIBITED_SECURITY_ACTION: 'الطلب يتضمن فعلًا أمنيًا محظورًا أو غير دفاعي.',
  AUTOMATED_RELIGIOUS_RULING_PROHIBITED: 'إصدار حكم شرعي أو فتوى آلية مستقلة ممنوع.',
  PROHIBITED_AI_AUTHORITY_OR_UNSEEN_CLAIM: 'ادعاء الوعي أو العصمة أو الوحي أو علم الغيب ممنوع.',
  AI_DIRECT_KERNEL_OR_FIRMWARE_MODIFICATION_PROHIBITED: 'لا يملك الذكاء الصناعي تعديل النواة أو البرمجيات الثابتة مباشرة.',
  EXTERNAL_WRITE_NOT_AUTHORIZED: 'الكتابة الخارجية غير مأذونة بإذن صريح.',
  REQUIRED_PERMISSION_MISSING: 'الإذن المطلوب غير موجود أو غير موثق.',
  EVIDENCE_INSUFFICIENT_RESULT_UNKNOWN: 'الدليل غير كاف؛ النتيجة غير معلومة وبدأ مسار بحث منضبط دون تخمين.',
  QUALIFIED_DOMAIN_REVIEW_REQUIRED: 'تحتاج المسألة مراجعة مختص مؤهل في مجالها.',
  HUMAN_APPROVAL_REQUIRED: 'تحتاج العملية موافقة الإنسان المسؤول.',
  TOOL_UNAVAILABLE_REQUIREMENTS_REPORT_REQUIRED: 'الأداة غير متاحة؛ يلزم تقرير متطلبات وخطة بديلة.',
  HARDWARE_SUPPORT_NOT_VERIFIED_USE_EMULATION: 'دعم العتاد غير مثبت؛ تستخدم المحاكاة دون ادعاء دعم أصلي.',
  NETWORK_UNAVAILABLE_USE_LOCAL_FIRST: 'الاتصال غير متاح؛ يستخدم التشغيل المحلي أولًا.',
  PERSONAL_DATA_REQUIRES_MINIMIZATION: 'البيانات الشخصية تحتاج تقليلًا وإخفاء هوية وسياسة احتفاظ.',
  RESOURCE_OR_COST_BOUNDARY_REACHED: 'بلغ الطلب حد الموارد أو التكلفة ويحتاج ضبط الميزانية.',
  DEFENSIVE_SECURITY_SCOPE_NOT_AUTHORIZED: 'نطاق الأمن الدفاعي غير مأذون.',
  AUTHORIZED_DEFENSIVE_SECURITY_SANDBOX_ONLY: 'المراجعة الدفاعية المأذونة تعمل داخل العزل فقط.',
  ELEVATED_RISK_REQUIRES_ISOLATION: 'الخطر مرتفع ويحتاج عزلًا أو محاكاة أو وضع قراءة فقط.',
  WITHIN_BOUNDARY_VERIFIED_FOR_GOVERNED_ROUTING: 'اجتاز الطلب فحص الحدود والدليل للمرور المحكوم، دون منحه إذن تنفيذ.',
  VALID_REGISTERED_BOUNDARY_REQUIRED: 'يلزم حد مسجل وحالة حد صحيحة.',
  BOUNDARY_STATE_WITHIN_BOUNDARY: 'الطلب ضمن الحد المأذون ويحتاج بوابة التفويض المنفصلة.',
  BOUNDARY_STATE_AT_BOUNDARY: 'الطلب عند الحد ويحتاج مسار الأمان أو المراجعة المناسب.',
  BOUNDARY_STATE_BEYOND_BOUNDARY: 'الطلب خارج الحد؛ منع التنفيذ وأنتج بديل آمن.',
  CAPACITY_INPUT_INVALID: 'بيانات المقدرة أو المورد أو النطاق غير مكتملة أو غير صحيحة.',
  SOFTWARE_CANNOT_DECLARE_HALAL_OR_HARAM: 'البرنامج لا يعلن الحلال أو الحرام؛ يلزم أهل العلم المؤهلون.',
  HUMAN_PARTICIPATION_REQUIRES_CONSENT: 'المشاركة البشرية تحتاج رضا صريحًا وحق الانسحاب وحفظ الكرامة.',
  RESOURCE_OWNER_PERMISSION_REQUIRED: 'استخدام المقدرة يحتاج إذن مالكها أو صاحب الصلاحية.',
  CAPACITY_EVIDENCE_REQUIRED: 'مقدار المقدرة غير موثق؛ بدأ مسار بحث عن قياس ودليل قابلين للتحقق.',
  KNOWN_HARM_PROHIBITS_CAPACITY_USE: 'ثبت احتمال ضرر غير مقبول؛ يمنع توجيه المقدرة إليه.',
  NON_HARM_NOT_VERIFIED_USE_SIMULATION: 'عدم الضرر غير مثبت؛ يسمح بالمحاكاة فقط.',
  REQUEST_EXCEEDS_AVAILABLE_CAPACITY: 'المقدار المطلوب يتجاوز المقدرة المتاحة الموثقة.',
  EXTERNAL_INTEGRATION_REQUIRES_APPROVAL: 'التكامل الخارجي يحتاج إذنًا صريحًا وموافقة بشرية ونطاقًا محدودًا.',
  CAPACITY_PLAN_READY_WITHIN_GOVERNED_BOUNDARY: 'خطة المقدرة جاهزة للمرور إلى بوابة التفويض دون تنفيذ تلقائي.'
});

const ARABIC_BOUNDARIES = Object.freeze({
  RELIGIOUS_BOUNDARY: 'الحد الشرعي',
  HUMAN_AUTHORITY_BOUNDARY: 'حد مسؤولية الإنسان وسلطته',
  LEGAL_BOUNDARY: 'الحد القانوني',
  PERMISSION_BOUNDARY: 'حد الإذن والصلاحية',
  SAFETY_BOUNDARY: 'حد السلامة ومنع الضرر',
  SECURITY_BOUNDARY: 'الحد الأمني الدفاعي',
  PRIVACY_BOUNDARY: 'حد الخصوصية وتقليل البيانات',
  EVIDENCE_BOUNDARY: 'حد الدليل والتثبت',
  KNOWLEDGE_UNCERTAINTY_BOUNDARY: 'حد عدم اليقين المعرفي',
  HARDWARE_BOUNDARY: 'حد العتاد',
  SOFTWARE_BOUNDARY: 'حد البرمجيات والأدوات',
  NETWORK_BOUNDARY: 'حد الشبكة والاتصال',
  RESOURCE_AND_COST_BOUNDARY: 'حد الموارد والتكلفة',
  ENVIRONMENTAL_BOUNDARY: 'حد المسؤولية البيئية',
  ACCESSIBILITY_BOUNDARY: 'حد الوصول والشمول',
  JURISDICTION_BOUNDARY: 'حد الولاية والاختصاص',
  PHYSICAL_WORLD_BOUNDARY: 'حد العالم المادي',
  HIGH_IMPACT_DECISION_BOUNDARY: 'حد القرار عالي الأثر'
});

const ARABIC_BOUNDARY_STATES = Object.freeze({
  WITHIN_BOUNDARY: 'ضمن الحد المأذون',
  AT_BOUNDARY: 'عند الحد ويحتاج تحققًا أو مراجعة',
  BEYOND_BOUNDARY: 'خارج الحد ويمنع التنفيذ'
});

const ARABIC_EVIDENCE_STATES = Object.freeze({
  VERIFIED: 'دليل موثق في سياق التقييم',
  UNKNOWN: 'غير معلوم لعدم كفاية الدليل'
});

const BOUNDARY_SCOPES = Object.freeze([
  'INTERNAL',
  'EXTERNAL',
  'CROSS_BOUNDARY'
]);

const RESOURCE_CLASSES = Object.freeze([
  'HUMAN_PARTICIPATION',
  'COMPUTE',
  'NETWORK',
  'KNOWLEDGE',
  'MATERIAL',
  'FINANCIAL',
  'ENERGY',
  'SPATIAL',
  'TEMPORAL',
  'EQUIPMENT'
]);

const ARABIC_RESOURCE_CLASSES = Object.freeze({
  HUMAN_PARTICIPATION: 'مشاركة بشرية طوعية ومصونة الكرامة',
  COMPUTE: 'قدرة حوسبية',
  NETWORK: 'قدرة شبكة واتصال',
  KNOWLEDGE: 'معرفة مأذونة وموثقة',
  MATERIAL: 'مواد وموجودات غير بشرية',
  FINANCIAL: 'ميزانية أو مورد مالي مأذون',
  ENERGY: 'طاقة فيزيائية مقاسة',
  SPATIAL: 'حيز مكاني مأذون',
  TEMPORAL: 'وقت أو نافذة زمنية',
  EQUIPMENT: 'جهاز أو معدة مأذونة'
});

const ARABIC_BOUNDARY_SCOPES = Object.freeze({
  INTERNAL: 'حد تشغيلي داخلي',
  EXTERNAL: 'حد تكامل خارجي',
  CROSS_BOUNDARY: 'اتصال محكوم بين الداخل والخارج'
});

const runtimeAudit = [];
let auditSequence = 0;

function readJson(filePath, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (_) {
    return fallback;
  }
}

function registry() {
  return readJson(REGISTRY_PATH, {
    system: 'SHEIKHA_CAPABILITY_BOUNDARY_REGISTRY_V1',
    status: 'REGISTRY_UNAVAILABLE',
    capabilities: [],
    boundaries: [],
    benefitDomains: []
  });
}

function transformationRegistry() {
  return readJson(TRANSFORMATION_PATH, {
    system: 'SHEIKHA_BENEFIT_TRANSFORMATION_REGISTRY_V1',
    status: 'REGISTRY_UNAVAILABLE',
    transformations: []
  });
}

function cleanText(value, maxLength = 1000) {
  const withoutControlCharacters = Array.from(String(value || ''))
    .map((character) => {
      const code = character.charCodeAt(0);
      return code <= 31 || code === 127 ? ' ' : character;
    })
    .join('');
  return withoutControlCharacters
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function cleanList(value, maxItems = 25, maxLength = 250) {
  return Array.isArray(value)
    ? value.filter(Boolean).slice(0, maxItems).map((item) => cleanText(item, maxLength))
    : [];
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeEvidence(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 25).map((item, index) => {
    if (typeof item === 'string') {
      return {
        evidenceId: cleanText(item, 160) || `unverified-${index + 1}`,
        source: 'request-reference',
        verified: false
      };
    }
    return {
      evidenceId: cleanText(item?.evidenceId || item?.id, 160) || `unverified-${index + 1}`,
      source: cleanText(item?.source, 160) || 'request-reference',
      verified: item?.verified === true,
      type: cleanText(item?.type, 80) || 'governance-decision'
    };
  });
}

function normalizeInput(input = {}) {
  const target = input.target && typeof input.target === 'object' ? input.target : {};
  const security = input.security && typeof input.security === 'object' ? input.security : {};
  const claims = input.claims && typeof input.claims === 'object' ? input.claims : {};
  const resources = input.resources && typeof input.resources === 'object' ? input.resources : {};
  const privacy = input.privacy && typeof input.privacy === 'object' ? input.privacy : {};
  const permissions = cleanList(input.permissions, 25, 160);
  const evidence = normalizeEvidence(input.evidence);

  return {
    capabilityId: cleanText(input.capabilityId || input.capability, 160),
    purpose: cleanText(input.purpose || input.intendedBenefit, 1200),
    beneficiaries: cleanList(input.beneficiaries, 25, 160),
    benefitDomains: cleanList(input.benefitDomains, 16, 120),
    permissions,
    evidence,
    reasoningMode: cleanText(input.reasoningMode || input.mode || 'standard', 20).toLowerCase(),
    riskLevel: cleanText(input.riskLevel || 'low', 20).toUpperCase(),
    highImpact: input.highImpact === true,
    humanApproval: input.humanApproval === true,
    qualifiedScholarReview: input.qualifiedScholarReview === true,
    externalWrite: input.externalWrite === true,
    externalWriteAuthorized: input.externalWriteAuthorized === true,
    externalResearchAuthorized: input.externalResearchAuthorized === true,
    religiousEvidenceResearch: input.religiousEvidenceResearch === true,
    evidenceTopics: cleanList(input.evidenceTopics, 12, 100),
    religiousRuling: input.religiousRuling === true,
    legalMedicalOrFinancialJudgment: input.legalMedicalOrFinancialJudgment === true,
    toolAvailable: input.toolAvailable !== false,
    networkAvailable: input.networkAvailable !== false,
    target: {
      hardwareSupported: target.hardwareSupported !== false,
      kernelModification: target.kernelModification === true,
      firmwareModification: target.firmwareModification === true,
      physicalAction: target.physicalAction === true
    },
    resources: {
      withinBudget: resources.withinBudget !== false,
      environmentallyReviewed: resources.environmentallyReviewed === true
    },
    privacy: {
      personalData: privacy.personalData === true,
      dataMinimized: privacy.dataMinimized === true,
      anonymized: privacy.anonymized === true,
      retentionDefined: privacy.retentionDefined === true
    },
    security: {
      defensiveOnly: security.defensiveOnly === true,
      authorizedScope: security.authorizedScope === true,
      exploitAgainstOthers: security.exploitAgainstOthers === true,
      credentialTheft: security.credentialTheft === true,
      persistence: security.persistence === true,
      evasion: security.evasion === true,
      safetyFilterBypass: security.safetyFilterBypass === true,
      destructivePayload: security.destructivePayload === true,
      preserveEvidence: security.preserveEvidence === true
    },
    claims: {
      consciousness: claims.consciousness === true,
      independentWill: claims.independentWill === true,
      infallibility: claims.infallibility === true,
      revelation: claims.revelation === true,
      unseenKnowledge: claims.unseenKnowledge === true,
      futureAsFact: claims.futureAsFact === true
    }
  };
}

function findCapability(capabilityId) {
  const normalized = cleanText(capabilityId, 160).toUpperCase();
  return registry().capabilities.find((item) =>
    String(item.capabilityId || '').toUpperCase() === normalized ||
    String(item.name || '').toUpperCase() === normalized
  ) || null;
}

function findTransformation(boundaryType) {
  return transformationRegistry().transformations.find(
    (item) => item.boundaryType === boundaryType
  ) || null;
}

function safeAlternativeFor(boundaryType, reason, capability = null) {
  const transformation = findTransformation(boundaryType);
  return {
    type: transformation?.safeAlternative?.type || 'HUMAN_HANDOFF',
    action: transformation?.safeAlternative?.action ||
      capability?.safeAlternative ||
      'أنشئ خطة مأذونة منخفضة الأثر واعرضها على الإنسان المسؤول.',
    boundaryType,
    reason,
    executionPerformed: false,
    externalWritePerformed: false
  };
}

function normalizeArabicSearchText(value) {
  return cleanText(value, 2000)
    .toLowerCase()
    .replace(/[\u064b-\u065f\u0670\u0640]/gu, '')
    .replace(/[أإآٱ]/gu, 'ا')
    .replace(/ى/gu, 'ي');
}

function detectEvidenceTopics(query, explicitTopics = [], religiousDomain = false) {
  const allowedTopics = [
    'DIVINE_EXISTENCE_AND_CREATION',
    'TAWHID',
    'WORSHIP',
    'EVIDENCE_METHOD'
  ];
  const normalized = normalizeArabicSearchText(query);
  const topics = cleanList(explicitTopics, 12, 100)
    .map((item) => item.toUpperCase())
    .filter((item) => allowedTopics.includes(item));

  if (/(الوجود|وجود الله|وجود الخالق|خلق الله|الخلق|الخالق|خلق الكون|خلق السماوات|من خلق)/u.test(normalized)) {
    topics.push('DIVINE_EXISTENCE_AND_CREATION');
  }
  if (/(التوحيد|توحيد|وحداني|الله احد|لا اله الا الله|الهة)/u.test(normalized)) {
    topics.push('TAWHID');
  }
  if (/(العبودي|العباد|عباده الله|ليعبدون|غايه الخلق)/u.test(normalized)) {
    topics.push('WORSHIP');
  }
  if (religiousDomain && topics.length === 0) {
    topics.push('DIVINE_EXISTENCE_AND_CREATION', 'TAWHID', 'WORSHIP');
  }
  topics.push('EVIDENCE_METHOD');
  return unique(topics);
}

function referenceToCandidateSource(reference = {}) {
  const sourceKind = reference.sourceKind ||
    (String(reference.reference || '').startsWith('سورة') ? 'QURAN' : 'SUNNAH');
  return {
    sourceId: reference.principle,
    sourceKind,
    title: reference.arabicPrinciple,
    citation: reference.reference,
    text: reference.arabicText,
    sourceUrl: reference.sourceUrl,
    topics: reference.evidenceTopics || [],
    provenance: {
      registry: reference.provenance?.registry ||
        'SHEIKHA_CAPABILITY_BOUNDARY_REGISTRY_V1',
      sourceType: reference.provenance?.sourceType ||
        (sourceKind === 'QURAN' ? 'QURAN_LOCATION' : 'HADITH_REFERENCE'),
      textIntegrityStatus: reference.provenance?.textIntegrityStatus ||
        'HUMAN_REVIEW_REQUIRED'
    },
    isnad: reference.isnad || {
      applicable: false,
      status: 'NOT_APPLICABLE_TO_QURAN_REFERENCE'
    }
  };
}

function researchEvidence(input = {}) {
  const currentRegistry = registry();
  const policy = currentRegistry.evidenceResearchPolicy || {};
  const query = cleanText(input.query || input.claim || input.purpose, 1600);
  const detectedTopics = detectEvidenceTopics(
    query,
    input.topics,
    input.religiousDomain === true
  );
  const religiousTopics = detectedTopics.filter((topic) => topic !== 'EVIDENCE_METHOD');
  const religiousDomain = input.religiousDomain === true || religiousTopics.length > 0;
  const topicToArgumentId = {
    DIVINE_EXISTENCE_AND_CREATION: 'CREATION_QURANIC_ARGUMENT',
    TAWHID: 'TAWHID_QURANIC_ARGUMENT',
    WORSHIP: 'WORSHIP_QURANIC_ARGUMENT',
    EVIDENCE_METHOD: 'EVIDENCE_METHOD_ARGUMENT'
  };
  const selectedArgumentIds = unique(detectedTopics.map(
    (topic) => topicToArgumentId[topic]
  ));
  const selectedArgumentMaps = (policy.argumentMaps || []).filter((argument) =>
    selectedArgumentIds.includes(argument.argumentId)
  );
  const methodArgument = (policy.argumentMaps || []).find(
    (argument) => argument.argumentId === 'EVIDENCE_METHOD_ARGUMENT'
  );
  const methodPrinciples = methodArgument?.sourcePrinciples || [];
  const candidatePrinciples = religiousDomain
    ? unique(selectedArgumentMaps.flatMap((argument) => argument.sourcePrinciples || []))
    : [];
  const references = currentRegistry.valuesReference?.references || [];
  const candidateSources = references
    .filter((reference) => candidatePrinciples.includes(reference.principle))
    .map(referenceToCandidateSource);
  const methodReferences = references
    .filter((reference) => methodPrinciples.includes(reference.principle))
    .map(referenceToCandidateSource);
  const plan = evidenceRegistry.researchPlan({
    query,
    requiredEvidence: input.requiredEvidence,
    candidateSources,
    availableChannels: policy.searchOrder,
    networkAvailable: input.networkAvailable === true,
    externalSearchAuthorized: input.externalSearchAuthorized === true,
    localSearchExecuted: true,
    religiousDomain
  });

  return {
    ...plan,
    system: 'SHEIKHA_GOVERNED_EVIDENCE_RESEARCH_ORCHESTRATOR_V1',
    evidenceRegistryPlanSystem: plan.system,
    topics: detectedTopics,
    methodReferences,
    argumentMaps: selectedArgumentMaps.map((argument) => ({
      ...argument,
      status: 'PRESENTED_FOR_QUALIFIED_HUMAN_REVIEW',
      sourceCitations: references
        .filter((reference) => (argument.sourcePrinciples || [])
          .includes(reference.principle))
        .map((reference) => reference.reference),
      conclusionDeclaredAsAutomatedProof: false
    })),
    sourceStandards: policy.sourceStandards || {},
    localIntegrationReferences: policy.existingLocalIntegrations || [],
    theologicalClaimProvenBySoftware: false,
    quranAndSunnahReferencesPresented: religiousDomain,
    scriptureUsedAsSubstituteForEmpiricalMeasurement: false,
    resultCanPromoteItselfToVerified: false
  };
}

function parseArabicBoundaryContract(source) {
  const text = String(source || '').slice(0, 16384);
  const extract = (label) => {
    const match = text.match(new RegExp(`(?:^|\\n)\\s*${label}\\s+"([^"]+)"`, 'u'));
    return match ? cleanText(match[1], 500) : null;
  };
  const decision = extract('فالقرار');
  const quranReferences = [...text.matchAll(
    /مقتطف_قرآني\s+"([^"]+)"\s+موضعه\s+"([^"]+)"/gu
  )].map((match) => ({
    kind: 'QURAN_EXCERPT',
    text: cleanText(match[1], 500),
    location: cleanText(match[2], 120),
    executableRule: false
  }));
  const sunnahReferences = [...text.matchAll(
    /نص_من_السنة\s+"([^"]+)"\s+تخريجه\s+"([^"]+)"/gu
  )].map((match) => ({
    kind: 'AUTHENTIC_SUNNAH_TEXT',
    text: cleanText(match[1], 500),
    source: cleanText(match[2], 300),
    executableRule: false
  }));
  const hadithIsnadMatch = text.match(
    /إسناد_الحديث:[\s\S]*?الحديث\s+"([^"]+)"[\s\S]*?الراوي\s+"([^"]+)"[\s\S]*?المصدر\s+"([^"]+)"[\s\S]*?الرقم\s+"([^"]+)"[\s\S]*?الدرجة\s+"([^"]+)"[\s\S]*?حكم_المحدث\s+"([^"]+)"/u
  );
  const hadithIsnad = hadithIsnadMatch
    ? [{
        text: cleanText(hadithIsnadMatch[1], 500),
        narrator: cleanText(hadithIsnadMatch[2], 200),
        collection: cleanText(hadithIsnadMatch[3], 200),
        number: cleanText(hadithIsnadMatch[4], 80),
        grade: cleanText(hadithIsnadMatch[5], 100),
        grader: cleanText(hadithIsnadMatch[6], 200),
        automatedAuthentication: false,
        humanHadithReviewRequired: true
      }]
    : [];
  const contract = {
    language: 'ar',
    arabicPrimary: true,
    tongue: 'لسان عربي مبين',
    dsl: 'SHEIKHA_ARABIC_BOUNDARY_DSL_V1',
    capability: extract('قدرة'),
    boundary: extract('ضمن حد'),
    permission: extract('تحتاج إذن'),
    dataMinimization: extract('وتقليل بيانات'),
    evidence: extract('ودليل'),
    missingPermissionRule: /فإن\s+غاب\s+الإذن/u.test(text),
    decision,
    safeAlternative: extract('والبديل')
  };
  const missing = Object.entries({
    capability: contract.capability,
    boundary: contract.boundary,
    permission: contract.permission,
    evidence: contract.evidence,
    decision: contract.decision,
    safeAlternative: contract.safeAlternative
  }).filter(([, value]) => !value).map(([key]) => key);
  if (quranReferences.length < 18) missing.push('quranWrittenReferences');
  if (sunnahReferences.length < 2) missing.push('sunnahWrittenReferences');
  if (hadithIsnad.length < 1) missing.push('hadithIsnadMetadata');
  if (!/الفتوى_الآلية:\s*ممنوعة/u.test(text)) missing.push('automatedFatwaBoundary');
  if (!/المراجعة_الشرعية:\s*أهل_العلم/u.test(text)) missing.push('qualifiedScholarBoundary');
  if (!/عند_نقص_الدليل:\s*ابدأ_بحثا_منضبطا/u.test(text)) {
    missing.push('missingEvidenceResearchPolicy');
  }
  if (!/مرشح_المصدر_يصبح_VERIFIED_تلقائيا:\s*لا/u.test(text)) {
    missing.push('candidateVerificationBoundary');
  }
  if (!/البرهان_العقدي_الآلي:\s*ممنوع/u.test(text)) {
    missing.push('automatedAqidahProofBoundary');
  }

  return {
    system: 'SHEIKHA_ARABIC_BOUNDARY_DSL_V1',
    status: missing.length === 0 && contract.missingPermissionRule
      ? 'VALID_GOVERNED_CONTRACT'
      : 'INVALID_CONTRACT',
    contract,
    writtenReferences: {
      quran: quranReferences,
      authenticSunnah: sunnahReferences,
      hadithIsnad,
      quranCount: quranReferences.length,
      authenticSunnahCount: sunnahReferences.length,
      valuesReferenceOnly: true,
      referenceAndResearchUseOnly: true,
      missingEvidenceStartsGovernedResearch: true,
      candidateSourceBecomesVerifiedAutomatically: false,
      automatedTheologicalProof: false,
      automatedInterpretationOrFatwa: false,
      qualifiedScholarReviewRequired: true,
      sourceTextIntegrityRequiresHumanReview: true
    },
    missing,
    executableAuthorityGranted: false,
    automatedReligiousRuling: false
  };
}

function arabicDecisionView({
  decision,
  reason,
  evidenceStatus = null,
  boundaries = [],
  requiredEvidence = [],
  requiredApprovals = [],
  harmControls = [],
  safeAlternative = null,
  evidenceResearch = null
}) {
  return {
    'اللغة': 'العربية',
    'القرار': ARABIC_DECISIONS[decision] || decision,
    'رمز_القرار_التقني': decision,
    'السبب': ARABIC_REASONS[reason] || reason || 'لم يحدد سبب إضافي.',
    'حالة_الدليل': ARABIC_EVIDENCE_STATES[evidenceStatus] || evidenceStatus,
    'الحدود': boundaries.map((item) => ({
      'الحد': ARABIC_BOUNDARIES[item.type] || item.type,
      'رمز_الحد_التقني': item.type,
      'الحالة': ARABIC_BOUNDARY_STATES[item.state] || item.state
    })),
    'الأدلة_المطلوبة': requiredEvidence,
    'الموافقات_المطلوبة': requiredApprovals,
    'ضوابط_منع_الضرر': harmControls,
    'البديل_الآمن': safeAlternative?.action || null,
    'التنفيذ_تم': false,
    'القرار_النهائي_للإنسان': true,
    'الفتوى_الآلية': false,
    'المعرفات_التقنية_محفوظة_للتوافق': true
  };
}

function auditDecision(result) {
  auditSequence += 1;
  const record = {
    auditId: `ubb-${Date.now()}-${auditSequence}`,
    timestamp: new Date().toISOString(),
    capabilityId: result.capabilityId,
    decision: result.decision,
    evidenceStatus: result.evidenceStatus,
    boundaries: result.boundaries.map((item) => item.type),
    humanFinalDecision: true,
    externalWritePerformed: false,
    sensitiveInputStored: false
  };
  runtimeAudit.push(record);
  if (runtimeAudit.length > 100) runtimeAudit.shift();
  return record.auditId;
}

function decisionResult({
  request,
  capability,
  decision,
  reason,
  boundaryType,
  evidenceStatus,
  requiredEvidence = [],
  requiredApprovals = [],
  harmControls = [],
  safeAlternative = null,
  evidenceResearch = null,
  boundaries = []
}) {
  const reasoning = runReasoning({
    message: request.purpose || capability?.allowedPurpose || 'فحص المنفعة والحدود',
    mode: ['standard', 'pro', 'ultra'].includes(request.reasoningMode)
      ? request.reasoningMode
      : 'standard',
    ultraBudgetApproved: request.reasoningMode === 'ultra'
  });
  const primaryBoundaryState = decision === 'ALLOW'
    ? 'WITHIN_BOUNDARY'
    : decision === 'DENY'
      ? 'BEYOND_BOUNDARY'
      : 'AT_BOUNDARY';
  const resolvedBoundaries = unique([
    ...(capability?.applicableBoundaries || []),
    boundaryType,
    ...boundaries
  ]).map((type) => ({
    type,
    state: type === boundaryType ? primaryBoundaryState : 'WITHIN_BOUNDARY'
  }));
  const resolvedRequiredEvidence = unique(requiredEvidence);
  const resolvedRequiredApprovals = unique(requiredApprovals);
  const resolvedHarmControls = unique(harmControls);
  const resolvedSafeAlternative = safeAlternative ||
    safeAlternativeFor(boundaryType, reason, capability);
  const result = {
    system: 'SHEIKHA_UNIVERSAL_BENEFIT_BOUNDARY_GOVERNANCE_V1',
    language: 'ar',
    arabicPrimary: true,
    decision,
    reason,
    capabilityId: capability?.capabilityId || request.capabilityId || null,
    capabilityStatus: capability?.status || 'NOT_REGISTERED',
    benefit: {
      intendedPurpose: request.purpose || capability?.allowedPurpose || null,
      domains: unique([
        ...(capability?.potentialBenefit || []),
        ...request.benefitDomains
      ]),
      beneficiaries: request.beneficiaries,
      indicatorOnlyNotAbsoluteMoralJudgment: true,
      verifiedBenefitClaim: decision === 'ALLOW' && evidenceStatus === 'VERIFIED'
    },
    boundaries: resolvedBoundaries,
    evidenceStatus,
    requiredEvidence: resolvedRequiredEvidence,
    requiredApprovals: resolvedRequiredApprovals,
    harmControls: resolvedHarmControls,
    safeAlternative: resolvedSafeAlternative,
    evidenceResearch,
    arabic: arabicDecisionView({
      decision,
      reason,
      evidenceStatus,
      boundaries: resolvedBoundaries,
      requiredEvidence: resolvedRequiredEvidence,
      requiredApprovals: resolvedRequiredApprovals,
      harmControls: resolvedHarmControls,
      safeAlternative: resolvedSafeAlternative
    }),
    humanFinalDecision: true,
    humanFinalResponsibility: true,
    executionAllowed: false,
    decisionGrantsAuthorization: false,
    externalWritePerformed: false,
    permissionEscalationAllowed: false,
    safetyBypassAllowed: false,
    religiousRulingsAutomated: false,
    aiClaimsConsciousness: false,
    l24: {
      role: 'ADVISORY_ANALYSIS_AND_PROPOSALS',
      reasoningMode: reasoning.mode,
      status: reasoning.status,
      roleSlots: reasoning.orchestration.roleSlots,
      actualIndependentModelProcesses: reasoning.orchestration.actualIndependentModelProcesses,
      externalActionAllowed: false,
      kernelOrFirmwareAuthority: false,
      permissionEscalation: false
    },
    reusedFabrics: {
      publicBenefitRouter: publicBenefitRouter.status().system,
      evidenceRegistry: evidenceRegistry.status().system,
      reasoningEngine: reasoning.system
    }
  };
  result.auditId = auditDecision(result);
  return result;
}

function evaluateCapability(input = {}) {
  const request = normalizeInput(input);
  const capability = findCapability(request.capabilityId);
  const verifiedEvidence = request.evidence.filter((item) => item.verified);
  const requiredPermission = capability?.requiredPermission || [];
  const missingPermissions = requiredPermission.filter(
    (permission) => !request.permissions.includes(permission)
  );

  const result = (config) => decisionResult({
    request,
    capability,
    evidenceStatus: verifiedEvidence.length > 0 ? 'VERIFIED' : 'UNKNOWN',
    ...config
  });

  if (!capability) {
    return result({
      decision: 'DENY',
      reason: 'CAPABILITY_NOT_REGISTERED',
      boundaryType: 'PERMISSION_BOUNDARY',
      requiredEvidence: ['CAPABILITY_REGISTRATION_RECORD'],
      requiredApprovals: ['CAPABILITY_OWNER_REVIEW']
    });
  }

  const purpose = request.purpose.toLowerCase();
  const prohibitedSecurity = request.security.safetyFilterBypass ||
    request.security.exploitAgainstOthers ||
    request.security.credentialTheft ||
    request.security.persistence ||
    request.security.evasion ||
    request.security.destructivePayload ||
    /bypass safety|تجاوز (?:مرشحات|فلاتر|حماية)|سرقة (?:بيانات|اعتماد)|حمولة مدمرة/u.test(purpose);
  if (prohibitedSecurity) {
    return result({
      decision: 'DENY',
      reason: 'PROHIBITED_SECURITY_ACTION',
      boundaryType: 'SECURITY_BOUNDARY',
      requiredApprovals: ['AUTHORIZED_DEFENSIVE_SECURITY_OWNER'],
      harmControls: ['DEFENSE_ONLY', 'PRESERVE_EVIDENCE', 'RESPONSIBLE_REMEDIATION']
    });
  }

  if (request.religiousRuling) {
    return result({
      decision: 'DENY',
      reason: 'AUTOMATED_RELIGIOUS_RULING_PROHIBITED',
      boundaryType: 'RELIGIOUS_BOUNDARY',
      requiredApprovals: ['QUALIFIED_SCHOLAR_REVIEW'],
      harmControls: ['NO_AUTOMATED_FATWA', 'PRESENT_CONTEXT_WITHOUT_BINDING_RULING']
    });
  }

  if (Object.values(request.claims).some(Boolean)) {
    return result({
      decision: 'DENY',
      reason: 'PROHIBITED_AI_AUTHORITY_OR_UNSEEN_CLAIM',
      boundaryType: 'KNOWLEDGE_UNCERTAINTY_BOUNDARY',
      requiredEvidence: ['MEASUREMENT_OR_SCENARIO_EVIDENCE'],
      harmControls: ['NO_CONSCIOUSNESS_CLAIM', 'NO_INFALLIBILITY_CLAIM', 'NO_UNSEEN_KNOWLEDGE_CLAIM']
    });
  }

  if (request.target.kernelModification || request.target.firmwareModification) {
    return result({
      decision: 'DENY',
      reason: 'AI_DIRECT_KERNEL_OR_FIRMWARE_MODIFICATION_PROHIBITED',
      boundaryType: 'HUMAN_AUTHORITY_BOUNDARY',
      requiredApprovals: ['AUTHORIZED_HUMAN_MAINTAINER', 'CHANGE_CONTROL_REVIEW'],
      harmControls: ['READ_ONLY_REVIEW', 'SIGNED_STAGING_ARTIFACT', 'ROLLBACK_PLAN']
    });
  }

  if (request.externalWrite && !request.externalWriteAuthorized) {
    return result({
      decision: 'DENY',
      reason: 'EXTERNAL_WRITE_NOT_AUTHORIZED',
      boundaryType: 'PERMISSION_BOUNDARY',
      requiredApprovals: ['EXPLICIT_EXTERNAL_WRITE_AUTHORIZATION'],
      harmControls: ['READ_ONLY_MODE', 'NO_NETWORK_WRITE']
    });
  }

  if (missingPermissions.length > 0) {
    return result({
      decision: 'DENY',
      reason: 'REQUIRED_PERMISSION_MISSING',
      boundaryType: 'PERMISSION_BOUNDARY',
      requiredApprovals: missingPermissions,
      requiredEvidence: ['TRACEABLE_PERMISSION_RECORD']
    });
  }

  if (verifiedEvidence.length === 0) {
    const evidenceResearch = researchEvidence({
      query: request.purpose,
      requiredEvidence: capability.requiredEvidence,
      topics: request.evidenceTopics,
      religiousDomain: request.religiousEvidenceResearch,
      networkAvailable: request.networkAvailable,
      externalSearchAuthorized: request.externalResearchAuthorized
    });
    const religiousResearch = evidenceResearch.religiousGovernance
      ?.religiousDomain === true;
    return result({
      decision: 'REVIEW',
      reason: 'EVIDENCE_INSUFFICIENT_RESULT_UNKNOWN',
      boundaryType: 'EVIDENCE_BOUNDARY',
      evidenceStatus: 'UNKNOWN',
      requiredEvidence: capability.requiredEvidence,
      requiredApprovals: [
        'EVIDENCE_OWNER_REVIEW',
        ...(religiousResearch ? ['QUALIFIED_SCHOLAR_REVIEW'] : [])
      ],
      harmControls: [
        'NO_VERIFIED_CLAIM_WITHOUT_EVIDENCE',
        'SOURCE_PROVENANCE',
        'ISNAD_WHEN_APPLICABLE',
        'SEPARATE_TEXT_INTERPRETATION_AND_INFERENCE'
      ],
      safeAlternative: {
        type: 'EVIDENCE_RESEARCH_PLAN',
        action: 'أبْقِ النتيجة غير معلومة، وابحث في المصادر المسجلة ثم تحقق من النص والإسناد والسياق والاستدلال قبل اعتماد الإنسان المؤهل.',
        boundaryType: 'EVIDENCE_BOUNDARY',
        reason: 'EVIDENCE_INSUFFICIENT_RESULT_UNKNOWN',
        executionPerformed: false,
        externalWritePerformed: false
      },
      evidenceResearch
    });
  }

  if (request.legalMedicalOrFinancialJudgment) {
    return result({
      decision: 'REVIEW',
      reason: 'QUALIFIED_DOMAIN_REVIEW_REQUIRED',
      boundaryType: 'HIGH_IMPACT_DECISION_BOUNDARY',
      requiredApprovals: ['QUALIFIED_DOMAIN_PROFESSIONAL', 'ACCOUNTABLE_HUMAN_OWNER']
    });
  }

  if ((request.highImpact || capability.humanApprovalRequired) && !request.humanApproval) {
    return result({
      decision: 'REVIEW',
      reason: 'HUMAN_APPROVAL_REQUIRED',
      boundaryType: 'HIGH_IMPACT_DECISION_BOUNDARY',
      requiredApprovals: ['ACCOUNTABLE_HUMAN_APPROVAL'],
      harmControls: ['NO_HIGH_IMPACT_AUTOMATION']
    });
  }

  if (!request.toolAvailable) {
    return result({
      decision: 'REVIEW',
      reason: 'TOOL_UNAVAILABLE_REQUIREMENTS_REPORT_REQUIRED',
      boundaryType: 'SOFTWARE_BOUNDARY',
      requiredEvidence: ['TOOL_REQUIREMENTS_REPORT'],
      harmControls: ['NO_CAPABILITY_CLAIM_WITHOUT_TOOL']
    });
  }

  if (!request.target.hardwareSupported) {
    return result({
      decision: 'SANDBOX',
      reason: 'HARDWARE_SUPPORT_NOT_VERIFIED_USE_EMULATION',
      boundaryType: 'HARDWARE_BOUNDARY',
      requiredEvidence: ['NATIVE_HARDWARE_QUALIFICATION'],
      harmControls: ['EMULATION_ONLY', 'NO_NATIVE_SUPPORT_CLAIM']
    });
  }

  if (!request.networkAvailable) {
    return result({
      decision: 'SANDBOX',
      reason: 'NETWORK_UNAVAILABLE_USE_LOCAL_FIRST',
      boundaryType: 'NETWORK_BOUNDARY',
      harmControls: ['OFFLINE_MODE', 'LOCAL_FIRST', 'DEFER_EXTERNAL_SYNC']
    });
  }

  if (request.privacy.personalData &&
      (!request.privacy.dataMinimized || !request.privacy.retentionDefined)) {
    return result({
      decision: 'SANDBOX',
      reason: 'PERSONAL_DATA_REQUIRES_MINIMIZATION',
      boundaryType: 'PRIVACY_BOUNDARY',
      requiredEvidence: ['DATA_MINIMIZATION_RECORD', 'RETENTION_POLICY'],
      harmControls: ['MINIMIZE_DATA', 'ANONYMIZE_WHEN_POSSIBLE', 'DEFINE_RETENTION']
    });
  }

  if (!request.resources.withinBudget) {
    return result({
      decision: 'SANDBOX',
      reason: 'RESOURCE_OR_COST_BOUNDARY_REACHED',
      boundaryType: 'RESOURCE_AND_COST_BOUNDARY',
      requiredApprovals: ['BUDGET_OWNER_APPROVAL'],
      harmControls: ['BUDGET_GATE', 'RESOURCE_OPTIMIZER', 'SMALL_SCALE_PROBE']
    });
  }

  if (capability.domain === 'DEFENSIVE_SECURITY') {
    if (!request.security.defensiveOnly || !request.security.authorizedScope) {
      return result({
        decision: 'DENY',
        reason: 'DEFENSIVE_SECURITY_SCOPE_NOT_AUTHORIZED',
        boundaryType: 'SECURITY_BOUNDARY',
        requiredApprovals: ['AUTHORIZED_SECURITY_SCOPE'],
        harmControls: ['DEFENSE_ONLY', 'NO_EXPLOITATION_AGAINST_OTHERS']
      });
    }
    return result({
      decision: 'SANDBOX',
      reason: 'AUTHORIZED_DEFENSIVE_SECURITY_SANDBOX_ONLY',
      boundaryType: 'SECURITY_BOUNDARY',
      harmControls: ['DEFENSE_ONLY', 'AUTHORIZED_SCOPE_ONLY', 'PRESERVE_EVIDENCE', 'RESPONSIBLE_REMEDIATION']
    });
  }

  if (['HIGH', 'CRITICAL'].includes(request.riskLevel)) {
    return result({
      decision: 'SANDBOX',
      reason: 'ELEVATED_RISK_REQUIRES_ISOLATION',
      boundaryType: 'SAFETY_BOUNDARY',
      requiredApprovals: ['RISK_OWNER_REVIEW'],
      harmControls: ['SANDBOX', 'SIMULATION', 'READ_ONLY', 'ROLLBACK_READY']
    });
  }

  return result({
    decision: 'ALLOW',
    reason: 'WITHIN_BOUNDARY_VERIFIED_FOR_GOVERNED_ROUTING',
    boundaryType: capability.applicableBoundaries[0] || 'EVIDENCE_BOUNDARY',
    harmControls: capability.mitigation,
    safeAlternative: {
      type: 'NOT_REQUIRED',
      action: 'تابع إلى بوابة التفويض والتنفيذ المنفصلة؛ هذا التقييم لا يمنح الإذن بذاته.',
      boundaryType: null,
      reason: null,
      executionPerformed: false,
      externalWritePerformed: false
    }
  });
}

function normalizeCapacityInput(input = {}) {
  const resource = input.resource && typeof input.resource === 'object'
    ? input.resource
    : {};
  const requestedAmount = Number(resource.requestedAmount ?? input.requestedAmount);
  const availableAmount = Number(resource.availableAmount ?? input.availableAmount);
  const declaredBoundaryScope = cleanText(
    input.boundaryScope || 'INTERNAL',
    40
  ).toUpperCase();
  const externalConnectionRequested = input.externalConnectionRequested === true;
  const boundaryScope = externalConnectionRequested && declaredBoundaryScope === 'INTERNAL'
    ? 'CROSS_BOUNDARY'
    : declaredBoundaryScope;
  const resourceClass = cleanText(
    resource.class || input.resourceClass || 'COMPUTE',
    60
  ).toUpperCase();

  return {
    capabilityId: cleanText(input.capabilityId, 160),
    purpose: cleanText(input.purpose, 1200),
    boundaryScope,
    declaredBoundaryScope,
    resource: {
      resourceId: cleanText(resource.resourceId || input.resourceId, 160),
      name: cleanText(resource.name || input.resourceName, 300),
      class: resourceClass,
      requestedAmount: Number.isFinite(requestedAmount) ? requestedAmount : null,
      availableAmount: Number.isFinite(availableAmount) ? availableAmount : null,
      unit: cleanText(resource.unit || input.unit, 80),
      owner: cleanText(resource.owner || input.owner, 200),
      location: cleanText(resource.location || input.location, 200),
      timeWindow: cleanText(resource.timeWindow || input.timeWindow, 200)
    },
    evidence: normalizeEvidence(input.evidence),
    ownerPermissionGranted: input.ownerPermissionGranted === true,
    ownerPermissionReference: cleanText(input.ownerPermissionReference, 200),
    humanConsentGranted: input.humanConsentGranted === true,
    humanWithdrawalRight: input.humanWithdrawalRight === true,
    nonHarmConfirmed: input.nonHarmConfirmed === true,
    knownHarm: input.knownHarm === true,
    externalConnectionRequested,
    externalConnectionAuthorized: input.externalConnectionAuthorized === true,
    humanApproval: input.humanApproval === true,
    requestsHalalOrHaramClassification:
      input.requestsHalalOrHaramClassification === true,
    qualifiedScholarReviewReference:
      cleanText(input.qualifiedScholarReviewReference, 300)
  };
}

function capacityDecision({
  request,
  capability,
  decision,
  reason,
  boundaryType,
  requiredEvidence = [],
  requiredApprovals = [],
  harmControls = [],
  safeAlternative = null,
  evidenceResearch = null
}) {
  const evidenceStatus = request.evidence.some((item) => item.verified)
    ? 'VERIFIED'
    : 'UNKNOWN';
  const state = decision === 'ALLOW'
    ? 'WITHIN_BOUNDARY'
    : decision === 'DENY'
      ? 'BEYOND_BOUNDARY'
      : 'AT_BOUNDARY';
  const boundaries = [{ type: boundaryType, state }];
  const resolvedSafeAlternative = safeAlternative ||
    safeAlternativeFor(boundaryType, reason, capability);
  const utilizationRatio = request.resource.availableAmount > 0 &&
    request.resource.requestedAmount !== null
    ? request.resource.requestedAmount / request.resource.availableAmount
    : null;
  const result = {
    system: 'SHEIKHA_PERMITTED_CAPACITY_CLASSIFIER_V1',
    status: decision === 'ALLOW'
      ? 'CAPACITY_PLAN_READY'
      : decision === 'SANDBOX'
        ? 'CAPACITY_SIMULATION_REQUIRED'
        : decision === 'REVIEW'
          ? 'CAPACITY_REVIEW_REQUIRED'
          : 'CAPACITY_USE_DENIED',
    language: 'ar',
    arabicPrimary: true,
    decision,
    reason,
    capabilityId: capability?.capabilityId || request.capabilityId || null,
    capabilityName: capability?.name || null,
    boundaryScope: request.boundaryScope,
    declaredBoundaryScope: request.declaredBoundaryScope,
    boundaryScopeArabic:
      ARABIC_BOUNDARY_SCOPES[request.boundaryScope] || request.boundaryScope,
    boundaries,
    resource: {
      ...request.resource,
      arabicClass: ARABIC_RESOURCE_CLASSES[request.resource.class] ||
        request.resource.class,
      measuredOrDeclaredWithEvidence: evidenceStatus === 'VERIFIED',
      utilizationRatio,
      requestedAmountExceedsAvailable:
        utilizationRatio !== null && utilizationRatio > 1,
      capacityClaimVerified: decision === 'ALLOW' && evidenceStatus === 'VERIFIED'
    },
    operationalPotential: {
      arabicName: 'المقدرة التشغيلية النافعة',
      conversionMode: 'GOVERNED_CAPACITY_PLAN_ONLY',
      physicalEnergyProduced: false,
      physicalEnergyClaimed: false,
      physicalEnergyRequiresEngineeringMeasurement: true,
      metaphoricalEnergyMeansOperationalCapacity: true,
      requestedAmount: request.resource.requestedAmount,
      availableAmount: request.resource.availableAmount,
      unit: request.resource.unit || null
    },
    vision: 'توجيه المقدرات المأذونة والموثقة إلى منفعة آمنة عادلة قابلة للقياس.',
    mission: 'قياس المقدرة وحفظ الحقوق والإذن ومنع الضرر ثم إعداد اتصال محكوم قابل للتدقيق والرجوع.',
    goals: [
      'إثبات الملكية والإذن والرضا عند الحاجة.',
      'قياس المقدرة بوحدة ودليل معلومين.',
      'عدم تجاوز المقدرة المتاحة أو الميزانية.',
      'اختيار اتصال داخلي أو خارجي بأقل صلاحية.',
      'حفظ كرامة الإنسان وحقه في الانسحاب.',
      'قياس الأثر وإتاحة الإيقاف والرجوع.'
    ],
    evidenceStatus,
    requiredEvidence: unique(requiredEvidence),
    requiredApprovals: unique(requiredApprovals),
    harmControls: unique(harmControls),
    safeAlternative: resolvedSafeAlternative,
    evidenceResearch,
    religiousBoundary: {
      divineLimitsDeterminedBySoftware: false,
      softwareDeclaresHalalOrHaram: false,
      religiousStatus: request.requestsHalalOrHaramClassification
        ? 'QUALIFIED_SCHOLAR_REVIEW_REQUIRED'
        : 'NOT_DETERMINED_BY_SOFTWARE',
      qualifiedScholarReviewReference:
        request.qualifiedScholarReviewReference || null,
      softwareRepresentsPropheticMission: false,
      softwarePerformsIslamImanOrIhsan: false,
      religiousGeneticClassificationAllowed: false
    },
    humanDignity: {
      humanIsExploitableResource: false,
      humanParticipationIsVoluntary: request.resource.class === 'HUMAN_PARTICIPATION'
        ? request.humanConsentGranted
        : null,
      withdrawalRightRequired: request.resource.class === 'HUMAN_PARTICIPATION',
      coercionAllowed: false,
      unlawfulDiscriminationAllowed: false
    },
    executionAllowed: false,
    connectionExecuted: false,
    externalWritePerformed: false,
    decisionGrantsAuthorization: false,
    permissionEscalationAllowed: false,
    humanFinalDecision: true,
    humanFinalResponsibility: true,
    arabic: arabicDecisionView({
      decision,
      reason,
      evidenceStatus,
      boundaries,
      requiredEvidence: unique(requiredEvidence),
      requiredApprovals: unique(requiredApprovals),
      harmControls: unique(harmControls),
      safeAlternative: resolvedSafeAlternative
    })
  };
  result.auditId = auditDecision(result);
  return result;
}

function classifyPermittedCapacity(input = {}) {
  const request = normalizeCapacityInput(input);
  const capability = findCapability(request.capabilityId);
  const scopeValid = BOUNDARY_SCOPES.includes(request.boundaryScope);
  const resourceClassValid = RESOURCE_CLASSES.includes(request.resource.class);
  const resourceIdentityValid = Boolean(
    request.resource.resourceId && request.resource.owner
  );
  const amountsValid = request.resource.requestedAmount !== null &&
    request.resource.availableAmount !== null &&
    request.resource.requestedAmount > 0 &&
    request.resource.availableAmount > 0 &&
    Boolean(request.resource.unit);
  const result = (config) => capacityDecision({ request, capability, ...config });

  if (!capability || !request.purpose || !scopeValid || !resourceClassValid ||
      !resourceIdentityValid || !amountsValid) {
    return result({
      decision: 'REVIEW',
      reason: 'CAPACITY_INPUT_INVALID',
      boundaryType: 'EVIDENCE_BOUNDARY',
      requiredEvidence: [
        'REGISTERED_CAPABILITY',
        'RESOURCE_ID',
        'RESOURCE_OWNER',
        'RESOURCE_CLASS',
        'AMOUNT',
        'UNIT'
      ]
    });
  }

  if (request.knownHarm) {
    return result({
      decision: 'DENY',
      reason: 'KNOWN_HARM_PROHIBITS_CAPACITY_USE',
      boundaryType: 'SAFETY_BOUNDARY',
      harmControls: ['STOP', 'WARNING', 'RECOVERY', 'HUMAN_HANDOFF']
    });
  }

  if (request.requestsHalalOrHaramClassification) {
    return result({
      decision: 'REVIEW',
      reason: 'SOFTWARE_CANNOT_DECLARE_HALAL_OR_HARAM',
      boundaryType: 'RELIGIOUS_BOUNDARY',
      requiredApprovals: ['QUALIFIED_SCHOLAR_REVIEW'],
      harmControls: ['NO_AUTOMATED_HALAL_HARAM_CLASSIFICATION', 'PRESERVE_SOURCE_CONTEXT']
    });
  }

  if (request.resource.class === 'HUMAN_PARTICIPATION' &&
      (!request.humanConsentGranted || !request.humanWithdrawalRight)) {
    return result({
      decision: 'DENY',
      reason: 'HUMAN_PARTICIPATION_REQUIRES_CONSENT',
      boundaryType: 'HUMAN_AUTHORITY_BOUNDARY',
      requiredApprovals: ['EXPLICIT_HUMAN_CONSENT', 'WITHDRAWAL_RIGHT'],
      harmControls: ['NO_COERCION', 'HUMAN_DIGNITY', 'NO_RELIGIOUS_OR_GENETIC_CLASSIFICATION']
    });
  }

  if (!request.ownerPermissionGranted || !request.ownerPermissionReference) {
    return result({
      decision: 'DENY',
      reason: 'RESOURCE_OWNER_PERMISSION_REQUIRED',
      boundaryType: 'PERMISSION_BOUNDARY',
      requiredApprovals: ['RESOURCE_OWNER_PERMISSION'],
      requiredEvidence: ['TRACEABLE_PERMISSION_REFERENCE']
    });
  }

  if (!request.evidence.some((item) => item.verified)) {
    const requiredEvidence = [
      'VERIFIED_CAPACITY_MEASUREMENT',
      'SOURCE_AND_TIMESTAMP'
    ];
    const evidenceResearch = researchEvidence({
      query: `قياس المقدرة التشغيلية ${request.resource.name || request.resource.resourceId}`,
      requiredEvidence,
      religiousDomain: false,
      networkAvailable: false,
      externalSearchAuthorized: false
    });
    return result({
      decision: 'REVIEW',
      reason: 'CAPACITY_EVIDENCE_REQUIRED',
      boundaryType: 'EVIDENCE_BOUNDARY',
      requiredEvidence,
      harmControls: [
        'MEASURE_WITH_DOMAIN_TOOL',
        'RECORD_SOURCE_AND_TIMESTAMP',
        'DO_NOT_USE_SCRIPTURE_AS_MEASUREMENT_SUBSTITUTE'
      ],
      safeAlternative: {
        type: 'EVIDENCE_RESEARCH_PLAN',
        action: 'أبق المقدرة غير موثقة، وحدد أداة القياس وخط الأساس والمصدر والزمن ثم اعرض النتيجة على مالك الدليل.',
        boundaryType: 'EVIDENCE_BOUNDARY',
        reason: 'CAPACITY_EVIDENCE_REQUIRED',
        executionPerformed: false,
        externalWritePerformed: false
      },
      evidenceResearch
    });
  }

  if (!request.nonHarmConfirmed) {
    return result({
      decision: 'SANDBOX',
      reason: 'NON_HARM_NOT_VERIFIED_USE_SIMULATION',
      boundaryType: 'SAFETY_BOUNDARY',
      requiredEvidence: ['NON_HARM_ASSESSMENT'],
      harmControls: ['SIMULATION_ONLY', 'READ_ONLY', 'ROLLBACK_READY']
    });
  }

  if (request.resource.requestedAmount > request.resource.availableAmount) {
    return result({
      decision: 'SANDBOX',
      reason: 'REQUEST_EXCEEDS_AVAILABLE_CAPACITY',
      boundaryType: 'RESOURCE_AND_COST_BOUNDARY',
      requiredApprovals: ['RESOURCE_OWNER_REVIEW'],
      harmControls: ['CAP_AT_VERIFIED_AVAILABLE_AMOUNT', 'BUDGET_GATE', 'SMALL_SCALE_PROBE']
    });
  }

  const externalScope = ['EXTERNAL', 'CROSS_BOUNDARY'].includes(request.boundaryScope) ||
    request.externalConnectionRequested;
  if (externalScope &&
      (!request.externalConnectionAuthorized || !request.humanApproval)) {
    return result({
      decision: 'REVIEW',
      reason: 'EXTERNAL_INTEGRATION_REQUIRES_APPROVAL',
      boundaryType: 'NETWORK_BOUNDARY',
      requiredApprovals: ['EXTERNAL_CONNECTION_AUTHORIZATION', 'ACCOUNTABLE_HUMAN_APPROVAL'],
      harmControls: ['LEAST_PRIVILEGE', 'ENCRYPTED_CHANNEL', 'RATE_LIMIT', 'ROLLBACK_READY']
    });
  }

  return result({
    decision: 'ALLOW',
    reason: 'CAPACITY_PLAN_READY_WITHIN_GOVERNED_BOUNDARY',
    boundaryType: externalScope ? 'NETWORK_BOUNDARY' : 'SOFTWARE_BOUNDARY',
    harmControls: [
      'MEASURED_CAPACITY',
      'OWNER_PERMISSION',
      'NO_HARM',
      'LEAST_PRIVILEGE',
      'AUDIT_AND_ROLLBACK'
    ],
    safeAlternative: {
      type: 'NOT_REQUIRED',
      action: 'مرر الخطة إلى بوابة التفويض المنفصلة؛ لم ينفذ اتصال أو نقل أو استهلاك مورد.',
      boundaryType: null,
      reason: null,
      executionPerformed: false,
      externalWritePerformed: false
    }
  });
}

function planCapacityIntegration(input = {}) {
  const classification = classifyPermittedCapacity(input);
  const ready = classification.decision === 'ALLOW';
  const transportByScope = {
    INTERNAL: 'LOCAL_GOVERNED_RUNTIME_BUS',
    EXTERNAL: 'AUTHENTICATED_ENCRYPTED_API_GATEWAY',
    CROSS_BOUNDARY: 'GOVERNED_ADAPTER_AND_POLICY_GATEWAY'
  };

  return {
    system: 'SHEIKHA_CAPACITY_CONNECTION_AND_INTEGRATION_PLANNER_V1',
    status: ready ? 'INTEGRATION_PLAN_READY' : 'INTEGRATION_PLAN_BLOCKED_BY_GATE',
    language: 'ar',
    arabicPrimary: true,
    decision: classification.decision,
    classification,
    connection: {
      scope: classification.boundaryScope,
      scopeArabic: classification.boundaryScopeArabic,
      transport: transportByScope[classification.boundaryScope] || null,
      connectionExecuted: false,
      dataTransferred: false,
      resourceConsumed: false,
      externalWritePerformed: false,
      leastPrivilegeRequired: true,
      encryptionRequiredForExternalConnection: true,
      identityAndOwnershipVerificationRequired: true,
      auditRequired: true,
      rollbackRequired: true
    },
    steps: [
      'تحقق من الهوية والملكية والصفة.',
      'تحقق من الإذن والرضا والنطاق والمدة.',
      'ثبت القياس والوحدة والدليل وخط الأساس.',
      'حدد عقد المدخلات والمخرجات والخصوصية.',
      'اختبر في العزل أو المحاكاة.',
      'طبق أقل صلاحية والتشفير وحدود المعدل.',
      'اعرض الخطة على الإنسان المسؤول.',
      'نفذ عبر مسار منفصل مأذون مع المراقبة.',
      'قس الأثر وأوقف عند الضرر.',
      'احفظ التدقيق وخطة الرجوع.'
    ],
    vision: classification.vision,
    mission: classification.mission,
    goals: classification.goals,
    humanFinalDecision: true,
    humanFinalResponsibility: true,
    executionAllowed: false,
    connectionExecuted: false,
    externalWritePerformed: false,
    decisionGrantsAuthorization: false,
    permissionEscalationAllowed: false
  };
}

function transformBoundary(input = {}) {
  const boundaryType = cleanText(input.boundaryType || input.boundary, 120).toUpperCase();
  const state = cleanText(input.state || 'AT_BOUNDARY', 40).toUpperCase();
  const registeredBoundary = registry().boundaries.find((item) => item.type === boundaryType);
  if (!registeredBoundary || !BOUNDARY_STATES.includes(state)) {
    const safeAlternative = safeAlternativeFor(
      registeredBoundary ? boundaryType : 'PERMISSION_BOUNDARY',
      'VALID_REGISTERED_BOUNDARY_REQUIRED'
    );
    const boundaries = [{
      type: registeredBoundary ? boundaryType : 'PERMISSION_BOUNDARY',
      state: 'BEYOND_BOUNDARY'
    }];
    return {
      system: 'SHEIKHA_BOUNDARY_TO_BENEFIT_TRANSFORMER_V1',
      language: 'ar',
      arabicPrimary: true,
      status: 'INVALID_BOUNDARY_REQUEST',
      decision: 'DENY',
      boundaryType: boundaryType || null,
      state,
      humanFinalDecision: true,
      externalWritePerformed: false,
      safeAlternative,
      arabic: arabicDecisionView({
        decision: 'DENY',
        reason: 'VALID_REGISTERED_BOUNDARY_REQUIRED',
        boundaries,
        safeAlternative
      })
    };
  }

  const transformation = findTransformation(boundaryType);
  const decision = state === 'WITHIN_BOUNDARY'
    ? 'ALLOW'
    : state === 'BEYOND_BOUNDARY'
      ? 'DENY'
      : transformation?.atBoundaryDecision || 'REVIEW';
  const safeAlternative = safeAlternativeFor(boundaryType, `BOUNDARY_STATE_${state}`);
  const boundaries = [{ type: boundaryType, state }];
  return {
    system: 'SHEIKHA_BOUNDARY_TO_BENEFIT_TRANSFORMER_V1',
    language: 'ar',
    arabicPrimary: true,
    status: 'BOUNDARY_TRANSFORMED_TO_SAFE_PATH',
    decision,
    boundaryType,
    state,
    controls: transformation?.controls || [],
    safeAlternative,
    arabic: arabicDecisionView({
      decision,
      reason: `BOUNDARY_STATE_${state}`,
      boundaries,
      harmControls: transformation?.controls || [],
      safeAlternative
    }),
    humanFinalDecision: true,
    executionAllowed: false,
    decisionGrantsAuthorization: false,
    externalWritePerformed: false,
    permissionEscalationAllowed: false
  };
}

function evidence() {
  return {
    system: 'SHEIKHA_UNIVERSAL_BENEFIT_EVIDENCE_PLANE_V1',
    language: 'ar',
    arabicPrimary: true,
    status: 'ACTIVE_BOUNDED_IN_MEMORY_AUDIT',
    arabic: {
      'الاسم': 'سجل أدلة منظومة الخير والنفع والحدود',
      'الحالة': 'نشط بسجل محدود داخل الذاكرة',
      'الكتابة_الخارجية': false,
      'حفظ_حمولة_الطلب_الحساسة': false,
      'المسؤولية_النهائية_للإنسان': true
    },
    evidenceRegistry: evidenceRegistry.status(),
    records: runtimeAudit.slice(-50),
    recordsCount: runtimeAudit.length,
    writesToExternalSystems: false,
    sensitiveRequestPayloadsStored: false,
    persistence: 'IN_MEMORY_ONLY',
    humanFinalResponsibility: true
  };
}

function status() {
  const currentRegistry = registry();
  const transformations = transformationRegistry();
  const verificationReport = readJson(REPORT_PATH, {});
  return {
    system: 'SHEIKHA_UNIVERSAL_BENEFIT_BOUNDARY_GOVERNANCE_V1',
    language: 'ar',
    arabicPrimary: true,
    arabicName: 'منظومة شيخة الشاملة للخير والنفع والحدود',
    status: verificationReport.status === 'VERIFIED_ACTIVE'
      ? 'VERIFIED_ACTIVE'
      : currentRegistry.status === 'ACTIVE' && transformations.status === 'ACTIVE'
        ? 'ACTIVE_WITH_RUNTIME_VERIFICATION'
        : 'PARTIAL',
    mode: 'PERMITTED_CAPABILITY_TO_VERIFIED_PUBLIC_BENEFIT',
    capabilitiesRegistered: currentRegistry.capabilities.length,
    boundariesRegistered: currentRegistry.boundaries.length,
    benefitDomainsRegistered: currentRegistry.benefitDomains.length,
    architectureComponentsRegistered:
      currentRegistry.architectureComponents?.length || 0,
    boundaryScopesRegistered:
      currentRegistry.operationalBoundaryScopes?.length || 0,
    resourceClassesRegistered: currentRegistry.resourceClasses?.length || 0,
    evidenceResearchSourcesRegistered:
      currentRegistry.valuesReference?.references?.length || 0,
    evidenceArgumentMapsRegistered:
      currentRegistry.evidenceResearchPolicy?.argumentMaps?.length || 0,
    priorityPolicy: currentRegistry.priorityPolicy || {},
    decisions: DECISIONS,
    boundaryStates: BOUNDARY_STATES,
    boundaryScopes: BOUNDARY_SCOPES,
    resourceClasses: RESOURCE_CLASSES,
    capacityGovernance: currentRegistry.capacityGovernance || {},
    evidenceResearchPolicy: currentRegistry.evidenceResearchPolicy || {},
    integrations: currentRegistry.integrations || [],
    routes: {
      status: '/api/governance/universal-benefit/status',
      evaluate: '/api/governance/universal-benefit/evaluate',
      transformBoundary: '/api/governance/universal-benefit/transform-boundary',
      classifyCapacity: '/api/governance/universal-benefit/classify-capacity',
      planIntegration: '/api/governance/universal-benefit/plan-integration',
      researchEvidence: '/api/governance/universal-benefit/research-evidence',
      capabilities: '/api/governance/universal-benefit/capabilities',
      evidence: '/api/governance/universal-benefit/evidence'
    },
    governance: {
      religiousRulingsAutomated: false,
      safetyBypassAllowed: false,
      permissionEscalationAllowed: false,
      humanFinalResponsibility: true,
      valuesReferenceExecutableAuthority: false,
      benefitIndicatorIsAbsoluteMoralJudgment: false,
      claimPolicy: 'لا ادعاء بمنفعة أو سلامة أو امتثال دون دليل ومراجعة بشرية واجبة.',
      writtenQuranSunnahValuesReference: true,
      quranSunnahTextBecomesAutomatedRuling: false,
      divineLimitsDeterminedBySoftware: false,
      halalOrHaramDeclaredBySoftware: false,
      operationalBoundariesAreReligiousRulings: false,
      humanParticipationIsExploitableResource: false,
      connectionPlannerExecutesConnections: false,
      physicalEnergyClaimRequiresEngineeringMeasurement: true,
      missingEvidenceStartsGovernedResearch: true,
      candidateSourceBecomesVerifiedAutomatically: false,
      automatedTheologicalProofOrAqidahJudgment: false,
      religiousEvidenceRequiresQualifiedScholarReview: true
    }
  };
}

function resetRuntimeAudit() {
  runtimeAudit.length = 0;
  auditSequence = 0;
}

module.exports = {
  BOUNDARY_SCOPES,
  BOUNDARY_STATES,
  DECISIONS,
  RESOURCE_CLASSES,
  classifyPermittedCapacity,
  evaluateCapability,
  evidence,
  parseArabicBoundaryContract,
  planCapacityIntegration,
  researchEvidence,
  registry,
  resetRuntimeAudit,
  status,
  transformBoundary,
  transformationRegistry
};
