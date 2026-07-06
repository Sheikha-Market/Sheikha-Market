#!/usr/bin/env bash
set -euo pipefail

echo "Activating SHEIKHA_EXTENSION_ACTION_FIRST_BINDING_V1..."

cp sheikha-vscode-extension/src/sheikhaExtensionChatClient.js \
  sheikha-vscode-extension/src/sheikhaExtensionChatClient.js.bak-action-first-binding-$(date +%Y%m%d%H%M%S)

cp sheikha-vscode-extension/src/sheikhaReplyNormalizer.js \
  sheikha-vscode-extension/src/sheikhaReplyNormalizer.js.bak-action-first-binding-$(date +%Y%m%d%H%M%S)

python3 - <<'PY'
from pathlib import Path

p = Path("sheikha-vscode-extension/src/sheikhaExtensionChatClient.js")
s = p.read_text()

helper = r"""
async function fetchActionFirstPolicy(baseUrl, message) {
  try {
    const response = await fetch(`${baseUrl}/api/sheikha/action-first-chat-apex/v1/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });

    if (!response.ok) return null;
    const json = await response.json();
    return json && (json.data || json);
  } catch (_error) {
    return null;
  }
}

async function fetchLivingConversation(baseUrl, message, context = {}) {
  try {
    const response = await fetch(`${baseUrl}/api/sheikha/living-conversation-apex/v1/compose`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, context })
    });

    if (!response.ok) return null;
    const json = await response.json();
    return json && (json.data || json);
  } catch (_error) {
    return null;
  }
}
"""

if "fetchActionFirstPolicy" not in s:
    insert_at = s.find("class")
    if insert_at == -1:
        insert_at = 0
    s = s[:insert_at] + helper + "\n" + s[insert_at:]

# لا نكسر العقود القديمة: نضيف policy داخل payload إن وجد sendChatMessage أو sendMessage
s = s.replace(
    "const payload = {",
    "const actionFirstPolicy = await fetchActionFirstPolicy(this.baseUrl || baseUrl || DEFAULT_BASE_URL, message);\n    const livingConversation = await fetchLivingConversation(this.baseUrl || baseUrl || DEFAULT_BASE_URL, message, context || {});\n\n    const payload = {",
    1
) if "const actionFirstPolicy = await fetchActionFirstPolicy" not in s else s

s = s.replace(
    "message,",
    "message,\n      actionFirstPolicy,\n      livingConversation,",
    1
) if "actionFirstPolicy," not in s else s

p.write_text(s)
PY

python3 - <<'PY'
from pathlib import Path

p = Path("sheikha-vscode-extension/src/sheikhaReplyNormalizer.js")
s = p.read_text()

append = r"""

function normalizeActionFirstReply(reply = '', options = {}) {
  const text = String(reply || '').trim();
  const policy = options.actionFirstPolicy || {};
  const living = options.livingConversation || {};

  const genericPatterns = [
    /^بسم الله الرحمن الرحيم\s*/u,
    /^أنا شيخة[.\s\n]*/u,
    /ما الذي تحتاج إليه من مساعدة أو عون[؟?]*/u
  ];

  let cleaned = text;
  for (const pattern of genericPatterns) {
    cleaned = cleaned.replace(pattern, '').trim();
  }

  if (!cleaned && living.reply) cleaned = living.reply;
  if (policy.opening && cleaned && !cleaned.includes(policy.opening)) {
    cleaned = `${policy.opening}\n\n${cleaned}`;
  }

  return cleaned || living.reply || policy.opening || 'تم فهم الطلب. سأبدأ بالعمل مباشرة.';
}

module.exports.normalizeActionFirstReply = normalizeActionFirstReply;
"""

if "normalizeActionFirstReply" not in s:
    s += append

p.write_text(s)
PY

node --check sheikha-vscode-extension/src/sheikhaExtensionChatClient.js
node --check sheikha-vscode-extension/src/sheikhaReplyNormalizer.js

npm run lint
npm test -- --runInBand sheikha-vscode-extension/tests/sheikhaExtensionChatTransport.test.js

echo "SHEIKHA_EXTENSION_ACTION_FIRST_BINDING_V1 activated."
