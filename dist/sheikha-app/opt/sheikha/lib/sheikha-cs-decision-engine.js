class SheikhaCSDecisionEngine {
  constructor() {
    this.version = '1.0.0';
    this.name = 'Sheikha CS Language Decision Engine';
  }

  numbersFrom(text = '') {
    const m = String(text).match(/-?\d+(\.\d+)?/g);
    return m ? m.map(Number) : [];
  }

  classify(command = '', grammar = null) {
    const text = String(command || '').trim();
    const nums = this.numbersFrom(text);
    const tokens = grammar && grammar.tokens ? grammar.tokens : [];
    const verb = (tokens.find(t => t.role === 'verb') || {}).token || text.split(/\s+/)[0] || '';
    const source = `${text} ${verb}`;

    if (/رتب|فرز|sort/i.test(source)) {
      return { domain: 'cs', operation: 'sort', endpoint: '/api/cs-language/execute', payload: { operation: 'sort', values: nums.length ? nums : [5, 3, 1, 4, 2] } };
    }
    if (/ابحث|بحث|search/i.test(source)) {
      return { domain: 'cs', operation: 'search', endpoint: '/api/cs-language/execute', payload: { operation: 'search', values: nums.length > 1 ? nums.slice(0, -1) : [1, 2, 3, 4], target: nums.length ? nums[nums.length - 1] : 3 } };
    }
    if (/هاش|بصمة|hash/i.test(source)) {
      return { domain: 'cs', operation: 'hash', endpoint: '/api/cs-language/execute', payload: { operation: 'hash', text } };
    }
    if (/تحويل|ثنائي|convert/i.test(source)) {
      return { domain: 'cs', operation: 'convert', endpoint: '/api/cs-language/execute', payload: { operation: 'convert', text: nums[0] ? String(nums[0]) : '1010', baseFrom: 2, baseTo: 10 } };
    }
    if (/زكاة|zakat/i.test(source)) {
      return { domain: 'cs', operation: 'zakat', endpoint: '/api/cs-language/execute', payload: { operation: 'zakat', amount: nums[0] || 10000 } };
    }
    if (/pm3|pm4|توريد|انتاج|إنتاج|orchestrator|تشغيل|فعّل/i.test(source)) {
      return { domain: 'orchestrator', operation: 'auto', endpoint: '/api/execution-orchestrator/auto', payload: { command: text, mode: 'auto' } };
    }
    if (/صورة|تصميم|فيديو|visual/i.test(source)) {
      return { domain: 'visual', operation: 'enqueue_visual_job', endpoint: '/api/jobs/enqueue', payload: { type: 'visual', mode: /فيديو|video/i.test(source) ? 'video' : 'image', priority: 'normal', payload: { prompt: text, command: text } } };
    }
    return { domain: 'orchestrator', operation: 'state', endpoint: '/api/execution-orchestrator/state', payload: { command: text } };
  }

  governance(command = '', decision = {}) {
    const text = String(command || '');
    const blocked = /حذف\s+كل|إتلاف|إلغاء\s+كامل|أمر\s+غير\s+آمن/i.test(text);
    return {
      allowed: !blocked,
      principle: 'لا ضرر ولا ضرار',
      controls: [
        { id: 'NO_HARM', status: blocked ? 'blocked' : 'passed' },
        { id: 'TRUST_AND_CLARITY', status: 'passed' },
        { id: 'RESPONSIBLE_AUTOMATION', status: decision.domain === 'orchestrator' ? 'reviewed' : 'passed' }
      ]
    };
  }

  plan(command = '', grammar = null) {
    const decision = this.classify(command, grammar);
    const governance = this.governance(command, decision);
    return {
      id: `PLAN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      command,
      grammarSummary: grammar ? { sentenceType: grammar.sentenceType, confidence: grammar.confidence, tokens: grammar.tokens } : null,
      decision,
      governance,
      steps: [
        { step: 'grammar', status: grammar ? 'ready' : 'fallback' },
        { step: 'decision', status: 'ready', target: decision.domain, operation: decision.operation },
        { step: 'execution', status: governance.allowed ? 'ready' : 'blocked', endpoint: decision.endpoint },
        { step: 'job-trail', status: 'ready' },
        { step: 'realtime', status: 'ready' }
      ],
      createdAt: new Date().toISOString()
    };
  }
}

module.exports = SheikhaCSDecisionEngine;
