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
  shouldUseGovernedLiveTransport,
  shouldUseUnifiedFallback
} = require('../src/sheikhaExtensionChatClient');

describe('Sheikha Extension Chat Transport', () => {
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
    expect(EXTENSION_TRANSPORT_VERSION).toBe('1.0.114');
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
        inspectorStatusLoader: async () => snapshot
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
});
