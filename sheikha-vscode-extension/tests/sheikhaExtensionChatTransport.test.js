'use strict';

const {
  EXTENSION_TRANSPORT_VERSION,
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
    expect(EXTENSION_TRANSPORT_VERSION).toBe('1.0.81');
  });
});
