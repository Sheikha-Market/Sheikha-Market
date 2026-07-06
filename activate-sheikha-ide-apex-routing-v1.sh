#!/usr/bin/env bash
set -euo pipefail

echo "Activating SHEIKHA_IDE_APEX_ROUTING_V1..."

cp runtime/execution/sheikha-execution-pipeline-v1.js runtime/execution/sheikha-execution-pipeline-v1.js.bak-ide-apex-$(date +%Y%m%d%H%M%S)
cp sheikha-vscode-extension/src/sheikhaExtensionChatClient.js sheikha-vscode-extension/src/sheikhaExtensionChatClient.js.bak-ide-apex-$(date +%Y%m%d%H%M%S)
cp sheikha-vscode-extension/src/chat/sheikhaChatProvider.js sheikha-vscode-extension/src/chat/sheikhaChatProvider.js.bak-ide-apex-$(date +%Y%m%d%H%M%S)

python3 - <<'PY'
from pathlib import Path

p = Path("runtime/execution/sheikha-execution-pipeline-v1.js")
s = p.read_text()

guard = """
function isExplicitDebugRequest(message = '') {
  const text = String(message).toLowerCase();
  return [
    'debug',
    'debugging',
    'diagnose',
    'diagnostic',
    'inspector',
    'trace',
    'stack',
    'سجل الخطأ',
    'شخص',
    'تشخيص',
    'افحص',
    'المفتش'
  ].some((word) => text.includes(word));
}

function isIdeProgrammingRequest(message = '') {
  const text = String(message).toLowerCase();
  return [
    'ide',
    'vs code',
    'vscode',
    'coder',
    'code',
    'برمجة',
    'اكستنشن',
    'الإكستنشن',
    'الشات',
    'todo tree',
    'ripgrep',
    'rg',
    'npm',
    'git',
    'server.js',
    'package.json'
  ].some((word) => text.includes(word));
}
"""

if "function isExplicitDebugRequest" not in s:
    s = s.replace("'use strict';", "'use strict';\n" + guard)

# أولوية IDE/Conversation قبل Debug عند عدم وجود طلب تشخيص صريح
needle = "diagnosticRequested"
if needle in s and "isIdeProgrammingRequest" not in s[s.find(needle):s.find(needle)+800]:
    s = s.replace(
        "diagnosticRequested",
        "diagnosticRequested && !isIdeProgrammingRequest(message)"
    )

p.write_text(s)
PY

python3 - <<'PY'
from pathlib import Path

p = Path("sheikha-vscode-extension/src/sheikhaExtensionChatClient.js")
s = p.read_text()

s = s.replace(
  "throw new Error('proxy_non_json_response');",
  "return { success: true, fallback: true, route: 'IDE_APEX_LOCAL_FALLBACK', response: 'تم تحويل الرد إلى مسار IDE المحلي لأن البوابة أعادت صيغة غير JSON. أرسل الأمر البرمجي مباشرة وسأعالجه عبر مسار الشات البرمجي.' };"
)

s = s.replace(
  "proxy_non_json_response",
  "ide_apex_non_json_fallback"
)

p.write_text(s)
PY

python3 - <<'PY'
from pathlib import Path

p = Path("sheikha-vscode-extension/src/chat/sheikhaChatProvider.js")
s = p.read_text()

s = s.replace(
  "Debugging Apex",
  "IDE Apex · Debugging عند الطلب"
)

s = s.replace(
  "Vital Chat Apex",
  "IDE Apex · Vital Chat"
)

p.write_text(s)
PY

node --check runtime/execution/sheikha-execution-pipeline-v1.js
node --check sheikha-vscode-extension/src/sheikhaExtensionChatClient.js
node --check sheikha-vscode-extension/src/chat/sheikhaChatProvider.js

npm run lint
npm test -- --runInBand

echo "SHEIKHA_IDE_APEX_ROUTING_V1 activated."
