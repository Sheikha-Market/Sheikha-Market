'use strict';

const {
  DEFAULT_BASE_URL,
  DEFAULT_EXTENSION_CHAT_LANGUAGE,
  EXTENSION_STREAMING_ARTIFACT_APEX_STATUS_ENDPOINT,
  EXTENSION_TRANSPORT_VERSION,
  LOCAL_BASE_URL,
  ORGANIZATION_CONTROL_STATUS_ENDPOINT,
  STREAMING_CHAT_APEX_STREAM_ENDPOINT,
  buildEnterpriseInspectorArabicSummary,
  buildGovernedOperationalEvidenceFallbackAnswer,
  buildGovernedContextualReportFallbackAnswer,
  buildContextualRepairFallbackAnswer,
  buildContextualRepairResolutionAnswer,
  buildExtensionActivationEvidenceAnswer,
  buildGovernedEditorialDocument,
  buildGovernedShellReviewFallbackAnswer,
  buildLocalChatFallbackAnswer,
  isStructuredOperationalEvidenceReviewRequest,
  isContextualReportFollowUpRequest,
  isGovernedShellCommandRequest,
  isLocalBaseUrl,
  isProvisionalLiveResponse,
  parseSseBuffer,
  safeJsonParse,
  sendExtensionChat,
  resolveRecentGovernedShellContext,
  resolveRecentContextualReportContext,
  isInspectorContinuationRequest,
  resolveRecentInspectorContinuation,
  buildInspectorContinuationAnswer,
  buildInspectorDiagnosticTriage,
  buildInspectorGitTriage,
  extractAnswerText,
  isAmbiguousExecutionRequest,
  isWebsiteRequest,
  isSheikhaChatIdentityRequest,
  isSheikhaCapabilitiesRequest,
  isUsefulDiscoveryRequest,
  isStandaloneReportRequest,
  isCommercialReadinessRequest,
  isChatLlmReadinessRequest,
  resolveRecentContextualRepairContext,
  shouldUseGovernedLiveTransport,
  shouldUseUnifiedFallback
} = require('../src/sheikhaExtensionChatClient');

describe('Sheikha Extension Chat Transport', () => {
  test('answers Sheikha chat identity as a governed product surface', async () => {
    expect(isSheikhaChatIdentityRequest('الشات ؟')).toBe(true);
    const result = await sendExtensionChat('الشات ؟', { streaming: true });
    expect(result.answer).toContain('واجهة تشغيل محلية محكومة');
    expect(result.raw.route).toBe('SHEIKHA_EXTENSION_CHAT_IDENTITY_V1');
  });

  test('answers product identity, capabilities and useful priorities locally', async () => {
    expect(isSheikhaChatIdentityRequest('شيخة عرفي عن نفسك')).toBe(true);
    expect(isSheikhaCapabilitiesRequest('ماذا يمكنك ان تفعل')).toBe(true);
    expect(isUsefulDiscoveryRequest('ابحث لي عن ما هو مفيد')).toBe(true);

    const identity = await sendExtensionChat('عرف شيخة', { streaming: true });
    const capabilities = await sendExtensionChat('ماذا يمكنك ان تفعل', { streaming: true });
    const useful = await sendExtensionChat('ابحث لي عن ما هو مفيد', { streaming: true });

    expect(identity.answer).toContain('SHEIKHA UGIT-RP');
    expect(identity.answer).not.toContain('شجرة');
    expect(capabilities.answer).toContain('قدرات شات شيخة');
    expect(useful.answer).toContain('أعلى الأعمال فائدة الآن');
    expect(capabilities.raw.modelInvoked).toBe(false);
  });

  test('writes a complete standalone report from the latest diagnosis', async () => {
    expect(isStandaloneReportRequest('اكتبي تقرير')).toBe(true);
    const result = await sendExtensionChat('اكتبي تقرير', {
      streaming: true,
      history: [{
        role: 'assistant',
        content: 'حالة المنظومة: HEALTHY.\nالتشخيص: 0 أخطاء، 3 تحذيرات.\nالمخاطر: مساحة العمل غير نظيفة.'
      }]
    });
    expect(result.answer).toContain('# تقرير:');
    expect(result.answer).toContain('3 تحذيرات');
    expect(result.answer).toContain('حدود النتيجة');
    expect(result.raw.modelInvoked).toBe(false);
  });

  test('reports commercial readiness with evidence and explicit gaps', async () => {
    expect(isCommercialReadinessRequest('ما يحتاجه الموقع للتشغيل التجاري')).toBe(true);
    const result = await sendExtensionChat('ما يحتاجه الموقع للتشغيل التجاري', {
      streaming: true,
      siteStatusLoader: async () => ({ success: true, data: { status: 'ok' } })
    });
    expect(result.answer).toContain('42/42');
    expect(result.answer).toContain('دورة الطلب والدفع');
    expect(result.answer).toContain('لا تُعلن');
    expect(result.raw.route).toBe('SHEIKHA_EXTENSION_COMMERCIAL_READINESS_V1');
  });
  test('reports governed chat and LLM readiness without waiting for a model', async () => {
    expect(isChatLlmReadinessRequest(
      'اصلح الشات واللغة LLM الضخمة والتكامل والوقت للانتاج التجاري'
    )).toBe(true);
    const result = await sendExtensionChat(
      'اصلح الشات واللغة LLM الضخمة والتكامل والوقت للانتاج التجاري',
      {
        streaming: true,
        llmIntegrationLoader: async () => ({
          data: {
            status: 'COMMERCIAL_INTEGRATION_BLOCKED',
            progressPercent: 33.33,
            trainingMode: 'LICENSED_BASE_MODEL_ADAPTATION',
            modelClassClaim: 'UNVERIFIED',
            modelIsLargeVerified: false,
            estimatedCalendar: { minimumWeeks: 2, maximumWeeks: 8 },
            blockers: ['MODEL_LICENSE_VERIFICATION_REQUIRED']
          }
        })
      }
    );
    expect(result.answer).toContain('33.33%');
    expect(result.answer).toContain('2–8 أسبوعًا');
    expect(result.answer).toContain('MODEL_LICENSE_VERIFICATION_REQUIRED');
    expect(result.raw.route).toBe('SHEIKHA_EXTENSION_CHAT_LLM_READINESS_V1');
    expect(result.raw.modelInvoked).toBe(false);
  });
  test('routes website launch and domain requests without model refusal', async () => {
    expect(isWebsiteRequest('شغلي الموقع')).toBe(true);
    expect(isWebsiteRequest('www.sheikha.top')).toBe(true);
    const result = await sendExtensionChat('شغلي الموقع', {
      streaming: true,
      siteStatusLoader: async () => ({ success: true, data: { status: 'ok' } })
    });

    expect(result.answer).toContain('موقع شيخة يعمل محليًا');
    expect(result.answer).toContain('https://www.sheikha.top');
    expect(result.raw.route).toBe('SHEIKHA_EXTENSION_WEBSITE_STATUS_V1');
    expect(result.raw.modelInvoked).toBe(false);
  });
  test('answers an ambiguous run request locally without model timeout', async () => {
    expect(isAmbiguousExecutionRequest('شغل')).toBe(true);
    const startedAt = Date.now();
    const result = await sendExtensionChat('شغل', {
      streaming: true,
      baseUrl: 'http://127.0.0.1:1'
    });

    expect(result.success).toBe(true);
    expect(result.answer).toContain('شغّل المشروع محليًا');
    expect(result.raw.route)
      .toBe('SHEIKHA_EXTENSION_GOVERNED_INTENT_CLARIFICATION_V1');
    expect(result.raw.modelInvoked).toBe(false);
    expect(Date.now() - startedAt).toBeLessThan(250);
  });
  test('renders structured model answers without object coercion', () => {
    expect(extractAnswerText({ answer: { content: [{ text: 'شرح الكود كامل.' }] } }))
      .toBe('شرح الكود كامل.');
    expect(extractAnswerText({ files: 2, verified: true }))
      .toContain('"verified": true');
    expect(extractAnswerText({ files: 2, verified: true }))
      .not.toContain('[object Object]');
  });
  test('produces a complete governed editorial document from inspector context', () => {
    const document = buildGovernedEditorialDocument(
      'حرر نتيجة بحث أو وثيقة أو ديوانًا برمجيًا ثم أخرج سجل تغييرات وبصمة مصدر.',
      [{
        role: 'assistant',
        content: 'حالة المنظومة: HEALTHY.\nالتشخيص: 0 أخطاء، 20 تحذيرًا.\nالمخاطر: مساحة العمل غير نظيفة وبها 111 تغييرًا.'
      }]
    );

    expect(document).toContain('# وثيقة مراجعة:');
    expect(document).toContain('20 تحذيرًا');
    expect(document).toContain('111 تغييرًا');
    expect(document).not.toContain('مجموع عناصر الفرز المرصودة = 131');
    expect(document).toContain('## سجل التحرير');
    expect(document).toContain('## المصدر والنطاق');
    expect(document).toContain('SHA-256');
    expect(document).toContain('غير موثق');
    expect(document).not.toContain('لا أستطيع مساعدتك');
  });
  test('reviews a pasted extension activation report without model timeout', () => {
    const reviewed = buildExtensionActivationEvidenceAnswer([
      'تم تفعيل مسار تحرير بحث ووثائق وبرمجيات.',
      'الإصدار المثبت: 1.0.120',
      'الاختبارات: 46/46 ناجحة',
      'زر الإرسال: DOM_CLICK_VERIFIED',
      `SHA-256: ${'a'.repeat(64)}`
    ].join('\n'), '1.0.120');

    expect(reviewed.accepted).toBe(true);
    expect(reviewed.answer).toContain('EVIDENCE_FORMAT_ACCEPTED');
    expect(reviewed.answer).toContain('46/46');
    expect(reviewed.answer).not.toContain('timeout');
  });
  test('binds "اصلحها" to the latest inspector diagnosis', () => {
    const context = resolveRecentContextualRepairContext('اصلحها', [
      { role: 'user', content: 'حلل حالة المنظومة' },
      {
        role: 'assistant',
        content: 'حالة المنظومة: HEALTHY.\nالتشخيص: 0 أخطاء، 7 تحذيرات.\nالمخاطر: مساحة العمل غير نظيفة وبها 109 تغييرًا.\nأفضل إجراء تالٍ: فرز التحذيرات.'
      }
    ]);

    expect(context.source).toBe('assistant-diagnostic-history');
    expect(context.repairMessage).toContain('7 تحذيرات');
    expect(context.repairMessage).toContain('IMPLEMENT_SCOPED_PATCH');
  });

  test('returns an exact terminal blocker instead of asking for known context', () => {
    const answer = buildContextualRepairFallbackAnswer(
      'التشخيص: 0 أخطاء، 7 تحذيرات. المخاطر: بها 109 تغييرًا.',
      'timeout'
    );

    expect(answer).toContain('7');
    expect(answer).toContain('109');
    expect(answer).toContain('BLOCKED_WITH_EXACT_REQUIREMENT');
    expect(answer).not.toContain('أرسل نص الخطأ');
  });

  test('resolves contextual repair from a fresh Inspector snapshot', async () => {
    const history = [{
      role: 'assistant',
      content: 'حالة المنظومة: ATTENTION.\nالتشخيص: خطأ واحد، 0 تحذيرات.\nالمخاطر: خطأ تشخيصي واحد، مساحة العمل غير نظيفة وبها 124 تغييرًا.'
    }];
    const snapshot = {
      success: true,
      status: 'ACTIVE',
      health: {
        overall: 'HEALTHY',
        diagnostics: { errors: 0, warnings: 23 }
      },
      git: { changedFileCount: 124, stale: false }
    };
    const direct = buildContextualRepairResolutionAnswer(
      history[0].content,
      snapshot
    );
    expect(direct).toContain('الأخطاء السابقة: 1');
    expect(direct).toContain('الأخطاء الحالية: 0');
    expect(direct).toContain('لم يعد ظاهرًا');

    const result = await sendExtensionChat('اصلح', {
      history,
      streaming: true,
      inspectorStatusLoader: async () => snapshot,
      sseTransport: async () => {
        throw new Error('SSE must not run for direct contextual repair');
      }
    });
    expect(result.raw.route)
      .toBe('SHEIKHA_EXTENSION_INSPECTOR_REPAIR_RESOLUTION_V1');
    expect(result.answer).toContain('التحذيرات الحالية: 23');
    expect(result.answer).not.toContain('first token timeout');
  });
  test('accepts valid conversation JSON without fallback', () => {
    const response = safeJsonParse('{"success":true,"answer":"جاهز"}', {
      statusCode: 200,
      contentType: 'application/json; charset=utf-8'
    });

    expect(response).toMatchObject({ success: true, answer: 'جاهز' });
    expect(shouldUseUnifiedFallback(response)).toBe(false);
  });

  test('classifies an HTML gateway response and enables unified-chat fallback', () => {
    const response = safeJsonParse('<!doctype html><html><body>Bad Gateway</body></html>', {
      statusCode: 200,
      contentType: 'text/html; charset=utf-8'
    });

    expect(response.error).toBe('ide_apex_non_json_fallback');
    expect(response.rawPreview).toContain('Bad Gateway');
    expect(shouldUseUnifiedFallback(response)).toBe(true);
  });

  test('defaults VS Code chat transport to the local governed runtime', () => {
    expect(LOCAL_BASE_URL).toBe('http://127.0.0.1:8080');
    expect(DEFAULT_BASE_URL).toBe(LOCAL_BASE_URL);
    expect(isLocalBaseUrl(DEFAULT_BASE_URL)).toBe(true);
    expect(DEFAULT_EXTENSION_CHAT_LANGUAGE).toBe('ar');
  });

  test('keeps package transport version aligned with the released extension', () => {
    expect(EXTENSION_TRANSPORT_VERSION).toBe(require('../package.json').version);
    expect(ORGANIZATION_CONTROL_STATUS_ENDPOINT)
      .toBe('/api/sheikha/organization-control/v1/status');
  });

  test('returns a useful local answer for pre-release testing when the model times out', () => {
    const answer = buildLocalChatFallbackAnswer(
      'اشرح فائدة الاختبار قبل النشر',
      'OLLAMA_MODEL_TIMEOUT'
    );

    expect(answer).toContain('يكشف الأعطال والانحدارات');
    expect(answer).toContain('اختبارات مستهدفة');
    expect(answer).not.toContain('تم، أعمل على ذلك الآن');
  });

  test('returns the governed owner dashboard boundary when the model is unavailable', () => {
    const answer = buildLocalChatFallbackAnswer(
      'اعرض لوحة المالك مع وضع صفر موظفين',
      'OLLAMA_MODEL_TIMEOUT'
    );

    expect(answer).toContain('صفر موظفين تشغيليين');
    expect(answer).toContain('تنتظر موافقة بشرية');
    expect(answer).toContain('/dashboard/');
  });

  test('parses governed SSE frames for the streaming extension path', () => {
    const { events, rest } = parseSseBuffer(
      'event: ack\ndata: {"accepted":true}\n\n' +
      'event: token\ndata: {"text":"مرحبا"}\n\npartial'
    );

    expect(rest).toBe('partial');
    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({ event: 'ack', data: { accepted: true } });
    expect(events[1]).toMatchObject({ event: 'token', data: { text: 'مرحبا' } });
    expect(STREAMING_CHAT_APEX_STREAM_ENDPOINT)
      .toBe('/api/sheikha/streaming-chat-apex/v1/stream');
    expect(EXTENSION_STREAMING_ARTIFACT_APEX_STATUS_ENDPOINT)
      .toBe('/api/sheikha/extension-streaming-artifact-apex/v1/status');
  });

  test('preserves escaped newlines inside an SSE JSON token', () => {
    const { events } = parseSseBuffer(
      'event: token\ndata: {"text":"سطر أول\\nسطر ثان"}\n\n'
    );

    expect(events).toHaveLength(1);
    expect(events[0].data.text).toBe('سطر أول\nسطر ثان');
  });

  test('treats the fast Arabic live acknowledgement as provisional', () => {
    expect(isProvisionalLiveResponse({
      answer: 'تم، أعمل على ذلك الآن.',
      events: [
        { event: 'meta', data: { deepModelMode: 'background' } },
        { event: 'done', data: { route: 'FAST_ARABIC_DEFAULT' } }
      ]
    })).toBe(true);
    expect(isProvisionalLiveResponse({
      answer: 'هذه إجابة مكتملة.',
      events: [{ event: 'done', data: { route: 'FULL_MODEL_STREAM' } }]
    })).toBe(false);
  });

  test('builds a useful local Todo Tree fallback instead of exposing gateway noise', () => {
    const answer = buildLocalChatFallbackAnswer(
      'Todo-Tree: Failed to find vscode-ripgrep',
      'ide_apex_non_json_fallback'
    );

    expect(answer).toContain('todo-tree.ripgrep');
    expect(answer).toContain('/usr/bin/rg');
    expect(answer).not.toContain('رد بوابة غير صالح');
  });

  test('recognizes Arabic report typo in local fallback', () => {
    const answer = buildLocalChatFallbackAnswer('اكتبي تثرير', 'ide_apex_non_json_fallback');

    expect(answer).toContain('أستطيع كتابة التقرير');
    expect(answer).toContain('ملخص تنفيذي');
  });

  test('diagnoses the F12_D2 evidence-list failure without claiming execution', () => {
    const transcript = [
      'F12_D2_EXIT_CODE=1',
      '--- /tmp/expected.txt',
      '+++ /tmp/actual.txt',
      '-current-worktree-state.json',
      'bash "$LAUNCHER"'
    ].join('\n');

    expect(isGovernedShellCommandRequest(transcript)).toBe(true);
    const answer = buildGovernedShellReviewFallbackAnswer(transcript);
    expect(answer).toContain('لم أنفذ أي أمر');
    expect(answer).toContain('current-worktree-state.json');
    expect(answer).toContain('فشل قبل النشر الذري');
  });

  test('classifies the I2 input capture as fixed read-only evidence collection', () => {
    const transcript = [
      'DIAG="$HOME/Backups/sheikha/diagnosis"',
      'MAIN="$HOME/Projects/sheikha/sheikha-main-portal"',
      'VERIFY_EXISTING_I1_R1_DIGESTS',
      '( cd "$DIAG"; sha256sum -c diagnosis-files.sha256 )',
      'CURRENT_MAIN_HEAD',
      'git -C "$MAIN" rev-parse HEAD',
      'CURRENT_MAIN_STATUS',
      'git -C "$MAIN" status --porcelain=v1 --untracked-files=all',
      'CURRENT_UNSTAGED_NAME_STATUS',
      'git -C "$MAIN" diff --name-status',
      'CURRENT_STAGED_NAME_STATUS',
      'git -C "$MAIN" diff --cached --name-status',
      'CURRENT_MANIFEST_SHA256',
      'READ_ONLY_I2_INPUT_CAPTURE_COMPLETE=true'
    ].join('\n');

    const answer = buildGovernedShellReviewFallbackAnswer(transcript);

    expect(answer).toContain('التقاط أدلة محلي للقراءة فقط');
    expect(answer).toContain('لا يظهر في النص مشغّل فرعي');
    expect(answer).toContain('محوّل الأدلة المحكوم');
    expect(answer).not.toContain('افتح المشغّل');
  });

  test('classifies precondition drift capture as fixed read-only comparison', () => {
    const transcript = [
      'MAIN="$HOME/Projects/sheikha/sheikha-main-portal"',
      'DIAG="$HOME/Backups/sheikha/diagnosis"',
      'VERIFY_I1_R1_PREDECESSOR_DIGESTS',
      'sha256sum -c diagnosis-files.sha256',
      'current-main-worktree-state.json',
      'status_added = []',
      'current_untracked = []',
      'READ_ONLY_PRECONDITION_DRIFT_CAPTURE_COMPLETE=true',
      'I2_OR_I2_R1_EXECUTION_ALLOWED_NOW=false',
      'D6_AUTHORIZATION_ALLOWED_NOW=false'
    ].join('\n');

    const answer = buildGovernedShellReviewFallbackAnswer(transcript);

    expect(answer).toContain('فرق شروط I1-R1 للقراءة فقط');
    expect(answer).toContain('دون تشغيل كتلة Python');
    expect(answer).toContain('لا يكتب أدلة');
  });

  test('classifies published terminal evidence as direct read-only verification', () => {
    const transcript = [
      'DIR="$HOME/Backups/sheikha/published"',
      'find "$DIR" -maxdepth 1 -type f',
      'sha256sum -c design-files.sha256',
      'python3 -m json.tool "$DIR/design-result.json"',
      'python3 -m json.tool "$DIR/design-terminal-record.json"',
      'READ_ONLY_PUBLISHED_I2_R2_VERIFICATION_COMPLETE=true',
      'I2_R2_RERUN_ALLOWED_NOW=false',
      'D6_AUTHORIZATION_ALLOWED_NOW=false'
    ].join('\n');

    const answer = buildGovernedShellReviewFallbackAnswer(transcript);

    expect(answer).toContain('دليل منشور للقراءة فقط');
    expect(answer).toContain('دون تشغيل Shell أو Python');
    expect(answer).toContain('لا يعيد تشغيل المرحلة');
  });

  test('routes hash-bound read-only scripts to the isolated sandbox', () => {
    const transcript = [
      'DOWNLOAD_DIR="$(xdg-user-dir DOWNLOAD)"',
      `EXPECTED="${'a'.repeat(64)}"`,
      'SCRIPT=""',
      'sha256sum "$CANDIDATE"',
      "find \"$DOWNLOAD_DIR\" -maxdepth 1 -type f -iname 'SHEIKHA_READ_ONLY_TEST*.sh' -print0",
      'bash "$SCRIPT"'
    ].join('\n');

    const answer = buildGovernedShellReviewFallbackAnswer(transcript);

    expect(answer).toContain('سكربت تحقق قرائي محلي');
    expect(answer).toContain('Bubblewrap');
    expect(answer).toContain('شبكة مفصولة');
  });

  test('routes hashed local launchers to governed preflight language', () => {
    const transcript = [
      'EXPECTED_SHA256="b29cbd0f15fb66137af2324bed2e746d916787953a6cac28040ba63c976a1acf"',
      "find \"$DOWNLOAD_DIR\" -iname 'SHEIKHA_LAUNCH_TEST*.sh' -print0",
      'sha256sum "$FILE"',
      'bash "$LAUNCHER"'
    ].join('\n');

    const answer = buildGovernedShellReviewFallbackAnswer(transcript);

    expect(answer).toContain('فاحص المشغّلات المحكوم');
    expect(answer).toContain('لا يُنفذ bash تلقائيًا');
    expect(answer).toContain('HEAD وحالة Git');
  });

  test('routes shell launchers through governed live transport in standard mode', () => {
    const shellRequest = isGovernedShellCommandRequest(
      'cd "$HOME/project"\nsha256sum "$BUNDLE"\nbash "$LAUNCHER"'
    );

    expect(shellRequest).toBe(true);
    expect(shouldUseGovernedLiveTransport({
      intelligenceApexMode: true,
      governedShellReviewRequested: shellRequest,
      liveEnabled: true
    })).toBe(true);
    expect(shouldUseGovernedLiveTransport({
      intelligenceApexMode: true,
      governedShellReviewRequested: false,
      liveEnabled: true
    })).toBe(false);
  });

  test('routes Enterprise Inspector through governed live transport in standard mode', () => {
    expect(shouldUseGovernedLiveTransport({
      intelligenceApexMode: true,
      diagnosticRequested: true,
      liveEnabled: true
    })).toBe(true);
  });

  test('normalizes localhost to the IPv4 loopback used by the local runtime', () => {
    const { normalizeLocalBaseUrl } = require('../src/sheikhaExtensionChatClient');

    expect(normalizeLocalBaseUrl('http://localhost:8080/'))
      .toBe('http://127.0.0.1:8080');
    expect(normalizeLocalBaseUrl('https://runtime.example.test/api/'))
      .toBe('https://runtime.example.test/api');
  });

  test('recovers an Inspector report directly when SSE misses its first-token budget', async () => {
    const snapshot = {
      success: true,
      status: 'ACTIVE',
      health: {
        overall: 'HEALTHY',
        runtime: 'ACTIVE',
        extension: 'CONNECTED',
        runtimeFabricV5: 'ACTIVE_SINGLE_NODE_OPERATIONAL',
        diagnostics: { errors: 0, warnings: 7 }
      },
      runtime: {
        cpuLoad1m: 0.4,
        ramUsedPercent: 38,
        heapUsedMb: 42,
        heapTotalMb: 72
      },
      git: { clean: false, changedFileCount: 3 },
      governance: {
        status: 'ACTIVE',
        humanReviewForHighImpactActions: true
      }
    };
    const result = await sendExtensionChat(
      'حلل حالة منظومة شيخة الحالية من Enterprise Inspector',
      {
        streaming: true,
        sseTransport: async () => {
          const error = new Error(
            'Sheikha extension first token timeout after 8000ms'
          );
          error.code = 'SHEIKHA_FIRST_TOKEN_TIMEOUT';
          throw error;
        },
        inspectorStatusLoader: async () => snapshot,
        preferDirectInspector: false
      }
    );

    expect(result.success).toBe(true);
    expect(result.raw.route)
      .toBe('SHEIKHA_EXTENSION_DIRECT_INSPECTOR_RECOVERY_V1');
    expect(result.raw.recoveredFrom).toBe('SHEIKHA_FIRST_TOKEN_TIMEOUT');
    expect(result.answer).toContain('حالة المنظومة: HEALTHY');
    expect(result.answer).toContain('7 تحذيرات');
    expect(result.answer).toContain('3 تغييرات');
    expect(result.answer).toContain('لم يُنفذ أي إجراء عالي الأثر');
  });

  test('prefers authoritative Inspector status without waiting for model SSE', async () => {
    let sseCalled = false;
    const events = [];
    const result = await sendExtensionChat(
      'حلل حالة منظومة شيخة الحالية من Enterprise Inspector',
      {
        streaming: true,
        sseTransport: async () => { sseCalled = true; },
        inspectorStatusLoader: async () => ({
          success: true,
          status: 'ACTIVE',
          health: {
            overall: 'HEALTHY', runtime: 'ACTIVE', extension: 'CONNECTED',
            diagnostics: { errors: 0, warnings: 3 }
          },
          runtime: {
            cpuLoad1m: 1, ramUsedPercent: 40,
            heapUsedMb: 50, heapTotalMb: 80
          },
          git: { clean: true, changedFileCount: 0 },
          governance: {
            status: 'ACTIVE', humanReviewForHighImpactActions: true
          }
        }),
        onEvent: (event) => events.push(event.event)
      }
    );
    expect(sseCalled).toBe(false);
    expect(result.raw.route).toBe('SHEIKHA_EXTENSION_DIRECT_INSPECTOR_V2');
    expect(result.answer).toContain('3 تحذيرات');
    expect(events).toEqual(['ack', 'meta', 'token', 'done']);
  });

  test('continues from the latest Inspector result without generic fallback', async () => {
    const history = [{
      role: 'assistant',
      content: [
        'حالة المنظومة: HEALTHY.',
        'التشخيص: 0 أخطاء، 39 تحذيرًا، الخادم ACTIVE، والإضافة CONNECTED.',
        'المخاطر: 39 تحذيرًا يحتاج الفرز، التشغيل الحالي أحادي العقدة.',
        'أفضل إجراء تالٍ دون أثر مرتفع: فرز التحذيرات قبل أي نشر.'
      ].join('\n')
    }];
    expect(isInspectorContinuationRequest('اكمل')).toBe(true);
    const context = resolveRecentInspectorContinuation('اكمل', history);
    expect(context.context).toContain('39 تحذيرًا');
    expect(buildInspectorContinuationAnswer(context.context))
      .toContain('## متابعة تشخيص منظومة شيخة');
    const result = await sendExtensionChat('اكمل', {
      history,
      streaming: true,
      inspectorStatusLoader: async () => ({
        success: true,
        generatedAt: '2026-09-09T10:00:00.000Z',
        status: 'ACTIVE',
        health: {
          overall: 'HEALTHY',
          runtimeFabricV5: 'ACTIVE_SINGLE_NODE',
          diagnostics: { errors: 0, warnings: 14 }
        },
        git: {
          clean: false,
          changedFileCount: 420,
          stale: false,
          changeSummary: {
            total: 420,
            byState: {
              untracked: 231,
              conflicted: 0,
              staged: 0,
              unstaged: 189,
              stagedAndUnstaged: 0
            },
            topAreas: [
              {area: 'runtime', count: 138},
              {area: 'tests', count: 109}
            ]
          }
        },
        extension: {
          diagnostics: [{
            file: 'server.js',
            diagnostics: [{
              message: 'Unused local value',
              severity: 1,
              line: 27,
              character: 5
            }]
          }]
        }
      })
    });
    expect(result.raw.route)
      .toBe('SHEIKHA_EXTENSION_INSPECTOR_CONTEXT_CONTINUATION_V1');
    expect(result.raw.inspectorRefreshSucceeded).toBe(true);
    expect(result.answer).toContain('14 تحذيرًا');
    expect(result.answer).toContain('server.js:27:5');
    expect(result.answer).toContain('420 تغييرًا');
    expect(result.answer).toContain('runtime=138');
    expect(result.answer).not.toContain('39 تحذيرًا');
    expect(result.answer).not.toContain('ترتيب الإكمال');
    expect(result.answer).not.toContain('تجاوز ميزانية أول Token');
  });

  test('labels historical Inspector values when continuation refresh fails', async () => {
    const history = [{
      role: 'assistant',
      content: 'حالة المنظومة: HEALTHY.\nالتشخيص: 0 أخطاء، 14 تحذيرًا.\nالمخاطر: بها 420 تغييرًا.'
    }];
    const result = await sendExtensionChat('اكمل', {
      history,
      streaming: true,
      inspectorStatusLoader: async () => ({
        success: false,
        status: 'OFFLINE',
        error: 'ECONNREFUSED'
      })
    });

    expect(result.raw.inspectorRefreshSucceeded).toBe(false);
    expect(result.answer).toContain('ليست قياسات حالية');
    expect(result.answer).toContain('ECONNREFUSED');
    expect(result.answer).toContain('لا يحمل الرد السابق أسماء ملفات التحذيرات');
  });

  test('triages detailed diagnostics and reports partial coverage', () => {
    const lines = buildInspectorDiagnosticTriage({
      health: { diagnostics: { errors: 0, warnings: 3 } },
      extension: {
        diagnostics: [{
          file: 'app.js',
          diagnostics: [{
            message: 'Deprecated API',
            severity: 1,
            line: 12,
            character: 3
          }]
        }]
      }
    });

    expect(lines.join('\n')).toContain('app.js:12:3');
    expect(lines.join('\n')).toContain('تغطية التفاصيل 1/3');
  });

  test('orders correctness and security diagnostics before style warnings', () => {
    const lines = buildInspectorDiagnosticTriage({
      health: { diagnostics: { errors: 0, warnings: 3 } },
      extension: {
        diagnostics: [{
          file: 'runtime.js',
          diagnostics: [
            { message: 'Prefer using an optional chain expression.', severity: 1, line: 3 },
            { message: 'Make sure the PATH variable only contains fixed directories.', severity: 1, line: 2 },
            { message: 'The rest will execute unconditionally.', severity: 1, line: 1 }
          ]
        }]
      }
    }).join('\n');

    expect(lines.indexOf('صحة منطق')).toBeLessThan(lines.indexOf('أمن'));
    expect(lines.indexOf('أمن')).toBeLessThan(lines.indexOf('جودة كود'));
  });

  test('summarizes Git changes by state and largest scope', () => {
    const lines = buildInspectorGitTriage({
      git: {
        changedFileCount: 420,
        changeSummary: {
          total: 420,
          byState: {untracked: 231, unstaged: 189},
          topAreas: [
            {area: 'runtime', count: 138},
            {area: 'tests', count: 109}
          ]
        }
      }
    }).join('\n');

    expect(lines).toContain('غير متتبعة 231');
    expect(lines).toContain('معدلة غير مرحّلة 189');
    expect(lines).toContain('runtime=138');
  });

  test('formats a truthful Arabic Inspector summary without model output', () => {
    const answer = buildEnterpriseInspectorArabicSummary({
      success: true,
      status: 'ACTIVE',
      health: {
        overall: 'HEALTHY',
        runtime: 'ACTIVE',
        extension: 'CONNECTED',
        diagnostics: { errors: 0, warnings: 0 }
      },
      runtime: {
        cpuLoad1m: 0.1,
        ramUsedPercent: 20,
        heapUsedMb: 20,
        heapTotalMb: 40
      },
      git: { clean: true, changedFileCount: 0 },
      governance: {
        status: 'ACTIVE',
        humanReviewForHighImpactActions: true
      }
    });

    expect(answer).toContain('لا تظهر مخاطر تشغيلية حرجة');
    expect(answer).toContain('مراجعة بشرية: نعم');
    expect(answer).not.toContain('فرز التحذيرات');
  });

  test('does not turn a truncated index column into a staged file', () => {
    const answer = buildInspectorGitTriage({git: {
      changedFileCount: 3,
      status: 'M .env.example\n M core/a.js\n?? runtime/new.js'
    }}).join('\n');
    expect(answer).toContain('حالات غير محسومة: 1');
    expect(answer).toContain('، مرحّلة 0');
    expect(answer).toContain('معدلة غير مرحّلة 1');
  });

  test('does not report missing or stale Git evidence as a clean worktree', () => {
    const missing = buildInspectorGitTriage({git: {changedFileCount: 424}}).join('\n');
    expect(missing).toContain('424 تغييرًا');
    expect(missing).toContain('غير متاحة');
    expect(missing).not.toContain('لا توجد تغييرات');
    expect(buildInspectorGitTriage({}).join('\n')).toContain('غير مثبتة');
    expect(buildInspectorGitTriage({git: {stale: true, status: ''}}).join('\n'))
      .toContain('قديمة');
  });

  test('does not recommend warning triage when warnings are zero but Git is dirty', () => {
    const answer = buildEnterpriseInspectorArabicSummary({
      health: {
        overall: 'HEALTHY',
        runtime: 'ACTIVE',
        extension: 'CONNECTED',
        diagnostics: { errors: 0, warnings: 0 }
      },
      runtime: {},
      git: { clean: false, changedFileCount: 111 },
      governance: {
        status: 'ACTIVE',
        humanReviewForHighImpactActions: true
      }
    });

    expect(answer).toContain('111 تغييرًا');
    expect(answer).toContain('تقسيم تغييرات مساحة العمل');
    expect(answer).not.toContain('فرز التحذيرات');
  });

  test('derives the Git map from porcelain status for an older Inspector server', () => {
    const answer = buildEnterpriseInspectorArabicSummary({
      health: {
        overall: 'HEALTHY',
        runtime: 'ACTIVE',
        extension: 'CONNECTED',
        diagnostics: { errors: 0, warnings: 0 }
      },
      runtime: {},
      git: {
        clean: false,
        changedFileCount: 4,
        status: [
          ' M core/provider.js',
          '?? runtime/new-a.js',
          '?? runtime/new-b.js',
          ' M tests/provider.test.js'
        ].join('\n')
      },
      governance: {
        status: 'ACTIVE',
        humanReviewForHighImpactActions: true
      }
    });

    expect(answer).toContain('خريطة تغييرات Git:');
    expect(answer).toContain('غير متتبعة 2');
    expect(answer).toContain('معدلة غير مرحّلة 2');
    expect(answer).toContain('runtime=2');
  });

  test('uses correct Arabic singular forms for Inspector counts', () => {
    const answer = buildEnterpriseInspectorArabicSummary({
      status: 'ACTIVE',
      health: {
        overall: 'HEALTHY',
        runtime: 'ACTIVE',
        extension: 'CONNECTED',
        diagnostics: { errors: 0, warnings: 1 }
      },
      runtime: {},
      git: { clean: false, changedFileCount: 1 },
      governance: {
        status: 'ACTIVE',
        humanReviewForHighImpactActions: true
      }
    });

    expect(answer).toContain('0 أخطاء، تحذير واحد');
    expect(answer).toContain('تحذير واحد يحتاج إلى الفرز');
    expect(answer).toContain('تغيير واحد');
    expect(answer).not.toContain('1 تحذيرًا');
  });

  test('restores recent shell context for a governed follow-up request', () => {
    const context = resolveRecentGovernedShellContext('شغل السكربت', [
      {
        role: 'user',
        content: 'cd "$HOME/project"\nsha256sum "$BUNDLE"\nbash "$LAUNCHER"'
      },
      { role: 'assistant', content: 'لم أنفذ هذه الأوامر.' }
    ]);

    expect(context.followUp).toBe(true);
    expect(context.reviewMessage).toContain('شغل السكربت');
    expect(context.reviewMessage).toContain('sha256sum');
    expect(isGovernedShellCommandRequest(context.reviewMessage)).toBe(true);
  });

  test('summarizes structured terminal evidence without accepting disk claims', () => {
    const evidence = [
      'SELECTION_REVIEW_DIGEST_LIST_VALID=true',
      'SELECTION_REVIEW_COMPLETE=true',
      'SELECTION_REVIEW_TERMINAL=true',
      'SELECTION_REVIEW_RERUN_ALLOWED=false',
      'F12_D2_R1_EXIT_CODE=0',
      'F12_D2_R1_COMPLETED_SUCCESSFULLY=true'
    ].join('\n');

    expect(isStructuredOperationalEvidenceReviewRequest(evidence)).toBe(true);
    const answer = buildGovernedOperationalEvidenceFallbackAnswer(evidence);
    expect(answer).toContain('F12_D2_R1');
    expect(answer).toContain('إعادة تشغيل المرحلة ممنوعة');
    expect(answer).toContain('النص وحده لا يثبت الملفات');
  });

  test('turns an Arabic report follow-up into a governed contextual report', () => {
    const previousAnswer = [
      'الحالة الموثقة الآن: حالة المنظومة: HEALTHY.',
      'التشخيص: 0 أخطاء، 19 تحذيرًا، الخادم ACTIVE، والإضافة CONNECTED.',
      'الموارد: حمل الدقيقة 0.67، الذاكرة 44%، Heap 67/100MB.',
      'المخاطر: 19 تحذيرًا يحتاج الفرز، مساحة العمل غير نظيفة وبها 155 تغييرًا.',
      'الحوكمة: ACTIVE، والإجراءات عالية الأثر تتطلب مراجعة بشرية: نعم.',
      'أفضل إجراء تالٍ دون أثر مرتفع: فرز التحذيرات وتشغيل الاختبارات المستهدفة.',
      'لم يُنفذ أي إجراء عالي الأثر.'
    ].join('\n');
    const context = resolveRecentContextualReportContext('اكتبي تقرير', [
      { role: 'user', content: 'حلل حالة منظومة شيخة' },
      { role: 'assistant', content: previousAnswer }
    ]);

    expect(isContextualReportFollowUpRequest('اكتبي تقرير')).toBe(true);
    expect(context.source).toBe('assistant-conversation-history');
    expect(context.context).toContain('19 تحذيرًا');
    expect(shouldUseGovernedLiveTransport({
      intelligenceApexMode: true,
      governedContextualReportRequested: true,
      liveEnabled: true
    })).toBe(true);

    const report = buildGovernedContextualReportFallbackAnswer(context.context);
    expect(report).toContain('## تقرير حالة منظومة شيخة');
    expect(report).toContain('### المخاطر');
    expect(report).toContain('155 تغييرًا');
    expect(report).toContain('### الإجراء الموصى به');
    expect(report).not.toContain('تم إعداد هذا التقرير بنجاح');
  });

  test('falls back to legacy live-chat JSON route when SSE live endpoint fails', async () => {
    const result = await sendExtensionChat('اشرح لي وضع النظام الحالي', {
      streaming: true,
      sseTransport: async () => {
        const error = new Error('connect ECONNREFUSED 127.0.0.1:8080');
        error.code = 'ECONNREFUSED';
        throw error;
      },
      liveLegacyTransport: async () => ({
        success: true,
        reply: 'استلمت طلبك وسأتعامل معه كتحليل وتشغيل وتطوير آمن تحت إدارة الإنسان.'
      })
    });

    expect(result.success).toBe(true);
    expect(result.raw.route)
      .toBe('SHEIKHA_EXTENSION_LEGACY_LIVE_CHAT_FALLBACK_V1');
    expect(result.raw.endpoint).toBe('/api/sheikha/live-chat');
    expect(result.answer).toContain('استلمت طلبك');
  });

  test('sends the governed completion contract through the SSE transport', async () => {
    let capturedPayload;
    const result = await sendExtensionChat('أكمل إلى النهاية', {
      streaming: true,
      sseTransport: async (_endpoint, payload) => {
        capturedPayload = payload;
        return {
          answer: 'اكتملت الخطوات الآمنة بالدليل.',
          events: [{ event: 'done', data: { route: 'FULL_MODEL_STREAM' } }]
        };
      }
    });

    expect(result.success).toBe(true);
    expect(capturedPayload.completion).toMatchObject({
      contract: 'SHEIKHA_GOVERNED_COMPLETION_CONTRACT_V1',
      requested: true,
      safeContinuationAllowed: true,
      requestIsNotHighImpactApproval: true,
      defaultAuthorization: 'DENY',
      completionClaimRequiresTerminalEvidence: true
    });
    expect(capturedPayload.completion.approvalRequired).toContain('EXTERNAL_PUBLISH');
  });
});
