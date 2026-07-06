#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Activate Sheikha Chat Autonomous Execution Binding V1 =="

cp server.js server.js.bak-chat-autonomous-binding-$(date +%Y%m%d%H%M%S)

python3 - <<'PY'
from pathlib import Path

p = Path("server.js")
s = p.read_text()

insert = r'''
// SHEIKHA CHAT AUTONOMOUS EXECUTION BINDING V1
(function registerSheikhaChatAutonomousExecutionBinding() {
  if (typeof app === 'undefined' || !app || app.__sheikhaChatAutonomousExecutionBindingV1) return;
  app.__sheikhaChatAutonomousExecutionBindingV1 = true;

  async function executeAutonomous(message, mode) {
    const { execute } = require('./runtime/autonomous-execution-bridge/v1/sheikha-autonomous-execution-bridge-v1');
    return execute(message, {
      mode: mode || 'smart',
      timeoutMs: 180000,
      numPredict: 160
    });
  }

  app.post('/api/sheikha/chat/autonomous/v1', async (req, res) => {
    try {
      const result = await executeAutonomous(req.body?.message || '', req.body?.mode || 'smart');
      res.json({
        success: true,
        route: 'SHEIKHA_CHAT_AUTONOMOUS_EXECUTION_BINDING_V1',
        answer: result.answer,
        result
      });
    } catch (error) {
      res.json({
        success: false,
        route: 'SHEIKHA_CHAT_AUTONOMOUS_EXECUTION_BINDING_V1',
        error: error.message,
        fallback: 'تعذر تشغيل التنفيذ العميق، وتم الرجوع للمسار السريع.'
      });
    }
  });

  app.post('/api/sheikha/streaming-chat-apex/v1/autonomous', async (req, res) => {
    try {
      const result = await executeAutonomous(req.body?.message || '', req.body?.mode || 'smart');

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

      send('ack', { success: true, accepted: true });
      send('meta', {
        route: 'SHEIKHA_CHAT_AUTONOMOUS_EXECUTION_BINDING_V1',
        apexLevel: 26,
        model: result?.routed?.model,
        status: result?.status
      });
      send('token', { text: result.answer || '' });
      send('done', { success: true });
      res.end();
    } catch (error) {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive'
      });
      res.write(`event: token\n`);
      res.write(`data: ${JSON.stringify({ text: 'تعذر تشغيل التنفيذ العميق، وتم الرجوع للمسار السريع.' })}\n\n`);
      res.write(`event: done\n`);
      res.write(`data: ${JSON.stringify({ success: false, error: error.message })}\n\n`);
      res.end();
    }
  });
})();
'''

if "SHEIKHA CHAT AUTONOMOUS EXECUTION BINDING V1" not in s:
    marker = "app.use(express.json"
    idx = s.find(marker)
    if idx == -1:
        idx = s.find("app.use(")
    if idx == -1:
        raise SystemExit("Cannot find insertion point")
    s = s[:idx] + insert + "\n" + s[idx:]

p.write_text(s)
PY

echo "== Checks =="
node --check server.js

echo "== Restart =="
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== JSON chat test =="
curl -s -X POST http://127.0.0.1:8080/api/sheikha/chat/autonomous/v1 \
  -H "Content-Type: application/json" \
  -d '{"message":"عرّف بنفسك باختصار","mode":"smart"}' | jq '.success,.route,.result.status,.result.routed.model,.answer'

echo "== SSE autonomous test =="
curl -N -X POST http://127.0.0.1:8080/api/sheikha/streaming-chat-apex/v1/autonomous \
  -H "Content-Type: application/json" \
  -d '{"message":"عرّف بنفسك باختصار","mode":"smart"}'

echo
echo "== Done =="
