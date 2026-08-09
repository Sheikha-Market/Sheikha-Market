'use strict';

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const {
  ROLE_CATALOG,
  detectSafetyBypassIntent,
  isComplexTask
} = require(
  '../../runtime/computing-cognitive-layers/v1/' +
  'sheikha-computing-cognitive-layers-v1'
);
const {
  askWithFallback
} = require('../providers/provider-registry');

const SYSTEM = 'SHEIKHA_INTELLIGENCE_CAPABILITY_APEX_V1';
const ROOT = path.resolve(__dirname, '..', '..');
const DEFAULT_OLLAMA_URL =
  process.env.OLLAMA_HOST ||
  process.env.OLLAMA_URL ||
  'http://127.0.0.1:11434';

const FILES = Object.freeze({
  contract:
    'runtime/intelligence-capability-apex/v1/contracts/' +
    'sheikha-intelligence-capability-apex-v1-contract.json',
  capabilities:
    'runtime/intelligence-capability-apex/v1/registries/' +
    'intelligence-capability-registry.json',
  models:
    'runtime/intelligence-capability-apex/v1/registries/' +
    'local-model-inventory.json',
  routing:
    'runtime/intelligence-capability-apex/v1/registries/' +
    'task-model-routing-matrix.json',
  benchmark:
    'runtime/intelligence-capability-apex/v1/evidence/' +
    'local-operational-benchmark.json',
  audit:
    'runtime/intelligence-capability-apex/v1/audit/' +
    'intelligence-execution-audit.jsonl',
  report:
    'runtime/intelligence-capability-apex/v1/' +
    'sheikha-intelligence-capability-apex-v1-report.json',
  ragEvidence:
    'runtime/root-knowledge-agentic-fabric/v1/' +
    'sheikha-root-knowledge-agentic-fabric-v1-report.json',
  liveEvidence:
    'runtime/live-realtime-fabric/v1/' +
    'sheikha-live-realtime-fabric-v1.json',
  cognitiveEvidence:
    'runtime/computing-cognitive-layers/v1/' +
    'sheikha-computing-cognitive-layers-v1-report.json',
  providerEvidence:
    'runtime/provider-registry/v1/' +
    'sheikha-provider-registry-v1.json',
  accelerationEvidence:
    'runtime/intelligence-capability-apex/v1/evidence/' +
    'ollama-gpu-acceleration-verification.json'
});

const MODE_PROFILES = Object.freeze({
  standard: Object.freeze({
    mode: 'standard',
    roleSlots: 1,
    concurrency: 1,
    modelInvocationMaximum: 1,
    numCtx: 4096,
    numPredict: 64,
    timeoutMs: 180000,
    budgetApprovalRequired: false
  }),
  pro: Object.freeze({
    mode: 'pro',
    roleSlots: 4,
    concurrency: 2,
    modelInvocationMaximum: 5,
    numCtx: 8192,
    numPredict: 80,
    timeoutMs: 240000,
    budgetApprovalRequired: false
  }),
  ultra: Object.freeze({
    mode: 'ultra',
    roleSlots: 4,
    concurrency: 4,
    modelInvocationMaximum: 5,
    numCtx: 12288,
    numPredict: 96,
    timeoutMs: 300000,
    budgetApprovalRequired: true
  })
});

const TASK_TYPES = Object.freeze([
  'ARABIC_GENERAL',
  'CODING',
  'REASONING',
  'MATHEMATICS',
  'SCIENCE',
  'DEFENSIVE_SECURITY',
  'RESEARCH',
  'DATA_ANALYSIS',
  'FAST_RESPONSE',
  'GENERAL'
]);

const TASK_REQUIREMENTS = Object.freeze({
  ARABIC_GENERAL: ['ARABIC', 'GENERAL'],
  CODING: ['CODE', 'REVIEW'],
  REASONING: ['REASONING', 'REVIEW'],
  MATHEMATICS: ['MATHEMATICS', 'REASONING'],
  SCIENCE: ['SCIENCE', 'REASONING'],
  DEFENSIVE_SECURITY: ['SECURITY', 'CODE', 'REVIEW'],
  RESEARCH: ['RESEARCH', 'REASONING', 'REVIEW'],
  DATA_ANALYSIS: ['DATA', 'REASONING'],
  FAST_RESPONSE: ['FAST', 'GENERAL'],
  GENERAL: ['GENERAL', 'ARABIC']
});

const MODEL_PROFILE_RULES = Object.freeze([
  Object.freeze({
    id: 'QWEN_CODER_LOCAL',
    match: /^qwen.*coder/i,
    capabilities: ['CODE', 'REVIEW', 'STRUCTURED', 'GENERAL'],
    taskWeights: {
      CODING: 120,
      DEFENSIVE_SECURITY: 80,
      DATA_ANALYSIS: 35
    }
  }),
  Object.freeze({
    id: 'DEEPSEEK_REASONING_LOCAL',
    match: /^deepseek.*r1/i,
    capabilities: [
      'REASONING',
      'MATHEMATICS',
      'SCIENCE',
      'SECURITY',
      'REVIEW',
      'GENERAL'
    ],
    taskWeights: {
      REASONING: 120,
      MATHEMATICS: 120,
      SCIENCE: 105,
      DEFENSIVE_SECURITY: 80,
      RESEARCH: 70
    }
  }),
  Object.freeze({
    id: 'SHEIKHA_CORE_LOCAL',
    match: /^sheikha-core/i,
    capabilities: [
      'ARABIC',
      'GENERAL',
      'GOVERNANCE',
      'INDUSTRIAL',
      'SUPPLY_CHAIN',
      'SYNTHESIS'
    ],
    taskWeights: {
      ARABIC_GENERAL: 125,
      GENERAL: 110,
      RESEARCH: 35,
      CODING: 25
    }
  }),
  Object.freeze({
    id: 'LLAMA_GENERAL_REVIEW_LOCAL',
    match: /^llama/i,
    capabilities: [
      'GENERAL',
      'REASONING',
      'REVIEW',
      'STRUCTURED',
      'SYNTHESIS'
    ],
    taskWeights: {
      GENERAL: 85,
      RESEARCH: 70,
      REASONING: 65,
      DEFENSIVE_SECURITY: 55
    }
  }),
  Object.freeze({
    id: 'TINY_FAST_LOCAL',
    match: /^tinyllama/i,
    capabilities: ['FAST', 'GENERAL'],
    taskWeights: {
      FAST_RESPONSE: 140,
      GENERAL: 10
    }
  })
]);

const SECRET_PATTERNS = Object.freeze([
  {
    id: 'PRIVATE_KEY',
    regex:
      /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
    replacement: '[REDACTED_PRIVATE_KEY]'
  },
  {
    id: 'OPENAI_STYLE_KEY',
    regex: /\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/g,
    replacement: '[REDACTED_API_KEY]'
  },
  {
    id: 'GITHUB_STYLE_TOKEN',
    regex: /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,
    replacement: '[REDACTED_TOKEN]'
  },
  {
    id: 'AWS_ACCESS_KEY',
    regex: /\bAKIA[0-9A-Z]{16}\b/g,
    replacement: '[REDACTED_ACCESS_KEY]'
  },
  {
    id: 'BEARER_TOKEN',
    regex: /\bBearer\s+[A-Za-z0-9._~+/-]{20,}=*/gi,
    replacement: 'Bearer [REDACTED_TOKEN]'
  }
]);

function resolveRoot(options = {}) {
  return options.root || ROOT;
}

function readJson(relativePath, fallback = {}, options = {}) {
  try {
    return JSON.parse(
      fs.readFileSync(
        path.join(resolveRoot(options), relativePath),
        'utf8'
      )
    );
  } catch {
    return fallback;
  }
}

function writeJson(relativePath, value, options = {}) {
  const target = path.join(resolveRoot(options), relativePath);
  const temporary = `${target}.${process.pid}.tmp`;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(
    temporary,
    `${JSON.stringify(value, null, 2)}\n`,
    'utf8'
  );
  fs.renameSync(temporary, target);
}

function sha256(value) {
  return crypto
    .createHash('sha256')
    .update(String(value || ''))
    .digest('hex');
}

function isArabic(value) {
  return /[\u0600-\u06ff]/.test(String(value || ''));
}

function cleanText(value, maximum = 12000) {
  return String(value || '').trim().slice(0, maximum);
}

function redactSecrets(value) {
  let text = String(value || '');
  const findings = [];
  for (const pattern of SECRET_PATTERNS) {
    pattern.regex.lastIndex = 0;
    const matches = text.match(pattern.regex);
    pattern.regex.lastIndex = 0;
    if (matches?.length) {
      findings.push({
        id: pattern.id,
        count: matches.length
      });
      text = text.replace(pattern.regex, pattern.replacement);
      pattern.regex.lastIndex = 0;
    }
  }
  return {
    text,
    redacted: findings.length > 0,
    findings
  };
}

function containsSecretPattern(value) {
  return SECRET_PATTERNS.some((pattern) => {
    pattern.regex.lastIndex = 0;
    const matched = pattern.regex.test(String(value || ''));
    pattern.regex.lastIndex = 0;
    return matched;
  });
}

function safeOllamaUrl(options = {}) {
  const value = options.ollamaUrl || DEFAULT_OLLAMA_URL;
  const url = new URL(value);
  const localHosts = new Set(['127.0.0.1', 'localhost', '[::1]', '::1']);
  if (url.protocol !== 'http:' || !localHosts.has(url.hostname)) {
    throw new Error('LOCAL_OLLAMA_ENDPOINT_REQUIRED');
  }
  return url.origin;
}

async function fetchJson(url, request = {}, timeoutMs = 5000, options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImpl(url, {
      ...request,
      signal: controller.signal
    });
    const text = await response.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }
    return { response, data };
  } finally {
    clearTimeout(timeout);
  }
}

function profileModel(model) {
  const name = cleanText(
    typeof model === 'string' ? model : model.name,
    160
  );
  const rule = MODEL_PROFILE_RULES.find((entry) =>
    entry.match.test(name)
  );
  return {
    name,
    digest: cleanText(model.digest, 160) || null,
    sizeBytes: Number(model.size || model.sizeBytes || 0),
    modifiedAt:
      cleanText(model.modified_at || model.modifiedAt, 80) || null,
    profileId: rule?.id || 'UNCLASSIFIED_LOCAL_MODEL',
    capabilities: rule?.capabilities || ['GENERAL'],
    taskWeights: rule?.taskWeights || { GENERAL: 20 },
    discoveredLocally: true,
    benchmarkVerified: false,
    externalModel: false
  };
}

async function discoverLocalModels(options = {}) {
  if (Array.isArray(options.localModels)) {
    const models = options.localModels.map(profileModel);
    return {
      status: models.length
        ? 'LOCAL_MODELS_DISCOVERED'
        : 'NO_LOCAL_MODELS_DISCOVERED',
      online: models.length > 0,
      endpoint:
        options.inventoryEndpoint ||
        'INJECTED_TEST_INVENTORY',
      discoveryMethod:
        options.inventoryDiscoveryMethod ||
        'INJECTED_TEST_INVENTORY',
      discoveryEvidence:
        options.inventoryEvidence || null,
      count: models.length,
      models,
      error: null
    };
  }

  let endpoint;
  try {
    endpoint = safeOllamaUrl(options);
    const { response, data } = await fetchJson(
      `${endpoint}/api/tags`,
      { method: 'GET' },
      Number(options.discoveryTimeoutMs || 3000),
      options
    );
    const models = Array.isArray(data.models)
      ? data.models.map(profileModel)
      : [];
    return {
      status: response.ok && models.length
        ? 'LOCAL_MODELS_DISCOVERED'
        : 'NO_LOCAL_MODELS_DISCOVERED',
      online: response.ok,
      endpoint,
      discoveryMethod: 'NODE_FETCH_LOOPBACK',
      discoveryEvidence: null,
      count: models.length,
      models,
      error: response.ok ? null : `HTTP_${response.status}`
    };
  } catch (error) {
    return {
      status: 'LOCAL_MODEL_DISCOVERY_UNAVAILABLE',
      online: false,
      endpoint: endpoint || 'LOCAL_ENDPOINT',
      discoveryMethod: 'NODE_FETCH_LOOPBACK',
      discoveryEvidence: null,
      count: 0,
      models: [],
      error:
        error.name === 'AbortError'
          ? 'DISCOVERY_TIMEOUT'
          : error.message
    };
  }
}

function hasModelCapability(inventory, capability) {
  return inventory.models.some((model) =>
    model.capabilities.includes(capability)
  );
}

function capability(
  id,
  category,
  titleAr,
  condition,
  evidence,
  options = {}
) {
  let status = 'REGISTERED_EVIDENCE_REQUIRED';
  if (condition === true) {
    status = options.governedOnly
      ? 'ACTIVE_GOVERNED'
      : 'ACTIVE_LOCAL';
  } else if (options.providerRequired) {
    status = 'REGISTERED_PROVIDER_REQUIRED';
  } else if (options.toolRequired) {
    status = 'REGISTERED_TOOL_REQUIRED';
  }
  return {
    id,
    category,
    titleAr,
    status,
    executable:
      status === 'ACTIVE_LOCAL' ||
      status === 'ACTIVE_GOVERNED',
    modelBacked: status === 'ACTIVE_LOCAL' && options.governedOnly !== true,
    evidence,
    limitations: options.limitations || []
  };
}

function buildCapabilityRegistry(inventory, options = {}) {
  const rag = readJson(FILES.ragEvidence, {}, options);
  const live = readJson(FILES.liveEvidence, {}, options);
  const cognitive = readJson(FILES.cognitiveEvidence, {}, options);
  const acceleration =
    readJson(FILES.accelerationEvidence, {}, options);
  const ragActive = rag.status === 'ACTIVE';
  const liveActive = live.status === 'ACTIVE';
  const cognitiveActive =
    cognitive.status === 'ACTIVE_WITH_CORRECTED_TECHNICAL_MODEL';
  const multiModel = inventory.models.length >= 2;
  const capabilities = [
    capability(
      'ARABIC_NATIVE_INTERACTION',
      'LANGUAGE',
      'تفاعل عربي أصيل',
      hasModelCapability(inventory, 'ARABIC'),
      'LOCAL_MODEL_CAPABILITY_PROFILE'
    ),
    capability(
      'MULTILINGUAL_TEXT',
      'LANGUAGE',
      'نصوص متعددة اللغات',
      inventory.models.length > 0,
      'LOCAL_MODEL_DISCOVERY',
      {
        limitations: [
          'Language quality requires task-specific benchmark evidence.'
        ]
      }
    ),
    capability(
      'GENERAL_GENERATION',
      'GENERATION',
      'توليد عام',
      hasModelCapability(inventory, 'GENERAL'),
      'LOCAL_MODEL_CAPABILITY_PROFILE'
    ),
    capability(
      'CODE_GENERATION',
      'ENGINEERING',
      'توليد الشفرة',
      hasModelCapability(inventory, 'CODE'),
      'QWEN_CODER_LOCAL_DISCOVERY'
    ),
    capability(
      'CODE_REVIEW_AND_DEBUG',
      'ENGINEERING',
      'مراجعة الشفرة والتشخيص',
      hasModelCapability(inventory, 'REVIEW') &&
        hasModelCapability(inventory, 'CODE'),
      'SPECIALIST_MODEL_PAIR'
    ),
    capability(
      'LOGICAL_REASONING',
      'REASONING',
      'الاستدلال المنطقي',
      hasModelCapability(inventory, 'REASONING'),
      'REASONING_MODEL_DISCOVERY'
    ),
    capability(
      'MATHEMATICAL_ASSISTANCE',
      'SCIENCE',
      'المساعدة الرياضية',
      hasModelCapability(inventory, 'MATHEMATICS'),
      'REASONING_MODEL_DISCOVERY',
      {
        limitations: [
          'Independent verification is required for consequential results.'
        ]
      }
    ),
    capability(
      'SCIENTIFIC_ASSISTANCE',
      'SCIENCE',
      'المساعدة العلمية',
      hasModelCapability(inventory, 'SCIENCE'),
      'REASONING_MODEL_DISCOVERY',
      {
        limitations: [
          'Reproducible evidence and domain review remain required.'
        ]
      }
    ),
    capability(
      'DEFENSIVE_SECURITY_REVIEW',
      'SECURITY',
      'مراجعة أمنية دفاعية',
      hasModelCapability(inventory, 'SECURITY'),
      'LOCAL_SECURITY_REVIEW_PROFILE',
      {
        limitations: [
          'Authorized defensive scope only.',
          'No safety-filter evasion or unrestricted exploitation.'
        ]
      }
    ),
    capability(
      'RAG_RETRIEVAL',
      'KNOWLEDGE',
      'استرجاع المعرفة RAG',
      ragActive,
      FILES.ragEvidence,
      { governedOnly: true }
    ),
    capability(
      'SOURCE_GROUNDING',
      'KNOWLEDGE',
      'تأصيل الإجابة بالمصادر',
      ragActive &&
        Number(rag.coverage?.ragGroundingChecks || 0) > 0,
      FILES.ragEvidence,
      { governedOnly: true }
    ),
    capability(
      'DATA_ANALYSIS',
      'ANALYTICS',
      'تحليل البيانات',
      hasModelCapability(inventory, 'REASONING'),
      'LOCAL_REASONING_AND_STRUCTURED_OUTPUT'
    ),
    capability(
      'STRUCTURED_OUTPUT',
      'GENERATION',
      'مخرجات منظمة',
      hasModelCapability(inventory, 'STRUCTURED'),
      'LOCAL_MODEL_CAPABILITY_PROFILE'
    ),
    capability(
      'DOCUMENT_ANALYSIS',
      'KNOWLEDGE',
      'تحليل الوثائق النصية',
      inventory.models.length > 0 && ragActive,
      'LOCAL_MODEL_AND_RAG_FOUNDATION'
    ),
    capability(
      'LONG_CONTEXT',
      'REASONING',
      'سياق طويل',
      false,
      'TASK_SPECIFIC_BENCHMARK_REQUIRED',
      {
        limitations: [
          'Configured context size is not proof of retained-context quality.'
        ]
      }
    ),
    capability(
      'TOOL_CALLING_PLAN',
      'TOOLS',
      'تخطيط استدعاء الأدوات',
      true,
      'GOVERNED_PLAN_ONLY',
      {
        governedOnly: true,
        limitations: ['Automatic high-impact tool execution is denied.']
      }
    ),
    capability(
      'AGENTIC_PLANNING',
      'AGENTS',
      'تخطيط وكيلي محكوم',
      ragActive,
      FILES.ragEvidence,
      { governedOnly: true }
    ),
    capability(
      'MULTI_MODEL_REVIEW',
      'AGENTS',
      'مراجعة متعددة النماذج',
      multiModel,
      'LOCAL_MODEL_INVENTORY'
    ),
    capability(
      'BOUNDED_SERENDIPITY',
      'REASONING',
      'اكتشاف بدائل مرتبطة',
      cognitiveActive,
      FILES.cognitiveEvidence,
      { governedOnly: true }
    ),
    capability(
      'FAST_RESPONSE',
      'PERFORMANCE',
      'استجابة سريعة',
      hasModelCapability(inventory, 'FAST'),
      'LOCAL_FAST_MODEL_DISCOVERY',
      {
        limitations: [
          'Latency must be measured on the current host and prompt class.'
        ]
      }
    ),
    capability(
      'GPU_ACCELERATED_INFERENCE',
      'PERFORMANCE',
      'استدلال مسرع بالمعالج الرسومي',
      acceleration.passed === true &&
        acceleration.ollama?.gpuInferenceVerified === true,
      FILES.accelerationEvidence,
      {
        limitations: acceleration.passed === true
          ? []
          : [
            'GPU hardware is present, but Ollama GPU inference is not verified.',
            'System permission repair requires explicit human authorization.'
          ]
      }
    ),
    capability(
      'STREAMING_RESPONSE',
      'PERFORMANCE',
      'استجابة متدفقة',
      liveActive,
      FILES.liveEvidence,
      { governedOnly: true }
    ),
    capability(
      'PRIVATE_LOCAL_INFERENCE',
      'PRIVACY',
      'استدلال محلي خاص',
      inventory.online && inventory.models.length > 0,
      'LOOPBACK_OLLAMA_DISCOVERY'
    ),
    capability(
      'OFFLINE_CONTINUITY',
      'RELIABILITY',
      'استمرارية دون مزود خارجي',
      true,
      'SHEIKHA_OFFLINE_PROVIDER',
      { governedOnly: true }
    ),
    capability(
      'HUMAN_APPROVAL_GOVERNANCE',
      'GOVERNANCE',
      'حوكمة الموافقة البشرية',
      true,
      FILES.contract,
      { governedOnly: true }
    ),
    capability(
      'HASH_ONLY_AUDIT',
      'GOVERNANCE',
      'تدقيق بالبصمات دون حفظ النص',
      true,
      FILES.contract,
      { governedOnly: true }
    ),
    capability(
      'MODEL_CAPABILITY_ROUTING',
      'ORCHESTRATION',
      'توجيه النماذج بحسب القدرة',
      inventory.models.length > 0,
      'DYNAMIC_LOCAL_MODEL_INVENTORY'
    ),
    capability(
      'LOCAL_OPERATIONAL_EVALUATION',
      'EVALUATION',
      'تقييم تشغيلي محلي',
      true,
      FILES.benchmark,
      { governedOnly: true }
    ),
    capability(
      'VISION_UNDERSTANDING',
      'MULTIMODAL',
      'فهم الصور',
      false,
      'LOCAL_VISION_MODEL_NOT_DISCOVERED',
      { providerRequired: true }
    ),
    capability(
      'AUDIO_SPEECH',
      'MULTIMODAL',
      'الصوت والكلام',
      false,
      'LOCAL_AUDIO_MODEL_NOT_DISCOVERED',
      { providerRequired: true }
    ),
    capability(
      'IMAGE_GENERATION',
      'MULTIMODAL',
      'توليد الصور',
      false,
      'LOCAL_IMAGE_MODEL_NOT_DISCOVERED',
      { providerRequired: true }
    ),
    capability(
      'LIVE_WEB_RESEARCH',
      'KNOWLEDGE',
      'بحث مباشر في الويب',
      false,
      'AUTHORIZED_RESEARCH_TOOL_REQUIRED',
      { toolRequired: true }
    ),
    capability(
      'INDUSTRIAL_DOMAIN_ASSISTANCE',
      'DOMAIN',
      'مساعدة صناعية',
      hasModelCapability(inventory, 'INDUSTRIAL'),
      'SHEIKHA_CORE_LOCAL_PROFILE',
      {
        limitations: [
          'Domain expert review remains required for high-impact use.'
        ]
      }
    ),
    capability(
      'SUPPLY_CHAIN_ASSISTANCE',
      'DOMAIN',
      'مساعدة سلاسل الإمداد',
      hasModelCapability(inventory, 'SUPPLY_CHAIN'),
      'SHEIKHA_CORE_LOCAL_PROFILE'
    )
  ];
  const count = (status) =>
    capabilities.filter((entry) => entry.status === status).length;
  return {
    schemaVersion: '1.0.0',
    registry: 'SHEIKHA_INTELLIGENCE_CAPABILITY_REGISTRY_V1',
    status: 'ACTIVE_EVIDENCE_BOUNDED',
    count: capabilities.length,
    coverage: {
      activeLocal: count('ACTIVE_LOCAL'),
      activeGoverned: count('ACTIVE_GOVERNED'),
      providerRequired: count('REGISTERED_PROVIDER_REQUIRED'),
      toolRequired: count('REGISTERED_TOOL_REQUIRED'),
      evidenceRequired: count('REGISTERED_EVIDENCE_REQUIRED')
    },
    capabilities
  };
}

function classifyTask(prompt, requestedTask) {
  if (TASK_TYPES.includes(requestedTask)) return requestedTask;
  const text = String(prompt || '');
  if (/سريع|مختصر|fast|quick|latency/i.test(text)) {
    return 'FAST_RESPONSE';
  }
  if (
    /كود|برمج|شفرة|دالة|خطأ|اصلح|أصلح|debug|code|function|test|lint|patch/i
      .test(text)
  ) {
    return 'CODING';
  }
  if (
    /ثغرة|أمن|أمان|حماية|تهديد|اختبار اختراق مصرح|security|vulnerability|threat|defensive/i
      .test(text)
  ) {
    return 'DEFENSIVE_SECURITY';
  }
  if (
    /معادلة|احسب|حساب|رياض|برهان|تكامل|تفاضل|equation|calculate|math|proof/i
      .test(text)
  ) {
    return 'MATHEMATICS';
  }
  if (
    /علمي|تجربة|فرضية|فيزياء|كيمياء|أحياء|scientific|experiment|physics|chemistry/i
      .test(text)
  ) {
    return 'SCIENCE';
  }
  if (
    /بيانات|إحصاء|مؤشر|تحليل البيانات|dataset|statistics|analytics|csv/i
      .test(text)
  ) {
    return 'DATA_ANALYSIS';
  }
  if (
    /ابحث|بحث|مصدر|مراجع|وثق|وثّق|research|sources|citations|evidence/i
      .test(text)
  ) {
    return 'RESEARCH';
  }
  if (
    /استدلال|منطق|حلل|قارن|برهن|reason|analy[sz]e|compare/i
      .test(text)
  ) {
    return 'REASONING';
  }
  return isArabic(text) ? 'ARABIC_GENERAL' : 'GENERAL';
}

function classifyRisk(prompt) {
  const text = String(prompt || '');
  const highImpact = [
    /فتوى|حكم شرعي|حلال|حرام|طلاق|ميراث/i,
    /تشخيص طبي|دواء|جرعة|medical diagnosis|dose|treatment/i,
    /استثمار|تحويل مالي|دفع|قرض|financial decision|payment/i,
    /عقد ملزم|قرار قانوني|legal decision|binding contract/i,
    /firmware|kernel write|حذف قرص|تحكم مصنع|سيارة|actuator/i,
    /نشر|deploy production|إطلاق عام|ترخيص حكومي/i
  ].some((pattern) => pattern.test(text));
  const secretMaterial =
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text);
  const safetyBypass = detectSafetyBypassIntent(text);
  return {
    level: safetyBypass || secretMaterial
      ? 'BLOCKED'
      : highImpact
        ? 'HIGH'
        : 'BOUNDED',
    highImpact,
    safetyBypass,
    secretMaterial,
    humanApprovalRequired: highImpact,
    executionAuthorized: false
  };
}

function normalizeMode(input = {}, prompt = '') {
  const requested = cleanText(
    input.reasoningMode || input.mode || 'auto',
    20
  ).toLowerCase();
  let resolved;
  if (['standard', 'pro', 'ultra'].includes(requested)) {
    resolved = requested;
  } else {
    resolved = isComplexTask(prompt) ? 'pro' : 'standard';
  }
  if (
    resolved === 'ultra' &&
    input.ultraBudgetApproved !== true
  ) {
    return {
      requested,
      resolved: 'pro',
      downgraded: true,
      downgradeReason: 'ULTRA_BUDGET_APPROVAL_REQUIRED'
    };
  }
  return {
    requested,
    resolved,
    downgraded: false,
    downgradeReason: null
  };
}

function scoreModel(
  model,
  task,
  extraCapability,
  options = {}
) {
  const requirements = TASK_REQUIREMENTS[task] || ['GENERAL'];
  const matches = requirements.filter((requirement) =>
    model.capabilities.includes(requirement)
  ).length;
  const extra = extraCapability &&
    model.capabilities.includes(extraCapability)
    ? 35
    : 0;
  const languageAdjustment = options.arabic === true
    ? model.capabilities.includes('ARABIC')
      ? 60
      : ['ARABIC_GENERAL', 'GENERAL', 'FAST_RESPONSE'].includes(task)
        ? -130
        : -5
    : 0;
  return matches * 30 +
    Number(model.taskWeights?.[task] || 0) +
    extra +
    languageAdjustment;
}

function rankModels(
  inventory,
  task,
  extraCapability,
  options = {}
) {
  return inventory.models
    .map((model) => ({
      ...model,
      routingScore:
        scoreModel(model, task, extraCapability, options)
    }))
    .sort((left, right) => {
      if (right.routingScore !== left.routingScore) {
        return right.routingScore - left.routingScore;
      }
      return left.name.localeCompare(right.name);
    });
}

function modelForRole(
  inventory,
  task,
  role,
  index,
  options = {}
) {
  const roleCapabilities = {
    EVIDENCE: 'REVIEW',
    ARCHITECTURE: task === 'CODING' ? 'CODE' : 'REASONING',
    SERENDIPITY: 'GENERAL',
    RISK_REVIEW: 'SECURITY'
  };
  const ranked = rankModels(
    inventory,
    task,
    roleCapabilities[role.id],
    options
  );
  if (!ranked.length) return null;
  return ranked[index % ranked.length];
}

function selectSynthesisModel(inventory, task) {
  const synthesis = inventory.models.find((model) =>
    model.capabilities.includes('SYNTHESIS') &&
    model.capabilities.includes('ARABIC')
  );
  return synthesis || rankModels(inventory, task, 'SYNTHESIS')[0] || null;
}

function buildRoutingPlan(input, inventory) {
  const secretState = redactSecrets(input.prompt);
  const prompt = cleanText(secretState.text);
  const validationErrors = [];
  if (!prompt) validationErrors.push('PROMPT_REQUIRED');
  if (String(input.prompt || '').length > 12000) {
    validationErrors.push('PROMPT_TOO_LARGE');
  }
  const risk = classifyRisk(prompt);
  const task = classifyTask(prompt, input.task);
  const modeState = normalizeMode(input, prompt);
  const profile = MODE_PROFILES[modeState.resolved];
  const arabicPrompt = isArabic(prompt);
  const roles = modeState.resolved === 'standard'
    ? [{
      id: 'DIRECT',
      title: 'Direct Specialist',
      objective: 'answer the task directly with bounded verification'
    }]
    : ROLE_CATALOG;
  const assignments = roles.map((role, index) => {
    const model = modelForRole(
      inventory,
      task,
      role,
      index,
      { arabic: arabicPrompt }
    );
    return {
      order: index + 1,
      roleId: role.id,
      title: role.title,
      objective: role.objective,
      model: model?.name || null,
      modelProfile: model?.profileId || null,
      routingScore: model?.routingScore || 0,
      status: model ? 'READY' : 'LOCAL_MODEL_UNAVAILABLE'
    };
  });
  const selectedModels = [
    ...new Set(
      assignments
        .map((assignment) => assignment.model)
        .filter(Boolean)
    )
  ];
  const blocked =
    validationErrors.length > 0 ||
    risk.level === 'BLOCKED';

  return {
    system: `${SYSTEM}_ROUTING_PLAN`,
    status: blocked
      ? 'BLOCKED'
      : selectedModels.length
        ? 'LOCAL_ROUTE_READY'
        : 'PROVIDER_FALLBACK_REQUIRED',
    prompt: {
      bytes: Buffer.byteLength(prompt),
      sha256: sha256(prompt),
      arabic: isArabic(prompt),
      secretsRedacted: secretState.redacted,
      redactionFindings: secretState.findings
    },
    sanitizedPrompt: prompt,
    validationErrors,
    task,
    requirements: TASK_REQUIREMENTS[task],
    risk,
    mode: {
      ...modeState,
      profile
    },
    assignments,
    synthesisModel:
      modeState.resolved === 'standard'
        ? null
        : selectSynthesisModel(inventory, task)?.name || null,
    selectedModels,
    distinctModelCount: selectedModels.length,
    providerPolicy: {
      localFirst: true,
      githubRequired: false,
      copilotRequired: false,
      externalProviderRequired: false,
      externalFallbackMayBeUsedWhenConfigured: true
    },
    authority: {
      answerAndAnalysisOnly: true,
      shellExecution: false,
      filesystemWrite: false,
      toolExecution: false,
      highImpactHumanApprovalRequired:
        risk.humanApprovalRequired,
      executionAuthorized: false
    },
    truthBoundaries: {
      routingScoreIsBenchmarkScore: false,
      modelCapabilityProfileIsPerformanceProof: false,
      actualIndependentModelProcessesClaimed: false,
      plannedIndependentModelInvocations: assignments.length
    }
  };
}

function roleSystemPrompt(assignment, task, mode) {
  return [
    'أنت دور تحليلي داخل قمة شيخة للقدرات الذكية.',
    `الدور: ${assignment.title}.`,
    `الهدف: ${assignment.objective}.`,
    `نوع المهمة: ${task}. نمط التشغيل: ${mode}.`,
    'أجب بالعربية إذا كان الطلب عربيًا.',
    'اجعل نتيجة هذا الدور مركزة، وبحد أقصى 80 كلمة.',
    'لا تعرض سلسلة تفكير خاصة؛ أعطِ نتائج موجزة وأدلة وافتراضات وحدودًا.',
    'لا تدّع الوعي أو العصمة أو التفوق المطلق.',
    'لا تنفذ أو تقترح تجاوز الحماية أو كشف الأسرار.',
    'القرارات الدينية والقانونية والطبية والمالية والفيزيائية عالية الأثر تحتاج مختصًا وموافقة بشرية.'
  ].join('\n');
}

function stripPrivateReasoning(value) {
  return cleanText(value, 30000)
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<analysis>[\s\S]*?<\/analysis>/gi, '')
    .trim();
}

async function executeLocalModel(request, options = {}) {
  if (typeof options.executor === 'function') {
    const result = await options.executor(request);
    return {
      success: result?.success !== false,
      model: request.model,
      output: stripPrivateReasoning(
        result?.output || result?.answer || ''
      ),
      metrics: result?.metrics || {},
      error: result?.error || null
    };
  }

  const endpoint = safeOllamaUrl(options);
  const started = process.hrtime.bigint();
  try {
    const { response, data } = await fetchJson(
      `${endpoint}/api/generate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: request.model,
          system: request.system,
          prompt: request.prompt,
          stream: false,
          keep_alive: request.profile.keepAlive || '10m',
          ...(
            request.profile.think === false
              ? { think: false }
              : {}
          ),
          options: {
            temperature: 0.2,
            top_p: 0.85,
            num_ctx: request.profile.numCtx,
            num_predict: request.profile.numPredict,
            repeat_penalty: 1.08
          }
        })
      },
      request.profile.timeoutMs,
      options
    );
    const elapsedMs =
      Number(process.hrtime.bigint() - started) / 1e6;
    if (!response.ok) {
      return {
        success: false,
        model: request.model,
        output: '',
        metrics: { elapsedMs },
        error: `HTTP_${response.status}`
      };
    }
    return {
      success: Boolean(data.response),
      model: request.model,
      output: stripPrivateReasoning(data.response),
      metrics: {
        elapsedMs: Math.round(elapsedMs * 100) / 100,
        totalDurationNs: Number(data.total_duration || 0),
        loadDurationNs: Number(data.load_duration || 0),
        promptEvalCount: Number(data.prompt_eval_count || 0),
        evalCount: Number(data.eval_count || 0)
      },
      error: data.response ? null : 'EMPTY_MODEL_RESPONSE'
    };
  } catch (error) {
    const elapsedMs =
      Number(process.hrtime.bigint() - started) / 1e6;
    return {
      success: false,
      model: request.model,
      output: '',
      metrics: {
        elapsedMs: Math.round(elapsedMs * 100) / 100
      },
      error:
        error.name === 'AbortError'
          ? 'MODEL_TIMEOUT'
          : error.message
    };
  }
}

async function runWithConcurrency(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function runWorker() {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(
    Array.from(
      { length: Math.min(limit, items.length) },
      runWorker
    )
  );
  return results;
}

function buildSynthesisPrompt(prompt, task, roleResults) {
  const evidence = roleResults
    .filter((entry) => entry.success)
    .map((entry) => [
      `## ${entry.assignment.title}`,
      entry.output.slice(0, 5000)
    ].join('\n'))
    .join('\n\n');
  return [
    'كوّن إجابة نهائية عربية عملية من مخرجات المراجعين.',
    'لا تنقل سلسلة تفكير، ولا تخترع مصدرًا، ولا تدّع تفوقًا مطلقًا.',
    'افصل النتيجة، الأدلة أو الافتراضات، المخاطر، وخطوات التحقق.',
    `نوع المهمة: ${task}`,
    '',
    `طلب المستخدم: ${prompt}`,
    '',
    'مخرجات المراجعة:',
    evidence
  ].join('\n').slice(0, 22000);
}

function deterministicSynthesis(roleResults) {
  const successful = roleResults.filter((entry) => entry.success);
  if (!successful.length) return '';
  return successful.map((entry) => [
    `### ${entry.assignment.title}`,
    entry.output
  ].join('\n')).join('\n\n');
}

function boundedExecutionProfile(profile, options = {}) {
  const bound = (value, minimum, maximum, fallback) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return fallback;
    return Math.min(maximum, Math.max(minimum, Math.floor(numeric)));
  };
  const keepAlive = String(
    options.executionKeepAlive || profile.keepAlive || ''
  ).trim();
  return {
    ...profile,
    numCtx: bound(
      options.executionNumCtx,
      512,
      profile.numCtx,
      profile.numCtx
    ),
    numPredict: bound(
      options.executionNumPredict,
      4,
      profile.numPredict,
      profile.numPredict
    ),
    timeoutMs: bound(
      options.executionTimeoutMs,
      1000,
      profile.timeoutMs,
      profile.timeoutMs
    ),
    ...(
      /^-?\d+(?:ms|s|m|h)?$/.test(keepAlive)
        ? { keepAlive }
        : {}
    ),
    ...(
      options.executionThink === false
        ? { think: false }
        : {}
    )
  };
}

function qualityGate(
  prompt,
  output,
  task,
  risk,
  executionState = {}
) {
  const checks = {
    nonEmptyOutput: output.length > 0,
    responseNotTruncated:
      executionState.tokenLimitReached !== true,
    arabicForArabicPrompt:
      !isArabic(prompt) || isArabic(output),
    noSecretMaterial: !containsSecretPattern(output),
    noAbsoluteSuperiorityClaim:
      !/(أفضل|أقوى|أسرع)\s+(?:نظام|ذكاء|نموذج)?.{0,20}(?:في الكون|في العالم|من كل النماذج|بلا منافس)|better than all models|best in the universe/i
        .test(output),
    noConsciousnessClaim:
      !/أنا\s+(?:واعٍ|واعي|أشعر|أحس)|I am conscious|I feel emotions/i
        .test(output),
    researchEvidenceBoundary:
      task !== 'RESEARCH' ||
      /مصدر|مرجع|دليل|لا أملك وصولًا|لا أملك وصولا|تحقق|source|citation|evidence|verify/i
        .test(output),
    highImpactHumanBoundary:
      !risk.highImpact ||
      /مراجعة بشرية|(?:^|[\s،.;:])مختص(?:$|[\s،.;:])|صاحب الصلاحية|human review|qualified professional/i
        .test(output)
  };
  const failed = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([id]) => id);
  return {
    status: failed.length
      ? 'QUALITY_REVIEW_REQUIRED'
      : 'QUALITY_GATES_PASSED',
    passed: failed.length === 0,
    checks,
    failed,
    semanticCorrectnessProven: false,
    externalFactAccuracyProven: false,
    independentExpertReviewCompleted: false
  };
}

async function fallbackAnswer(prompt, options = {}) {
  if (typeof options.fallbackExecutor === 'function') {
    return options.fallbackExecutor(prompt);
  }
  const result = await askWithFallback({
    prompt,
    system:
      'أجب بالعربية بصدق واختصار. لا تدّع التفوق المطلق، ولا تنفذ إجراءً مؤثرًا.',
    options: {
      temperature: 0.2,
      num_predict: 384
    }
  }, process.env.SHEIKHA_PROVIDER || 'local');
  return {
    success: result?.success === true,
    output: stripPrivateReasoning(result?.output),
    provider: result?._providerUsed || result?.provider || 'fallback',
    error: result?.error || result?.lastError || null
  };
}

function writeAudit(result, options = {}) {
  if (options.persist === false) {
    return {
      persisted: false,
      reason: 'PERSIST_DISABLED'
    };
  }
  const target = path.join(resolveRoot(options), FILES.audit);
  const entry = {
    eventId:
      `SHEIKHA-INTEL-${sha256(
        `${result.request.promptSha256}|${result.generatedAt}`
      ).slice(0, 20)}`,
    generatedAt: result.generatedAt,
    system: SYSTEM,
    status: result.status,
    task: result.task,
    mode: result.mode.resolved,
    prompt: {
      sha256: result.request.promptSha256,
      bytes: result.request.promptBytes,
      stored: false
    },
    response: {
      sha256: sha256(result.output),
      bytes: Buffer.byteLength(result.output || ''),
      stored: false
    },
    selectedModels: result.execution.selectedModels,
    successfulModelInvocations:
      result.execution.successfulModelInvocations,
    failedModelInvocations:
      result.execution.failedModelInvocations,
    qualityStatus: result.quality.status,
    humanApprovalRequired:
      result.governance.humanApprovalRequired,
    executionAuthorized: false
  };
  try {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.appendFileSync(target, `${JSON.stringify(entry)}\n`, 'utf8');
    return {
      persisted: true,
      path: FILES.audit,
      eventId: entry.eventId
    };
  } catch (error) {
    return {
      persisted: false,
      reason: error.message
    };
  }
}

async function executeIntelligenceRequest(input = {}, options = {}) {
  const generatedAt =
    options.generatedAt || new Date().toISOString();
  const inventory = options.inventory ||
    await discoverLocalModels(options);
  const plan = buildRoutingPlan(input, inventory);
  plan.mode.profile = boundedExecutionProfile(
    plan.mode.profile,
    options
  );
  const prompt = plan.sanitizedPrompt;

  if (plan.status === 'BLOCKED') {
    const blockedOutput = plan.risk.safetyBypass
      ? 'تم حظر طلب تجاوز الحماية. يمكنني المساعدة في تحليل دفاعي مصرح وتصميم ضوابط كشف ومنع.'
      : plan.risk.secretMaterial
        ? 'تم حظر الطلب لأنه يحتوي مادة سرية حساسة. أزل المفاتيح والأسرار ثم أعد الإرسال.'
        : 'تعذر قبول الطلب: اكتب طلبًا واضحًا ضمن الحد المسموح.';
    const result = {
      schemaVersion: '1.0.0',
      system: SYSTEM,
      generatedAt,
      success: false,
      status: 'BLOCKED_BY_GOVERNANCE',
      task: plan.task,
      mode: plan.mode,
      request: {
        promptSha256: plan.prompt.sha256,
        promptBytes: plan.prompt.bytes,
        secretsRedacted: plan.prompt.secretsRedacted,
        promptStored: false
      },
      routing: plan,
      execution: {
        selectedModels: [],
        modelInvocations: 0,
        successfulModelInvocations: 0,
        failedModelInvocations: 0,
        actualIndependentModelProcesses: false,
        actualIndependentModelInvocations: 0
      },
      output: blockedOutput,
      quality: qualityGate(
        prompt,
        blockedOutput,
        plan.task,
        plan.risk
      ),
      governance: {
        humanApprovalRequired:
          plan.risk.humanApprovalRequired,
        humanFinalDecision: true,
        automatedFatwa: false,
        executionAuthorized: false
      },
      comparison: {
        betterThanAllModelsClaimed: false,
        externalModelsBenchmarked: false
      }
    };
    result.audit = writeAudit(result, options);
    delete result.routing.sanitizedPrompt;
    return result;
  }

  const profile = plan.mode.profile;
  let roleResults = [];
  let fallback = null;
  if (plan.assignments.every((entry) => entry.model)) {
    roleResults = await runWithConcurrency(
      plan.assignments,
      profile.concurrency,
      async (assignment) => {
        const execution = await executeLocalModel({
          model: assignment.model,
          system: roleSystemPrompt(
            assignment,
            plan.task,
            plan.mode.resolved
          ),
          prompt,
          profile,
          assignment,
          task: plan.task,
          mode: plan.mode.resolved
        }, options);
        return {
          assignment,
          ...execution
        };
      }
    );
  } else {
    fallback = await fallbackAnswer(prompt, options);
  }

  let output = '';
  let synthesis = null;
  const successful = roleResults.filter((entry) => entry.success);
  if (plan.mode.resolved === 'standard') {
    output = successful[0]?.output || fallback?.output || '';
  } else if (successful.length > 0 && plan.synthesisModel) {
    const synthesisAssignment = {
      roleId: 'SYNTHESIS',
      title: 'Governed Synthesis',
      objective: 'compose the final bounded answer'
    };
    synthesis = await executeLocalModel({
      model: plan.synthesisModel,
      system: roleSystemPrompt(
        synthesisAssignment,
        plan.task,
        plan.mode.resolved
      ),
      prompt: buildSynthesisPrompt(
        prompt,
        plan.task,
        roleResults
      ),
      profile,
      assignment: synthesisAssignment,
      task: plan.task,
      mode: plan.mode.resolved
    }, options);
    output = synthesis.success
      ? synthesis.output
      : deterministicSynthesis(roleResults);
  } else {
    output = deterministicSynthesis(roleResults) ||
      fallback?.output ||
      '';
  }

  const modelInvocations =
    roleResults.length + (synthesis ? 1 : 0);
  const successfulModelInvocations =
    successful.length + (synthesis?.success ? 1 : 0);
  const failedModelInvocations =
    modelInvocations - successfulModelInvocations;
  const quality = qualityGate(
    prompt,
    output,
    plan.task,
    plan.risk,
    {
      tokenLimitReached: [
        ...roleResults,
        ...(synthesis ? [synthesis] : [])
      ].some((entry) =>
        entry.success === true &&
        Number(entry.metrics?.evalCount || 0) >=
          Number(profile.numPredict || 0)
      )
    }
  );
  const success = output.length > 0 &&
    quality.checks.noSecretMaterial;
  const result = {
    schemaVersion: '1.0.0',
    system: SYSTEM,
    generatedAt,
    success,
    status: success
      ? quality.passed
        ? 'COMPLETED_WITH_QUALITY_GATES'
        : 'COMPLETED_REVIEW_REQUIRED'
      : 'MODEL_EXECUTION_FAILED',
    task: plan.task,
    mode: plan.mode,
    request: {
      promptSha256: plan.prompt.sha256,
      promptBytes: plan.prompt.bytes,
      secretsRedacted: plan.prompt.secretsRedacted,
      redactionFindingCount:
        plan.prompt.redactionFindings.length,
      promptStored: false
    },
    routing: {
      ...plan,
      sanitizedPrompt: undefined
    },
    execution: {
      route: roleResults.length
        ? 'LOCAL_MULTI_MODEL'
        : 'PROVIDER_FALLBACK',
      selectedModels: plan.selectedModels,
      synthesisModel: plan.synthesisModel,
      roleSlots: plan.assignments.length,
      modelInvocations,
      successfulModelInvocations,
      failedModelInvocations,
      actualIndependentModelInvocations:
        successful.length,
      actualIndependentModelProcesses: false,
      roleResults: roleResults.map((entry) => ({
        roleId: entry.assignment.roleId,
        model: entry.model,
        success: entry.success,
        outputSha256: sha256(entry.output),
        outputBytes: Buffer.byteLength(entry.output || ''),
        metrics: entry.metrics,
        error: entry.error
      })),
      synthesis: synthesis
        ? {
          model: synthesis.model,
          success: synthesis.success,
          outputSha256: sha256(synthesis.output),
          outputBytes:
            Buffer.byteLength(synthesis.output || ''),
          metrics: synthesis.metrics,
          error: synthesis.error
        }
        : null,
      fallbackProvider: fallback?.provider || null
    },
    output,
    quality,
    governance: {
      noHarm: true,
      humanIsPrimaryAndAccountable: true,
      humanApprovalRequired:
        plan.risk.humanApprovalRequired,
      humanFinalDecision: true,
      automatedFatwa: false,
      shellExecuted: false,
      filesWrittenByModel: false,
      externalActionExecuted: false,
      executionAuthorized: false
    },
    comparison: {
      betterThanAllModelsClaimed: false,
      copilotBenchmarked: false,
      externalGptModelBenchmarked: false,
      allExternalModelsBenchmarked: false,
      resultScope: 'CURRENT_LOCAL_TASK_ROUTE_ONLY'
    }
  };
  result.audit = writeAudit(result, options);
  return result;
}

function externalProviderState() {
  return {
    openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
    anthropicConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
    geminiConfigured: Boolean(
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY
    ),
    credentialsExposed: false,
    externalUsageActivatedByStatusCheck: false
  };
}

function buildRoutingMatrix(inventory) {
  return {
    schemaVersion: '1.0.0',
    registry: 'SHEIKHA_TASK_MODEL_ROUTING_MATRIX_V1',
    status: inventory.models.length
      ? 'ACTIVE_LOCAL_ROUTING'
      : 'LOCAL_MODELS_UNAVAILABLE',
    modes: MODE_PROFILES,
    tasks: TASK_TYPES.map((task) => ({
      task,
      requirements: TASK_REQUIREMENTS[task],
      rankedModels: rankModels(inventory, task).map((model) => ({
        model: model.name,
        profileId: model.profileId,
        routingScore: model.routingScore,
        routingScoreIsBenchmarkScore: false
      }))
    })),
    policy: {
      taskCapabilityBeforeBrand: true,
      availabilityRequired: true,
      routingScoreIsBenchmarkScore: false,
      localFirst: true,
      noSingleProviderDependency: true
    }
  };
}

async function buildStatus(options = {}) {
  const contract = readJson(FILES.contract, {}, options);
  const inventory = options.inventory ||
    await discoverLocalModels(options);
  const capabilities =
    buildCapabilityRegistry(inventory, options);
  const benchmark = readJson(FILES.benchmark, {}, options);
  const acceleration =
    readJson(FILES.accelerationEvidence, {}, options);
  const checks = {
    contractActive: contract.status === 'ACTIVE_CONTRACT',
    localDiscoveryOperational:
      ['LOCAL_MODELS_DISCOVERED', 'NO_LOCAL_MODELS_DISCOVERED']
        .includes(inventory.status),
    capabilityRegistryGenerated:
      capabilities.count > 0,
    humanAuthority:
      contract.objective?.humansRemainPrimaryAndAccountable === true,
    shellDenied:
      contract.authority?.mayExecuteShell === false,
    fileWritesDenied:
      contract.authority?.mayWriteFiles === false,
    automatedFatwaDenied:
      contract.authority?.mayIssueReligiousRuling === false &&
      contract.governance?.automatedFatwa === false,
    absoluteSuperiorityDenied:
      contract.objective?.absoluteSuperiorityClaim === false,
    githubNotRequired:
      contract.providerPolicy?.githubRequired === false,
    copilotNotRequired:
      contract.providerPolicy?.copilotRequired === false
  };
  const failedChecks = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([id]) => id);
  const passed = failedChecks.length === 0;

  return {
    schemaVersion: '1.0.0',
    system: SYSTEM,
    generatedAt:
      options.generatedAt || new Date().toISOString(),
    status: passed
      ? inventory.models.length
        ? 'ACTIVE_LOCAL_MULTI_MODEL_CAPABILITY_ROUTER'
        : 'ACTIVE_GOVERNANCE_PROVIDER_FALLBACK_ONLY'
      : 'CAPABILITY_APEX_REVIEW_REQUIRED',
    passed,
    checks,
    failedChecks,
    coverage: {
      discoveredLocalModels: inventory.count,
      registeredCapabilities: capabilities.count,
      activeLocalCapabilities:
        capabilities.coverage.activeLocal,
      activeGovernedCapabilities:
        capabilities.coverage.activeGoverned,
      providerRequiredCapabilities:
        capabilities.coverage.providerRequired,
      toolRequiredCapabilities:
        capabilities.coverage.toolRequired,
      evidenceRequiredCapabilities:
        capabilities.coverage.evidenceRequired,
      reasoningModes: Object.keys(MODE_PROFILES).length,
      multiAgentRoleSlots: ROLE_CATALOG.length
    },
    localRuntime: {
      online: inventory.online,
      endpoint: inventory.endpoint,
      models: inventory.models.map((model) => ({
        name: model.name,
        profileId: model.profileId,
        capabilities: model.capabilities,
        benchmarkVerified: model.benchmarkVerified
      }))
    },
    externalProviders: externalProviderState(),
    acceleration: {
      status: acceleration.status || 'NOT_VERIFIED',
      hostGpuDetected:
        acceleration.hostGpu?.detectedOutsideCodexSandbox === true,
      gpuInferenceVerified:
        acceleration.ollama?.gpuInferenceVerified === true,
      observedComputeBackend:
        acceleration.ollama?.observedComputeBackend || 'UNKNOWN',
      observedVramBytes:
        Number(acceleration.ollama?.observedVramBytes || 0),
      explicitSystemPermissionApprovalRequired:
        acceleration.requiredHumanGate
          ?.explicitSudoApprovalRequired === true
    },
    benchmark: {
      status: benchmark.status || 'NOT_EXECUTED',
      executedCases:
        Number(benchmark.summary?.executedCases || 0),
      passedCases:
        Number(benchmark.summary?.passedCases || 0),
      externalComparisonCases: 0,
      competitorSuperiorityEstablished: false
    },
    modes: MODE_PROFILES,
    authority: contract.authority,
    providerPolicy: contract.providerPolicy,
    qualityPolicy: contract.qualityPolicy,
    governance: contract.governance,
    truthBoundaries: {
      betterThanAllModelsClaimed: false,
      bestPossibleByEvidenceObjective: true,
      copilotBenchmarked: false,
      externalGptModelBenchmarked: false,
      allExternalModelsBenchmarked: false,
      agiClaimed: false,
      asiClaimed: false,
      consciousnessClaimed: false,
      humansRemainPrimaryAndAccountable: true,
      modelProfilesAreNotBenchmarkProof: true,
      localOperationalSmokeIsNotCompetitorBenchmark: true
    },
    outputs: FILES,
    nextGate:
      'Run reproducible task suites with equal prompts, tools, budgets, ' +
      'hardware disclosure, blind scoring, and independent review before ' +
      'any comparative superiority statement.'
  };
}

async function buildActivationArtifacts(options = {}) {
  const inventory = await discoverLocalModels(options);
  return {
    inventory: {
      schemaVersion: '1.0.0',
      registry: 'SHEIKHA_LOCAL_MODEL_INVENTORY_V1',
      generatedAt:
        options.generatedAt || new Date().toISOString(),
      ...inventory,
      policy: {
        discoveryIsPerformanceBenchmark: false,
        modelNameIsCapabilityProof: false,
        localAvailabilityRequiredForExecution: true
      }
    },
    capabilities:
      buildCapabilityRegistry(inventory, options),
    routing: buildRoutingMatrix(inventory),
    report: await buildStatus({ ...options, inventory })
  };
}

module.exports = Object.freeze({
  SYSTEM,
  FILES,
  MODE_PROFILES,
  TASK_TYPES,
  MODEL_PROFILE_RULES,
  redactSecrets,
  safeOllamaUrl,
  profileModel,
  discoverLocalModels,
  buildCapabilityRegistry,
  classifyTask,
  classifyRisk,
  normalizeMode,
  rankModels,
  buildRoutingPlan,
  boundedExecutionProfile,
  executeLocalModel,
  qualityGate,
  executeIntelligenceRequest,
  buildRoutingMatrix,
  buildStatus,
  buildActivationArtifacts,
  writeJson
});
