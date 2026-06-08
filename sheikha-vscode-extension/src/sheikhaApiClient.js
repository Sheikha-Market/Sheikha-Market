'use strict';

const http = require('http');

const BASE_URL = process.env.SHEIKHA_RUNTIME_URL || 'http://127.0.0.1:8080';
const TIMEOUT_MS = Number(process.env.SHEIKHA_API_TIMEOUT_MS || 30000);

function postJson(path, payload) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const body = JSON.stringify(payload || {});

    const req = http.request({
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname,
      method: 'POST',
      headers: {'Content-Type':'application/json','Content-Length':Buffer.byteLength(body)},
      timeout: TIMEOUT_MS
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ success:false, message:data || `HTTP ${res.statusCode}` }); }
      });
    });

    req.on('timeout', () => req.destroy(new Error('Sheikha API timeout')));
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function looksLikeShell(text) {
  return /(^|\n)\s*(cd |git |npm |node |curl |pm2 |python3? |npx |code |sudo |chmod |cat >|rm -f|mkdir )/.test(text);
}

function shellReply(prompt) {
  return {
    success:true,
    data:{
      reply:
`أفهم أن هذا أمر طرفية/تشغيل، وليس سؤال دردشة.

نفّذه في الطرفية:

\`\`\`bash
${prompt.trim()}
\`\`\`

ولحفظ تغييرات إضافة شيخة غالبًا استخدم:

\`\`\`bash
cd ~/Projects/sheikha/sheikha-main-portal
git status --short
git add sheikha-vscode-extension
git commit -m "Improve Sheikha advanced chat routing"
git push origin optimization/long-tail-latency-elimination
\`\`\``,
      provider:'sheikha-extension-cli-router',
      model:'Sheikha-Core',
      mode:'cli',
      localModelOnline:true
    }
  };
}

async function askSheikha(prompt, context = {}) {
  const mode = context.mode || 'agentic';

  if (mode === 'cli' || looksLikeShell(prompt)) {
    return shellReply(prompt);
  }

  const payload = { message: prompt, prompt, mode, context };

  const endpoints = [
    '/api/sheikha/ai-gateway/chat',
    '/api/sheikha/chat',
    '/api/ai/chat'
  ];

  let lastError = null;

  for (const ep of endpoints) {
    try {
      const result = await postJson(ep, payload);
      const text = result?.data?.reply || result?.reply || result?.message || result?.data?.message;

      if (result && result.success !== false && text && text !== 'Governance passed') {
        return result;
      }

      lastError = result;
    } catch (e) {
      lastError = e;
    }
  }

  return {
    success:true,
    data:{
      reply:
`تم استلام طلبك داخل شيخة.

لم أجد مسار دردشة مولّد مكتمل في Runtime الحالي، لذلك أرجع لك ردًا تشغيليًا آمنًا.

الطلب:
${prompt}

الحالة المطلوبة الآن:
1) تثبيت endpoint دردشة فعلي في Runtime.
2) ربط /api/sheikha/ai-gateway/chat بنموذج Sheikha-Core.
3) منع تحويل أسئلة الشات إلى protocol/decision حتى لا يظهر "Governance passed" كرد نهائي.`,
      provider:'sheikha-extension-safe-fallback',
      model:'Sheikha-Core',
      mode,
      localModelOnline:false,
      lastError
    }
  };
}

module.exports = { askSheikha };
