'use strict';

const cp = require('child_process');
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');

const ROOT = process.env.SHEIKHA_ROOT || (
  fs.existsSync('/opt/sheikha/current') ? '/opt/sheikha/current' : process.cwd()
);
const AUDIT = path.join(ROOT, 'runtime/audit/sheikha-model-executor-audit.jsonl');
const DEFAULT_OLLAMA_URL =
  process.env.SHEIKHA_OLLAMA_URL || 'http://127.0.0.1:11434';
const DEFAULT_MODEL_TIMEOUT_MS = Number(
  process.env.SHEIKHA_MODEL_TIMEOUT_MS || 60000
);
const DEFAULT_MODEL_MAX_TOKENS = Number(
  process.env.SHEIKHA_MODEL_MAX_TOKENS || 256
);

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
      timeout: DEFAULT_MODEL_TIMEOUT_MS,
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

function chooseModelFromList(task, models = []) {
  const preferred = {
    coding: ['qwen2.5-coder:14b', 'qwen3:8b', 'Sheikha-Core:latest'],
    rag: ['qwen3:8b', 'Sheikha-Core:latest', 'llama3.1:8b'],
    report: ['qwen3:8b', 'Sheikha-Core:latest', 'llama3.1:8b'],
    reasoning: ['deepseek-r1:8b', 'qwen3:8b', 'Sheikha-Core:latest'],
    general: ['Sheikha-Core:latest', 'qwen3:8b', 'llama3.1:8b']
  }[task] || ['Sheikha-Core:latest'];

  return preferred.find((m) => models.includes(m)) || models[0] || null;
}

function chooseModel(task) {
  return chooseModelFromList(task, listModels());
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

function requestOllamaJson(pathname, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(
      pathname,
      options.baseUrl || DEFAULT_OLLAMA_URL
    );
    const payload = options.payload;
    const body = payload === undefined
      ? ''
      : JSON.stringify(payload);
    const transport = url.protocol === 'https:' ? https : http;
    const timeoutMs = Number(
      options.timeoutMs || DEFAULT_MODEL_TIMEOUT_MS
    );
    const maxResponseBytes = Number(
      options.maxResponseBytes || 10 * 1024 * 1024
    );
    let responseBytes = 0;

    const request = transport.request({
      method: options.method || (body ? 'POST' : 'GET'),
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: `${url.pathname}${url.search}`,
      headers: {
        Accept: 'application/json',
        ...(body
          ? {
              'Content-Type': 'application/json',
              'Content-Length': Buffer.byteLength(body)
            }
          : {})
      },
      timeout: timeoutMs
    }, (response) => {
      const chunks = [];

      response.on('data', (chunk) => {
        responseBytes += chunk.length;
        if (responseBytes > maxResponseBytes) {
          response.destroy(
            new Error('OLLAMA_RESPONSE_SIZE_LIMIT_EXCEEDED')
          );
          return;
        }
        chunks.push(chunk);
      });
      response.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        if (
          Number(response.statusCode || 0) < 200 ||
          Number(response.statusCode || 0) >= 300
        ) {
          const error = new Error(
            `OLLAMA_HTTP_${response.statusCode || 'UNKNOWN'}`
          );
          error.responsePreview = raw.slice(0, 240);
          reject(error);
          return;
        }

        try {
          resolve(raw ? JSON.parse(raw) : {});
        } catch {
          reject(new Error('OLLAMA_INVALID_JSON_RESPONSE'));
        }
      });
      response.on('error', reject);
    });

    request.on('timeout', () => {
      request.destroy(
        new Error(`OLLAMA_MODEL_TIMEOUT_${timeoutMs}MS`)
      );
    });
    request.on('error', reject);
    if (body) request.write(body);
    request.end();
  });
}

async function listModelsAsync(options = {}) {
  const response = await (
    options.requestJson || requestOllamaJson
  )('/api/tags', {
    baseUrl: options.baseUrl,
    timeoutMs: options.timeoutMs
  });

  return (response.models || [])
    .map((model) => String(model.name || model.model || '').trim())
    .filter(Boolean);
}

function buildPrompt(message, options = {}) {
  const system = [
    'أنت شيخة ضمن نظام حوكمة آمن.',
    'لا تنفذ حذفاً أو ماليات أو IoT أو أسرار.',
    'تحدث بصورة طبيعية ودافئة ومباشرة، وافهم المقصود من سياق الحوار.',
    'عالج سؤال المستخدم نفسه، ولا تطبع تقرير النظام أو Git أو المسارات الداخلية إلا إذا طلب التشخيص صراحة.',
    'أجب بنتيجة عملية مختصرة مع خطوات تحقق عند الحاجة.',
    'إذا احتجت تعديلاً على ملفات فاقترح patch أو استخدم مسار الكتابة الآمنة فقط.',
    'سياق المفتش المؤسسي للقراءة فقط، ولا تعتبر حالة غير مقاسة حقيقة تشغيلية.',
    'لا تدّع الوعي أو الشعور أو السمع أو البصر البشري؛ صف الحيوية كتفاعل تشغيلي واستجابة وسياق.'
  ].join('\n');
  const context = String(options.context || '').slice(0, 8000);
  const contextBlock = context
    ? `\n\nسياق المحادثة المحكوم:\n${context}`
    : '';

  return `${system}${contextBlock}\n\nالطلب:\n${message}`;
}

function buildModelFallback(task, model, error) {
  return {
    success: true,
    cluster: 'SHEIKHA_MODEL_CLUSTER_V1',
    scheduler: 'SHEIKHA_PIPELINE_SCHEDULER_V1',
    executor: 'SHEIKHA_MODEL_EXECUTOR_ASYNC_V1',
    task,
    model,
    fallback: true,
    error: String(error?.message || error || 'MODEL_RESPONSE_EMPTY'),
    answer:
      'لم يكتمل رد النموذج المحلي ضمن المهلة المحكومة. ' +
      'بقي الخادم مستجيبًا، ويمكن إعادة الطلب أو اختيار مسار محكوم متخصص.'
  };
}

async function executeAsync(message, options = {}) {
  const check = guard(message);
  if (!check.allowed) {
    if (options.audit !== false) {
      audit({
        action: 'blocked_async',
        messageBytes: Buffer.byteLength(String(message || '')),
        reason: check.reason
      });
    }
    return {
      success: false,
      blocked: true,
      reason: check.reason,
      answer:
        'تم حظر الطلب لأنه يتضمن صلاحية خطرة أو مدمرة. ' +
        'يمكنني تنفيذ قراءة أو كتابة محكومة أو تحليل آمن فقط.'
    };
  }

  const task = classify(message);
  let model = options.model || null;

  try {
    if (!model) {
      const models = options.models || await listModelsAsync(options);
      model = chooseModelFromList(task, models);
    }
    if (!model) {
      return {
        success: false,
        error: 'NO_OLLAMA_MODEL_AVAILABLE'
      };
    }

    const response = await (
      options.requestJson || requestOllamaJson
    )('/api/generate', {
      baseUrl: options.baseUrl,
      timeoutMs: options.timeoutMs,
      payload: {
        model,
        prompt: buildPrompt(message, options),
        stream: false,
        keep_alive: options.keepAlive || '10m',
        options: {
          temperature: Number(options.temperature ?? 0.2),
          num_ctx: Number(options.numContext || 2048),
          num_predict: Number(
            options.maxTokens || DEFAULT_MODEL_MAX_TOKENS
          )
        }
      }
    });
    const output = String(response.response || '').trim();

    if (!output) {
      return buildModelFallback(
        task,
        model,
        'MODEL_RESPONSE_EMPTY'
      );
    }

    if (options.audit !== false) {
      audit({
        action: 'model_execute_async',
        task,
        model,
        messageBytes: Buffer.byteLength(String(message || '')),
        outputBytes: Buffer.byteLength(output)
      });
    }

    return {
      success: true,
      cluster: 'SHEIKHA_MODEL_CLUSTER_V1',
      scheduler: 'SHEIKHA_PIPELINE_SCHEDULER_V1',
      executor: 'SHEIKHA_MODEL_EXECUTOR_ASYNC_V1',
      task,
      model,
      answer: output
    };
  } catch (error) {
    if (options.audit !== false) {
      audit({
        action: 'model_async_timeout_or_error',
        task,
        model,
        error: error.message
      });
    }
    return buildModelFallback(task, model, error);
  }
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

  const prompt = buildPrompt(message, options);

  const raw = sh(
    `curl -fsS http://127.0.0.1:11434/api/generate -H 'Content-Type: application/json' --data-binary @-`,
    JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.2,
        num_ctx: 2048,
        num_predict: DEFAULT_MODEL_MAX_TOKENS
      }
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

module.exports = {
  DEFAULT_MODEL_MAX_TOKENS,
  DEFAULT_MODEL_TIMEOUT_MS,
  DEFAULT_OLLAMA_URL,
  buildPrompt,
  chooseModel,
  chooseModelFromList,
  classify,
  execute,
  executeAsync,
  guard,
  listModels,
  listModelsAsync,
  requestOllamaJson
};
