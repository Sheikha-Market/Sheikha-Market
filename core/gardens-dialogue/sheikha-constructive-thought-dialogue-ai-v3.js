'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  buildDialoguePlan,
  buildStatus: buildDialogueRuntimeStatus,
  listReligiousMethodReferences,
  listThoughtFrameworks,
  matchThoughtFrameworks
} = require(
  './sheikha-gardens-knowledge-dialogue-runtime-v2'
);
const {
  executeIntelligenceRequest
} = require(
  '../intelligence-apex/' +
    'sheikha-intelligence-capability-apex-v1'
);

const ROOT = path.resolve(__dirname, '..', '..');
const SYSTEM = 'SHEIKHA_CONSTRUCTIVE_THOUGHT_DIALOGUE_AI_V3';

const FILES = Object.freeze({
  contract:
    'runtime/jannat-gardens/v3/contracts/' +
    'sheikha-constructive-thought-dialogue-ai-v3-contract.json',
  matrix:
    'runtime/jannat-gardens/v3/registries/' +
    'sheikha-thought-dialogue-matrix-v3.json',
  report:
    'runtime/jannat-gardens/v3/' +
    'sheikha-constructive-thought-dialogue-ai-v3-report.json',
  integrationEvidence:
    'runtime/jannat-gardens/v3/evidence/' +
    'sheikha-thought-dialogue-integration-selftest-v3.json',
  intelligenceReport:
    'runtime/intelligence-capability-apex/v1/' +
    'sheikha-intelligence-capability-apex-v1-report.json'
});

const AUDIENCE_CONTEXTS = Object.freeze({
  GENERAL_PUBLIC: Object.freeze({
    id: 'GENERAL_PUBLIC',
    nameAr: 'الجمهور العام',
    styleAr: 'لغة عربية واضحة، وتعريف المصطلح قبل استعماله.',
    evidenceDepthAr: 'دليل موجز مع بيان حدود اليقين.',
    openingAr: 'ابدأ بالمشترك الإنساني والمصلحة العامة.'
  }),
  LEARNER: Object.freeze({
    id: 'LEARNER',
    nameAr: 'المتعلم',
    styleAr: 'شرح متدرج، ومثال واحد، وسؤال تحقق في كل مرحلة.',
    evidenceDepthAr: 'فرّق بوضوح بين التعريف والمثال والدليل.',
    openingAr: 'ابدأ بسؤال يحدد المعرفة السابقة دون اختبار للشخص.'
  }),
  TECHNICAL_PROFESSIONAL: Object.freeze({
    id: 'TECHNICAL_PROFESSIONAL',
    nameAr: 'الممارس التقني',
    styleAr: 'مصطلحات منضبطة، وافتراضات معلنة، وآثار قابلة للقياس.',
    evidenceDepthAr: 'اذكر المنهج والمؤشر ومصدر البيانات والقيود.',
    openingAr: 'ابدأ بتعريف المشكلة والواجهة والنتيجة المتوقعة.'
  }),
  RESEARCHER: Object.freeze({
    id: 'RESEARCHER',
    nameAr: 'الباحث',
    styleAr: 'تعريفات تشغيلية، وحجج متقابلة، وفجوات بحثية.',
    evidenceDepthAr: 'اطلب المصدر الأولي والمنهج والدليل المضاد.',
    openingAr: 'ابدأ بتحديد الدعوى القابلة للاختبار وسياقها التاريخي.'
  }),
  COMMUNITY_FACILITATOR: Object.freeze({
    id: 'COMMUNITY_FACILITATOR',
    nameAr: 'ميسر الحوار المجتمعي',
    styleAr: 'لغة جامعة تحفظ الكرامة وتفصل الأشخاص عن الأفكار.',
    evidenceDepthAr: 'اعرض مواضع الاتفاق والخلاف ومصالح الأطراف.',
    openingAr: 'ابدأ بقواعد الحوار والهدف المشترك والحق في الاعتراض.'
  }),
  DECISION_REVIEWER: Object.freeze({
    id: 'DECISION_REVIEWER',
    nameAr: 'مراجع القرار',
    styleAr: 'بدائل ومخاطر وحقوق ومؤشرات وتوقف وتعاف.',
    evidenceDepthAr: 'اطلب أثرًا قابلاً للقياس ومراجعة مستقلة.',
    openingAr: 'ابدأ بحدود الصلاحية والقرار المطلوب ومن يتحمل أثره.'
  })
});

const AUDIENCE_ALIASES = Object.freeze({
  GENERAL: 'GENERAL_PUBLIC',
  PUBLIC: 'GENERAL_PUBLIC',
  STUDENT: 'LEARNER',
  TECHNICAL: 'TECHNICAL_PROFESSIONAL',
  EXPERT: 'TECHNICAL_PROFESSIONAL',
  ACADEMIC: 'RESEARCHER',
  FACILITATOR: 'COMMUNITY_FACILITATOR',
  REVIEWER: 'DECISION_REVIEWER'
});

const METHOD_REFERENCE_IDS = Object.freeze([
  'QURAN_16_125',
  'QURAN_49_6',
  'QURAN_5_8',
  'QURAN_17_36',
  'QURAN_2_256',
  'ABU_DAWUD_4607',
  'SAHIH_MUSLIM_49A',
  'IBN_MAJAH_2340'
]);

function readJson(relativePath, fallback = null) {
  try {
    return JSON.parse(
      fs.readFileSync(path.join(ROOT, relativePath), 'utf8')
    );
  } catch {
    return fallback;
  }
}

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(String(value || ''))
    .digest('hex');
}

function cleanText(value, maximum = 4000) {
  return String(value || '')
    .split(String.fromCharCode(0))
    .join('')
    .trim()
    .slice(0, maximum);
}

function resolveDialogueTimeoutMs(options = {}) {
  const requested = Number(
    options.dialogueTimeoutMs ||
    process.env.SHEIKHA_THOUGHT_DIALOGUE_TIMEOUT_MS ||
    8000
  );
  return Math.min(15000, Math.max(1000,
    Number.isFinite(requested) ? Math.floor(requested) : 8000
  ));
}

async function executeWithDialogueDeadline(executor, request, options) {
  const timeoutMs = resolveDialogueTimeoutMs(options);
  let timer;
  const timeoutResult = new Promise((resolve) => {
    timer = setTimeout(() => resolve({
      success: false,
      status: 'LOCAL_MODEL_DEADLINE_EXCEEDED',
      output: '',
      execution: {
        route: 'DETERMINISTIC_GOVERNED_FALLBACK',
        selectedModels: [],
        synthesisModel: null,
        modelInvocations: 0,
        successfulModelInvocations: 0,
        failedModelInvocations: 1
      },
      quality: {
        passed: false,
        status: 'MODEL_OUTPUT_UNAVAILABLE'
      },
      request: { promptStored: false },
      audit: { persisted: false, reason: 'DEADLINE_EXCEEDED' },
      deadline: { exceeded: true, timeoutMs }
    }), timeoutMs + 250);
  });
  try {
    return await Promise.race([
      executor(request, {
        ...(options.intelligenceOptions || {}),
        executionTimeoutMs: Math.min(
          timeoutMs,
          Number(options.intelligenceOptions?.executionTimeoutMs) || timeoutMs
        ),
        persist: options.persist !== false,
        root: options.root || options.rootDir
      }),
      timeoutResult
    ]);
  } finally {
    clearTimeout(timer);
  }
}

function normalizeAudienceContext(input = {}) {
  const requested = cleanText(
    input.audienceContext || input.audience || 'GENERAL_PUBLIC',
    64
  ).toUpperCase();
  const resolved = AUDIENCE_ALIASES[requested] || requested;
  const context = AUDIENCE_CONTEXTS[resolved];
  if (!context) {
    const error = new Error(
      `Unknown non-sensitive audience context: ${requested}`
    );
    error.code = 'INVALID_AUDIENCE_CONTEXT';
    throw error;
  }
  return {
    ...context,
    source: requested === 'GENERAL_PUBLIC' &&
      !input.audienceContext &&
      !input.audience
      ? 'SAFE_DEFAULT'
      : 'EXPLICIT_USER_SELECTION',
    inferredSensitiveTraits: false,
    personProfileCreated: false
  };
}

function listAudienceContexts() {
  return {
    system: `${SYSTEM}_AUDIENCE_CONTEXTS`,
    status: 'ACTIVE_NON_SENSITIVE_EXPLICIT_CONTEXTS',
    count: Object.keys(AUDIENCE_CONTEXTS).length,
    contexts: Object.values(AUDIENCE_CONTEXTS),
    boundaries: {
      politicalIdentityInference: false,
      religiousIdentityInference: false,
      religiousSchoolInference: false,
      demographicProfiling: false,
      individualScoring: false
    }
  };
}

function detectConstructiveDialogueTopic(message) {
  const text = cleanText(message);
  const candidates = matchThoughtFrameworks(text);
  const explicitDialogueIntent =
    /(?:قارن|ناقش|حاور|حلل|افحص|وازن).{0,120}(?:فكر|فكرة|أيديولوج|ايدولوج|تيار|مذهب فكري|نظام اجتماعي|نظام اقتصادي)/i
      .test(text) ||
    /(?:قارن|ناقش|حاور|حلل|افحص|وازن)/i.test(text) &&
      candidates.length > 0;
  return {
    matched: explicitDialogueIntent && candidates.length > 0,
    candidates,
    classificationBoundary:
      'IDEA_TOPIC_DETECTION_NOT_PERSON_IDENTITY_INFERENCE'
  };
}

function getMethodAnchors(enabled = true) {
  if (!enabled) return [];
  const registry = listReligiousMethodReferences();
  return METHOD_REFERENCE_IDS
    .map((id) => registry.references.find((entry) => entry.id === id))
    .filter(Boolean)
    .map((entry) => ({
      id: entry.id,
      kind: entry.kind,
      citation: entry.citation,
      principleAr: entry.principleAr,
      sourceStatus: entry.sourceStatus,
      sourceGradeAtRegistrySource:
        entry.sourceGradeAtRegistrySource || null,
      useBoundaryAr: entry.useBoundaryAr || (
        'مرجع منهجي، ولا يمنح البرنامج سلطة تفسير أو فتوى.'
      )
    }));
}

function buildThoughtDialogueMatrix() {
  const registry = listThoughtFrameworks();
  return {
    schemaVersion: '3.0.0',
    system: `${SYSTEM}_FRAMEWORK_MATRIX`,
    status: 'ACTIVE_IDEA_LEVEL_DIALOGUE_MATRIX',
    generatedAt: new Date().toISOString(),
    coverage: registry.coverage,
    classificationTarget:
      'IDEAS_AND_EXPLICITLY_SELECTED_LENSES_ONLY',
    frameworks: registry.frameworks.map((framework) => ({
      id: framework.id,
      nameAr: framework.nameAr,
      nameEn: framework.nameEn,
      era: framework.era,
      family: framework.family,
      fairOpeningAr:
        `ابدأ بتعريف ${framework.nameAr} كما يقدمه أصحابه، ` +
        'مع تحديد النسخة والسياق وعدم نسبته إلى المستخدم.',
      statedGoalsAr: framework.statedGoalsAr,
      possibleCommonGroundAr: framework.potentialBenefitsAr,
      critiqueAndRiskAr: framework.risksAndCritiquesAr,
      evidenceQuestionsAr: framework.dialogueQuestionsAr,
      requiredMoves: [
        'STEELMAN_BEFORE_CRITIQUE',
        'SEPARATE_GOAL_CLAIM_AND_MEANS',
        'REQUEST_EVIDENCE_AND_COUNTEREVIDENCE',
        'ASSESS_RIGHTS_AND_HARM',
        'OFFER_VOLUNTARY_NONCOERCIVE_OPTIONS'
      ],
      forbiddenMoves: [
        'CLASSIFY_PERSON',
        'INFER_SENSITIVE_TRAIT',
        'TARGETED_POLITICAL_OR_RELIGIOUS_PERSUASION',
        'COERCION_OR_GROUP_SUPPRESSION'
      ]
    })),
    claimBoundary:
      'The matrix guides idea-level dialogue and does not describe, rank, or classify people.'
  };
}

function selectedMethodAnchors(input = {}) {
  const enabled = input.religiousLensRequested !== false;
  return getMethodAnchors(enabled);
}

function renderItems(items, fallback) {
  const values = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!values.length) return `- ${fallback}`;
  return values.map((item) => `- ${item}`).join('\n');
}

function buildGovernedIntelligencePrompt(input, plan, audience, anchors) {
  const message = cleanText(input.message || input.prompt || input.text);
  const frameworks = plan.frameworkSummaries || [];
  const frameworkText = frameworks.length
    ? frameworks.map((framework) => [
      `الإطار: ${framework.nameAr} (${framework.id})`,
      `التعريف: ${framework.descriptionAr}`,
      'الأهداف:',
      renderItems(framework.statedGoalsAr, 'يحتاج تحديدًا.'),
      'المنافع المحتملة:',
      renderItems(framework.potentialBenefitsAr, 'تحتاج دليلًا.'),
      'المخاطر والاعتراضات:',
      renderItems(framework.risksAndCritiquesAr, 'تحتاج فحصًا.')
    ].join('\n')).join('\n\n')
    : 'لم يُحدد إطار بعينه؛ اطلب التوضيح ولا تنسب توجهًا إلى المستخدم.';
  const methodText = anchors.length
    ? anchors.map((entry) => [
      `${entry.citation}: ${entry.principleAr}`,
      `حالة المصدر: ${entry.sourceStatus}.`,
      `حد الاستعمال: ${entry.useBoundaryAr}`
    ].join(' ')).join('\n')
    : 'لم يطلب المستخدم عدسة مرجعية دينية في هذا الرد.';

  return [
    'أنت محرك حوار عربي بنّاء داخل منظومة شيخة.',
    'حلل الفكرة والدعوى والغاية والوسيلة والدليل، لا هوية الإنسان.',
    'لا تستنتج دينًا أو مذهبًا أو توجهًا سياسيًا أو سمة حساسة.',
    'لا تستخدم استهدافًا سياسيًا أو دينيًا، ولا إكراهًا أو تحقيرًا.',
    'قدّم أقوى صياغة عادلة للفكرة قبل نقدها.',
    'لا تختلق مرجعًا. لا تنقل نص آية أو حديث من ذاكرة النموذج.',
    'استعمل فقط بيانات الاستشهاد المسجلة أدناه، إن احتجت إليها.',
    'لا تصدر فتوى أو حكمًا عقديًا أو تفضيلًا آليًا بين المذاهب.',
    'أي حكم ديني تفصيلي يحتاج مراجعة بشرية مؤهلة.',
    '',
    `سياق الجمهور المختار: ${audience.nameAr}.`,
    `أسلوب العرض: ${audience.styleAr}`,
    `عمق الدليل: ${audience.evidenceDepthAr}`,
    `بداية الحوار: ${audience.openingAr}`,
    '',
    'سؤال أو فكرة المستخدم:',
    message,
    '',
    'الأطر الفكرية المختارة أو المرشحة من نص الموضوع:',
    frameworkText,
    '',
    'المراجع المنهجية المسجلة:',
    methodText,
    '',
    'المادة البنائية:',
    'الأهداف المعلنة:',
    renderItems(
      plan.constructiveMaterial?.statedGoalsAr,
      'يحتاج المستخدم إلى تحديد الهدف.'
    ),
    'المشترك الممكن:',
    renderItems(
      plan.constructiveMaterial?.possibleCommonGroundAr,
      'لم يتحدد بعد.'
    ),
    'المخاطر والاعتراضات:',
    renderItems(
      plan.constructiveMaterial?.risksAndCritiquesAr,
      'تحتاج فحصًا.'
    ),
    'أسئلة التحقق:',
    renderItems(
      plan.constructiveMaterial?.questionsAr,
      'ما الدعوى المحددة وما دليلها؟'
    ),
    '',
    'اكتب جوابًا عربيًا موجزًا بهذه العناوين:',
    '1. فهم عادل للفكرة.',
    '2. الغايات والدعاوى والوسائل.',
    '3. مواضع الاتفاق والاختلاف.',
    '4. الدليل والدليل المضاد وما لم يثبت.',
    '5. مرجعية القيم وحدود الاستدلال.',
    '6. خيار سلمي نافع قابل للاختبار.',
    '7. سؤال متابعة محترم.',
    'اختم بحدود اليقين وما يحتاج مراجعة بشرية.'
  ].join('\n').slice(0, 12000);
}

function extractCitationMentions(output) {
  const source = String(output || '');
  const patterns = [
    /سورة\s+[\u0600-\u06ff ]{2,30}:\s*\d+/g,
    /سنن\s+أبي\s+داود:\s*[\da-z]+/gi,
    /صحيح\s+مسلم:\s*[\da-z]+/gi,
    /سنن\s+ابن\s+ماجه:\s*[\da-z]+/gi
  ];
  return [...new Set(patterns.flatMap((pattern) =>
    source.match(pattern) || []
  ))];
}

function assessGeneratedDialogue(output, anchors, intelligence) {
  const text = cleanText(output, 30000);
  const allowedCitations = new Set(
    anchors.map((entry) => entry.citation.toLowerCase())
  );
  const citationMentions = extractCitationMentions(text);
  const unknownCitations = citationMentions.filter((citation) =>
    !allowedCitations.has(citation.toLowerCase())
  );
  const checks = {
    outputPresent: text.length > 0,
    intelligenceQualityPassed:
      intelligence?.quality?.passed === true,
    noPersonIdeologyClaim:
      !/(?:أنت|هذا الشخص|المستخدم)\s+(?:ليبرالي|اشتراكي|ماركسي|علماني|إسلامي|سني|شيعي|ملحد)/i
        .test(text),
    noCoerciveOrTargetedPersuasion:
      !/أجبر(?:ه|هم)|إجبار(?:ه|هم)|إكراه(?:ه|هم)|اقمع(?:ه|هم)|استأصل(?:ه|هم)|استهدف(?:ه|هم)\s+(?:سياسي|ديني)|غيّر معتقده بالقوة/i
        .test(text),
    noAutomatedReligiousRuling:
      !/(?:^|\n)\s*(?:هذا|هذه|ذلك).{0,40}(?:حرام|حلال)|(?:^|\n)\s*(?:الفتوى|الحكم الشرعي)\s*[:：]\s*(?!يحتاج)/i
        .test(text),
    citationsRestrictedToRegistry: unknownCitations.length === 0,
    noSecretMaterial:
      intelligence?.quality?.checks?.noSecretMaterial !== false
  };
  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([id]) => id);
  return {
    status: failed.length
      ? 'HUMAN_REVIEW_REQUIRED'
      : 'GOVERNED_DIALOGUE_QUALITY_PASSED',
    passed: failed.length === 0,
    checks,
    failed,
    citationMentions,
    unknownCitations,
    semanticCorrectnessProven: false,
    religiousInterpretationApproved: false
  };
}

function deterministicDialogueBrief(plan, audience, anchors) {
  const frameworks = plan.frameworkSummaries || [];
  const names = frameworks.map((entry) => entry.nameAr);
  const commonGround =
    plan.constructiveMaterial?.possibleCommonGroundAr || [];
  const risks = plan.constructiveMaterial?.risksAndCritiquesAr || [];
  const questions = plan.constructiveMaterial?.questionsAr || [];
  const method = anchors.slice(0, 3).map((entry) =>
    `${entry.citation} (${entry.principleAr})`
  );
  return [
    'فهم أولي محكوم:',
    names.length
      ? `الموضوع يقارن أفكارًا مرتبطة بـ${names.join(' و')}.`
      : 'لم يتحدد إطار فكري بعينه؛ يلزم توضيح الدعوى المقصودة.',
    '',
    `أسلوب الحوار المناسب: ${audience.styleAr}`,
    '',
    'المشترك الممكن:',
    renderItems(commonGround.slice(0, 4), 'يحتاج إلى تحديد مشترك.'),
    '',
    'المخاطر التي تحتاج دليلًا:',
    renderItems(risks.slice(0, 4), 'لم تتحدد بعد.'),
    '',
    'مرجعية القيم المسجلة:',
    renderItems(method, 'لم تُفعّل المراجع الدينية لهذا الطلب.'),
    '',
    'سؤال المتابعة:',
    questions[0] || 'ما الدعوى المحددة التي تريد فحصها وما دليلها؟',
    '',
    'هذه مساعدة معرفية وليست فتوى أو تصنيفًا للشخص. ' +
      'الأحكام الدينية التفصيلية تحتاج مراجعة بشرية مؤهلة.'
  ].join('\n');
}

function publicIntelligenceMetadata(result) {
  if (!result) return null;
  return {
    system: result.system,
    status: result.status,
    task: result.task,
    mode: result.mode,
    execution: {
      route: result.execution?.route || null,
      selectedModels: result.execution?.selectedModels || [],
      synthesisModel: result.execution?.synthesisModel || null,
      modelInvocations:
        Number(result.execution?.modelInvocations || 0),
      successfulModelInvocations:
        Number(result.execution?.successfulModelInvocations || 0),
      failedModelInvocations:
        Number(result.execution?.failedModelInvocations || 0)
    },
    quality: result.quality,
    promptStored: result.request?.promptStored === true,
    audit: result.audit
  };
}

async function generateConstructiveDialogue(
  input = {},
  options = {}
) {
  const message = cleanText(
    input.message || input.prompt || input.text
  );
  const audience = normalizeAudienceContext(input);
  const plan = buildDialoguePlan({
    ...input,
    message,
    religiousLensRequested:
      input.religiousLensRequested !== false
  });

  if (plan.status === 'SAFE_REDIRECTION_REQUIRED') {
    return {
      schemaVersion: '3.0.0',
      system: SYSTEM,
      generatedAt: new Date().toISOString(),
      success: false,
      status: 'SAFE_REDIRECTION_REQUIRED',
      answer: plan.safeAlternativeAr,
      plan,
      audience,
      intelligence: {
        invoked: false,
        modelInvocations: 0
      },
      privacy: {
        rawMessagePersisted: false,
        sensitiveProfileCreated: false,
        userBeliefStored: false
      },
      executionAuthorized: false
    };
  }

  const anchors = selectedMethodAnchors(input);
  const governedPrompt = buildGovernedIntelligencePrompt(
    input,
    plan,
    audience,
    anchors
  );
  const intelligenceExecutor =
    options.executeIntelligenceRequest ||
    executeIntelligenceRequest;
  const intelligence = await executeWithDialogueDeadline(
    intelligenceExecutor,
    {
    prompt: governedPrompt,
    task: 'REASONING',
    mode: input.mode || input.reasoningMode || 'standard',
    ultraBudgetApproved: input.ultraBudgetApproved === true
    },
    options
  );
  const assessment = assessGeneratedDialogue(
    intelligence.output,
    anchors,
    intelligence
  );
  const aiAnswerAccepted =
    intelligence.success === true && assessment.passed;
  const fallbackAnswer = deterministicDialogueBrief(
    plan,
    audience,
    anchors
  );

  return {
    schemaVersion: '3.0.0',
    system: SYSTEM,
    generatedAt: new Date().toISOString(),
    success: true,
    status: aiAnswerAccepted
      ? 'AI_CONSTRUCTIVE_DIALOGUE_COMPLETED'
      : 'PLAN_READY_AI_OUTPUT_REVIEW_REQUIRED',
    answer: aiAnswerAccepted
      ? cleanText(intelligence.output, 30000)
      : fallbackAnswer,
    aiOutputReturned: aiAnswerAccepted,
    aiOutputSuppressed: !aiAnswerAccepted &&
      Boolean(intelligence.output),
    subject: {
      analysisTarget:
        'IDEAS_CLAIMS_GOALS_MEANS_AND_EVIDENCE',
      selectedFrameworks:
        plan.subject?.userSelectedFrameworks || [],
      topicCandidates: plan.subject?.topicCandidates || [],
      personIdeologyInferred: false,
      religiousSchoolInferred: false,
      sensitiveTraitsInferred: false
    },
    audience,
    methodAnchors: anchors,
    plan: {
      status: plan.status,
      frameworkSummaries: plan.frameworkSummaries,
      dialoguePhases: plan.dialoguePhases,
      constructiveMaterial: plan.constructiveMaterial,
      evidenceChecklistAr: plan.evidenceChecklistAr,
      outputInstructionsAr: plan.outputInstructionsAr
    },
    intelligence: {
      invoked: true,
      deadline: intelligence.deadline || {
        exceeded: false,
        timeoutMs: resolveDialogueTimeoutMs(options)
      },
      ...publicIntelligenceMetadata(intelligence)
    },
    dialogueQuality: assessment,
    governance: {
      analyzeIdeasNotPeople: true,
      targetedPoliticalPersuasion: false,
      targetedReligiousPersuasion: false,
      coercion: false,
      automatedFatwa: false,
      automatedAqidahJudgment: false,
      qualifiedHumanReviewForReligiousRulings: true,
      humanFinalDecision: true
    },
    privacy: {
      rawMessagePersisted: false,
      messageReturnedInMetadata: false,
      sensitiveProfileCreated: false,
      userBeliefStored: false,
      intelligenceAuditHashOnly: true
    },
    execution: {
      shellExecuted: false,
      filesWrittenByModel: false,
      externalActionExecuted: false,
      highImpactDecisionExecuted: false,
      authorized: false
    },
    claimBoundary:
      'The answer is a bounded educational aid. It is not a classification of a person, proof of truth, religious ruling, or authorization for high-impact action.'
  };
}

function buildIntegrationStatus() {
  const contract = readJson(FILES.contract, {});
  const base = buildDialogueRuntimeStatus();
  const matrix = buildThoughtDialogueMatrix();
  const intelligenceReport = readJson(FILES.intelligenceReport, {});
  const integrationEvidence = readJson(
    FILES.integrationEvidence,
    {}
  );
  const anchors = getMethodAnchors(true);
  const checks = {
    contractActive: contract.status === 'ACTIVE_DEFAULT_DENY',
    contemporaryFrameworksIntegrated:
      matrix.coverage.contemporary === 19,
    historicalFrameworksIntegrated:
      matrix.coverage.historical === 18,
    audienceContextsBounded:
      Object.keys(AUDIENCE_CONTEXTS).length === 6,
    personClassificationDisabled:
      contract.audiencePolicy?.politicalIdeologyInference === false &&
      contract.audiencePolicy?.religiousIdentityInference === false,
    targetedPersuasionDisabled:
      contract.dialoguePolicy?.targetedPoliticalPersuasion === false &&
      contract.dialoguePolicy?.targetedReligiousPersuasion === false,
    automatedFatwaDisabled:
      contract.religiousMethod?.automatedFatwa === false,
    approvedReferenceMetadataAvailable: anchors.length === 8,
    intelligenceProviderIntegrated:
      contract.foundations?.intelligenceProvider ===
        'SHEIKHA_INTELLIGENCE_CAPABILITY_APEX_V1',
    localFirst:
      contract.intelligencePolicy?.localFirst === true,
    githubNotRequired:
      contract.intelligencePolicy?.githubRequired === false,
    deterministicIntegrationSelfTestPassed:
      integrationEvidence.passed === true &&
      integrationEvidence.liveModelInvoked === false
  };
  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([id]) => id);

  return {
    schemaVersion: '3.0.0',
    system: SYSTEM,
    generatedAt: new Date().toISOString(),
    status: failedChecks.length
      ? 'INTEGRATION_REVIEW_REQUIRED'
      : 'ACTIVE_GOVERNED_AI_CONSTRUCTIVE_DIALOGUE',
    passed: failedChecks.length === 0,
    checks,
    failedChecks,
    coverage: {
      contemporaryThoughtFrameworks:
        matrix.coverage.contemporary,
      historicalThoughtFrameworks:
        matrix.coverage.historical,
      totalThoughtFrameworks: matrix.coverage.total,
      audienceContexts: Object.keys(AUDIENCE_CONTEXTS).length,
      methodReferenceAnchors: anchors.length
    },
    foundations: {
      dialogueRuntime: base.status,
      thoughtRegistry: matrix.status,
      intelligenceProvider:
        intelligenceReport.status || 'CONFIGURED_REPORT_UNAVAILABLE',
      discoveredLocalModels:
        Number(
          intelligenceReport.coverage?.discoveredLocalModels || 0
        )
    },
    routes: {
      status:
        '/api/sheikha/constructive-thought-dialogue/v3/status',
      audiences:
        '/api/sheikha/constructive-thought-dialogue/v3/audiences',
      matrix:
        '/api/sheikha/constructive-thought-dialogue/v3/frameworks/matrix',
      respond:
        '/api/sheikha/constructive-thought-dialogue/v3/respond',
      conversationEngine:
        '/api/sheikha/conversation-engine/v1/chat'
    },
    governance: {
      analysisTarget: 'IDEAS_NOT_PEOPLE',
      personClassification: false,
      sensitiveTraitInference: false,
      targetedPersuasion: false,
      coerciveAdoption: false,
      automatedFatwa: false,
      qualifiedHumanReviewForReligiousRulings: true
    },
    intelligenceEvidence: {
      integrationImplemented: true,
      deterministicIntegrationSelfTestPassed:
        integrationEvidence.passed === true,
      selfTestOutputStored:
        integrationEvidence.outputStored === true,
      liveModelInvokedBySelfTest:
        integrationEvidence.liveModelInvoked === true,
      liveSemanticCorrectnessProven: false,
      modelOutputIsReligiousEvidence: false
    },
    outputs: FILES,
    claimBoundary: contract.claimBoundary
  };
}

module.exports = Object.freeze({
  SYSTEM,
  FILES,
  AUDIENCE_CONTEXTS,
  METHOD_REFERENCE_IDS,
  normalizeAudienceContext,
  listAudienceContexts,
  detectConstructiveDialogueTopic,
  getMethodAnchors,
  buildThoughtDialogueMatrix,
  buildGovernedIntelligencePrompt,
  extractCitationMentions,
  assessGeneratedDialogue,
  generateConstructiveDialogue,
  buildIntegrationStatus,
  sha256
});
