class SheikhaCodingLanguageEngine {
  constructor() {
    this.version = '1.0.0';
    this.name = 'Sheikha Coding Language Engine';
    this.grammar = {
      actions: {
        'حلل': 'analyze',
        'حلّل': 'analyze',
        'استخرج': 'extract',
        'فعّل': 'activate',
        'شغل': 'run',
        'شغّل': 'run',
        'اعرض': 'show',
        'اربط': 'link',
        'حوّل': 'transform',
        'نفّذ': 'execute',
        'قارن': 'compare',
        'طبّع': 'normalize',
        'طبع': 'normalize'
      },
      targets: {
        'الجذر': 'root',
        'النص': 'text',
        'الترميز': 'encoding',
        'utf8': 'utf8',
        'UTF8': 'utf8',
        'pm3': 'pm3',
        'PM3': 'pm3',
        'pm4': 'pm4',
        'PM4': 'pm4',
        'pm1': 'pm1',
        'PM1': 'pm1',
        'pm2': 'pm2',
        'PM2': 'pm2',
        'التوريد': 'supply',
        'الطلبات': 'orders',
        'العقود': 'contracts',
        'التنفيذ': 'execution',
        'التنفيذ التلقائي': 'auto_execution',
        'النظام': 'system',
        'الحالة': 'state',
        'اللغة': 'language',
        'التشابه': 'similarity',
        'التضمين': 'embedding',
        'القرآن': 'quran',
        'السنة': 'sunnah',
        'المقاصد': 'maqasid'
      },
      connectors: ['و', 'ثم', 'بعدها', 'مع']
    };

    this.examples = [
      'حلل النص واستخرج الجذر',
      'فعّل PM4 واربط التوريد',
      'شغّل التنفيذ التلقائي',
      'اعرض حالة النظام',
      'قارن النص وولّد تضمين',
      'طبّع النص ثم حلّل الترميز'
    ];
  }

  normalizeArabic(text = '') {
    return String(text)
      .trim()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[ًٌٍَُِّْـ]/g, '')
      .replace(/\s+/g, ' ');
  }

  tokenize(command = '') {
    const normalized = this.normalizeArabic(command);
    return normalized.split(' ').filter(Boolean);
  }

  detectAction(tokens = []) {
    for (const token of tokens) {
      if (this.grammar.actions[token]) return this.grammar.actions[token];
    }
    return null;
  }

  detectTargets(command = '', tokens = []) {
    const found = [];
    const normalized = this.normalizeArabic(command);

    for (const [raw, canonical] of Object.entries(this.grammar.targets)) {
      const normalizedRaw = this.normalizeArabic(raw);
      if (normalized.includes(normalizedRaw)) {
        found.push(canonical);
      }
    }

    for (const token of tokens) {
      if (this.grammar.targets[token]) found.push(this.grammar.targets[token]);
    }

    return [...new Set(found)];
  }

  inferOperations(action, targets) {
    const ops = [];

    if (action === 'activate' && targets.includes('pm4')) ops.push('activate_pm4');
    if (action === 'activate' && targets.includes('pm3')) ops.push('activate_pm3');
    if (action === 'activate' && targets.includes('pm1')) ops.push('activate_pm1');
    if (action === 'activate' && targets.includes('pm2')) ops.push('activate_pm2');
    if (action === 'run' && targets.includes('auto_execution')) ops.push('execution_orchestrator_auto');
    if (action === 'run' && targets.includes('execution')) ops.push('execution_orchestrator_run');
    if (action === 'show' && targets.includes('system')) ops.push('show_system_state');
    if (action === 'show' && targets.includes('state')) ops.push('show_execution_state');
    if (action === 'analyze' && targets.includes('text')) ops.push('analyze_text');
    if (action === 'analyze' && targets.includes('encoding')) ops.push('analyze_encoding');
    if (action === 'extract' && targets.includes('root')) ops.push('extract_root');
    if (action === 'compare' && targets.includes('similarity')) ops.push('compare_similarity');
    if (action === 'transform' && targets.includes('embedding')) ops.push('generate_embedding');
    if (action === 'normalize' && targets.includes('text')) ops.push('normalize_text');
    if (action === 'link' && targets.includes('supply')) ops.push('open_supply_review');
    if (action === 'show' && targets.includes('quran')) ops.push('show_quran');
    if (action === 'show' && targets.includes('sunnah')) ops.push('show_sunnah');
    if (action === 'show' && targets.includes('maqasid')) ops.push('show_maqasid');

    return [...new Set(ops)];
  }

  parse(command = '') {
    const tokens = this.tokenize(command);
    const action = this.detectAction(tokens);
    const targets = this.detectTargets(command, tokens);
    const operations = this.inferOperations(action, targets);

    return {
      ok: true,
      engine: this.name,
      version: this.version,
      input: command,
      normalized: this.normalizeArabic(command),
      tokens,
      action,
      targets,
      operations,
      confidence: operations.length ? 0.92 : action || targets.length ? 0.68 : 0.35
    };
  }

  compile(command = '') {
    const parsed = this.parse(command);
    return {
      ok: true,
      parsed,
      compiled: {
        type: 'sheikha_command',
        input: parsed.input,
        action: parsed.action,
        targets: parsed.targets,
        operations: parsed.operations
      }
    };
  }

  execute(command = '') {
    const compiled = this.compile(command);
    const operations = compiled.compiled.operations || [];

    const executionPlan = operations.map((operation) => ({
      operation,
      targetApi: this.mapOperationToApi(operation),
      status: 'planned'
    }));

    return {
      ok: true,
      engine: this.name,
      command,
      operationsCount: operations.length,
      executionPlan,
      result: operations.length ? 'ready_for_execution' : 'no_operation_inferred'
    };
  }

  mapOperationToApi(operation) {
    const map = {
      activate_pm1: '/api/pm-neural/pm1/activate',
      activate_pm2: '/api/pm-neural/pm2/activate',
      activate_pm3: '/api/pm-neural/pm3/activate',
      activate_pm4: '/api/pm-neural/pm4/activate',
      execution_orchestrator_run: '/api/execution-orchestrator/run',
      execution_orchestrator_auto: '/api/execution-orchestrator/auto',
      show_system_state: '/api/execution-orchestrator/state',
      show_execution_state: '/api/execution-orchestrator/state',
      analyze_text: '/api/arabic-utf8/analyze',
      analyze_encoding: '/api/arabic-utf8/encode',
      extract_root: '/api/arabic-utf8/root',
      compare_similarity: '/api/arabic-utf8/similarity',
      generate_embedding: '/api/arabic-utf8/embedding',
      normalize_text: '/api/arabic-utf8/normalize',
      open_supply_review: '/api/execution-orchestrator/state',
      show_quran: '/api/arabic-utf8/quran',
      show_sunnah: '/api/arabic-utf8/sunnah',
      show_maqasid: '/api/arabic-utf8/maqasid'
    };

    return map[operation] || null;
  }

  health() {
    return {
      ok: true,
      engine: this.name,
      version: this.version,
      grammarActions: Object.keys(this.grammar.actions).length,
      grammarTargets: Object.keys(this.grammar.targets).length,
      examples: this.examples.length
    };
  }

  getGrammar() {
    return {
      ok: true,
      grammar: this.grammar,
      examples: this.examples
    };
  }
}

module.exports = SheikhaCodingLanguageEngine;
