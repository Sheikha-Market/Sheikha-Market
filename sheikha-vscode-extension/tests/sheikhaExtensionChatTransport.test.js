'use strict';

const {
  DEFAULT_BASE_URL,
  EXTENSION_STREAMING_ARTIFACT_APEX_STATUS_ENDPOINT,
  EXTENSION_TRANSPORT_VERSION,
  LOCAL_BASE_URL,
  STREAMING_CHAT_APEX_STREAM_ENDPOINT,
  buildLocalChatFallbackAnswer,
  isLocalBaseUrl,
  parseSseBuffer,
  safeJsonParse,
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
  });

  test('keeps package transport version aligned with the released extension', () => {
    expect(EXTENSION_TRANSPORT_VERSION).toBe('1.0.89');
  });

  test('parses governed SSE frames for the streaming extension path', () => {
    const { events, rest } = parseSseBuffer(
      'event: ack\\ndata: {"accepted":true}\\n\\n' +
      'event: token\\ndata: {"text":"مرحبا"}\\n\\npartial'
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
});
