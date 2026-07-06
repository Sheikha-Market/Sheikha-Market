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
    expect(result.performance.noPlaceholderTokens).toBe(true);
  });

  test('uses a fast live profile for extension chat latency', () => {
    const profile = resolveLiveProfile('فعل اللايف بسرعة', 'code', {
      channel: 'extension-chat'
    });

    expect(profile.route).toBe('SHEIKHA_REAL_MODEL_LIVE_STREAM_L65_V2');
    expect(profile.key).toBe('fast');
    expect(profile.numPredict).toBeLessThanOrEqual(48);
    expect(profile.timeoutMs).toBeLessThanOrEqual(60000);
    expect(selectLiveModel('فعل اللايف بسرعة', 'code', { channel: 'extension-chat' }))
      .toBe(profile.model);
    expect(shouldUseFastArabicDefault('فعل اللايف بسرعة', 'code', {
      channel: 'extension-chat'
    })).toBe(true);
    expect(buildFastArabicReply('فعل اللايف بسرعة')).toBe('تم، أعمل على ذلك الآن.');
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

  test('live chat writes an immediate Arabic token without waiting for model output', () => {
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
    expect(data).toContain('fast-arabic-default');
    expect(data).toContain('event: token');
    expect(data).toContain('تم، أعمل على ذلك الآن.');
    expect(data).toContain('event: done');
    expect(data).toContain('FAST_ARABIC_DEFAULT');
    expect(data).not.toContain('model_wait');
  });
});
