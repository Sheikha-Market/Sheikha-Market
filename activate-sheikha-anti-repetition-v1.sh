#!/usr/bin/env bash
set -euo pipefail

ROOT="$HOME/Projects/sheikha/sheikha-main-portal"
EXT="$ROOT/sheikha-vscode-extension"
CLIENT="$EXT/src/sheikhaExtensionChatClient.js"

cd "$ROOT"

echo "== Activate Sheikha Anti Repetition V1 =="

cp "$CLIENT" "$CLIENT.bak-anti-repetition-$(date +%Y%m%d%H%M%S)"

python3 - <<'PY'
from pathlib import Path

p = Path("sheikha-vscode-extension/src/sheikhaExtensionChatClient.js")
s = p.read_text()

helper = r'''
function dedupeSheikhaAnswer(text) {
  const raw = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!raw) return raw;

  const lines = raw.split('\n').map(x => x.trim()).filter(Boolean);
  const seen = new Set();
  const out = [];

  for (const line of lines) {
    const key = line
      .replace(/[.،,:؛!؟\s]+$/g, '')
      .replace(/\s+/g, ' ')
      .toLowerCase();

    if (seen.has(key)) continue;
    seen.add(key);
    out.push(line);
  }

  let finalText = out.join('\n');

  finalText = finalText.replace(/^(أنا شيخة\.\s*){2,}/g, 'أنا شيخة.\n');
  finalText = finalText.replace(/(بسم الله الرحمن الرحيم\s*){2,}/g, 'بسم الله الرحمن الرحيم\n');

  return finalText.trim();
}
'''

if "function dedupeSheikhaAnswer" not in s:
    insert_at = s.find("async function sendExtensionChat")
    if insert_at == -1:
        raise SystemExit("sendExtensionChat not found")
    s = s[:insert_at] + helper + "\n" + s[insert_at:]

s = s.replace(
    "answer: fullAnswerText,",
    "answer: dedupeSheikhaAnswer(fullAnswerText),",
    1
)

s = s.replace(
    "options.onEvent({ event: 'token', data: { text: answerText } });",
    "options.onEvent({ event: 'token', data: { text: dedupeSheikhaAnswer(answerText) } });",
    1
)

s = s.replace(
    "options.onToken({ event: 'token', data: { text: answerText }, text: answerText });",
    "options.onToken({ event: 'token', data: { text: dedupeSheikhaAnswer(answerText) }, text: dedupeSheikhaAnswer(answerText) });",
    1
)

p.write_text(s)
PY

cd "$EXT"

node --check src/sheikhaExtensionChatClient.js

node - <<'JS'
const { sendExtensionChat } = require('./src/sheikhaExtensionChatClient');

sendExtensionChat('اختبار منع التكرار: عرف بنفسك مرة واحدة فقط', {
  baseUrl: 'http://127.0.0.1:8080',
  autonomous: true,
  streaming: true,
  timeout: 180000,
  onEvent: e => console.log('EVENT', e.event, e.data),
  onToken: t => console.log('TOKEN:', String(t.text || '').slice(0, 200))
}).then(r => {
  console.log('SUCCESS:', r.success);
  console.log('ANSWER:', r.answer);
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
  activate-sheikha-anti-repetition-v1.sh \
  sheikha-vscode-extension/src/sheikhaExtensionChatClient.js

git commit -m "Prevent repeated Sheikha extension chat answers"
git push origin feature/extension-experience-apex-v1

pkill code || true
code "$ROOT"

echo "== Done =="
