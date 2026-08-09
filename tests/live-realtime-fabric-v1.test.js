const {
  status,
  resolveLiveProfile,
  shouldUseFastArabicDefault,
  buildFastArabicReply,
  buildGovernedLocalFallbackReply,
  buildGovernedShellReviewReply,
  buildGovernedOperationalEvidenceReply,
  buildGovernedContextualReportReply,
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
  // SHEIKHA_LIVE_REALTIME_TEST_ALIGNED_WITH_ARABIC_FIRST_TOKEN_V3
  test('promotes live stream to L65 while keeping endpoint compatibility', () => {
    const result = status();

    expect(result.system).toBe('SHEIKHA_REAL_MODEL_LIVE_STREAM_L65_V2');
    expect(result.apexLevel).toBe(65);
    expect(result.compatibility.previousSystem).toBe('SHEIKHA_REAL_MODEL_LIVE_STREAM_L50_V1');
    expect(result.compatibility.endpointStable).toBe('/api/sheikha/live/chat/v1');
    expect(result.performance.liveFirst).toBe(true);
    expect(result.performance.ackBeforeModel).toBe(true);
    expect(result.performance.fastArabicDefault).toBe(true);
    expect(result.performance.firstProgressSignalBeforeModel).toBe(false);
    expect(result.performance.firstArabicTokenWithoutModelWait).toBe(true);
    expect(result.performance.immediateContextualArabicOpening).toBe(true);
    expect(result.performance.fastThenDeepStreaming).toBe(true);
    expect(result.performance.fastModelInlineStreaming).toBe(true);
    expect(
      result.performance.modelFirstTokenHardTimeoutEnabled
    ).toBe(true);
    expect(
      result.performance.governedLocalFallbackOnBudgetExceeded
    ).toBe(true);
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
    const liveStatus = status();

    const profile = resolveLiveProfile(
      message,
      'live',
      context
    );

    expect(profile.route).toBe(
      'SHEIKHA_REAL_MODEL_LIVE_STREAM_L65_V2'
    );
    expect(profile.key).toBe('fast');
    expect(profile.model).toBe(liveStatus.routing.arabicFast);
    expect(profile.numPredict).toBeLessThanOrEqual(48);
    expect(profile.numCtx).toBe(1024);
    expect(profile.timeoutMs).toBeLessThanOrEqual(60000);
    expect(profile.modelFirstTokenHardTimeoutMs).toBe(8000);
    expect(selectLiveModel(message, 'live', context)).toBe(
      liveStatus.routing.arabicFast
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

  test('does not route a generic Arabic verification request as coding', () => {
    const liveStatus = status();
    const profile = resolveLiveProfile(
      'اختبار حي بعد التكامل',
      'smart',
      {
        channel: 'extension-chat',
        language: 'ar'
      }
    );

    expect(profile.key).toBe('fast');
    expect(profile.model).toBe(liveStatus.routing.arabicFast);
  });

  test('routes an ASCII shell request from the Arabic extension to Qwen code', () => {
    const profile = resolveLiveProfile(
      'cd "$HOME/project"\nfind . -type f\nsha256sum artifact.zip',
      'smart',
      {
        channel: 'extension-chat',
        language: 'ar'
      }
    );

    expect(profile.key).toBe('code');
    expect(profile.model).toBe('qwen2.5-coder:7b');
    expect(profile.outputLanguage).toBe('ar');
    expect(buildPrompt('cd "$HOME/project"', profile))
      .toContain('Reply ONLY in Arabic');
  });

  test('defaults extension requests to deep stream unless fast-only is explicit', () => {
    expect(
      liveRealtimeRouter.__test.shouldUseDeepExtensionStream(
        'extension-chat',
        ''
      )
    ).toBe(true);
    expect(
      liveRealtimeRouter.__test.shouldUseDeepExtensionStream(
        'extension-chat',
        'FAST_ONLY'
      )
    ).toBe(false);
  });

  test('keeps deep reasoning available when explicitly requested', () => {
    const liveStatus = status();
    const profile = resolveLiveProfile('حلل السبب الجذري بعمق', 'smart');

    expect(profile.key).toBe('reasoning');
    expect(profile.model).toBe(liveStatus.routing.arabicReasoning);
    expect(profile.deepLayerEscalationAvailable).toBe(true);
    expect(profile.timeoutMs).toBeGreaterThan(60000);
  });

  test('builds a direct live prompt without placeholder phrases', () => {
    const prompt = buildPrompt('اختبر سلسلة الإمداد', { name: 'LIVE_FIRST_FAST_L65' });

    expect(prompt).toContain('Reply ONLY in Arabic');
    expect(prompt).toContain('السؤال:');
    expect(prompt).toContain('لا تذكر اسمك أو اسم النموذج');
    expect(prompt).toContain('أكمل جميع النقاط أو البنود');
    expect(prompt).not.toContain('Live profile');
    expect(prompt).not.toContain('تم الاستلام:');
  });

  test('legacy immediate completion helper remains explicit', () => {
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
    expect(data).toContain(
      'contextual-arabic-opening-then-fast-model-stream'
    );
    expect(data).toContain('event: token');
    expect(data).toContain('نتيجة الفحص المباشر:');
    expect(data).toContain('event: done');
    expect(data).toContain('FAST_ARABIC_DEFAULT');
    expect(data).not.toContain('model_wait');
  });

  test('sends a contextual Arabic token before the full answer stream', () => {
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
    liveRealtimeRouter.__test.writeFastArabicOpening(
      res,
      'اشرح النتيجة'
    );

    const data = res.body();
    expect(res.ended).toBe(false);
    expect(deepProfile.model).toBe('qwen2.5-coder:7b');
    expect(data).toContain('LIVE_FAST_THEN_DEEP_STREAM');
    expect(data).toContain('event: token');
    expect(data).toContain('"immediate":true');
    expect(data).toContain('"partial":true');
    expect(data).toContain('إليك النتيجة مباشرة:');
    expect(data).not.toContain('event: done');
  });

  test('keeps the CPU deep stream alive long enough for a real model token', () => {
    const profile = resolveLiveProfile('اكتب تقريرًا موجزًا', 'chat', {
      channel: 'extension-chat',
      language: 'ar'
    });
    const deepProfile = liveRealtimeRouter.__test
      .createDeepStreamingProfile(profile);

    expect(deepProfile.timeoutMs).toBe(120000);
    expect(deepProfile.numCtx).toBe(1024);
    expect(deepProfile.numThread).toBe(16);
    expect(deepProfile.modelFirstTokenHardTimeoutMs).toBe(75000);
    expect(deepProfile.modelFirstTokenHardTimeoutMs)
      .toBeGreaterThan(deepProfile.firstTokenTargetMs);
    expect(deepProfile.modelFirstTokenHardTimeoutAuthoritative).toBe(true);
  });

  test('does not let the global fast budget truncate an extension deep stream', () => {
    const previousBudget =
      process.env.SHEIKHA_LIVE_MODEL_FIRST_TOKEN_HARD_TIMEOUT_MS;
    process.env.SHEIKHA_LIVE_MODEL_FIRST_TOKEN_HARD_TIMEOUT_MS = '8000';

    try {
      const profile = resolveLiveProfile('اكتب تقريرًا موجزًا', 'chat', {
        channel: 'extension-chat',
        language: 'ar'
      });
      const deepProfile = liveRealtimeRouter.__test
        .createDeepStreamingProfile(profile);
      const effectiveBudget = liveRealtimeRouter.__test
        .resolveModelFirstTokenHardTimeoutMs(deepProfile);

      expect(effectiveBudget).toBe(75000);
    } finally {
      if (previousBudget === undefined) {
        delete process.env.SHEIKHA_LIVE_MODEL_FIRST_TOKEN_HARD_TIMEOUT_MS;
      } else {
        process.env.SHEIKHA_LIVE_MODEL_FIRST_TOKEN_HARD_TIMEOUT_MS =
          previousBudget;
      }
    }
  });

  test('keeps the model selected for an explicit reasoning request', () => {
    const profile = resolveLiveProfile(
      'حلل حالة المنظومة وحدد المخاطر',
      'smart',
      {
        channel: 'extension-chat',
        language: 'ar'
      }
    );
    const deepProfile = liveRealtimeRouter.__test
      .createDeepStreamingProfile(profile);

    expect(profile.key).toBe('reasoning');
    expect(deepProfile.model).toBe('qwen2.5-coder:7b');
  });

  test('reviews a shell launcher immediately without executing it', () => {
    const reply = buildGovernedShellReviewReply([
      'cd "$HOME/project"',
      'EXPECTED_BUNDLE_SHA256="abc"',
      'BUNDLE=$(find "$HOME/Downloads" -type f)',
      'sha256sum "$BUNDLE"',
      'chmod 700 "$BUNDLE"',
      'bash "$BUNDLE"'
    ].join('\n'));

    expect(reply).toContain('لم أنفذ هذه الأوامر');
    expect(reply).toContain('مطابقة بصمات SHA-256');
    expect(reply).toContain('الخطر الأعلى هو تشغيل bash');
    expect(reply).toContain('موافقة بشرية منفصلة');
  });

  test('identifies the F12_D2 missing evidence file as a pre-publish failure', () => {
    const reply = buildGovernedShellReviewReply([
      'bash "$LAUNCHER"',
      'F12_D2_EXIT_CODE=1',
      '--- /tmp/expected.txt',
      '+++ /tmp/actual.txt',
      '-current-worktree-state.json'
    ].join('\n'));

    expect(reply).toContain('لم أنفذ أي أمر');
    expect(reply).toContain('current-worktree-state.json');
    expect(reply).toContain('فشلت قبل النشر الذري');
    expect(reply).toContain('ببصمة جديدة');
  });

  test('reads operational completion markers without claiming file verification', () => {
    const reply = buildGovernedOperationalEvidenceReply([
      'اعتماد توقف F12-D2',
      'SELECTION_REVIEW_FILE_COUNT=23',
      'SELECTION_REVIEW_DIGEST_LIST_VALID=true',
      'SELECTION_REVIEW_COMPLETE=true',
      'SELECTION_REVIEW_TERMINAL=true',
      'SELECTION_REVIEW_RERUN_ALLOWED=false',
      'F12_D2_R1_EXIT_CODE=0',
      'F12_D2_R1_COMPLETED_SUCCESSFULLY=true'
    ].join('\n'));

    expect(reply).toContain('F12_D2_R1');
    expect(reply).toContain('مكتملة بنجاح');
    expect(reply).toContain('إعادة تشغيل المرحلة ممنوعة');
    expect(reply).toContain('النص وحده');
    expect(reply).toContain('لم أنفذ');
  });

  test('builds a complete contextual report from the prior inspector answer', () => {
    const report = buildGovernedContextualReportReply([
      'الحالة الموثقة الآن: حالة المنظومة: HEALTHY.',
      'التشخيص: 0 أخطاء، 19 تحذيرًا، الخادم ACTIVE، والإضافة CONNECTED.',
      'الموارد: حمل الدقيقة 0.67، الذاكرة 44%، Heap 67&amp;#x2F;100MB.',
      'المخاطر: 19 تحذيرًا يحتاج الفرز، مساحة العمل غير نظيفة وبها 155 تغييرًا.',
      'الحوكمة: ACTIVE، والإجراءات عالية الأثر تتطلب مراجعة بشرية: نعم.',
      'أفضل إجراء تالٍ دون أثر مرتفع: فرز التحذيرات وتشغيل الاختبارات المستهدفة.',
      'لم يُنفذ أي إجراء عالي الأثر.'
    ].join('\n'), 'اكتبي تقرير');

    expect(report).toContain('## تقرير حالة منظومة شيخة');
    expect(report).toContain('0 أخطاء، 19 تحذيرًا');
    expect(report).toContain('Heap 67/100MB');
    expect(report).not.toContain('&amp;#x2F;');
    expect(report).toContain('### المخاطر');
    expect(report).toContain('155 تغييرًا');
    expect(report).toContain('### حدود التقرير');
    expect(report).not.toContain('تم إعداد هذا التقرير بنجاح');
  });

  test('builds a concise read-only Enterprise Inspector analysis', () => {
    const summary = liveRealtimeRouter.__test
      .buildEnterpriseInspectorArabicSummary({
        status: 'ACTIVE',
        health: {
          overall: 'HEALTHY',
          runtime: 'ACTIVE',
          extension: 'CONNECTED',
          runtimeFabricV5: 'ACTIVE_SINGLE_NODE_OPERATIONAL',
          diagnostics: { errors: 0, warnings: 7 }
        },
        runtime: {
          cpuLoad1m: 2.5,
          ramUsedPercent: 48,
          heapUsedMb: 64,
          heapTotalMb: 72
        },
        git: { clean: false, changedFileCount: 12 },
        governance: {
          status: 'ACTIVE',
          humanReviewForHighImpactActions: true
        }
      });

    expect(summary).toContain('حالة المنظومة: HEALTHY');
    expect(summary).toContain('0 أخطاء، 7 تحذيرًا');
    expect(summary).toContain('12 تغييرًا');
    expect(summary).toContain('لم يُنفذ أي إجراء عالي الأثر');
  });

  test('completes an exact-output contract without a model call', () => {
    const res = createFakeSseResponse();

    liveRealtimeRouter.__test.writeExactOutputCompletion(
      res,
      'LIVE_MODEL_STREAM_OK'
    );

    expect(res.ended).toBe(true);
    expect(res.body()).toContain('LIVE_MODEL_STREAM_OK');
    expect(res.body()).toContain('"modelUsed":false');
  });

  test('completes a governed local fallback instead of hanging', () => {
    const res = createFakeSseResponse();
    const fallback = buildGovernedLocalFallbackReply(
      'اختبار حي بعد التكامل'
    );

    liveRealtimeRouter.__test.writeGovernedFallbackCompletion(
      res,
      'اختبار حي بعد التكامل',
      {
        model: 'Sheikha-Core:latest',
        budgetMs: 12000
      }
    );

    expect(fallback).toContain('نجح اتصال الشات والبث');
    expect(res.ended).toBe(true);
    expect(res.body()).toContain(
      'governed-local-time-budget-fallback'
    );
    expect(res.body()).toContain(
      'GOVERNED_LOCAL_TIME_BUDGET_FALLBACK'
    );
    expect(res.body()).toContain('"modelCompleted":false');
  });
});
