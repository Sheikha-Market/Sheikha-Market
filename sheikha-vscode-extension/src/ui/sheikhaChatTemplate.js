'use strict';

const QUICK_ACTIONS = Object.freeze([
  {
    label: 'حالة المنظومة',
    prompt: 'حلل حالة منظومة شيخة الحالية من Enterprise Inspector وحدد أفضل إجراء تالٍ.'
  },
  {
    label: 'مراجعة المشروع',
    prompt: 'حلل Workspace وGit الحاليين وحدد مخاطر الاختبار والدمج.'
  },
  {
    label: 'التشخيص',
    prompt: 'راجع أخطاء وتحذيرات VS Code الحالية واقترح خطة إصلاح مرتبة.'
  },
  {
    label: 'التوزيع V2',
    prompt: 'افحص حالة Universal Delivery V2 والحزم والأدلة المحلية دون نشر خارجي.'
  }
]);

const CHAT_MODES = Object.freeze([
  ['smart', 'ذكي'],
  ['streaming', 'بث مباشر'],
  ['generative', 'توليد'],
  ['rag', 'استرجاع موثق'],
  ['agentic', 'وكيل محكوم'],
  ['multi-agent', 'وكلاء متعددون'],
  ['mcp', 'أدوات MCP'],
  ['sdk', 'تكامل SDK'],
  ['cli', 'CLI'],
  ['graphics', 'واجهات ورسوم'],
  ['agi-research', 'بحث AGI'],
  ['asi-research', 'بحث ASI']
]);

const APEX_LAYERS = Object.freeze([
  ['L24', 'Computing Cognitive Apex'],
  ['L23', 'Extension Streaming Artifact Apex'],
  ['L21', 'Streaming Multilingual Chat Apex'],
  ['L20', 'Technical Capability Apex'],
  ['L19', 'IDE Apex'],
  ['L18', 'Debugging Apex'],
  ['L17', 'Chat Interface Apex'],
  ['L16', 'Vital Chat Apex']
]);

function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderSheikhaChatTemplate(options = {}) {
  const nonce = esc(options.nonce || '');
  const version = esc(options.version || 'unknown');
  const modeOptions = CHAT_MODES.map(([value, label]) => (
    `<option value="${esc(value)}">${esc(label)}</option>`
  )).join('');
  const quickActions = QUICK_ACTIONS.map((action) => (
    `<button class="quick-action" data-prompt="${esc(action.prompt)}" title="${esc(action.label)}">${esc(action.label)}</button>`
  )).join('');
  const apexRows = APEX_LAYERS.map(([level, name]) => (
    `<li data-layer="${esc(level)}"><span><b>${esc(level)}</b> ${esc(name)}</span><em>جارٍ الفحص</em></li>`
  )).join('');

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
:root{
  color-scheme:light dark;
  --bg:var(--vscode-sideBar-background,#0d1117);
  --surface:var(--vscode-editor-background,#10161e);
  --surface-raised:var(--vscode-input-background,#151d27);
  --line:var(--vscode-panel-border,#303b48);
  --text:var(--vscode-foreground,#eef2f6);
  --muted:var(--vscode-descriptionForeground,#98a4b2);
  --focus:var(--vscode-focusBorder,#5b9bd5);
  --accent:var(--vscode-button-background,#2f6f4e);
  --accent-text:var(--vscode-button-foreground,#fff);
  --good:#68c083;
  --warn:#d5ad45;
  --bad:#e36d72;
}
*{box-sizing:border-box}
html,body{height:100%}
body{margin:0;background:var(--bg);color:var(--text);font:13px/1.55 system-ui,sans-serif;letter-spacing:0}
button,select,textarea{font:inherit;letter-spacing:0}
button:focus-visible,select:focus-visible,textarea:focus-visible,summary:focus-visible{outline:1px solid var(--focus);outline-offset:1px}
.app{min-height:100%;display:grid;grid-template-rows:auto auto minmax(280px,1fr) auto}
.topbar{padding:12px 12px 9px;border-bottom:1px solid var(--line);background:var(--surface)}
.identity{display:grid;grid-template-columns:34px minmax(0,1fr) auto;align-items:center;gap:9px}
.mark{width:34px;height:34px;display:grid;place-items:center;border:1px solid #39744e;border-radius:7px;background:#12251a;color:var(--good);font-weight:800}
.title{min-width:0}.title h1{margin:0;font-size:15px;line-height:1.35}.title p{margin:2px 0 0;color:var(--muted);font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;direction:ltr;text-align:right}
.health{display:inline-flex;align-items:center;gap:6px;color:var(--good);font-size:10px;white-space:nowrap}.health::before{content:'';width:7px;height:7px;border-radius:50%;background:currentColor}
.health[data-state="busy"]{color:var(--warn)}.health[data-state="error"]{color:var(--bad)}
.toolbar{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px;margin-top:10px}
.mode-field{display:grid;grid-template-columns:auto minmax(0,1fr);align-items:center;gap:7px;color:var(--muted);font-size:11px}
select{min-width:0;width:100%;height:30px;border:1px solid var(--line);border-radius:6px;background:var(--surface-raised);color:var(--text);padding:0 8px}
.governance{border-top:1px solid var(--line);margin-top:9px;padding-top:7px}
.governance summary{cursor:pointer;color:var(--muted);font-size:11px;list-style:none;display:flex;justify-content:space-between;gap:8px}.governance summary::-webkit-details-marker{display:none}.governance summary::after{content:'⌄';color:var(--good)}.governance[open] summary::after{content:'⌃'}
.layer-list{list-style:none;margin:8px 0 0;padding:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:4px 12px;direction:ltr}
.layer-list li{display:flex;justify-content:space-between;gap:8px;min-width:0;padding:4px 0;border-bottom:1px solid color-mix(in srgb,var(--line) 55%,transparent);font-size:10px;color:var(--muted)}
.layer-list span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.layer-list b{color:var(--text)}.layer-list em{color:var(--warn);font-style:normal;white-space:nowrap}.layer-list li[data-state="active"] em{color:var(--good)}.layer-list li[data-state="error"] em{color:var(--bad)}
.quickbar{display:flex;gap:6px;padding:8px 12px;border-bottom:1px solid var(--line);overflow-x:auto;scrollbar-width:thin}
button{height:30px;border:1px solid var(--line);border-radius:6px;background:var(--surface-raised);color:var(--text);padding:0 9px;cursor:pointer;white-space:nowrap}
button:hover{border-color:var(--focus)}button:disabled{opacity:.55;cursor:wait}
.quick-action{font-size:11px;color:var(--muted)}
.conversation{display:flex;flex-direction:column;gap:10px;padding:12px;overflow-y:auto;min-height:0;scrollbar-width:thin}
.message{max-width:94%;min-width:0;align-self:flex-start;border-inline-start:3px solid var(--line);padding:8px 10px;background:color-mix(in srgb,var(--surface) 82%,transparent);border-radius:0 6px 6px 0;white-space:pre-wrap;overflow-wrap:anywhere;unicode-bidi:plaintext}
.message.user{align-self:flex-end;border-inline-start:0;border-inline-end:3px solid var(--focus);background:color-mix(in srgb,var(--focus) 12%,var(--surface));border-radius:6px 0 0 6px}
.message.streaming{border-color:var(--good)}.message.error{border-color:var(--bad)}
.role{display:block;color:var(--muted);font-size:9px;margin-bottom:3px}.message.user .role{text-align:left}
.typing{display:flex;align-items:center;gap:7px;color:var(--muted);font-size:11px}.typing::before{content:'';width:8px;height:8px;border-radius:50%;background:var(--warn);animation:pulse 1s ease-in-out infinite}
@keyframes pulse{50%{opacity:.35}}
.trace{max-width:94%;align-self:flex-start;color:var(--muted);font-size:10px}.trace summary{cursor:pointer}.trace div{margin-top:5px;padding-inline-start:9px;border-inline-start:1px solid var(--line);unicode-bidi:plaintext}
.composer{position:sticky;bottom:0;padding:9px 12px 11px;border-top:1px solid var(--line);background:var(--surface)}
.compose-row{display:grid;grid-template-columns:minmax(0,1fr) 34px;gap:7px;align-items:end}
textarea{width:100%;max-height:180px;min-height:44px;resize:none;border:1px solid var(--line);border-radius:7px;background:var(--vscode-input-background,var(--surface-raised));color:var(--vscode-input-foreground,var(--text));padding:10px;line-height:1.5;overflow-y:auto}
#send{width:34px;height:34px;padding:0;display:grid;place-items:center;background:var(--accent);border-color:transparent;color:var(--accent-text);font-size:18px}
.composer-meta{display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:6px;color:var(--muted);font-size:9px}
#clear{height:auto;border:0;background:transparent;padding:2px 0;color:var(--muted);font-size:10px}
@media(max-width:420px){.app{grid-template-rows:auto auto minmax(240px,1fr) auto}.layer-list{grid-template-columns:1fr}.title p{max-width:210px}.message{max-width:100%}}
</style>
</head>
<body>
<main class="app">
  <header class="topbar">
    <div class="identity">
      <div class="mark" aria-hidden="true">ش</div>
      <div class="title"><h1>شات شيخة</h1><p>Local governed runtime · Extension ${version}</p></div>
      <div class="health" id="health" data-state="ready">متصل</div>
    </div>
    <div class="toolbar">
      <label class="mode-field"><span>الوضع</span><select id="mode" title="وضع الاستدلال">${modeOptions}</select></label>
      <button id="clear" title="مسح سجل المحادثة">مسح</button>
    </div>
    <details class="governance" id="governance">
      <summary><span id="governanceSummary">الحوكمة والمسار التشغيلي</span><span>8 طبقات</span></summary>
      <ul class="layer-list" id="layerList">${apexRows}</ul>
    </details>
  </header>
  <nav class="quickbar" aria-label="إجراءات سريعة">${quickActions}</nav>
  <section class="conversation" id="log" aria-live="polite">
    <div class="message assistant"><span class="role">شيخة</span>بسم الله الرحمن الرحيم\n\nما الذي تحتاج إليه من مساعدة أو عون؟</div>
  </section>
  <footer class="composer">
    <div class="compose-row">
      <textarea id="input" rows="1" dir="auto" aria-label="رسالتك" placeholder="اكتب رسالتك..."></textarea>
      <button id="send" title="إرسال" aria-label="إرسال">↑</button>
    </div>
    <div class="composer-meta"><span id="activity">جاهز</span><span>Enter للإرسال · Shift+Enter لسطر جديد</span></div>
  </footer>
</main>
<script nonce="${nonce}">
const vscode = acquireVsCodeApi();
const previousState = vscode.getState() || {};
const log = document.getElementById('log');
const input = document.getElementById('input');
const send = document.getElementById('send');
const clear = document.getElementById('clear');
const modeSelect = document.getElementById('mode');
const health = document.getElementById('health');
const activity = document.getElementById('activity');
let busy = false;
let typingMessage = null;
let streamingMessage = null;

modeSelect.value = previousState.mode || 'smart';
input.value = previousState.draft || '';

function saveState() {
  vscode.setState({ mode: modeSelect.value, draft: input.value });
}

function resizeInput() {
  input.style.height = 'auto';
  input.style.height = Math.min(input.scrollHeight, 180) + 'px';
}

function setBusy(value, label) {
  busy = Boolean(value);
  send.disabled = busy;
  clear.disabled = busy;
  health.dataset.state = busy ? 'busy' : 'ready';
  health.textContent = busy ? 'يعمل' : 'متصل';
  activity.textContent = label || (busy ? 'جارٍ المعالجة' : 'جاهز');
}

function addMessage(text, role, className) {
  const article = document.createElement('article');
  article.className = 'message ' + (className || role || 'assistant');
  const roleLabel = document.createElement('span');
  roleLabel.className = 'role';
  roleLabel.textContent = role === 'user' ? 'أنت' : 'شيخة';
  article.appendChild(roleLabel);
  article.appendChild(document.createTextNode(String(text || '')));
  log.appendChild(article);
  article.scrollIntoView({ behavior: 'smooth', block: 'end' });
  return article;
}

function messageTextNode(message) {
  return message && message.lastChild && message.lastChild.nodeType === Node.TEXT_NODE
    ? message.lastChild
    : null;
}

function addTrace(layers) {
  if (!Array.isArray(layers) || !layers.length) return;
  const details = document.createElement('details');
  details.className = 'trace';
  const summary = document.createElement('summary');
  summary.textContent = 'دليل مسار الرد · ' + layers.length + ' طبقات';
  const content = document.createElement('div');
  content.textContent = layers.map(function (layer) {
    return 'L' + layer.layer + ' ' + layer.name + ': ' + layer.status;
  }).join(' · ');
  details.append(summary, content);
  log.appendChild(details);
}

function clearTransient() {
  if (typingMessage) typingMessage.remove();
  typingMessage = null;
}

function ensureStreamingMessage() {
  if (!streamingMessage) streamingMessage = addMessage('', 'assistant', 'assistant streaming');
  return streamingMessage;
}

function ask() {
  if (busy) return;
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, 'user', 'user');
  input.value = '';
  resizeInput();
  saveState();
  setBusy(true, 'إرسال الطلب');
  vscode.postMessage({ command: 'ask', text: text, mode: modeSelect.value });
}

function resetConversation() {
  if (busy) return;
  log.replaceChildren();
  addMessage('بسم الله الرحمن الرحيم\n\nما الذي تحتاج إليه من مساعدة أو عون؟', 'assistant', 'assistant');
  input.focus();
}

function setLayer(level, state) {
  const row = document.querySelector('[data-layer="' + level + '"]');
  if (!row) return;
  row.dataset.state = state === 'error' ? 'error' : 'active';
  const value = row.querySelector('em');
  if (value) value.textContent = state === 'error' ? 'تعذر' : 'نشط';
}

function readStatus(payload) {
  const root = payload && typeof payload === 'object' ? payload : {};
  const data = root.data && typeof root.data === 'object' ? root.data : root;
  return String(data.decision || data.status || (root.success === true ? 'ACTIVE' : 'UNKNOWN'));
}

function handleApexStatus(command, payload) {
  const levels = {
    experienceStatus: ['L23'], vitalStatus: ['L16'], debuggingStatus: ['L18'],
    interfaceStatus: ['L17'], ideApexStatus: ['L19'], technicalCapabilityStatus: ['L20'],
    streamingApexStatus: ['L21'], extensionArtifactApexStatus: ['L23'],
    computingCognitiveApexStatus: ['L24']
  };
  const active = readStatus(payload).toUpperCase().includes('ACTIVE');
  (levels[command] || []).forEach(function (level) { setLayer(level, active ? 'active' : 'error'); });
  if (!active && payload && payload.success === false) {
    health.dataset.state = 'error';
    health.textContent = 'محدود';
  }
}

modeSelect.addEventListener('change', saveState);
input.addEventListener('input', function () { resizeInput(); saveState(); });
send.addEventListener('click', ask);
clear.addEventListener('click', resetConversation);
document.querySelectorAll('[data-prompt]').forEach(function (button) {
  button.addEventListener('click', function () {
    if (busy) return;
    input.value = button.dataset.prompt || '';
    resizeInput();
    saveState();
    input.focus();
  });
});
input.addEventListener('keydown', function (event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    ask();
  }
});

window.addEventListener('message', function (event) {
  const msg = event.data || {};
  if (msg.command === 'typing') {
    clearTransient();
    typingMessage = document.createElement('div');
    typingMessage.className = 'typing';
    typingMessage.textContent = msg.text || 'شيخة تقرأ السياق...';
    log.appendChild(typingMessage);
    typingMessage.scrollIntoView({ behavior: 'smooth', block: 'end' });
    setBusy(true, 'قراءة السياق');
  } else if (msg.command === 'streamStart') {
    clearTransient();
    streamingMessage = addMessage('', 'assistant', 'assistant streaming');
    setBusy(true, 'بث الاستجابة');
  } else if (msg.command === 'streamToken') {
    clearTransient();
    const message = ensureStreamingMessage();
    const node = messageTextNode(message);
    if (node) node.nodeValue += msg.text || '';
    message.scrollIntoView({ behavior: 'smooth', block: 'end' });
  } else if (msg.command === 'streamDone') {
    clearTransient();
    const finalText = String(msg.text || '');
    if (!streamingMessage) streamingMessage = addMessage(finalText, 'assistant', 'assistant');
    const node = messageTextNode(streamingMessage);
    if (node && finalText && node.nodeValue.trim() !== finalText.trim()) node.nodeValue = finalText;
    streamingMessage.classList.remove('streaming');
    streamingMessage = null;
    addTrace(msg.meta && msg.meta.layers);
    setBusy(false, 'اكتمل الرد');
  } else if (msg.command === 'reply') {
    if (msg.meta && msg.meta.busy) {
      activity.textContent = 'طلب سابق قيد التنفيذ';
      return;
    }
    clearTransient();
    if (streamingMessage && !String(messageTextNode(streamingMessage)?.nodeValue || '').trim()) streamingMessage.remove();
    streamingMessage = null;
    addMessage(msg.text || '', 'assistant', msg.meta && msg.meta.error ? 'assistant error' : 'assistant');
    addTrace(msg.meta && msg.meta.layers);
    setBusy(false, msg.meta && msg.meta.error ? 'تعذر المسار' : 'اكتمل الرد');
  } else if (msg.command === 'prefill') {
    if (busy) return;
    input.value = msg.text || '';
    resizeInput();
    saveState();
    input.focus();
    if (msg.autoSend) ask();
  }

  const payloadByCommand = {
    experienceStatus: msg.experience, vitalStatus: msg.vital,
    debuggingStatus: msg.debugging, interfaceStatus: msg.interfaceApex,
    ideApexStatus: msg.ideApex, technicalCapabilityStatus: msg.technicalCapability,
    streamingApexStatus: msg.streamingApex, extensionArtifactApexStatus: msg.extensionArtifactApex,
    computingCognitiveApexStatus: msg.computingCognitiveApex
  };
  if (Object.prototype.hasOwnProperty.call(payloadByCommand, msg.command)) {
    handleApexStatus(msg.command, payloadByCommand[msg.command]);
  }
});

resizeInput();
input.focus();
</script>
</body>
</html>`;
}

module.exports = {
  APEX_LAYERS,
  CHAT_MODES,
  QUICK_ACTIONS,
  renderSheikhaChatTemplate
};
