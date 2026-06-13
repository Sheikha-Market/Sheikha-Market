'use strict';

const cp = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = process.env.SHEIKHA_ROOT || (
  fs.existsSync('/opt/sheikha/current') ? '/opt/sheikha/current' : process.cwd()
);
const AUDIT = path.join(ROOT, 'runtime/audit/sheikha-model-executor-audit.jsonl');

function audit(entry) {
  try {
    fs.mkdirSync(path.dirname(AUDIT), { recursive: true });
    fs.appendFileSync(AUDIT, JSON.stringify({ ...entry, at: new Date().toISOString() }) + '\n');
    return true;
  } catch (error) {
    console.warn('[SHEIKHA MODEL AUDIT]', error.message);
    return false;
  }
}

function sh(cmd, input = '') {
  try {
    return cp.execSync(cmd, {
      cwd: ROOT,
      input,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: Number(process.env.SHEIKHA_MODEL_TIMEOUT_MS || 300000),
      maxBuffer: 1024 * 1024 * 10
    }).trim();
  } catch (error) {
    audit({
      action: 'model_timeout_or_error',
      cmd,
      error: error.message
    });
    return '';
  }
}

function listModels() {
  const out = sh('ollama list || true');
  return out.split('\n').slice(1).map((l) => l.trim().split(/\s+/)[0]).filter(Boolean);
}

function chooseModel(task) {
  const models = listModels();
  const preferred = {
    coding: ['qwen2.5-coder:14b', 'qwen3:8b', 'Sheikha-Core:latest'],
    rag: ['qwen3:8b', 'Sheikha-Core:latest', 'llama3.1:8b'],
    report: ['qwen3:8b', 'Sheikha-Core:latest', 'llama3.1:8b'],
    reasoning: ['deepseek-r1:8b', 'qwen3:8b', 'Sheikha-Core:latest'],
    general: ['Sheikha-Core:latest', 'qwen3:8b', 'llama3.1:8b']
  }[task] || ['Sheikha-Core:latest'];

  return preferred.find((m) => models.includes(m)) || models[0] || null;
}

function classify(message) {
  const t = String(message || '');
  if (/كود|برمج|debug|ديبنق|دبق|fix|test|خطأ/i.test(t)) return 'coding';
  if (/rag|وثائق|حوكمة|معمارية|ابحث/i.test(t)) return 'rag';
  if (/تقرير|حلل|تحليل|افحص/i.test(t)) return 'report';
  if (/استنتج|منطق|reason/i.test(t)) return 'reasoning';
  return 'general';
}

function guard(message) {
  const t = String(message || '').toLowerCase();
  const blocked = [
    'rm -rf',
    'mkfs',
    'shutdown',
    'reboot',
    'drop database',
    'truncate',
    'delete from',
    'payment',
    'تحويل مالي',
    'افتح القفل',
    'iot actuator'
  ];
  const hit = blocked.find((x) => t.includes(x));
  if (hit) return { allowed: false, reason: `BLOCKED_DANGEROUS_REQUEST:${hit}` };
  return { allowed: true };
}

function execute(message, options = {}) {
  const check = guard(message);
  if (!check.allowed) {
    audit({ action: 'blocked', message, reason: check.reason });
    return {
      success: false,
      blocked: true,
      reason: check.reason,
      answer: 'تم حظر الطلب لأنه يتضمن صلاحية خطرة أو مدمرة. يمكنني تنفيذ قراءة/كتابة محكومة أو تحليل آمن فقط.'
    };
  }

  const task = classify(message);
  const model = chooseModel(task);
  if (!model) {
    return { success: false, error: 'NO_OLLAMA_MODEL_AVAILABLE' };
  }

  const system = [
    'أنت شيخة ضمن نظام حوكمة آمن.',
    'لا تنفذ حذفاً أو ماليات أو IoT أو أسرار.',
    'أجب بنتيجة عملية مختصرة مع خطوات تحقق.',
    'إذا احتجت تعديلاً على ملفات فاقترح patch أو استخدم مسار الكتابة الآمنة فقط.',
    'سياق المفتش المؤسسي للقراءة فقط، ولا تعتبر حالة غير مقاسة حقيقة تشغيلية.'
  ].join('\n');

  const context = String(options.context || '').slice(0, 8000);
  const contextBlock = context ? `\n\nسياق Enterprise Inspector:\n${context}` : '';
  const prompt = `${system}${contextBlock}\n\nالطلب:\n${message}`;

  const raw = sh(
    `curl -fsS http://127.0.0.1:11434/api/generate -H 'Content-Type: application/json' --data-binary @-`,
    JSON.stringify({
      model,
      prompt,
      stream: false
    })
  );

  let output = raw;
  try {
    output = JSON.parse(raw).response || raw;
  } catch (_) {
    output = raw;
  }

  if (!output) {
    return {
      success: true,
      cluster: 'SHEIKHA_MODEL_CLUSTER_V1',
      scheduler: 'SHEIKHA_PIPELINE_SCHEDULER_V1',
      executor: 'SHEIKHA_MODEL_EXECUTOR_V1',
      task,
      model,
      fallback: true,
      answer: 'الشات يعمل عبر المسار الاحتياطي الآمن. النموذج المحلي تأخر أو لم يرجع رداً ضمن المهلة، ولم يتم كسر مسار الشات.'
    };
  }

  audit({
    action: 'model_execute',
    task,
    model,
    messageBytes: Buffer.byteLength(message),
    outputBytes: Buffer.byteLength(output)
  });

  return {
    success: true,
    cluster: 'SHEIKHA_MODEL_CLUSTER_V1',
    scheduler: 'SHEIKHA_PIPELINE_SCHEDULER_V1',
    executor: 'SHEIKHA_MODEL_EXECUTOR_V1',
    task,
    model,
    answer: output
  };
}

module.exports = { execute, listModels, chooseModel, classify };
