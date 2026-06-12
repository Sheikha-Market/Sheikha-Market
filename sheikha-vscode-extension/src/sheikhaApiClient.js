'use strict';

const { detectIntent } = require('./sheikhaIntentRouter');
const { governMode } = require('./sheikhaModeGovernance');

const https = require('https');
const http = require('http');

const BASE_URL = process.env.SHEIKHA_RUNTIME_URL || 'https://api.sheikha.top';
const TIMEOUT_MS = Number(process.env.SHEIKHA_API_TIMEOUT_MS || 180000);

function requestJson(method, path, payload) {
  return new Promise((resolve) => {
    const url = new URL(path, BASE_URL);
    const body = payload ? JSON.stringify(payload) : '';
    const client = url.protocol === 'https:' ? https : http;

    const req = client.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      },
      timeout: TIMEOUT_MS
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ success:false, error:'invalid_json', raw:data }); }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success:false, error:'timeout', message:`Timeout after ${TIMEOUT_MS}ms` });
    });

    req.on('error', err => resolve({ success:false, error:'connection_error', message:err.message }));

    if (body) req.write(body);
    req.end();
  });
}

function isProgrammingRequest(message) {
  const m = String(message || '').toLowerCase();
  return [
    'اكتب دالة','اكتب كود','برمج','debugger','debug','كود',
    'javascript','typescript','python','node','react','api',
    'function','class','coding','programming'
  ].some(x => m.includes(x.toLowerCase()));
}

async function health() {
  return requestJson('GET', '/api/health');
}

async function askSheikha(message, options = {}) {
  const programming = options.task === 'coding' || options.mode === 'coding' || isProgrammingRequest(message);

  const path = programming
    ? '/api/sheikha/programming/ask'
    : '/api/sheikha/ai-gateway/chat';

  const payload = programming
    ? { message, task: options.task || 'coding', language: options.language || 'auto' }
    : { message, mode: options.mode || 'agentic', runtimeTarget: BASE_URL.startsWith('https://') ? 'server-https' : 'local' };

  const result = await requestJson('POST', path, payload);

  if (result?.success && result?.data) {
    result.data.runtimeUrl = BASE_URL;
    result.data.runtimeTarget = BASE_URL.startsWith('https://') ? 'server-https' : 'local';
    result.data.route = path;
    if (programming && result.data.answer && !result.data.reply) result.data.reply = result.data.answer;
  }

  return result;
}

async function runCli(command) {
  return requestJson('POST', '/api/sheikha/cli/run', { command });
}

async function searchRag(query) {
  return requestJson('POST', '/api/sheikha/rag/search', { query });
}

async function getMcpTools() {
  return requestJson('GET', '/api/sheikha/mcp/tools');
}

async function getSdkRegistry() {
  return requestJson('GET', '/api/sheikha/sdk/registry');
}

async function renderGraphics(kind = 'route-map') {
  return requestJson('POST', '/api/sheikha/graphics/render', { kind });
}

async function runTool(mode, message) {
  const m = String(mode || '').toLowerCase();
  const text = String(message || '').trim();

  if (m === 'cli') {
    const command = text.includes('pwd') || text.includes('مسار') ? 'pwd'
      : text.includes('git') ? 'git_status'
      : text.includes('pm2') ? 'pm2_status'
      : text.includes('health') || text.includes('صحة') ? 'health'
      : 'pwd';
    return runCli(command);
  }

  if (m === 'rag') return searchRag(text || 'sheikha-runtime-chat');
  if (m === 'mcp') return getMcpTools();
  if (m === 'sdk') return getSdkRegistry();
  if (m === 'graphics') return renderGraphics('route-map');

  return askSheikha(message, { mode });
}

module.exports = {
  askSheikha,
  health,
  BASE_URL,
  isProgrammingRequest,
  runCli,
  searchRag,
  getMcpTools,
  getSdkRegistry,
  renderGraphics,
  runTool
};

async function scanEnvironment() {
  return requestJson('GET', '/api/sheikha/environment/scan');
}

module.exports.scanEnvironment = scanEnvironment;

function readLocalVsCodeEnvironment() {
  const fs = require('fs');
  const path = require('path');
  const p = path.resolve(__dirname, '../reports/vscode-environment-report.json');
  if (!fs.existsSync(p)) return { success:false, error:'vscode_environment_report_missing' };
  return { success:true, data: JSON.parse(fs.readFileSync(p, 'utf8')) };
}

module.exports.readLocalVsCodeEnvironment = readLocalVsCodeEnvironment;

async function classifyIntent(message, mode = '') {
  return requestJson('POST', '/api/sheikha/router/classify', { message, mode });
}

function readVsCodeAwareness() {
  const fs = require('fs');
  const path = require('path');
  const p = path.resolve(__dirname, '../reports/vscode-awareness-report.json');
  if (!fs.existsSync(p)) return { success:false, error:'vscode_awareness_report_missing' };
  return { success:true, data: JSON.parse(fs.readFileSync(p, 'utf8')) };
}


async function sheikhaSmartRoute(message, options = {}) {
  const mode = typeof options === 'object' && options !== null ? (options.mode || options.task || '') : String(options || '');
  const raw = String(message || '').trim();
  const governance = governMode(raw, mode);
  const intent = governance.intent;

  
  if (intent === 'GLOBAL_REGISTRY') {
    return requestJson('GET', '/api/sheikha/global-registry/status');
  }

  if (intent === 'DEBUG') {
    return {
      success: true,
      data: {
        provider: 'Sheikha Debugger Fabric',
        model: 'VS Code Debug API',
        localModelOnline: true,
        message: 'تم تحويل طلب debugger إلى مسار Debugger Fabric بدل النموذج.',
        reply: JSON.stringify({
          message: 'تم تحليل طلب debugger من VS Code API وليس من النموذج.',
          nextAction: 'افتح launch.json أو شغّل Start Debugging من VS Code.'
        }, null, 2)
      }
    };
  }


  if (intent === 'DEBUG') {
    return {
      success: true,
      data: {
        provider: 'Sheikha Debugger Fabric',
        model: 'VS Code Debug API',
        localModelOnline: true,
        reply: JSON.stringify({
          message: 'تم تحويل debugger إلى مسار Debugger Fabric، وليس إلى النموذج.',
          nextAction: 'افتح launch.json أو Start Debugging من VS Code.'
        }, null, 2)
      }
    };
  }

  if (intent === 'GLOBAL_REGISTRY') {
    return requestJson('GET', '/api/sheikha/global-registry/status');
  }

  if (intent === 'TODO') {
    return requestJson('POST', '/api/sheikha/todo/add', { text: raw });
  }

  if (intent === 'TAG') {
    return requestJson('POST', '/api/sheikha/tags/add', { tag: raw.replace(/^tag[:：]?/i,'').trim() || 'general' });
  }


  if (intent === 'CODE') {
    return {
      success: true,
      data: {
        provider: 'Sheikha Programming Consultant',
        model: 'Sheikha-Coding-Fabric',
        localModelOnline: true,
        reply:
`تم تفعيل مسار البرمجة.

سأتعامل مع الطلب كمستشار برمجي:
1. أحدد الهدف.
2. أراجع المسار أو الملف.
3. أعطي كود نظيف قابل للتنفيذ.
4. أضيف أوامر تحقق.
5. لا أعتذر عن البرمجة إلا إذا كان الطلب يحتاج صلاحية خارجية.

اكتب الآن الطلب البرمجي أو أرسل اسم الملف/المسار.`
      }
    };
  }

if (intent === 'CLI') {
    return runTool('cli', raw.replace(/^(cli|terminal):/i, '').trim() || 'pwd');
  }

  if (intent === 'GIT') {
    return runTool('cli', raw.includes('status') ? 'git status --short' : 'git branch --show-current');
  }

  if (intent === 'RAG') {
    return runTool('rag', raw.replace(/^rag:/i, '').trim());
  }

  if (intent === 'SOFTWARE_REGISTRY') {
    return requestJson('POST', '/api/sheikha/software-registry/search', {
      query: raw.replace(/^registry:/i, '').replace(/^ريجستري:/i, '').trim() || 'chat'
    });
  }

  if (intent === 'MCP') return runTool('mcp', raw);
  if (intent === 'SDK') return runTool('sdk', raw);
  if (intent === 'GRAPHICS') return runTool('graphics', raw);

  if (intent === 'ENVIRONMENT') {
    const env = await scanEnvironment();
    const aware = readVsCodeAwareness();
    return {
      success: true,
      data: {
        provider: 'Sheikha VS Code Awareness + Environment',
        governance,
        intent,
        environment: env.data || env,
        vscodeAwareness: aware.data || aware,
        reply: JSON.stringify({
          intent,
          environment: env.data || env,
          vscodeAwareness: aware.data || aware
        }, null, 2)
      }
    };
  }

  if (intent === 'CODE' || intent === 'DEBUG') {
    return askSheikha(raw, { task: 'coding', mode: 'coding' });
  }

  return askSheikha(raw, { mode: mode || 'agentic' });
}

module.exports.classifyIntent = classifyIntent;
module.exports.readVsCodeAwareness = readVsCodeAwareness;
module.exports.sheikhaSmartRoute = sheikhaSmartRoute;

async function classifyIntent(message, mode = '') {
  return requestJson('POST', '/api/sheikha/router/classify', { message, mode });
}

function readVsCodeAwareness() {
  const fs = require('fs');
  const path = require('path');
  const p = path.resolve(__dirname, '../reports/vscode-awareness-report.json');
  if (!fs.existsSync(p)) return { success:false, error:'vscode_awareness_report_missing' };
  return { success:true, data: JSON.parse(fs.readFileSync(p, 'utf8')) };
}

async function sheikhaSmartRoute(message, mode = '') {
  if (typeof mode === 'object' && mode !== null) {
    mode = mode.mode || mode.task || '';
  }

  const raw = String(message || '').trim();
  const lower = raw.toLowerCase();

  if (/^(pwd|ls|whoami|date|uptime|df|free|pm2|git status|git branch)$/.test(lower)) {
    return runTool('cli', raw);
  }

  if (/^(cli|terminal):/i.test(raw)) {
    return runTool('cli', raw.replace(/^(cli|terminal):/i, '').trim() || 'pwd');
  }

  if (/^rag:/i.test(raw)) {
    return runTool('rag', raw.replace(/^rag:/i, '').trim());
  }

  if (/^registry:/i.test(raw) || /^ريجستري:/i.test(raw)) {
    return requestJson('POST', '/api/sheikha/software-registry/search', {
      query: raw.replace(/^registry:/i, '').replace(/^ريجستري:/i, '').trim() || 'chat'
    });
  }

  const c = await classifyIntent(message, mode);
  const intent = c?.data?.intent || 'CHAT';

  if (intent === 'CLI') return runTool('cli', message);
  if (intent === 'GIT') return runTool('cli', 'git');
  if (intent === 'RAG') return runTool('rag', message.replace(/^rag:/i, '').trim());
  if (intent === 'MCP') return runTool('mcp', message);
  if (intent === 'SDK') return runTool('sdk', message);
  if (intent === 'GRAPHICS') return runTool('graphics', message);
  if (intent === 'ENVIRONMENT') return scanEnvironment();
  if (intent === 'SOFTWARE_REGISTRY') {
    return requestJson('POST', '/api/sheikha/software-registry/search', { query: message.replace(/registry:|ريجستري/gi, '').trim() || 'chat' });
  }

  return askSheikha(message, { mode: intent === 'CODE' || intent === 'DEBUG' ? 'coding' : 'agentic' });
}

module.exports.classifyIntent = classifyIntent;
module.exports.readVsCodeAwareness = readVsCodeAwareness;
module.exports.sheikhaSmartRoute = sheikhaSmartRoute;

module.exports.governMode = governMode;


// Sheikha Extension Chat endpoint policy
module.exports.EXTENSION_CHAT_ENDPOINT = '/api/sheikha/unified-chat';
module.exports.EXTENSION_CHAT_STATUS_ENDPOINT = '/api/sheikha/unified-chat/status';
