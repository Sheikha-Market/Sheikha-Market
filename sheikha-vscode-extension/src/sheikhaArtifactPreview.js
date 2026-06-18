'use strict';

const MAX_ARTIFACT_BYTES = 200000;

function extractHtmlArtifact(text = '') {
  const source = String(text || '');
  const fenced = source.match(/```html\s*([\s\S]*?)```/i);
  const fullDocument = source.match(/<!doctype\s+html[\s\S]*$/i) ||
    source.match(/<html[\s\S]*<\/html>/i);

  const html = fenced?.[1] || fullDocument?.[0] || '';
  if (!html.trim()) return null;

  return {
    type: 'html',
    title: 'Sheikha HTML Artifact Preview',
    bytes: Buffer.byteLength(html),
    truncated: Buffer.byteLength(html) > MAX_ARTIFACT_BYTES,
    content: html.slice(0, MAX_ARTIFACT_BYTES)
  };
}

function escapeHtml(value = '') {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizePreviewHtml(html = '') {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
    .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/<meta[^>]+http-equiv\s*=\s*["']?refresh["']?[^>]*>/gi, '');
}

function createSafePreviewHtml(html = '') {
  const safeHtml = sanitizePreviewHtml(html);
  const escapedSrcDoc = escapeHtml(safeHtml);

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'none'; img-src data: https:; style-src 'unsafe-inline'; frame-src 'self';">
<style>
body { margin:0; background:#080b0f; color:#f5f7fa; font-family:system-ui,sans-serif; letter-spacing:0; }
header { padding:10px 12px; border-bottom:1px solid #2b3948; background:#101720; }
strong { display:block; font-size:14px; }
small { color:#9ba8b6; font-size:11px; }
iframe { width:100vw; height:calc(100vh - 50px); border:0; background:#fff; }
</style>
</head>
<body>
<header>
  <strong>Sheikha Safe Artifact Preview</strong>
  <small>scripts disabled · sandboxed preview · no file writes</small>
</header>
<iframe sandbox="" srcdoc="${escapedSrcDoc}"></iframe>
</body>
</html>`;
}

module.exports = {
  MAX_ARTIFACT_BYTES,
  createSafePreviewHtml,
  escapeHtml,
  extractHtmlArtifact,
  sanitizePreviewHtml
};
