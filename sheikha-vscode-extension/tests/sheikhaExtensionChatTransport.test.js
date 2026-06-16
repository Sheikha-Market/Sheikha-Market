'use strict';

const {
  EXTENSION_TRANSPORT_VERSION,
  buildLocalChatFallbackAnswer,
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

    expect(response.error).toBe('proxy_non_json_response');
    expect(response.rawPreview).toContain('Bad Gateway');
    expect(shouldUseUnifiedFallback(response)).toBe(true);
  });

  test('keeps package transport version aligned with the released extension', () => {
    expect(EXTENSION_TRANSPORT_VERSION).toBe('1.0.85');
  });

  test('builds a useful local Todo Tree fallback instead of exposing gateway noise', () => {
    const answer = buildLocalChatFallbackAnswer(
      'Todo-Tree: Failed to find vscode-ripgrep',
      'proxy_non_json_response'
    );

    expect(answer).toContain('todo-tree.ripgrep');
    expect(answer).toContain('/usr/bin/rg');
    expect(answer).not.toContain('رد بوابة غير صالح');
  });
});
