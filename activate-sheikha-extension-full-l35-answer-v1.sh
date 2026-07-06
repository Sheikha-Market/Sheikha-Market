#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
EXT="$ROOT/sheikha-vscode-extension"
CLIENT="$EXT/src/sheikhaExtensionChatClient.js"

cd "$ROOT"

echo "== Activate Sheikha Extension Full L35 Answer V1 =="

cp "$CLIENT" "$CLIENT.bak-full-l35-answer-$(date +%Y%m%d%H%M%S)"

python3 - <<'PY'
from pathlib import Path

p = Path("sheikha-vscode-extension/src/sheikhaExtensionChatClient.js")
s = p.read_text()

old = """          return {
            success: true,
            answer: normalizeSheikhaReply(answerText, text, { greetingAllowed }),
            raw: {
              ...autonomous,
              route: 'SHEIKHA_EXTENSION_L35_ORCHESTRATOR_BINDING_V1',
              endpoint: AUTONOMOUS_CHAT_ENDPOINT,
              meta
            }
          };"""

new = """          const fullAnswerText = String(
            autonomous?.answer ||
            autonomous?.result?.answer ||
            autonomous?.result?.answerText ||
            autonomous?.result?.response ||
            answerText ||
            ''
          );

          return {
            success: true,
            answer: fullAnswerText,
            raw: {
              ...autonomous,
              route: 'SHEIKHA_EXTENSION_L35_ORCHESTRATOR_BINDING_V1',
              endpoint: AUTONOMOUS_CHAT_ENDPOINT,
              meta,
              fullAnswerText
            }
          };"""

if old not in s:
    raise SystemExit("L35 return block not found")

s = s.replace(old, new, 1)
p.write_text(s)
PY

echo "== Checks =="
cd "$EXT"
node --check src/sheikhaExtensionChatClient.js

echo "== Direct test =="
node - <<'JS'
const { sendExtensionChat } = require('./src/sheikhaExtensionChatClient');

sendExtensionChat('عرّف بنفسك باختصار', {
  baseUrl: 'http://127.0.0.1:8080',
  autonomous: true,
  streaming: true,
  timeout: 180000,
  onEvent: e => console.log('EVENT', e.event, e.data),
  onToken: t => console.log('TOKEN:', String(t.text || '').slice(0, 200))
}).then(r => {
  console.log('SUCCESS:', r.success);
  console.log('ROUTE:', r.raw?.route);
  console.log('MODEL:', r.raw?.meta?.model);
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
  activate-sheikha-extension-full-l35-answer-v1.sh \
  sheikha-vscode-extension/src/sheikhaExtensionChatClient.js

git commit -m "Preserve full L35 answer in Sheikha extension chat"
git push origin feature/extension-experience-apex-v1

echo "== Restart VS Code =="
pkill code || true
code "$ROOT"

echo "== Done =="
