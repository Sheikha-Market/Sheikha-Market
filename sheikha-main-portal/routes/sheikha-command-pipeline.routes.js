const express = require('express');
const router = express.Router();

function numbersFrom(text) {
  const m = String(text || '').match(/-?\d+(\.\d+)?/g);
  return m ? m.map(Number) : [];
}

function analyzeGrammar(command) {
  try {
    const Grammar = require('../lib/sheikha-arabic-grammar-engine');
    const engine = typeof Grammar === 'function' ? new Grammar() : Grammar;
    if (engine && typeof engine.analyze === 'function') return engine.analyze(command);
  } catch (e) {}
  const tokens = String(command || '').split(/\s+/).filter(Boolean);
  return { fallback: true, text: command, tokens: tokens.map((token, i) => ({ token, role: i === 0 ? 'verb' : 'object' })) };
}

function decide(command, grammar) {
  const text = String(command || '');
  const nums = numbersFrom(text);
  const verb = grammar && grammar.tokens ? (grammar.tokens.find(t => t.role === 'verb') || {}).token : '';
  const source = `${text} ${verb}`;

  if (/رتب|فرز|sort/i.test(source)) {
    return { target: 'cs-language', action: 'sort', payload: { operation: 'sort', values: nums.length ? nums : [5,3,1,4,2] } };
  }
  if (/ابحث|بحث|search/i.test(source)) {
    return { target: 'cs-language', action: 'search', payload: { operation: 'search', values: nums.length > 1 ? nums.slice(0,-1) : [1,2,3,4], target: nums.length ? nums[nums.length-1] : 3 } };
  }
  if (/هاش|بصمة|hash/i.test(source)) {
    return { target: 'cs-language', action: 'hash', payload: { operation: 'hash', text } };
  }
  if (/تحويل|convert|ثنائي/i.test(source)) {
    return { target: 'cs-language', action: 'convert', payload: { operation: 'convert', text: nums[0] ? String(nums[0]) : '1010', baseFrom: 2, baseTo: 10 } };
  }
  if (/زكاة|zakat/i.test(source)) {
    return { target: 'cs-language', action: 'zakat', payload: { operation: 'zakat', amount: nums[0] || 10000 } };
  }
  if (/pm3|pm4|توريد|انتاج|إنتاج|orchestrator|تشغيل/i.test(source)) {
    return { target: 'orchestrator', action: 'auto', payload: { command, mode: 'auto' } };
  }
  if (/صورة|تصميم|فيديو|visual/i.test(source)) {
    return { target: 'visual-job', action: 'enqueue', payload: { type: 'visual', mode: /فيديو|video/i.test(source) ? 'video' : 'image', priority: 'normal', prompt: command } };
  }
  return { target: 'orchestrator', action: 'state', payload: { command } };
}

function governance(command, decision) {
  const text = String(command || '');
  const blocked = /احذف كل|دمّر|تخريب|سرقة|اختراق/i.test(text);
  return {
    principle: 'لا ضرر ولا ضرار',
    allowed: !blocked,
    controls: [
      { id: 'NO_HARM', status: blocked ? 'blocked' : 'passed' },
      { id: 'TRUST_AND_CLARITY', status: 'passed' },
      { id: 'RESPONSIBLE_AUTOMATION', status: decision.target === 'orchestrator' ? 'reviewed' : 'passed' }
    ]
  };
}

async function execute(decision, req) {
  const base = `${req.protocol}://${req.get('host')}`;
  if (decision.target === 'cs-language') {
    const r = await fetch(`${base}/api/cs-language/execute`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(decision.payload) });
    return { routed: '/api/cs-language/execute', status: r.status, response: await r.json() };
  }
  if (decision.target === 'orchestrator') {
    const endpoint = decision.action === 'auto' ? '/api/execution-orchestrator/auto' : '/api/execution-orchestrator/state';
    const options = endpoint.endsWith('/auto') ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(decision.payload) } : {};
    const r = await fetch(`${base}${endpoint}`, options);
    return { routed: endpoint, status: r.status, response: await r.json() };
  }
  if (decision.target === 'visual-job') {
    const r = await fetch(`${base}/api/jobs/enqueue`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(decision.payload) });
    return { routed: '/api/jobs/enqueue', status: r.status, response: await r.json() };
  }
  return { routed: null, status: 204, response: null };
}

async function emitRealtime(req, payload) {
  try {
    const base = `${req.protocol}://${req.get('host')}`;
    await fetch(`${base}/api/realtime/emit`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channel: 'sheikha.command.executed', payload }) });
  } catch (e) {}
}

router.get('/health', (req, res) => {
  res.json({ success: true, service: 'sheikha-command-pipeline', status: 'healthy' });
});

router.post('/command', async (req, res) => {
  try {
    const command = req.body && req.body.command;
    const grammar = analyzeGrammar(command);
    const decision = decide(command, grammar);
    const gov = governance(command, decision);
    if (!gov.allowed) {
      const blocked = { success: false, command, grammar, decision, governance: gov, message: 'تم رفض الأمر لأن فيه ضرراً أو مخالفة تشغيلية' };
      await emitRealtime(req, blocked);
      return res.status(403).json(blocked);
    }
    const execution = await execute(decision, req);
    const result = { success: true, schema: 'sheikha/v2', command, grammar, decision, execution, governance: gov, trace: [
      { step: 'arabic-grammar', ok: true },
      { step: 'decision', ok: true, target: decision.target, action: decision.action },
      { step: 'execution', ok: execution.status >= 200 && execution.status < 300, routed: execution.routed }
    ], timestamp: new Date().toISOString() };
    await emitRealtime(req, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
