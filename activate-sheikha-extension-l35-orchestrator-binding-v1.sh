#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
EXT="$ROOT/sheikha-vscode-extension"
cd "$ROOT"

echo "== Activate Sheikha Extension L35 Orchestrator Binding V1 =="

cp "$EXT/src/sheikhaExtensionChatClient.js" \
   "$EXT/src/sheikhaExtensionChatClient.js.bak-l35-orchestrator-$(date +%Y%m%d%H%M%S)"

python3 - <<'PY'
from pathlib import Path

p = Path("sheikha-vscode-extension/src/sheikhaExtensionChatClient.js")
s = p.read_text()

if "AUTONOMOUS_CHAT_ENDPOINT" not in s:
    s = s.replace(
        "const STREAMING_CHAT_APEX_STREAM_ENDPOINT = '/api/sheikha/streaming-chat-apex/v1/stream';",
        "const STREAMING_CHAT_APEX_STREAM_ENDPOINT = '/api/sheikha/streaming-chat-apex/v1/stream';\nconst AUTONOMOUS_CHAT_ENDPOINT = '/api/sheikha/chat/autonomous/v1';\nconst AUTONOMOUS_STREAM_ENDPOINT = '/api/sheikha/streaming-chat-apex/v1/autonomous';",
        1
    )

marker = "SHEIKHA_EXTENSION_L35_ORCHESTRATOR_BINDING_V1"
if marker not in s:
    fn = s.find("async function sendExtensionChat")
    if fn == -1:
        raise SystemExit("sendExtensionChat not found")

    try_idx = s.find("  try {\n", fn)
    if try_idx == -1:
        raise SystemExit("sendExtensionChat try block not found")

    insert = r'''  try {
    // SHEIKHA_EXTENSION_L35_ORCHESTRATOR_BINDING_V1
    // Primary deep governed path: Extension -> Autonomous Chat -> L35/L26 -> Model Router.
    if (options.autonomous !== false) {
      try {
        if (typeof options.onEvent === 'function') {
          options.onEvent({
            event: 'ack',
            data: {
              success: true,
              route: 'SHEIKHA_EXTENSION_L35_ORCHESTRATOR_BINDING_V1'
            }
          });
        }

        const autonomous = await postJson(
          AUTONOMOUS_CHAT_ENDPOINT,
          {
            message: text,
            mode: payload.mode || options.mode || 'smart',
            actor: 'vscode-extension',
            channel: 'extension-chat',
            source: 'sheikha-vscode-extension',
            transport: 'AUTONOMOUS_L35_JSON',
            __timeoutMs: Number(options.timeout || 180000)
          },
          primaryBaseUrl
        );

        const answerText = String(
          autonomous?.answer ||
          autonomous?.result?.answer ||
          autonomous?.message ||
          ''
        );

        if (autonomous?.success === true && answerText) {
          const meta = {
            route: 'SHEIKHA_EXTENSION_L35_ORCHESTRATOR_BINDING_V1',
            backendRoute: autonomous.route,
            status: autonomous?.result?.status,
            model: autonomous?.result?.routed?.model,
            agent: autonomous?.result?.plan?.agent,
            apexLevel: autonomous?.result?.plan?.apexLevel || 35
          };

          if (typeof options.onEvent === 'function') {
            options.onEvent({ event: 'meta', data: meta });
            options.onEvent({ event: 'token', data: { text: answerText } });
            options.onEvent({ event: 'done', data: { success: true } });
          }

          if (typeof options.onToken === 'function') {
            options.onToken({ event: 'token', data: { text: answerText }, text: answerText });
          }

          return {
            success: true,
            answer: normalizeSheikhaReply(answerText, text, { greetingAllowed }),
            raw: {
              ...autonomous,
              route: 'SHEIKHA_EXTENSION_L35_ORCHESTRATOR_BINDING_V1',
              endpoint: AUTONOMOUS_CHAT_ENDPOINT,
              meta
            }
          };
        }
      } catch (autonomousError) {
        if (typeof options.onEvent === 'function') {
          options.onEvent({
            event: 'autonomous-l35-fallback',
            data: { error: autonomousError.message }
          });
        }
      }
    }

'''
    s = s[:try_idx] + insert + s[try_idx + len("  try {\n"):]

if "AUTONOMOUS_CHAT_ENDPOINT," not in s and "module.exports" in s:
    s = s.replace(
        "STREAMING_CHAT_APEX_STREAM_ENDPOINT,",
        "STREAMING_CHAT_APEX_STREAM_ENDPOINT,\n  AUTONOMOUS_CHAT_ENDPOINT,\n  AUTONOMOUS_STREAM_ENDPOINT,",
        1
    )

p.write_text(s)
PY

echo "== Checks =="
cd "$EXT"
node --check src/sheikhaExtensionChatClient.js

echo "== Direct extension client test =="
node - <<'JS'
const { sendExtensionChat } = require('./src/sheikhaExtensionChatClient');

console.time('l35-extension');
sendExtensionChat('عرّف بنفسك باختصار', {
  baseUrl: 'http://127.0.0.1:8080',
  streaming: true,
  autonomous: true,
  timeout: 180000,
  onEvent: e => console.log('EVENT', e.event, e.data),
  onToken: t => console.log('TOKEN', String(t.text || '').slice(0, 160))
}).then(r => {
  console.timeEnd('l35-extension');
  console.log('SUCCESS:', r.success);
  console.log('ROUTE:', r.raw?.route);
  console.log('MODEL:', r.raw?.meta?.model);
  console.log('ANSWER:', String(r.answer || '').slice(0, 220));
}).catch(e => {
  console.error(e);
  process.exit(1);
});
JS

echo "== Tests and package =="
npm test -- --runInBand sheikhaExtensionChatTransport.test.js
npm run package
code --install-extension dist/sheikha.sheikha-1.0.89.vsix --force

cd "$ROOT"
echo "== Done =="
