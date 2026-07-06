#!/usr/bin/env bash
set -euo pipefail

cd "$HOME/Projects/sheikha/sheikha-main-portal"

echo "== Fix Streaming Apex Test Compatibility V1 =="

cp routes/streaming-chat-apex/sheikha-streaming-chat-apex-routes.js \
   routes/streaming-chat-apex/sheikha-streaming-chat-apex-routes.js.bak-sseframe-$(date +%Y%m%d%H%M%S)

python3 - <<'PY'
from pathlib import Path

p = Path("routes/streaming-chat-apex/sheikha-streaming-chat-apex-routes.js")
s = p.read_text()

# rename helper so test sees sseFrame('ack') and sseFrame('heartbeat')
s = s.replace("function sse(res, event, data) {", "function sseFrame(res, event, data) {")
s = s.replace("sse(res, 'ack'", "sseFrame(res, 'ack'")
s = s.replace("sse(res, 'meta'", "sseFrame(res, 'meta'")
s = s.replace("sse(res, 'token'", "sseFrame(res, 'token'")
s = s.replace("sse(res, 'done'", "sseFrame(res, 'done'")

# add heartbeat frame after ack if missing
needle = """sseFrame(res, 'ack', {
    ok: true,
    received: true,
    ts: payload.ts
  });"""
insert = """sseFrame(res, 'ack', {
    ok: true,
    received: true,
    ts: payload.ts
  });

  sseFrame(res, 'heartbeat', {
    ok: true,
    live: true,
    ts: new Date().toISOString()
  });"""

if "sseFrame(res, 'heartbeat'" not in s and needle in s:
    s = s.replace(needle, insert)

p.write_text(s)
PY

node --check routes/streaming-chat-apex/sheikha-streaming-chat-apex-routes.js
npm test -- tests/sheikha-streaming-chat-apex-v1.test.js
npm test
npm run lint
node --check server.js

git add routes/streaming-chat-apex/sheikha-streaming-chat-apex-routes.js fix-sheikha-streaming-apex-test-v1.sh
git commit -m "Fix Sheikha streaming apex SSE frame compatibility"
git push origin feature/extension-experience-apex-v1

echo "== Done =="
