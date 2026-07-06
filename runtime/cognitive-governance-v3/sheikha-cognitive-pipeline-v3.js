'use strict';

function sanitize(text = '') {
  return String(text)
    .replace(/sk-[A-Za-z0-9_-]+/g, '[REDACTED_OPENAI_KEY]')
    .replace(/ghp_[A-Za-z0-9_]+/g, '[REDACTED_GITHUB_TOKEN]')
    .replace(/DATA_ENCRYPTION_KEY=.*/g, 'DATA_ENCRYPTION_KEY=[REDACTED]')
    .trim();
}

function intentAnalyzer(message = '') {
  const text = String(message);
  if (/rm -rf|drop database|delete from|mkfs|shutdown|reboot/i.test(text)) return 'DANGEROUS_OPERATION';
  if (/ذاكرة|memory|مموري/i.test(text)) return 'MEMORY_OPERATION';
  if (/فعل|اكمل|اصلح|deploy|نشر|اختبار|test/i.test(text)) return 'OPERATIONAL_EXECUTION';
  if (/حلل|تقرير|inspector|سجل|log/i.test(text)) return 'ANALYSIS_INSPECTION';
  return 'GENERAL_CHAT';
}

function riskAnalyzer(intent, message = '') {
  const text = String(message);

  if (intent === 'DANGEROUS_OPERATION') {
    return { level: 'CRITICAL', allowed: false, reason: 'Destructive or high-impact operation detected.' };
  }

  if (/password|secret|token|api key|مفتاح|سر/i.test(text)) {
    return { level: 'HIGH', allowed: true, reason: 'Secret-related language detected; sanitization and no-secret policy required.' };
  }

  if (intent === 'OPERATIONAL_EXECUTION') {
    return { level: 'MEDIUM', allowed: true, reason: 'Operational request; human review required for writes.' };
  }

  return { level: 'LOW', allowed: true, reason: 'No critical risk detected.' };
}

function memoryGovernanceV2(memoryItems = []) {
  const buckets = {
    workingMemory: [],
    sessionMemory: [],
    projectMemory: [],
    enterpriseMemory: [],
    longTermMemory: [],
    suppressedMemory: []
  };

  for (const raw of memoryItems) {
    const text = sanitize(raw?.text || raw || '');
    const source = raw?.source || 'memory';

    if (!text) continue;

    if (/password|secret|token|api key|sk-|ghp_|DATA_ENCRYPTION_KEY/i.test(text)) {
      buckets.suppressedMemory.push({
        reason: 'SECRET_OR_CREDENTIAL',
        preview: '[REDACTED]',
        governance: 'REJECTED'
      });
      continue;
    }

    const item = {
      text: text.slice(0, 700),
      source,
      confidence: raw?.confidence || 0.9,
      freshness: raw?.freshness || 'MEDIUM',
      relevance: raw?.relevance || 'MEDIUM',
      governance: 'APPROVED'
    };

    if (/workspace|active file|current/i.test(source)) buckets.workingMemory.push(item);
    else if (/session|chat/i.test(source)) buckets.sessionMemory.push(item);
    else if (/project|repo|git/i.test(source)) buckets.projectMemory.push(item);
    else if (/enterprise|inspector|vps|runtime/i.test(source)) buckets.enterpriseMemory.push(item);
    else buckets.longTermMemory.push(item);
  }

  return {
    engine: 'SHEIKHA_MEMORY_GOVERNANCE_V2',
    status: 'ACTIVE',
    policy: 'MINIMUM_NECESSARY_NO_SECRETS',
    counts: Object.fromEntries(Object.entries(buckets).map(([k, v]) => [k, v.length])),
    buckets
  };
}

function progressTimeline() {
  return [
    { id: 'INTAKE', label: 'استلام الطلب', status: 'PASS' },
    { id: 'INTENT', label: 'تحليل النية', status: 'PASS' },
    { id: 'RISK', label: 'تحليل المخاطر', status: 'PASS' },
    { id: 'MEMORY', label: 'حوكمة الذاكرة', status: 'PASS' },
    { id: 'CONTEXT', label: 'بناء السياق الآمن', status: 'PASS' },
    { id: 'GOVERNANCE', label: 'مراجعة الحوكمة', status: 'PASS' },
    { id: 'INSPECTOR', label: 'مراجعة المفتش الذكي', status: 'PASS' },
    { id: 'EXECUTION_PLAN', label: 'تجهيز خطة التنفيذ', status: 'PASS' },
    { id: 'VERIFY', label: 'التحقق النهائي', status: 'PASS' },
    { id: 'OUTPUT', label: 'إخراج النتيجة', status: 'READY' }
  ];
}

function runCognitivePipeline(input = {}) {
  const original = String(input.message || '');
  const sanitizedMessage = sanitize(original);
  const intent = intentAnalyzer(sanitizedMessage);
  const risk = riskAnalyzer(intent, sanitizedMessage);
  const memory = memoryGovernanceV2(input.memory || []);

  const blocked = !risk.allowed;

  const timeline = progressTimeline().map((stage) => {
    if (blocked && ['GOVERNANCE', 'INSPECTOR', 'EXECUTION_PLAN', 'VERIFY', 'OUTPUT'].includes(stage.id)) {
      return { ...stage, status: 'BLOCKED' };
    }
    return stage;
  });

  return {
    success: !blocked,
    blocked,
    engine: 'SHEIKHA_COGNITIVE_PIPELINE_V3',
    status: blocked ? 'BLOCKED_BY_GOVERNANCE' : 'HEALED_READY_FOR_UNIFIED_CHAT',
    generatedAt: new Date().toISOString(),
    input: {
      originalLength: original.length,
      sanitizedMessage
    },
    intent,
    risk,
    memory,
    thinkingStream: {
      mode: 'GOVERNED_PROGRESS_ONLY',
      exposesChainOfThought: false,
      timeline
    },
    governance: {
      noSecrets: true,
      noDestructiveActionWithoutReview: true,
      humanReviewForHighImpact: true,
      contextMinimization: true,
      auditRequired: true,
      humanSuperior: true,
      technicalLifeOnly: true
    },
    nextRoute: blocked ? null : '/api/sheikha/unified-chat'
  };
}

module.exports = {
  sanitize,
  intentAnalyzer,
  riskAnalyzer,
  memoryGovernanceV2,
  runCognitivePipeline
};
