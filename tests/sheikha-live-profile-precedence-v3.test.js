'use strict';

describe('Sheikha governed live profile precedence V3', () => {
  let runtime;

  beforeEach(() => {
    jest.resetModules();

    delete process.env.SHEIKHA_LIVE_FAST_MODEL;
    delete process.env.SHEIKHA_LIVE_CODE_MODEL;
    delete process.env.SHEIKHA_LIVE_ARABIC_MODEL;
    delete process.env.SHEIKHA_LIVE_REASONING_MODEL;
    delete process.env.SHEIKHA_OLLAMA_MODEL;

    runtime = require(
      '../runtime/live-realtime-fabric/v1/' +
      'sheikha-live-realtime-fabric-v1'
    );
  });

  test('routes explicit coding mode to Qwen', () => {
    const profile = runtime.resolveLiveProfile(
      'Return only this text: LIVE_MODEL_STREAM_OK',
      'coding'
    );

    expect(profile.key).toBe('code');
    expect(profile.model).toBe('qwen2.5-coder:7b');
    expect(profile.reason).toBe(
      'code-quality-requested'
    );
  });

  test('does not treat LIVE inside an identifier as fast intent', () => {
    const profile = runtime.resolveLiveProfile(
      'Return only this text: LIVE_MODEL_STREAM_OK',
      'smart'
    );

    expect(profile.key).not.toBe('fast');
    expect(profile.reason).not.toBe(
      'live-first-speed-requested'
    );
  });

  test('recognizes ordinary English coding prompts', () => {
    const profile = runtime.resolveLiveProfile(
      'Write a JavaScript function that returns true.',
      'coding'
    );

    expect(profile.key).toBe('code');
    expect(profile.model).toBe('qwen2.5-coder:7b');
  });

  test('does not replace Qwen for Arabic coding input', () => {
    const profile = runtime.resolveLiveProfile(
      'اكتب دالة جافاسكربت تعيد القيمة الصحيحة',
      'coding',
      { language: 'ar' }
    );

    expect(profile.key).toBe('code');
    expect(profile.model).toBe('qwen2.5-coder:7b');
    expect(profile.sameLanguageModel).not.toBe(true);
  });

  test('routes explicit reasoning mode before fast intent', () => {
    const profile = runtime.resolveLiveProfile(
      'Analyze this problem carefully and return it fast.',
      'reasoning'
    );

    expect(profile.key).toBe('reasoning');
    expect(profile.model).toBe('deepseek-r1:8b');
    expect(profile.reason).toBe(
      'deep-reasoning-requested'
    );
  });

  test('routes coding before explicit fast text', () => {
    const profile = runtime.resolveLiveProfile(
      'Fast: write a JavaScript test.',
      'coding'
    );

    expect(profile.key).toBe('code');
    expect(profile.model).toBe('qwen2.5-coder:7b');
  });

  test('retains explicit live mode for non-code requests', () => {
    const profile = runtime.resolveLiveProfile(
      'Give a brief operational status.',
      'live'
    );

    expect(profile.key).toBe('fast');
    expect(profile.model).toBe('tinyllama:latest');
  });

  test('retains lightweight Arabic ordinary conversation', () => {
    const profile = runtime.resolveLiveProfile(
      'اشرح حالة النظام باختصار',
      'general',
      { language: 'ar' }
    );

    expect(profile.key).toBe('general');
    expect(profile.model).toBe('tinyllama:latest');
    expect(profile.sameLanguageModel).toBe(true);
    expect(profile.deepArabicModel).toBe(
      'Sheikha-Core:latest'
    );
  });

  test('allows extension-chat deep escalation metadata', () => {
    const profile = runtime.resolveLiveProfile(
      'تحليل عميق للبنية',
      'general',
      {
        channel: 'extension-chat',
        language: 'ar'
      }
    );

    expect(profile.deepLayerEscalationAvailable).toBe(
      true
    );

    expect(profile.deepArabicModel).toBe(
      'Sheikha-Core:latest'
    );
  });
});
