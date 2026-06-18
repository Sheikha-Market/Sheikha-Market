'use strict';

const {
  createSafePreviewHtml,
  extractHtmlArtifact,
  sanitizePreviewHtml
} = require('../src/sheikhaArtifactPreview');

describe('Sheikha Artifact Preview', () => {
  test('extracts fenced HTML artifacts from chat answers', () => {
    const artifact = extractHtmlArtifact([
      'تفضل المعاينة:',
      '```html',
      '<html><body><h1>Sheikha</h1></body></html>',
      '```'
    ].join('\n'));

    expect(artifact.type).toBe('html');
    expect(artifact.content).toContain('<h1>Sheikha</h1>');
  });

  test('sanitizes active content and renders sandboxed preview chrome', () => {
    const sanitized = sanitizePreviewHtml(
      '<html><body onload="alert(1)"><script>alert(1)</script><h1>Safe</h1></body></html>'
    );
    const preview = createSafePreviewHtml(sanitized);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('onload');
    expect(preview).toContain('sandbox=""');
    expect(preview).toContain("script-src 'none'");
    expect(preview).toContain('Safe');
  });
});
