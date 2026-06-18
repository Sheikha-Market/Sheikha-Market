'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_REAL_MODEL_LIVE_STREAM_L50_V1',
    status: 'ACTIVE',
    apexLevel: 50,
    mode: 'REAL_MODEL_TOKEN_STREAM',
    placeholderRemoved: true,
    makeFastAnswerRemoved: true,
    routing: {
      general: 'Sheikha-Core:latest',
      code: 'qwen2.5-coder:7b',
      reasoning: 'deepseek-r1:8b',
      fast: 'tinyllama:latest'
    },
    governance: {
      principle: 'لا ضرر ولا ضرار',
      envProtected: true,
      secretsProtected: true,
      destructiveActionsBlocked: true
    }
  };
}

function selectLiveModel(message = '', mode = 'smart') {
  const text = String(message || '');
  if (mode === 'code' || /كود|برمج|debug|fix|test|اختبار/i.test(text)) return 'qwen2.5-coder:7b';
  if (/حلل|استنتج|reason|deep|منطق/i.test(text)) return 'deepseek-r1:8b';
  if (/سريع|مختصر|fast/i.test(text)) return 'tinyllama:latest';
  return process.env.SHEIKHA_OLLAMA_MODEL || 'Sheikha-Core:latest';
}

function buildPrompt(message = '') {
  return [
    'أجب مرة واحدة فقط بدون تكرار.',
    'لا تستخدم عبارات: تم الاستلام، سأبدأ، سأكمل في الخلفية.',
    'كن مباشراً ومفيداً.',
    String(message || '').trim()
  ].join('\n');
}

module.exports = { status, selectLiveModel, buildPrompt };
