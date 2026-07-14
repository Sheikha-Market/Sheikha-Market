const {
  status,
  resolveLiveProfile,
  shouldUseFastArabicDefault,
  buildFastArabicReply,
  selectLiveModel,
  buildPrompt
} = require('../runtime/live-realtime-fabric/v1/sheikha-live-realtime-fabric-v1');
const liveRealtimeRouter = require('../routes/live-realtime-fabric/sheikha-live-realtime-fabric-routes');

function createFakeSseResponse() {
  const chunks = [];
  return {
    ended: false,
    writeHead: jest.fn(),
    write(chunk) {
      chunks.push(String(chunk));
    },
    end() {
      this.ended = true;
    },
    body() {
      return chunks.join('');
    }
  };
}

describe('Sheikha Live Realtime Fabric V1', () => {
  // SHEIKHA_LIVE_REALTIME_TEST_ALIGNED_WITH_INLINE_MODEL_V2
  test('promotes live stream to L65 while keeping endpoint compatibility', () => {
    const result = status();

    expect(result.system).toBe('SHEIKHA_REAL_MODEL_LIVE_STREAM_L65_V2');
    expect(result.apexLevel).toBe(65);
    expect(result.compatibility.previousSystem).toBe('SHEIKHA_REAL_MODEL_LIVE_STREAM_L50_V1');
    expect(result.compatibility.endpointStable).toBe('/api/sheikha/live/chat/v1');
    expect(result.performance.liveFirst).toBe(true);
    expect(result.performance.ackBeforeModel).toBe(true);
    expect(result.performance.fastArabicDefault).toBe(true);
    expect(result.performance.firstArabicTokenWithoutModelWait).toBe(true);
    expect(result.performance.fastThenDeepStreaming).toBe(false);
    expect(result.performance.fastModelInlineStreaming).toBe(true);
    expect(result.performance.progressSeparatedFromFinalAnswer).toBe(true);
    expect(result.performance.backgroundDeepSingleFlight).toBe(false);
    expect(
      result.performance.backgroundDeepDisabledByDefault
    ).toBe(true);
    expect(result.performance.noPlaceholderTokens).toBe(true);
  });

  // SHEIKHA_LIVE_PROFILE_PRECEDENCE_TEST_RECONCILIATION_V3
  test('uses an explicit fast live profile for extension chat latency', () => {
    const message = 'أعطني حالة تشغيل مختصرة';
    const context = {
      channel: 'extension-chat',
      language: 'ar'
    };

    const profile = resolveLiveProfile(
      message,
      'live',
      context
    );

    expect(profile.route).toBe(
      'SHEIKHA_REAL_MODEL_LIVE_STREAM_L65_V2'
    );
    expect(profile.key).toBe('fast');
    expect(profile.model).toBe('tinyllama:latest');
    expect(profile.numPredict).toBeLessThanOrEqual(48);
    expect(profile.timeoutMs).toBeLessThanOrEqual(60000);
    expect(selectLiveModel(message, 'live', context)).toBe(
      'tinyllama:latest'
    );
  });

  test('preserves coding precedence inside extension chat', () => {
    const message =
      'اكتب اختبار JavaScript سريعًا يعيد القيمة الصحيحة';
    const context = {
      channel: 'extension-chat',
      language: 'ar'
    };

    const profile = resolveLiveProfile(
      message,
      'code',
      context
    );

    expect(profile.route).toBe(
      'SHEIKHA_REAL_MODEL_LIVE_STREAM_L65_V2'
    );
    expect(profile.key).toBe('code');
    expect(profile.model).toBe('qwen2.5-coder:7b');
    expect(profile.reason).toBe('code-quality-requested');
    expect(profile.sameLanguageModel).not.toBe(true);
    expect(selectLiveModel(message, 'code', context)).toBe(
      'qwen2.5-coder:7b'
    );
  });

  test('keeps deep reasoning available when explicitly requested', () => {
    const profile = resolveLiveProfile('حلل السبب الجذري بعمق', 'smart');

    expect(profile.key).toBe('reasoning');
    expect(profile.deepLayerEscalationAvailable).toBe(true);
    expect(profile.timeoutMs).toBeGreaterThan(60000);
  });

  test('builds a direct live prompt without placeholder phrases', () => {
    const prompt = buildPrompt('اختبر سلسلة الإمداد', { name: 'LIVE_FIRST_FAST_L65' });

    expect(prompt).toContain('Reply ONLY in Arabic');
    expect(prompt).toContain('السؤال:');
    expect(prompt).not.toContain('Live profile');
    expect(prompt).not.toContain('تم الاستلام:');
  });

  test('legacy immediate completion helper remains explicit while default routing uses inline model streaming', () => {
    const profile = resolveLiveProfile('اختبار سريع', 'code', {
      channel: 'extension-chat',
      language: 'ar'
    });
    const res = createFakeSseResponse();
    const started = Date.now();

    liveRealtimeRouter.__test.writeLivePrelude(res, profile, profile.model, true);
    liveRealtimeRouter.__test.writeFastArabicCompletion(res, 'اختبار سريع');

    const data = res.body();
    expect(Date.now() - started).toBeLessThan(1000);
    expect(res.ended).toBe(true);
    expect(data).toContain('event: ack');
    expect(data).toContain('"ok":true');
    expect(data).toContain('LIVE_FAST_ARABIC_FIRST');
    expect(data).toContain('event: meta');
    expect(data).toContain('"profile":"arabic-fast-default"');
    expect(data).toContain('fast-model-inline-stream');
    expect(data).toContain('event: token');
    expect(data).toContain('تم، أعمل على ذلك الآن.');
    expect(data).toContain('event: done');
    expect(data).toContain('FAST_ARABIC_DEFAULT');
    expect(data).not.toContain('model_wait');
  });

  test('separates immediate progress from the full extension answer stream', () => {
    const profile = resolveLiveProfile('اشرح النتيجة', 'chat', {
      channel: 'extension-chat',
      language: 'ar'
    });
    const deepProfile = liveRealtimeRouter.__test
      .createDeepStreamingProfile(profile);
    const res = createFakeSseResponse();

    liveRealtimeRouter.__test.writeLivePrelude(
      res,
      deepProfile,
      deepProfile.model,
      true,
      {
        mode: 'LIVE_FAST_THEN_DEEP_STREAM',
        profileName: 'arabic-fast-then-deep',
        deepModelMode: 'inline-stream',
        source: 'extension-deep-stream'
      }
    );
    liveRealtimeRouter.__test.writeFastArabicProgress(res);

    const data = res.body();
    expect(res.ended).toBe(false);
    expect(deepProfile.model).toBe('Sheikha-Core:latest');
    expect(data).toContain('LIVE_FAST_THEN_DEEP_STREAM');
    expect(data).toContain('event: progress');
    expect(data).toContain('"finalAnswer":false');
    expect(data).not.toContain('event: done');
  });
});
