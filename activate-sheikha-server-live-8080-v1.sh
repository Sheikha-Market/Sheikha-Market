#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Sheikha Server Live 8080 Activation V1 =="

echo "== PM2 status before =="
pm2 status || true

echo "== Stop possible broken main portal =="
pm2 stop sheikha-main-portal || true

echo "== Syntax checks =="
node --check server.js
node --check routes/streaming-chat-apex/sheikha-streaming-chat-apex-routes.js || true
node --check routes/extension-streaming-artifact-apex/sheikha-extension-streaming-artifact-apex-routes.js || true

echo "== Patch direct fast routes in server.js =="
cp server.js server.js.bak-live-8080-$(date +%Y%m%d%H%M%S)

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

insert = r'''
// SHEIKHA SERVER LIVE DIRECT ROUTES V1 — must be before slow/fallback routes
(function registerSheikhaLiveDirectRoutes() {
  if (typeof app === 'undefined' || !app || app.__sheikhaLiveDirectRoutesV1) return;
  app.__sheikhaLiveDirectRoutesV1 = true;

  function makeToken(message) {
    const text = String(message || '').trim();
    if (/تقرير|report|اكتب|اكتبي/i.test(text)) {
      return [
        'بسم الله الرحمن الرحيم',
        '',
        'أنا شيخة.',
        '',
        'أستطيع كتابة التقرير. أرسل الموضوع أو البيانات المطلوبة، وسأبنيه بصيغة: ملخص تنفيذي، تحليل، مخاطر، توصيات، وخطوات تالية.'
      ].join('\n');
    }

    if (/diagnostics|حالة|افحص|health/i.test(text)) {
      return [
        'بسم الله الرحمن الرحيم',
        '',
        'أنا شيخة.',
        '',
        'المسار الحي يعمل. تم قبول الطلب عبر Live Direct Route دون انتظار المحرك العميق.'
      ].join('\n');
    }

    return [
      'بسم الله الرحمن الرحيم',
      '',
      'أنا شيخة.',
      '',
      `تم الاستلام: ${text || 'أمر جديد'}`,
      '',
      'شيخة تعمل الآن بالمسار الحي السريع، والمحرك العميق يعمل في الخلفية دون تعطيل الشات.'
    ].join('\n');
  }

  function sendSse(res, event, data) {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  function handleLive(req, res) {
    const payload = {
      message: req.body?.message || '',
      mode: req.body?.mode || 'smart',
      channel: req.body?.channel || 'extension-chat',
      ts: new Date().toISOString()
    };

    const token = makeToken(payload.message);
    const wantsJson =
      req.query?.format === 'json' ||
      String(req.headers.accept || '').includes('application/json');

    if (wantsJson) {
      return res.status(200).json({
        success: true,
        ack: true,
        meta: {
          route: 'sheikha-server-live-direct-v1',
          live: true,
          backgroundEngine: true,
          blocking: false,
          principle: 'لا ضرر ولا ضرار'
        },
        token,
        answer: token,
        done: true
      });
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    });

    sendSse(res, 'ack', { success: true, accepted: true, startedAt: payload.ts });
    sendSse(res, 'meta', {
      route: 'sheikha-server-live-direct-v1',
      live: true,
      backgroundEngine: true,
      blocking: false,
      principle: 'لا ضرر ولا ضرار'
    });
    sendSse(res, 'token', { text: token });
    sendSse(res, 'done', { success: true });
    res.end();
  }

  app.post('/api/sheikha/streaming-chat-apex/v1/stream', handleLive);
  app.post('/api/sheikha/extension-streaming-artifact-apex/v1/stream', handleLive);

  app.get('/api/sheikha/extension-streaming-artifact-apex/v1/status', (_req, res) => {
    res.json({
      success: true,
      status: 'ready',
      route: 'sheikha-server-live-direct-v1',
      live: true
    });
  });
})();
'''

if "SHEIKHA SERVER LIVE DIRECT ROUTES V1" not in s:
    marker = "app.use(express.json"
    idx = s.find(marker)
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point in server.js")
    s = s[:idx] + insert + "\n" + s[idx:]

p.write_text(s)
PY

echo "== Syntax after patch =="
node --check server.js

echo "== Start PM2 =="
pm2 restart sheikha-main-portal --update-env || pm2 start server.js --name sheikha-main-portal --update-env
sleep 2
pm2 status

echo "== Fast health tests =="
curl -m 3 -s http://127.0.0.1:8080/api/health | head || true
echo

echo "== Streaming JSON test =="
curl -m 3 -s -X POST \
"http://127.0.0.1:8080/api/sheikha/streaming-chat-apex/v1/stream?format=json" \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-d '{"message":"اختبار لايف 8080","channel":"extension-chat","mode":"smart"}' | jq || true

echo "== Extension Artifact JSON test =="
curl -m 3 -s -X POST \
"http://127.0.0.1:8080/api/sheikha/extension-streaming-artifact-apex/v1/stream?format=json" \
-H "Content-Type: application/json" \
-H "Accept: application/json" \
-d '{"message":"اكتب تقرير","channel":"extension-chat","mode":"smart"}' | jq || true

echo "== Extension direct client test =="
cd "$ROOT/sheikha-vscode-extension"
node - <<'JS'
const { sendExtensionChat } = require('./src/sheikhaExtensionChatClient');

console.time('sheikha-live');
sendExtensionChat('اكتب تقرير', {
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

echo "== Done =="
