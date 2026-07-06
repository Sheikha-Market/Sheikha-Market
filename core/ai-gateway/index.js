'use strict';

// بوابة الذكاء الصناعي الموحدة — توجيه كامل عبر Provider Abstraction Layer

const { askSheikhaCore, getSheikhaGatewayStatus, isOllamaRecognitionPrompt } = require('./sheikha-ai-gateway');
const { askWithFallback, getProviderRegistryStatus } = require('../providers/provider-registry');

// نقطة الدخول الرئيسية — تستخدم Sheikha-Core الحاكمة
async function ask(input, opts = {}) {
  const prompt = typeof input === 'string' ? input : input?.prompt || '';
  return askSheikhaCore({ prompt, model: opts.model, context: opts.context || {} });
}

// توليد نص خام عبر سلسلة المزودات
async function generate(input, opts = {}) {
  const prompt = typeof input === 'string' ? input : String(input || '');
  return askWithFallback({ prompt, system: opts.system, model: opts.model, options: opts });
}

// محادثة دردشة (messages array)
async function chat(messages = [], opts = {}) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const prompt = lastUser?.content || '';
  const system = messages.find((m) => m.role === 'system')?.content || '';

  if (isOllamaRecognitionPrompt(prompt)) {
    const context = opts.context ? { ...opts.context, source: 'gateway-chat', channel: 'chat' } : { source: 'gateway-chat', channel: 'chat' };
    return askSheikhaCore({
      prompt,
      model: opts.model,
      context
    });
  }

  return askWithFallback({ prompt, system, model: opts.model, options: opts });
}

// تحليل صورة — يحتاج مزود يدعم multimodal
async function vision(image, opts = {}) {
  const provider = require('../providers/provider-registry').resolveProvider('gemini');
  return provider && typeof provider.vision === 'function'
    ? provider.vision(image, opts)
    : { success: false, error: 'vision_not_available', output: null };
}

// embedding — للمستقبل
async function embedding(text, opts = {}) {
  const provider = require('../providers/provider-registry').resolveProvider('openai');
  return provider && typeof provider.embedding === 'function'
    ? provider.embedding(text, opts)
    : { success: false, error: 'embedding_not_available', output: null };
}

async function reason(context, opts = {}) {
  return generate(context, opts);
}

async function tools(toolName, args) {
  return { success: false, error: 'tools_not_implemented', toolName, args };
}

// حالة البوابة الكاملة
async function getGatewayStatus() {
  const [ollamaStatus, registryStatus] = await Promise.allSettled([
    getSheikhaGatewayStatus(),
    Promise.resolve(getProviderRegistryStatus())
  ]);

  return {
    success: true,
    gateway: 'SHEIKHA_AI_GATEWAY',
    ollama: ollamaStatus.status === 'fulfilled' ? ollamaStatus.value : { error: ollamaStatus.reason?.message },
    registry: registryStatus.status === 'fulfilled' ? registryStatus.value : { error: registryStatus.reason?.message },
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  ask,
  generate,
  chat,
  vision,
  embedding,
  reason,
  tools,
  getGatewayStatus
};
