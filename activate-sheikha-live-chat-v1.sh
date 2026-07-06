#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
EXT="$ROOT/sheikha-vscode-extension"
CLIENT="$EXT/src/sheikhaExtensionChatClient.js"

echo "== Sheikha Live Chat Activation V1 =="

cd "$EXT"

cp "$CLIENT" "$CLIENT.bak-live-real-$(date +%Y%m%d%H%M%S)"

python3 - <<'PY'
from pathlib import Path

p = Path("src/sheikhaExtensionChatClient.js")
s = p.read_text()

# 1) postJson timeout becomes configurable by payload.__timeoutMs
s = s.replace(
    "      timeout: 60000",
    "      timeout: Number(payload?.__timeoutMs || 60000)",
    1
)

s = s.replace(
    "      req.destroy(new Error('Sheikha extension chat timeout after 60s'));",
    "      req.destroy(new Error(`Sheikha extension chat timeout after ${Number(payload?.__timeoutMs || 60000)}ms`));",
    1
)

# 2) Prevent expensive context collection before live fastpath
s = s.replace(
"""  const workspace = collectWorkspaceContext();
  const vscodeTools = collectVSCodeToolContext();
  const diagnosticRequested = isInspectorRequest(text);
  const inspectorSnapshot = diagnosticRequested
    ? await getEnterpriseInspectorStatus({ baseUrl: primaryBaseUrl })
    : undefined;""",
"""  const liveMode = options.streaming !== false;
  const diagnosticRequested = isInspectorRequest(text);

  // Live path must not wait for workspace/tool/inspector collection.
  const workspace = liveMode ? {} : collectWorkspaceContext();
  const vscodeTools = liveMode ? {} : collectVSCodeToolContext();
  const inspectorSnapshot = (!liveMode && diagnosticRequested)
    ? await getEnterpriseInspectorStatus({ baseUrl: primaryBaseUrl })
    : undefined;"""
)

# 3) Insert JSON live fastpath immediately after payload/greetingAllowed and before raw SSE/conversation fallback
needle = "  const greetingAllowed = options.greetingAllowed !== false;\n\n  try {"
live_block = r'''  const greetingAllowed = options.greetingAllowed !== false;

  try {
    if (options.streaming !== false) {
      try {
        const fastJson = await postJson(
          `${STREAMING_CHAT_APEX_STREAM_ENDPOINT}?format=json`,
          {
            message: text,
            mode: payload.mode,
            actor: 'vscode-extension',
            channel: 'extension-chat',
            source: 'sheikha-vscode-extension',
            transport: 'JSON_FAST_STREAM_LIVE_V2',
            extensionStreaming: true,
            __timeoutMs: Number(options.timeout || 3000)
          },
          primaryBaseUrl
        );

        const fastText = String(
          fastJson?.token?.text ||
          fastJson?.token ||
          fastJson?.answer ||
          fastJson?.reply ||
          fastJson?.message ||
          ''
        );

        if (fastJson?.success === true && fastText) {
          if (typeof options.onEvent === 'function') {
            options.onEvent({ event: 'ack', data: { success: true, accepted: true } });
            options.onEvent({
              event: 'meta',
              data: {
                ...(fastJson.meta || {}),
                route: fastJson.meta?.route || 'json-fast-stream-live-v2',
                live: true
              }
            });
            options.onEvent({ event: 'token', data: { text: fastText } });
            options.onEvent({ event: 'done', data: { success: true } });
          }

          if (typeof options.onToken === 'function') {
            options.onToken({ event: 'token', data: { text: fastText }, text: fastText });
          }

          return {
            success: true,
            answer: normalizeSheikhaReply(fastText, text, { greetingAllowed }),
            raw: {
              ...fastJson,
              route: 'SHEIKHA_STREAMING_CHAT_JSON_FASTPATH_LIVE_V2',
              endpoint: `${STREAMING_CHAT_APEX_STREAM_ENDPOINT}?format=json`
            }
          };
        }
      } catch (fastJsonError) {
        if (typeof options.onEvent === 'function') {
          options.onEvent({
            event: 'json-fastpath-fallback',
            data: { error: fastJsonError.message }
          });
        }

        const liveFallback = buildLocalChatFallbackAnswer(text, fastJsonError.message);

        if (typeof options.onToken === 'function') {
          options.onToken({ event: 'token', data: { text: liveFallback }, text: liveFallback });
        }

        if (typeof options.onEvent === 'function') {
          options.onEvent({ event: 'done', data: { success: true, localLiveFallback: true } });
        }

        return {
          success: true,
          answer: normalizeSheikhaReply(liveFallback, text, { greetingAllowed }),
          raw: {
            success: true,
            localLiveFallback: true,
            error: fastJsonError.message,
            route: 'SHEIKHA_EXTENSION_LOCAL_LIVE_FALLBACK_V2'
          }
        };
      }
    }
'''

if "SHEIKHA_STREAMING_CHAT_JSON_FASTPATH_LIVE_V2" not in s:
    if needle not in s:
        raise SystemExit("Cannot find live insertion point")
    s = s.replace(needle, live_block, 1)

p.write_text(s)
PY

echo "== Syntax check =="
node --check src/sheikhaExtensionChatClient.js

echo "== Direct live test =="
node - <<'JS'
const { sendExtensionChat } = require('./src/sheikhaExtensionChatClient');

console.time('sheikha-live');
sendExtensionChat('اختبار لايف سريع', {
  baseUrl: 'http://127.0.0.1:8080',
  streaming: true,
  timeout: 3000,
  onEvent: e => console.log('EVENT', e.event, e.data),
  onToken: t => console.log('TOKEN', String(t.text || '').slice(0, 160))
}).then(r => {
  console.timeEnd('sheikha-live');
  console.log('SUCCESS:', r.success);
  console.log('ROUTE:', r.raw?.route);
  console.log('ANSWER:', String(r.answer || '').slice(0, 260));
}).catch(e => {
  console.error('ERROR:', e);
  process.exit(1);
});
JS

echo "== Tests =="
npm test -- --runInBand sheikhaExtensionChatTransport.test.js

echo "== Package VSIX =="
npm run package

echo "== Install VSIX =="
code --install-extension dist/sheikha.sheikha-1.0.89.vsix --force

echo "== Restart VS Code =="
pkill code || true
cd "$ROOT"
code . >/dev/null 2>&1 &

echo "== Git status =="
cd "$ROOT"
git status --short

echo "== Done. If live test is under 3-4s, commit with:"
echo "git add sheikha-vscode-extension/src/sheikhaExtensionChatClient.js && git commit -m 'Activate Sheikha extension true live chat fastpath' && git push origin feature/extension-experience-apex-v1"
