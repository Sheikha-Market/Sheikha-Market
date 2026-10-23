'use strict';

const http = require('node:http');
const ORIGIN = 'http://127.0.0.1:8142';
const MAX = 1024 * 1024;
const READ_PATHS = new Set(['/health', '/api/status', '/api/chat/tools', '/api/session', '/api/data/metrics', '/api/news/inbox']);
const TOOLS = Object.freeze([
  ['STATUS', 'حالة الخدمة', {}], ['NEWS_INBOX', 'صندوق المستجدات', {}],
  ['DATA_CATALOG', 'فهرس البيانات', {}], ['DATA_METRICS', 'مقاييس البيانات', {}],
  ['DATA_SEARCH', 'البحث المحلي', { query: '' }],
  ['DOMAIN_PLAN', 'مسودة خطة مجال', { id: 'CHAT-PLAN-1', domainId: 'DATA_INFORMATION', objective: '', method: 'ENGINEERING' }],
  ['EFFECT', 'حساب الأثر', { baseline: 20, observed: 15, better: 'LOWER', unit: 'دقيقة' }],
  ['INDUSTRIAL_BALANCE', 'اتزان الكميات', { unit: 'kg', inputs: 100, acceptedOutputs: 85, byproducts: 10, waste: 3, inventoryChange: 2, tolerance: 0.01 }],
  ['PROOF_REVIEW', 'مسودة ملف البرهان', { claim: '', kind: 'ENGINEERING', evidenceRefs: [], limitations: [] }],
  ['DATA_PREVIEW', 'معاينة بيانات دون حفظ', { records: [] }], ['NEWS_PREVIEW', 'معاينة خبر دون حفظ', { records: [] }],
  ['ARCHITECTURE', 'معمارية الأدوات', {}], ['FILES', 'مساحات الملفات', {}],
  ['FILES_INDEX', 'فهرس ملفات الحزمة', {}], ['GITHUB_SNAPSHOT', 'لقطة GitHub المحفوظة', {}], ['MEMORY_READ', 'فهرس المعرفة', {}]
].map(([id, label, example]) => Object.freeze({ id, label, example: Object.freeze(example) })));
const allowed = id => TOOLS.some(tool => tool.id === id);

function requestLocal(route, { method = 'GET', body, token } = {}) {
  if (!(method === 'GET' && READ_PATHS.has(route)) && !(method === 'POST' && route === '/api/chat/tool')) {
    return Promise.reject(new Error('LOCAL_ROUTE_DENIED'));
  }
  let payload;
  if (method === 'POST') {
    if (!allowed(body?.toolId) || Object.keys(body).some(key => !['toolId','input'].includes(key)) ||
        !/^[a-f0-9]{64}$/.test(token || '')) return Promise.reject(new Error('LOCAL_TOOL_REQUEST_DENIED'));
    try { payload = JSON.stringify(body); } catch { return Promise.reject(new Error('JSON_REQUIRED')); }
    if (Buffer.byteLength(payload) > 256 * 1024) return Promise.reject(new Error('INPUT_LIMIT'));
  }
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (error, value) => {
      if (settled) return;
      settled = true; clearTimeout(timer);
      if (error) { req.destroy(); reject(new Error(error)); } else resolve(value);
    };
    const req = http.request({ hostname: '127.0.0.1', port: 8142, path: route, method, agent: false,
      headers: { Accept: 'application/json', ...(payload ? { 'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload), Origin: ORIGIN, 'X-Sheikha-Session': token } : {}) }
    }, response => {
      // No redirects, proxy, arbitrary host, or server error bodies are accepted.
      if (response.statusCode !== 200 || !/^application\/json(?:;|$)/i.test(response.headers['content-type'] || '')) {
        finish('LOCAL_SERVICE_RESPONSE_REJECTED'); return;
      }
      const chunks = []; let size = 0;
      response.on('data', chunk => {
        size += chunk.length;
        if (size > MAX) finish('LOCAL_RESPONSE_LIMIT'); else chunks.push(chunk);
      });
      response.on('aborted', () => finish('LOCAL_RESPONSE_ABORTED'));
      response.on('error', () => finish('LOCAL_RESPONSE_FAILED'));
      response.on('end', () => {
        try { finish(null, JSON.parse(Buffer.concat(chunks).toString('utf8'))); }
        catch { finish('LOCAL_RESPONSE_INVALID_JSON'); }
      });
    });
    const timer = setTimeout(() => finish('LOCAL_SERVICE_TIMEOUT'), 5000);
    req.on('error', () => finish('LOCAL_SERVICE_UNAVAILABLE'));
    req.end(payload);
  });
}

class ObservationBridge {
  constructor(request = requestLocal) { this.request = request; }
  async inspect() {
    const health = await this.request('/health');
    if (health?.ok !== true || health.system !== 'SHEIKHA_DATA_WORKSPACE_V1') throw new Error('LOCAL_IDENTITY_MISMATCH');
    const status = await this.request('/api/status');
    const registry = await this.request('/api/chat/tools');
    if (status?.system !== health.system || registry?.schema !== 'SHEIKHA_CHAT_TOOL_REGISTRY_V1' ||
        registry.execution !== 'DETERMINISTIC_TOOL_NOT_LLM' || !Array.isArray(registry.tools)) throw new Error('LOCAL_CONTRACT_MISMATCH');
    const tools = TOOLS.filter(tool => registry.tools.some(item => item.id === tool.id && item.status === 'AVAILABLE'));
    const number = n => Number.isSafeInteger(n) && n >= 0 ? n : null;
    return { checkedAt: new Date().toISOString(), endpoint: ORIGIN, reachable: true,
      version: typeof status.version === 'string' ? status.version.slice(0,32) : null,
      domains: number(status.domains), structure: { roots: number(status.v3?.roots), substructures: number(status.v3?.substructures), levels: number(status.v3?.levels) },
      structureMatchReported: status.liveRegistry?.matched === true,
      tools: tools.map(({ id, label }) => ({ id, label })),
      authenticationScope: 'SINGLE_LOCAL_OS_USER_NOT_MULTI_TENANT_AUTH',
      evidenceScope: 'LOCAL_SERVICE_RESPONSES_NOT_INDEPENDENT_CERTIFICATION',
      externalFetchEnabled: false, automaticSave: false, modelInference: false, productionReady: false };
  }
  async report() {
    const snapshot = await this.inspect();
    const metrics = await this.request('/api/data/metrics');
    const news = await this.request('/api/news/inbox');
    const count = value => Number.isSafeInteger(value) && value >= 0 ? value : null;
    return { ...snapshot, data: Object.fromEntries(['total','eligible','held','expired','revoked'].map(key => [key, count(metrics?.[key])])),
      news: { count: count(news?.count), unreadCount: count(news?.unreadCount), contentsIncluded: false } };
  }
  async execute(toolId, input = {}) {
    if (!allowed(toolId)) throw new Error('LOCAL_TOOL_DENIED');
    if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('JSON_OBJECT_REQUIRED');
    const state = await this.inspect();
    if (!state.tools.some(tool => tool.id === toolId)) throw new Error('LOCAL_TOOL_UNAVAILABLE');
    const session = await this.request('/api/session');
    if (session?.scope !== state.authenticationScope || !/^[a-f0-9]{64}$/.test(session.token || '')) throw new Error('LOCAL_SESSION_REJECTED');
    const result = await this.request('/api/chat/tool', { method: 'POST', body: { toolId, input }, token: session.token });
    if (result?.toolId !== toolId || result.execution !== 'DETERMINISTIC_TOOL_NOT_LLM' || result.network !== 'NONE' ||
        ['writes','historyPersisted','modelInference','trainingExecuted','outputAsInstructions','externalUpload'].some(key => result[key] !== false)) throw new Error('LOCAL_RESULT_BOUNDARY_MISMATCH');
    return result;
  }
}

module.exports = { ORIGIN, TOOLS, requestLocal, ObservationBridge };
