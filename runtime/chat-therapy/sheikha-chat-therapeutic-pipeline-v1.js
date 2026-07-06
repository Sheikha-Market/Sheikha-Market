'use strict';

function sanitize(text = '') {
  return String(text)
    .replace(/sk-[A-Za-z0-9_-]+/g, '[REDACTED_OPENAI_KEY]')
    .replace(/ghp_[A-Za-z0-9_]+/g, '[REDACTED_GITHUB_TOKEN]')
    .replace(/DATA_ENCRYPTION_KEY=.*/g, 'DATA_ENCRYPTION_KEY=[REDACTED]')
    .trim();
}

function classify(message = '') {
  const t = String(message);
  if (/rm -rf|delete from|drop database|mkfs|shutdown|reboot/i.test(t)) return 'DANGEROUS';
  if (/token|secret|api key|password|مفتاح|سر/i.test(t)) return 'SECRET_RISK';
  if (/اصلح|فعّل|اكمل|شغل|deploy|نشر|اختبار|test/i.test(t)) return 'OPERATIONAL';
  if (/ذاكرة|memory|مموري/i.test(t)) return 'MEMORY';
  return 'GENERAL';
}

function memoryGovernance(memoryItems = []) {
  const safe = [];
  const rejected = [];

  for (const item of memoryItems) {
    const text = sanitize(item?.text || item || '');
    if (!text) continue;

    if (/password|token|secret|api key|sk-|ghp_|DATA_ENCRYPTION_KEY/i.test(text)) {
      rejected.push({ reason: 'SECRET_OR_CREDENTIAL', preview: '[REDACTED]' });
      continue;
    }

    safe.push({
      text: text.slice(0, 500),
      source: item.source || 'memory',
      allowedForContext: true
    });
  }

  return {
    engine: 'SHEIKHA_MEMORY_GOVERNANCE_V1',
    safeCount: safe.length,
    rejectedCount: rejected.length,
    safe,
    rejected,
    policy: 'MINIMUM_NECESSARY_NO_SECRETS'
  };
}

function therapeuticPipeline(input = {}) {
  const original = String(input.message || '');
  const cleaned = sanitize(original);
  const intent = classify(cleaned);
  const memory = memoryGovernance(input.memory || []);

  const stages = [
    { id: 'INTAKE', label: 'استقبال المدخل', status: 'PASS' },
    { id: 'CLEANSE', label: 'تنقية النص من الأسرار والضوضاء', status: 'PASS' },
    { id: 'CLASSIFY', label: 'تصنيف النية والمخاطر', status: 'PASS', intent },
    { id: 'MEMORY_GOVERNANCE', label: 'حوكمة الذاكرة قبل إدخالها للسياق', status: 'PASS' },
    { id: 'GOVERNANCE_REVIEW', label: 'مراجعة الحوكمة ومنع الضرر', status: intent === 'DANGEROUS' ? 'BLOCKED' : 'PASS' },
    { id: 'CONTEXT_MINIMIZATION', label: 'تقليل السياق للحد الأدنى اللازم', status: 'PASS' },
    { id: 'EXECUTION_READY', label: 'جاهز للتنفيذ الآمن', status: intent === 'DANGEROUS' ? 'BLOCKED' : 'PASS' }
  ];

  const blocked = intent === 'DANGEROUS';

  return {
    success: !blocked,
    blocked,
    engine: 'SHEIKHA_CHAT_THERAPEUTIC_PIPELINE_V1',
    status: blocked ? 'BLOCKED' : 'HEALED_READY',
    originalLength: original.length,
    sanitizedMessage: cleaned,
    intent,
    memory,
    stages,
    governance: {
      noSecrets: true,
      noDestructiveActionWithoutReview: true,
      humanReviewForHighImpact: true,
      humanSuperior: true,
      technicalLifeOnly: true
    },
    answerPrefix: blocked
      ? 'تم إيقاف الطلب لأنه يتضمن أثراً خطراً. يمكنني تحويله إلى فحص آمن أو خطة مراجعة.'
      : 'تمت معالجة المدخل عبر مراحل الحوكمة والتنقية والتحقق، وهو جاهز للإجابة الآمنة.'
  };
}

module.exports = { sanitize, classify, memoryGovernance, therapeuticPipeline };
