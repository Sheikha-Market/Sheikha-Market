#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
cd "$ROOT"

echo "== Remove remaining Sheikha live placeholders final V1 =="

# 1) انقل نسخ الباك أب خارج runtime/routes حتى لا تظهر في grep ولا تُحمّل بالخطأ
mkdir -p backups/live-placeholder-cleanup

find runtime routes -type f \( \
  -name "*.bak-real-stream-*" -o \
  -name "*.bak-sse-fast-*" -o \
  -name "*.bak-live-*" \
\) -print -exec mv {} backups/live-placeholder-cleanup/ \;

# 2) عطّل نص Placeholder القديم داخل streaming-chat-apex حتى لا يربك الإكستنشن عند fallback
cp routes/streaming-chat-apex/sheikha-streaming-chat-apex-routes.js \
   routes/streaming-chat-apex/sheikha-streaming-chat-apex-routes.js.bak-remove-placeholder-$(date +%Y%m%d%H%M%S)

python3 - <<'PY'
from pathlib import Path

p = Path("routes/streaming-chat-apex/sheikha-streaming-chat-apex-routes.js")
s = p.read_text()

s = s.replace(
"`تم الاستلام: ${text}\\n\\nسأتعامل مع الطلب فورًا عبر المسار السريع، مع تشغيل المحرك العميق في الخلفية دون تعطيل الشات.`",
"`Sheikha live route is available. Use /api/sheikha/live/chat/v1 for real model streaming.`"
)

p.write_text(s)
PY

# 3) أبقِ Sheikha Least fallback فقط كتعذر نموذج، لكن أزل "تم الاستلام"
cp runtime/model-core/v1/sheikha-ollama-core-v1.js \
   runtime/model-core/v1/sheikha-ollama-core-v1.js.bak-remove-least-placeholder-$(date +%Y%m%d%H%M%S)

python3 - <<'PY'
from pathlib import Path

p = Path("runtime/model-core/v1/sheikha-ollama-core-v1.js")
s = p.read_text()

s = s.replace(
"`تم الاستلام: ${message || 'أمر جديد'}\\n\\nتعذر تشغيل النموذج المحلي الآن، وتم استخدام مسار Sheikha Least السريع.`",
"`تعذر تشغيل النموذج المحلي الآن، وتم استخدام مسار Sheikha Least السريع.`"
)

p.write_text(s)
PY

echo "== Checks =="
node --check routes/streaming-chat-apex/sheikha-streaming-chat-apex-routes.js
node --check runtime/model-core/v1/sheikha-ollama-core-v1.js
node --check runtime/live-realtime-fabric/v1/sheikha-live-realtime-fabric-v1.js
node --check routes/live-realtime-fabric/sheikha-live-realtime-fabric-routes.js
node --check server.js

echo "== Restart =="
pm2 restart sheikha-main-portal --update-env
sleep 2

echo "== Verify no active placeholders =="
grep -R "makeFastAnswer\|تم الاستلام:\|سأبدأ بالمسار الحي" \
  runtime routes sheikha-vscode-extension/src \
  --exclude-dir=node_modules \
  --exclude='*.bak*' || true

echo "== Test real live stream =="
curl -N -X POST http://127.0.0.1:8080/api/sheikha/live/chat/v1 \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"message":"عرف بنفسك مرة واحدة فقط بدون تكرار","mode":"smart"}'

echo
echo "== Commit =="
git add \
  routes/streaming-chat-apex/sheikha-streaming-chat-apex-routes.js \
  runtime/model-core/v1/sheikha-ollama-core-v1.js \
  backups/live-placeholder-cleanup

git commit -m "Remove remaining Sheikha live placeholder responses"
git push origin feature/extension-experience-apex-v1

echo "== Done =="
