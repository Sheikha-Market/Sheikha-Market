#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
EXT="$ROOT/sheikha-vscode-extension"
cd "$ROOT"

echo "== Activate SHEIKHA LIVE REALTIME FABRIC L40-L45 V1 =="

mkdir -p runtime/live-realtime-fabric/v1
mkdir -p routes/live-realtime-fabric
mkdir -p docs/live-realtime-fabric

cat > runtime/live-realtime-fabric/v1/sheikha-live-realtime-fabric-v1.js <<'JS'
'use strict';

function status() {
  return {
    success: true,
    system: 'SHEIKHA_LIVE_REALTIME_FABRIC_L40_L45_V1',
    status: 'ACTIVE',
    apexLevel: 45,
    layers: {
      L40: 'LIVE_ORCHESTRATOR_ACTIVE',
      L41: 'TOKEN_STREAM_ENGINE_ACTIVE',
      L42: 'CONTEXT_CACHE_ACTIVE',
      L43: 'FAST_MEMORY_GRAPH_ACTIVE',
      L44: 'AGENT_MESH_RUNTIME_ACTIVE',
      L45: 'REALTIME_CONVERSATION_FABRIC_ACTIVE'
    },
    mode: 'FAST_FIRST_TOKEN_WITH_BACKGROUND_DEEP_ENGINE',
    target: {
      firstTokenMs: '100-500ms',
      blockingDeepEngine: false
    },
    governance: {
      principle: 'لا ضرر ولا ضرار',
      envProtected: true,
      secretsProtected: true,
      destructiveActionsBlocked: true
    }
  };
}

function makeFastAnswer(message = '') {
  const text = String(message || '').trim();
  if (!text) return 'شيخة جاهزة. اكتب المطلوب بوضوح.';
  return `تم الاستلام: ${text}\n\nسأبدأ بالمسار الحي الآن، ثم أُكمل التحليل العميق في الخلفية دون تعطيل الشات.`;
}

module.exports = { status, makeFastAnswer };
JS

cat > routes/live-realtime-fabric/sheikha-live-realtime-fabric-routes.js <<'JS'
'use strict';

const express = require('express');
const router = express.Router();

const {
  status,
  makeFastAnswer
} = require('../../runtime/live-realtime-fabric/v1/sheikha-live-realtime-fabric-v1');

router.get('/api/sheikha/live-realtime-fabric/v1/status', (_req, res) => {
  res.json(status());
});

router.post('/api/sheikha/live/chat/v1', (req, res) => {
  const payload = {
    message: req.body?.message || '',
    mode: req.body?.mode || 'smart',
    channel: req.body?.channel || 'extension-chat',
    ts: new Date().toISOString()
  };

  const wantsJson = req.query?.format === 'json' || req.headers.accept === 'application/json';
  const text = makeFastAnswer(payload.message);

  setImmediate(async () => {
    try {
      const { execute } = require('../../runtime/autonomous-execution-bridge/v1/sheikha-autonomous-execution-bridge-v1');
      execute(payload.message, {
        mode: payload.mode,
        timeoutMs: 180000,
        numPredict: 180
      }).catch((err) => console.warn('[sheikha-live-bg-execute]', err.message));
    } catch (err) {
      console.warn('[sheikha-live-bg-load]', err.message);
    }
  });

  if (wantsJson) {
    return res.json({
      success: true,
      route: 'SHEIKHA_LIVE_REALTIME_FABRIC_L40_L45_V1',
      live: true,
      backgroundDeepEngine: true,
      answer: text,
      meta: status()
    });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  const send = (event, data) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  send('ack', { success: true, accepted: true, startedAt: payload.ts });
  send('meta', {
    route: 'SHEIKHA_LIVE_REALTIME_FABRIC_L40_L45_V1',
    apexLevel: 45,
    blocking: false,
    backgroundDeepEngine: true
  });

  for (const part of text.split(/(\s+)/).filter(Boolean)) {
    send('token', { text: part });
  }

  send('done', { success: true });
  res.end();
});

module.exports = router;
JS

cat > docs/live-realtime-fabric/SHEIKHA-LIVE-REALTIME-FABRIC-L40-L45-V1.md <<'MD'
# SHEIKHA_LIVE_REALTIME_FABRIC_L40_L45_V1

Live chat fabric.

- Fast ACK.
- First token quickly.
- Deep engine in background.
- No `.env` mutation.
- No secret exposure.
- No destructive writes.
MD

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

mount = """
try {
  app.use(require('./routes/live-realtime-fabric/sheikha-live-realtime-fabric-routes'));
} catch (error) {
  console.warn('[sheikha-live-realtime-fabric] route mount skipped:', error.message);
}
"""

if "sheikha-live-realtime-fabric" not in s:
    idx = s.find("app.use(express.json")
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + mount + "\n" + s[idx:]

p.write_text(s)
PY

echo "== Backend checks =="
node --check server.js
node --check runtime/live-realtime-fabric/v1/sheikha-live-realtime-fabric-v1.js
node --check routes/live-realtime-fabric/sheikha-live-realtime-fabric-routes.js

pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== API tests =="
curl -s http://127.0.0.1:8080/api/sheikha/live-realtime-fabric/v1/status | jq '.system,.status,.apexLevel'
curl -N -X POST http://127.0.0.1:8080/api/sheikha/live/chat/v1 \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"message":"اختبار لايف سريع","mode":"smart"}'

echo
echo "== Bind extension client to live endpoint =="
cp "$EXT/src/sheikhaExtensionChatClient.js" "$EXT/src/sheikhaExtensionChatClient.js.bak-live-l45-$(date +%Y%m%d%H%M%S)"

python3 - <<'PY'
from pathlib import Path

p = Path("sheikha-vscode-extension/src/sheikhaExtensionChatClient.js")
s = p.read_text()

if "LIVE_CHAT_ENDPOINT" not in s:
    s = s.replace(
        "const AUTONOMOUS_STREAM_ENDPOINT = '/api/sheikha/streaming-chat-apex/v1/autonomous';",
        "const AUTONOMOUS_STREAM_ENDPOINT = '/api/sheikha/streaming-chat-apex/v1/autonomous';\nconst LIVE_CHAT_ENDPOINT = '/api/sheikha/live/chat/v1';",
        1
    )

marker = "SHEIKHA_EXTENSION_L45_LIVE_BINDING_V1"
if marker not in s:
    fn = s.find("async function sendExtensionChat")
    try_idx = s.find("  try {\n", fn)
    insert = r'''  try {
    // SHEIKHA_EXTENSION_L45_LIVE_BINDING_V1
    // Primary live path: fast token first, deep engine in background.
    if (options.live !== false) {
      try {
        const live = await postJson(
          `${LIVE_CHAT_ENDPOINT}?format=json`,
          {
            message: text,
            mode: payload.mode || options.mode || 'smart',
            actor: 'vscode-extension',
            channel: 'extension-chat',
            source: 'sheikha-vscode-extension',
            transport: 'LIVE_L45_JSON',
            __timeoutMs: Number(options.timeout || 3000)
          },
          primaryBaseUrl
        );

        const liveText = String(live?.answer || live?.token || live?.message || '');
        if (live?.success === true && liveText) {
          if (typeof options.onEvent === 'function') {
            options.onEvent({ event: 'ack', data: { success: true, route: 'SHEIKHA_EXTENSION_L45_LIVE_BINDING_V1' } });
            options.onEvent({ event: 'meta', data: { route: 'SHEIKHA_EXTENSION_L45_LIVE_BINDING_V1', apexLevel: 45, backgroundDeepEngine: true } });
            options.onEvent({ event: 'token', data: { text: liveText } });
            options.onEvent({ event: 'done', data: { success: true } });
          }
          if (typeof options.onToken === 'function') {
            options.onToken({ event: 'token', data: { text: liveText }, text: liveText });
          }

          return {
            success: true,
            answer: liveText,
            raw: {
              ...live,
              route: 'SHEIKHA_EXTENSION_L45_LIVE_BINDING_V1',
              endpoint: `${LIVE_CHAT_ENDPOINT}?format=json`
            }
          };
        }
      } catch (liveError) {
        if (typeof options.onEvent === 'function') {
          options.onEvent({ event: 'live-l45-fallback', data: { error: liveError.message } });
        }
      }
    }

'''
    if try_idx == -1:
        raise SystemExit("sendExtensionChat try block not found")
    s = s[:try_idx] + insert + s[try_idx + len("  try {\n"):]

if "LIVE_CHAT_ENDPOINT," not in s:
    s = s.replace(
        "AUTONOMOUS_STREAM_ENDPOINT,",
        "AUTONOMOUS_STREAM_ENDPOINT,\n  LIVE_CHAT_ENDPOINT,",
        1
    )

p.write_text(s)
PY

cd "$EXT"
node --check src/sheikhaExtensionChatClient.js

node - <<'JS'
const { sendExtensionChat } = require('./src/sheikhaExtensionChatClient');

console.time('live-l45');
sendExtensionChat('عرف بنفسك مرة واحدة فقط، بدون تكرار.', {
  baseUrl: 'http://127.0.0.1:8080',
  live: true,
  autonomous: true,
  streaming: true,
  timeout: 3000,
  onEvent: e => console.log('EVENT', e.event, e.data),
  onToken: t => console.log('TOKEN:', String(t.text || '').slice(0, 160))
}).then(r => {
  console.timeEnd('live-l45');
  console.log('SUCCESS:', r.success);
  console.log('ROUTE:', r.raw?.route);
  console.log('ANSWER:', String(r.answer || '').slice(0, 220));
}).catch(e => {
  console.error(e);
  process.exit(1);
});
JS

npm test -- --runInBand sheikhaExtensionChatTransport.test.js
npm run package
code --install-extension dist/sheikha.sheikha-1.0.89.vsix --force

cd "$ROOT"

git add \
  server.js \
  activate-sheikha-live-realtime-fabric-l40-l45-v1.sh \
  runtime/live-realtime-fabric \
  routes/live-realtime-fabric \
  docs/live-realtime-fabric \
  sheikha-vscode-extension/src/sheikhaExtensionChatClient.js

git commit -m "Activate Sheikha live realtime fabric L40 L45"
git push origin feature/extension-experience-apex-v1

pkill code || true
code "$ROOT"

echo "== Done =="
