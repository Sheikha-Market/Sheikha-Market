class SheikhaDynamicExecutionPlanner {
  constructor() {
    this.name = 'Sheikha Dynamic Execution Planner';
    this.version = '1.0.0';
  }

  splitCommand(command = '') {
    return String(command)
      .split(/\s+(?:ثم|و(?:?=\s)|بعدها|مع)\s+/u)
      .map(s => s.trim())
      .filter(Boolean);
  }

  numbersFrom(text = '') {
    const found = String(text).match(/-?\d+(\.\d+)?/g);
    return found ? found.map(Number) : [];
  }

  classifyStep(text = '') {
    const nums = this.numbersFrom(text);
    if (/رتب|فرز|sort/i.test(text)) {
      return { kind: 'cs', operation: 'sort', endpoint: '/api/cs-language/execute', payload: { operation: 'sort', values: nums.length ? nums : [5,3,1,4,2] } };
    }
    if (/ابحث|بحث|search/i.test(text)) {
      return { kind: 'cs', operation: 'search', endpoint: '/api/cs-language/execute', payload: { operation: 'search', values: nums.length > 1 ? nums.slice(0,-1) : [1,2,3,4], target: nums.length ? nums[nums.length - 1] : 3 } };
    }
    if (/زكاة|zakat/i.test(text)) {
      return { kind: 'cs', operation: 'zakat', endpoint: '/api/cs-language/execute', payload: { operation: 'zakat', amount: nums[0] || 10000 } };
    }
    if (/هاش|بصمة|hash/i.test(text)) {
      return { kind: 'cs', operation: 'hash', endpoint: '/api/cs-language/execute', payload: { operation: 'hash', text } };
    }
    if (/تحويل|ثنائي|convert/i.test(text)) {
      return { kind: 'cs', operation: 'convert', endpoint: '/api/cs-language/execute', payload: { operation: 'convert', text: nums[0] ? String(nums[0]) : '1010', baseFrom: 2, baseTo: 10 } };
    }
    if (/pm3|pm4|توريد|إنتاج|انتاج|شغل|فعّل|فعل|orchestrator/i.test(text)) {
      return { kind: 'orchestrator', operation: 'auto', endpoint: '/api/execution-orchestrator/auto', payload: { command: text, mode: 'auto' } };
    }
    if (/صورة|تصميم|فيديو|شعار|visual/i.test(text)) {
      return { kind: 'job', operation: 'visual', endpoint: '/api/jobs/enqueue', payload: { type: 'visual', mode: /فيديو|video/i.test(text) ? 'video' : 'image', priority: 'normal', payload: { command: text, prompt: text } } };
    }
    if (/تقرير|وثق|توثيق|report/i.test(text)) {
      return { kind: 'job', operation: 'report', endpoint: '/api/jobs/enqueue', payload: { type: 'report', mode: 'document', priority: 'normal', payload: { command: text } } };
    }
    return { kind: 'orchestrator', operation: 'state', endpoint: '/api/execution-orchestrator/state', payload: { command: text } };
  }

  governance(command = '') {
    const blocked = /حذف\s+كل|إلغاء\s+كامل|إتلاف|أمر\s+غير\s+آمن/i.test(String(command));
    return {
      allowed: !blocked,
      principle: 'لا ضرر ولا ضرار',
      controls: [
        { id: 'NO_HARM', status: blocked ? 'blocked' : 'passed' },
        { id: 'TRACEABILITY', status: 'passed' },
        { id: 'RESPONSIBLE_AUTOMATION', status: 'passed' }
      ]
    };
  }

  build(command = '', options = {}) {
    const parts = this.splitCommand(command);
    const normalizedParts = parts.length ? parts : [String(command || '').trim()].filter(Boolean);
    const steps = normalizedParts.map((part, index) => {
      const classified = this.classifyStep(part);
      return {
        id: `STEP-${index + 1}`,
        order: index + 1,
        input: part,
        ...classified,
        dependsOn: index === 0 ? [] : [`STEP-${index}`],
        status: 'planned'
      };
    });

    const governance = this.governance(command);
    return {
      success: true,
      schema: 'sheikha/planner/v1',
      planner: this.name,
      version: this.version,
      planId: `PLAN-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
      command,
      mode: options.mode || 'sequential',
      governance,
      steps,
      summary: {
        steps: steps.length,
        cs: steps.filter(s => s.kind === 'cs').length,
        orchestrator: steps.filter(s => s.kind === 'orchestrator').length,
        jobs: steps.filter(s => s.kind === 'job').length
      },
      createdAt: new Date().toISOString()
    };
  }
}

module.exports = SheikhaDynamicExecutionPlanner;
