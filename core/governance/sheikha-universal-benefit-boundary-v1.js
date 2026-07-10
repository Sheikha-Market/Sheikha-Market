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
  EVIDENCE_INSUFFICIENT_RESULT_UNKNOWN: 'الدليل غير كاف؛ النتيجة غير معلومة ولا يجوز تخمينها.',
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
  BOUNDARY_STATE_BEYOND_BOUNDARY: 'الطلب خارج الحد؛ منع التنفيذ وأنتج بديل آمن.'
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

function parseArabicBoundaryContract(source) {
  const text = String(source || '').slice(0, 8192);
  const extract = (label) => {
    const match = text.match(new RegExp(`${label}\\s+"([^"]+)"`, 'u'));
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
  if (quranReferences.length < 6) missing.push('quranWrittenReferences');
  if (sunnahReferences.length < 1) missing.push('sunnahWrittenReferences');
  if (!/الفتوى_الآلية:\s*ممنوعة/u.test(text)) missing.push('automatedFatwaBoundary');
  if (!/المراجعة_الشرعية:\s*أهل_العلم/u.test(text)) missing.push('qualifiedScholarBoundary');

  return {
    system: 'SHEIKHA_ARABIC_BOUNDARY_DSL_V1',
    status: missing.length === 0 && contract.missingPermissionRule
      ? 'VALID_GOVERNED_CONTRACT'
      : 'INVALID_CONTRACT',
    contract,
    writtenReferences: {
      quran: quranReferences,
      authenticSunnah: sunnahReferences,
      quranCount: quranReferences.length,
      authenticSunnahCount: sunnahReferences.length,
      valuesReferenceOnly: true,
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
  safeAlternative = null
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
    return result({
      decision: 'REVIEW',
      reason: 'EVIDENCE_INSUFFICIENT_RESULT_UNKNOWN',
      boundaryType: 'EVIDENCE_BOUNDARY',
      evidenceStatus: 'UNKNOWN',
      requiredEvidence: capability.requiredEvidence,
      requiredApprovals: ['EVIDENCE_OWNER_REVIEW'],
      harmControls: ['NO_VERIFIED_CLAIM_WITHOUT_EVIDENCE']
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
    priorityPolicy: currentRegistry.priorityPolicy || {},
    decisions: DECISIONS,
    boundaryStates: BOUNDARY_STATES,
    integrations: currentRegistry.integrations || [],
    routes: {
      status: '/api/governance/universal-benefit/status',
      evaluate: '/api/governance/universal-benefit/evaluate',
      transformBoundary: '/api/governance/universal-benefit/transform-boundary',
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
      quranSunnahTextBecomesAutomatedRuling: false
    }
  };
}

function resetRuntimeAudit() {
  runtimeAudit.length = 0;
  auditSequence = 0;
}

module.exports = {
  BOUNDARY_STATES,
  DECISIONS,
  evaluateCapability,
  evidence,
  parseArabicBoundaryContract,
  registry,
  resetRuntimeAudit,
  status,
  transformBoundary,
  transformationRegistry
};
