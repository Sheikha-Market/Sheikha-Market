#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
EXT="$ROOT/sheikha-vscode-extension"
CLIENT="$EXT/src/sheikhaExtensionChatClient.js"

cd "$ROOT"

echo "== Activate SHEIKHA_EXTENSION_REAL_SSE_BINDING_L51_V1 =="

cp "$CLIENT" "$CLIENT.bak-real-sse-l51-$(date +%Y%m%d%H%M%S)"

python3 - <<'PY'
from pathlib import Path

p = Path("sheikha-vscode-extension/src/sheikhaExtensionChatClient.js")
s = p.read_text()

start = s.find("    // SHEIKHA_EXTENSION_L45_LIVE_BINDING_V1")
end = s.find("    // SHEIKHA_EXTENSION_L35_ORCHESTRATOR_BINDING_V1", start)

if start == -1 or end == -1:
    raise SystemExit("L45 block boundaries not found")

new_block = r'''    // SHEIKHA_EXTENSION_REAL_SSE_BINDING_L51_V1
    // Real transport path: Extension -> /api/sheikha/live/chat/v1 -> Ollama SSE tokens.
    if (options.live !== false) {
      try {
        const streamed = await postSse(
          LIVE_CHAT_ENDPOINT,
          {
            message: text,
            mode: payload.mode || options.mode || 'smart',
            actor: 'vscode-extension',
            channel: 'extension-chat',
            source: 'sheikha-vscode-extension',
            transport: 'REAL_SSE_L51'
          },
          primaryBaseUrl,
          {
            timeout: Number(options.timeout || 180000),
            onEvent: options.onEvent,
            onToken: options.onToken
          }
        );

        const answerText = String(
          streamed?.answer ||
          streamed?.text ||
          streamed?.tokens?.join?.('') ||
          ''
        ).trim();

        if (streamed?.success !== false && answerText) {
          return {
            success: true,
            answer: dedupeSheikhaAnswer(answerText),
            raw: {
              ...streamed,
              route: 'SHEIKHA_EXTENSION_REAL_SSE_BINDING_L51_V1',
              endpoint: LIVE_CHAT_ENDPOINT,
              realSse: true
            }
          };
        }
      } catch (sseError) {
        if (typeof options.onEvent === 'function') {
          options.onEvent({
            event: 'real-sse-l51-error',
            data: { error: sseError.message }
          });
        }
        throw sseError;
      }
    }

'''

s = s[:start] + new_block + s[end:]

# احذف Fast JSON المكرر بعد L35 إذا بقي يسبق SSE الحقيقي.
for marker in [
    "JSON_FAST_STREAM_LIVE_V2",
    "JSON_FAST_STREAM_LIVE"
]:
    while marker in s:
        idx = s.find(marker)
        block_start = s.rfind("    if (options.streaming !== false) {", 0, idx)
        block_end = s.find("    if (options.streaming !== false) {", idx + 1)
        if block_start == -1:
            break
        if block_end == -1:
            block_end = s.find("    const streamed = await postSse", idx)
        if block_end == -1:
            break
        s = s[:block_start] + "    // Removed obsolete JSON fastpath; real SSE L51 is authoritative.\n\n" + s[block_end:]

# لا تستخدم LIVE_CHAT_ENDPOINT مع format=json مطلقاً
s = s.replace("`${LIVE_CHAT_ENDPOINT}?format=json`", "LIVE_CHAT_ENDPOINT")
s = s.replace("endpoint: `${LIVE_CHAT_ENDPOINT}?format=json`", "endpoint: LIVE_CHAT_ENDPOINT")

p.write_text(s)
PY

echo "== Checks =="
cd "$EXT"
node --check src/sheikhaExtensionChatClient.js

echo "== Grep verify =="
grep -n "LIVE_CHAT_ENDPOINT.*format=json\\|JSON_FAST_STREAM_LIVE\\|SHEIKHA_EXTENSION_L45_LIVE_BINDING_V1" src/sheikhaExtensionChatClient.js || true

echo "== Direct L51 test =="
node - <<'JS'
const { sendExtensionChat } = require('./src/sheikhaExtensionChatClient');

console.time('l51-real-sse');
sendExtensionChat('عرف بنفسك مرة واحدة فقط بدون تكرار', {
  baseUrl: 'http://127.0.0.1:8080',
  live: true,
  autonomous: false,
  streaming: true,
  timeout: 180000,
  onEvent: e => console.log('EVENT', e.event, e.data),
  onToken: t => process.stdout.write(String(t.text || t.data?.text || ''))
}).then(r => {
  console.log('\n---');
  console.timeEnd('l51-real-sse');
  console.log('SUCCESS:', r.success);
  console.log('ROUTE:', r.raw?.route);
  console.log('ANSWER:', String(r.answer || '').slice(0, 300));
}).catch(e => {
  console.error(e);
  process.exit(1);
});
JS

echo "== Test and package =="
npm test -- --runInBand sheikhaExtensionChatTransport.test.js
npm run package
code --install-extension dist/sheikha.sheikha-1.0.89.vsix --force

cd "$ROOT"

git add \
  activate-sheikha-extension-real-sse-binding-l51-v1.sh \
  sheikha-vscode-extension/src/sheikhaExtensionChatClient.js

git commit -m "Bind Sheikha extension chat to real SSE L51"
git push origin feature/extension-experience-apex-v1

pkill code || true
code "$ROOT"

echo "== Done =="
