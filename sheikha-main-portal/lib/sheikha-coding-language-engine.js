'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class SheikhaCodingLanguageEngine {
  constructor(options = {}) {
    this.version = '2.1.0';
    this.name = 'Sheikha Coding Language Engine';
    this.runtimeLimits = {
      maxOps: Number(options.maxOps || 256),
      maxScriptBytes: Number(options.maxScriptBytes || 64 * 1024),
      maxQueueSize: Number(options.maxQueueSize || 128)
    };
    this.packageStorePath = options.packageStorePath
      || path.join(__dirname, '../data/shk-package-lock.json');

    this.grammar = {
      actions: {
        'حلل': 'analyze', 'حلّل': 'analyze', 'استخرج': 'extract', 'فعّل': 'activate',
        'شغل': 'run', 'شغّل': 'run', 'اعرض': 'show', 'اربط': 'link',
        'حوّل': 'transform', 'نفّذ': 'execute', 'قارن': 'compare', 'طبّع': 'normalize', 'طبع': 'normalize'
      },
      targets: {
        'الجذر': 'root', 'النص': 'text', 'الترميز': 'encoding', 'utf8': 'utf8', 'UTF8': 'utf8',
        'pm3': 'pm3', 'PM3': 'pm3', 'pm4': 'pm4', 'PM4': 'pm4', 'pm1': 'pm1', 'PM1': 'pm1',
        'pm2': 'pm2', 'PM2': 'pm2', 'التوريد': 'supply', 'الطلبات': 'orders', 'العقود': 'contracts',
        'التنفيذ': 'execution', 'التنفيذ التلقائي': 'auto_execution', 'النظام': 'system', 'الحالة': 'state',
        'اللغة': 'language', 'التشابه': 'similarity', 'التضمين': 'embedding', 'القرآن': 'quran',
        'السنة': 'sunnah', 'المقاصد': 'maqasid'
      },
      declarations: ['عرف', 'let', 'var'],
      types: {
        number: 'number', 'رقم': 'number',
        string: 'string', 'نص': 'string',
        boolean: 'boolean', 'منطقي': 'boolean',
        array: 'array', 'قائمة': 'array',
        object: 'object', 'كائن': 'object',
        any: 'any', 'اي': 'any'
      }
    };

    this.examples = [
      'حلل النص واستخرج الجذر',
      'فعّل PM4 واربط التوريد',
      'شغّل التنفيذ التلقائي',
      'اعرض حالة النظام',
      'عرف الكمية:رقم = 15'
    ];

    this.governancePolicies = [
      { id: 'no_riba', severity: 'error', pattern: /(ربا|interest)/i, message: 'مخالفة شرعية: وجود ربا/فوائد.' },
      { id: 'no_haram', severity: 'error', pattern: /(خمر|كحول|خنزير|alcohol|pork)/i, message: 'مخالفة شرعية: منتج محرم.' },
      { id: 'avoid_gharar', severity: 'warning', pattern: /(غرر|uncertain|unknown)/i, message: 'تنبيه: صياغة قد تحمل غرر.' }
    ];

    this.neuralRootCells = [
      { id: 'R01', rule: 'start', weight: 1.0 },
      { id: 'R02', rule: 'governance', weight: 1.0 },
      { id: 'R03', rule: 'type_safety', weight: 0.95 },
      { id: 'R04', rule: 'runtime_isolation', weight: 0.93 },
      { id: 'R05', rule: 'operation_quality', weight: 0.9 },
      { id: 'R06', rule: 'sharia_guard', weight: 1.0 }
    ];

    this.daemon = {
      running: false,
      startedAt: null,
      processed: 0,
      queue: [],
      lastResult: null,
      lastError: null
    };
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
    return this.normalizeArabic(command).split(' ').filter(Boolean);
  }

  detectAction(tokens = []) {
    for (const token of tokens) if (this.grammar.actions[token]) return this.grammar.actions[token];
    return null;
  }

  detectTargets(command = '', tokens = []) {
    const found = [];
    const normalized = this.normalizeArabic(command);
    for (const [raw, canonical] of Object.entries(this.grammar.targets)) {
      if (normalized.includes(this.normalizeArabic(raw))) found.push(canonical);
    }
    for (const token of tokens) if (this.grammar.targets[token]) found.push(this.grammar.targets[token]);
    return [...new Set(found)];
  }

  inferOperations(action, targets) {
    const ops = [];
    if (action === 'activate' && targets.includes('pm4')) ops.push('activate_pm4');
    if (action === 'activate' && targets.includes('pm3')) ops.push('activate_pm3');
    if (action === 'activate' && targets.includes('pm2')) ops.push('activate_pm2');
    if (action === 'activate' && targets.includes('pm1')) ops.push('activate_pm1');
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

  lexer(source = '') {
    const input = String(source || '');
    if (Buffer.byteLength(input, 'utf8') > this.runtimeLimits.maxScriptBytes) {
      throw new Error(`Script exceeds ${this.runtimeLimits.maxScriptBytes} bytes`);
    }
    const tokens = [];
    let line = 1;
    let column = 1;
    let i = 0;
    const isWordStart = (c) => /[\p{L}_]/u.test(c);
    const isWord = (c) => /[\p{L}\p{N}_-]/u.test(c);

    while (i < input.length) {
      const ch = input[i];
      if (ch === '\r') { i += 1; continue; }
      if (ch === '\n' || ch === ';') { tokens.push({ type: 'NEWLINE', value: ch, line, column }); i += 1; line += 1; column = 1; continue; }
      if (ch === ' ' || ch === '\t') { i += 1; column += 1; continue; }
      if (ch === '"' || ch === '\'') {
        const q = ch; const c0 = column; i += 1; column += 1; let out = '';
        while (i < input.length && input[i] !== q) {
          if (input[i] === '\n') throw new Error(`Unclosed string at line ${line}`);
          if (input[i] === '\\' && typeof input[i + 1] === 'string') { out += input[i + 1]; i += 2; column += 2; continue; }
          out += input[i]; i += 1; column += 1;
        }
        if (i >= input.length) throw new Error(`Unclosed string at line ${line}`);
        i += 1; column += 1; tokens.push({ type: 'STRING', value: out, line, column: c0 }); continue;
      }
      if (ch >= '0' && ch <= '9') {
        const c0 = column; let out = ''; let dot = false;
        while (i < input.length && ((input[i] >= '0' && input[i] <= '9') || (!dot && input[i] === '.'))) {
          if (input[i] === '.') dot = true;
          out += input[i]; i += 1; column += 1;
        }
        tokens.push({ type: 'NUMBER', value: out, line, column: c0 }); continue;
      }
      if (isWordStart(ch)) {
        const c0 = column; let out = '';
        while (i < input.length && isWord(input[i])) { out += input[i]; i += 1; column += 1; }
        tokens.push({ type: 'WORD', value: out, line, column: c0 }); continue;
      }
      if ('=:,[]{}'.includes(ch)) { tokens.push({ type: 'SYMBOL', value: ch, line, column }); i += 1; column += 1; continue; }
      throw new Error(`Unexpected token '${ch}' at ${line}:${column}`);
    }
    tokens.push({ type: 'EOF', value: '', line, column });
    return tokens;
  }

  _normalizeType(raw) {
    if (!raw) return null;
    return this.grammar.types[raw] || this.grammar.types[this.normalizeArabic(raw)] || raw;
  }

  _tokenAsNode(token) {
    if (!token) return { type: 'Literal', value: null, valueType: 'null' };
    if (token.type === 'STRING') return { type: 'Literal', value: token.value, valueType: 'string', loc: token };
    if (token.type === 'NUMBER') return { type: 'Literal', value: Number(token.value), valueType: 'number', loc: token };
    if (token.type === 'WORD') {
      const n = this.normalizeArabic(token.value);
      if (['true', 'صح'].includes(n)) return { type: 'Literal', value: true, valueType: 'boolean', loc: token };
      if (['false', 'خطا'].includes(n)) return { type: 'Literal', value: false, valueType: 'boolean', loc: token };
      return { type: 'Identifier', name: token.value, loc: token };
    }
    return { type: 'Literal', value: null, valueType: 'null', loc: token };
  }

  parseAst(source = '', options = {}) {
    const tokens = this.lexer(source);
    const body = [];
    let i = 0;
    const readLine = (start) => {
      const out = [];
      let p = start;
      while (p < tokens.length && !['NEWLINE', 'EOF'].includes(tokens[p].type)) { out.push(tokens[p]); p += 1; }
      return { out, next: p };
    };

    while (i < tokens.length) {
      const t = tokens[i];
      if (!t || t.type === 'EOF') break;
      if (t.type === 'NEWLINE') { i += 1; continue; }

      const kw = this.normalizeArabic(t.value || '');
      if (t.type === 'WORD' && this.grammar.declarations.includes(kw)) {
        const nameToken = tokens[i + 1];
        if (!nameToken || nameToken.type !== 'WORD') throw new Error(`Expected identifier after declaration at line ${t.line}`);
        let p = i + 2;
        let annotation = null;
        if (tokens[p] && tokens[p].type === 'SYMBOL' && tokens[p].value === ':') {
          if (!tokens[p + 1] || tokens[p + 1].type !== 'WORD') throw new Error(`Expected type annotation at line ${t.line}`);
          annotation = this._normalizeType(tokens[p + 1].value);
          p += 2;
        }
        let value = { type: 'Literal', value: null, valueType: 'null', loc: t };
        if (tokens[p] && tokens[p].type === 'SYMBOL' && tokens[p].value === '=') {
          value = this._tokenAsNode(tokens[p + 1]);
          p += 2;
        }
        body.push({ type: 'VariableDeclaration', kind: 'let', id: nameToken.value, annotation, value, loc: t });
        i = p;
        continue;
      }

      const line = readLine(i);
      const words = line.out.filter(x => ['WORD', 'NUMBER', 'STRING'].includes(x.type)).map(x => String(x.value));
      const raw = words.join(' ').trim();
      const textTokens = this.tokenize(raw);
      const action = this.detectAction(textTokens);
      const targets = this.detectTargets(raw, textTokens);
      const operations = this.inferOperations(action, targets);
      body.push({ type: 'CommandStatement', raw, tokens: textTokens, action, targets, operations, loc: line.out[0] || t });
      i = line.next;
    }

    return { type: 'Program', language: 'sheikha-shk', version: this.version, sourceType: options.sourceType || 'script', body, tokens };
  }

  parseShk(source = '', options = {}) {
    const ast = this.parseAst(source, options);
    return { ok: true, engine: this.name, version: this.version, ast, statements: ast.body.length };
  }

  _inferNodeType(node, symbols = {}) {
    if (!node) return 'unknown';
    if (node.type === 'Literal') return node.valueType || typeof node.value;
    if (node.type === 'Identifier') return symbols[node.name] || 'unknown';
    return 'unknown';
  }

  typeCheckAst(ast) {
    const errors = [];
    const warnings = [];
    const symbols = {};
    for (const node of ast.body || []) {
      if (node.type === 'VariableDeclaration') {
        const inferred = this._inferNodeType(node.value, symbols);
        const expected = this._normalizeType(node.annotation);
        if (expected && expected !== 'any' && inferred !== expected) {
          errors.push({ code: 'TYPE_MISMATCH', message: `Type mismatch for '${node.id}': expected ${expected}, got ${inferred}`, line: node.loc.line, column: node.loc.column });
        }
        symbols[node.id] = expected || inferred;
      }
      if (node.type === 'CommandStatement') {
        if (!node.action) warnings.push({ code: 'UNKNOWN_ACTION', message: `Unknown command action: '${node.raw}'`, line: node.loc.line, column: node.loc.column });
        if (node.action && node.operations.length === 0) warnings.push({ code: 'NO_OPERATION', message: `No operation inferred: '${node.raw}'`, line: node.loc.line, column: node.loc.column });
      }
    }
    return { ok: errors.length === 0, stage: 'type-check', symbols, errors, warnings };
  }

  evaluateGovernance(ast) {
    const findings = [];
    for (const node of ast.body || []) {
      const text = node.type === 'CommandStatement' ? String(node.raw || '') : String((node.value && node.value.value) || '');
      for (const p of this.governancePolicies) {
        if (p.pattern.test(text)) findings.push({ policyId: p.id, severity: p.severity, message: p.message, line: node.loc.line, column: node.loc.column, nodeType: node.type });
      }
    }
    return { ok: findings.filter(x => x.severity === 'error').length === 0, stage: 'governance', findings, blocked: findings.filter(x => x.severity === 'error') };
  }

  compileToBytecode(ast) {
    const instructions = [];
    for (const node of ast.body || []) {
      if (node.type === 'VariableDeclaration') instructions.push({ op: 'DECLARE', name: node.id, declaredType: node.annotation || null, value: node.value });
      if (node.type === 'CommandStatement') instructions.push({ op: 'COMMAND', action: node.action, targets: node.targets, operations: node.operations, raw: node.raw });
    }
    instructions.push({ op: 'HALT' });
    return { ok: true, stage: 'bytecode', instructionSet: 'SHK-BC/0.1', instructions };
  }

  _evalNode(node, scope) {
    if (!node) return null;
    if (node.type === 'Literal') return node.value;
    if (node.type === 'Identifier') return scope[node.name];
    return null;
  }

  executeBytecode(bytecode, options = {}) {
    const maxOps = Number(options.maxOps || this.runtimeLimits.maxOps);
    const state = { variables: {}, plannedOperations: [], executedOps: 0, halted: false };
    for (const ins of bytecode.instructions || []) {
      state.executedOps += 1;
      if (state.executedOps > maxOps) throw new Error(`Runtime limit exceeded: maxOps=${maxOps}`);
      if (ins.op === 'DECLARE') state.variables[ins.name] = this._evalNode(ins.value, state.variables);
      if (ins.op === 'COMMAND') state.plannedOperations.push(...(ins.operations || []).map(op => ({ operation: op, targetApi: this.mapOperationToApi(op), status: 'planned' })));
      if (ins.op === 'HALT') { state.halted = true; break; }
    }
    return { ok: true, stage: 'runtime', isolated: true, state };
  }

  executeNeuralRootRuntime(compiled, options = {}) {
    const governancePenalty = compiled.governance.findings.filter(f => f.severity === 'error').length * 0.5;
    const warningPenalty = compiled.typeCheck.warnings.length * 0.05;
    const errorPenalty = compiled.typeCheck.errors.length * 0.2;
    const base = this.neuralRootCells.reduce((s, c) => s + c.weight, 0) / this.neuralRootCells.length;
    const confidence = Math.max(0, Math.min(1, base - governancePenalty - warningPenalty - errorPenalty));

    if (!compiled.typeCheck.ok || !compiled.governance.ok) {
      return {
        ok: false,
        stage: 'neural-root-runtime',
        mode: 'blocked',
        confidence,
        reason: 'compile_or_governance_failed',
        governance: compiled.governance,
        typeCheck: compiled.typeCheck
      };
    }

    const runtime = this.executeBytecode(compiled.bytecode, options);
    return {
      ok: true,
      stage: 'neural-root-runtime',
      mode: 'compiled_vm_plus_neural_root',
      confidence,
      neuralRoot: {
        totalCells: this.neuralRootCells.length,
        activeCells: this.neuralRootCells.map(c => c.id),
        decision: confidence >= 0.7 ? 'approve' : 'review'
      },
      runtime
    };
  }

  compileScript(source = '', options = {}) {
    const ast = this.parseAst(source, options);
    const typeCheck = this.typeCheckAst(ast);
    const governance = this.evaluateGovernance(ast);
    return { ok: typeCheck.ok && governance.ok, stage: 'compile', ast, typeCheck, governance, bytecode: this.compileToBytecode(ast) };
  }

  executeInSandbox(source = '', options = {}) {
    const compiled = this.compileScript(source, options);
    const neuralRuntime = this.executeNeuralRootRuntime(compiled, options);
    if (!neuralRuntime.ok) return { ok: false, stage: 'sandbox', isolation: { mode: 'in-memory-isolated-runtime' }, ...neuralRuntime };
    return {
      ok: true,
      stage: 'sandbox',
      isolation: { mode: 'in-memory-isolated-runtime', limits: { maxOps: Number(options.maxOps || this.runtimeLimits.maxOps), maxScriptBytes: this.runtimeLimits.maxScriptBytes } },
      compiled,
      neuralRuntime
    };
  }

  _ensurePackageStore() { fs.mkdirSync(path.dirname(this.packageStorePath), { recursive: true }); }
  _readPackageLock() {
    try {
      if (!fs.existsSync(this.packageStorePath)) return { schema: 'sheikha/shk-lock/v1', packages: {}, updatedAt: null };
      return JSON.parse(fs.readFileSync(this.packageStorePath, 'utf8'));
    } catch (_) {
      return { schema: 'sheikha/shk-lock/v1', packages: {}, updatedAt: null };
    }
  }
  _writePackageLock(lock) { this._ensurePackageStore(); fs.writeFileSync(this.packageStorePath, JSON.stringify(lock, null, 2), 'utf8'); }

  installPackage(input = {}) {
    const name = String(input.name || '').trim();
    const version = String(input.version || '').trim();
    const constraints = String(input.constraints || '').trim() || `^${version}`;
    if (!name) throw new Error('Package name is required');
    if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Package version must be semver x.y.z');
    const lock = this._readPackageLock();
    const integrity = `sha256-${crypto.createHash('sha256').update(`${name}@${version}`).digest('hex')}`;
    lock.packages[name] = { version, constraints, integrity, installedAt: new Date().toISOString() };
    lock.updatedAt = new Date().toISOString();
    this._writePackageLock(lock);
    return { ok: true, stage: 'package-manager', package: { name, version, constraints, integrity }, lock };
  }

  getPackageLock() { return { ok: true, stage: 'package-manager', lock: this._readPackageLock() }; }

  daemonStart() {
    if (this.daemon.running) return { ok: true, started: false, message: 'daemon already running', health: this.daemonHealth() };
    this.daemon.running = true; this.daemon.startedAt = new Date().toISOString(); this.daemon.lastError = null;
    return { ok: true, started: true, health: this.daemonHealth() };
  }

  daemonStop() {
    if (!this.daemon.running) return { ok: true, stopped: false, message: 'daemon already stopped', health: this.daemonHealth() };
    this.daemon.running = false; this.daemon.queue = [];
    return { ok: true, stopped: true, health: this.daemonHealth() };
  }

  daemonReload() { this.daemonStop(); return this.daemonStart(); }

  daemonHealth() {
    return {
      ok: true,
      running: this.daemon.running,
      startedAt: this.daemon.startedAt,
      processed: this.daemon.processed,
      queued: this.daemon.queue.length,
      lastResult: this.daemon.lastResult,
      lastError: this.daemon.lastError
    };
  }

  daemonSubmit(script = '', options = {}) {
    if (!this.daemon.running) return { ok: false, error: 'daemon_not_running' };
    if (this.daemon.queue.length >= this.runtimeLimits.maxQueueSize) return { ok: false, error: 'daemon_queue_full' };
    const job = { id: `shk-job-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`, script: String(script || ''), queuedAt: new Date().toISOString() };
    this.daemon.queue.push(job);
    try {
      const result = this.executeInSandbox(job.script, options);
      this.daemon.queue = this.daemon.queue.filter(x => x.id !== job.id);
      this.daemon.processed += 1;
      this.daemon.lastResult = { id: job.id, ok: result.ok, at: new Date().toISOString() };
      return { ok: true, jobId: job.id, result };
    } catch (err) {
      this.daemon.queue = this.daemon.queue.filter(x => x.id !== job.id);
      this.daemon.lastError = { message: err.message, at: new Date().toISOString() };
      return { ok: false, jobId: job.id, error: err.message };
    }
  }

  _severityToNumber(severity = 'info') { return severity === 'error' ? 1 : severity === 'warning' ? 2 : 3; }

  lspDiagnostics(source = '') {
    try {
      const compiled = this.compileScript(source);
      const diagnostics = [];
      for (const e of compiled.typeCheck.errors) diagnostics.push({ severity: 1, message: e.message, line: e.line || 1, column: e.column || 1, source: 'shk-type', code: e.code });
      for (const w of compiled.typeCheck.warnings) diagnostics.push({ severity: 2, message: w.message, line: w.line || 1, column: w.column || 1, source: 'shk-type', code: w.code });
      for (const g of compiled.governance.findings) diagnostics.push({ severity: this._severityToNumber(g.severity), message: g.message, line: g.line || 1, column: g.column || 1, source: 'shk-governance', code: g.policyId });
      return { ok: true, diagnostics, astStatements: compiled.ast.body.length };
    } catch (err) {
      return { ok: false, diagnostics: [{ severity: 1, message: err.message, line: 1, column: 1, source: 'shk-parser', code: 'PARSER_ERROR' }] };
    }
  }

  lspCompletions(prefix = '') {
    const pref = this.normalizeArabic(prefix);
    const items = [];
    for (const k of Object.keys(this.grammar.actions)) items.push({ label: k, kind: 'Function', detail: `Action → ${this.grammar.actions[k]}` });
    for (const k of Object.keys(this.grammar.targets)) items.push({ label: k, kind: 'Constant', detail: `Target → ${this.grammar.targets[k]}` });
    for (const k of this.grammar.declarations) items.push({ label: k, kind: 'Keyword', detail: 'Declaration keyword' });
    for (const k of Object.keys(this.grammar.types)) items.push({ label: k, kind: 'TypeParameter', detail: `Type → ${this.grammar.types[k]}` });
    return { ok: true, items: items.filter(x => !pref || this.normalizeArabic(x.label).startsWith(pref)).slice(0, 200) };
  }

  lspHover(source = '', line = 1, column = 1) {
    try {
      const tokens = this.lexer(source);
      const t = tokens.find(x => x.line === Number(line) && Number(column) >= x.column && Number(column) <= (x.column + String(x.value || '').length));
      if (!t) return { ok: true, hover: null };
      const n = this.normalizeArabic(t.value || '');
      if (this.grammar.actions[n]) return { ok: true, hover: { token: t.value, markdown: `**Action**: ${this.grammar.actions[n]}` } };
      if (this.grammar.targets[n]) return { ok: true, hover: { token: t.value, markdown: `**Target**: ${this.grammar.targets[n]}` } };
      if (this.grammar.types[n]) return { ok: true, hover: { token: t.value, markdown: `**Type**: ${this.grammar.types[n]}` } };
      return { ok: true, hover: { token: t.value, markdown: `**Token**: ${t.type}` } };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }

  parse(command = '') {
    const source = String(command || '');
    const tokens = this.tokenize(source);
    const action = this.detectAction(tokens);
    const targets = this.detectTargets(source, tokens);
    const operations = this.inferOperations(action, targets);
    const ast = this.parseAst(source, { sourceType: 'command' });
    const typeCheck = this.typeCheckAst(ast);
    const governance = this.evaluateGovernance(ast);
    return {
      ok: true,
      engine: this.name,
      version: this.version,
      input: source,
      normalized: this.normalizeArabic(source),
      tokens,
      action,
      targets,
      operations,
      ast,
      typeCheck,
      governance,
      confidence: operations.length ? 0.92 : action || targets.length ? 0.68 : 0.35
    };
  }

  compile(command = '') {
    const parsed = this.parse(command);
    const bytecode = this.compileToBytecode(parsed.ast);
    return {
      ok: parsed.typeCheck.ok && parsed.governance.ok,
      parsed,
      compiled: {
        type: 'sheikha_command',
        input: parsed.input,
        action: parsed.action,
        targets: parsed.targets,
        operations: parsed.operations,
        ast: parsed.ast,
        bytecode,
        governance: parsed.governance,
        typeCheck: parsed.typeCheck
      }
    };
  }

  execute(command = '') {
    const compiledCommand = this.compile(command);
    if (!compiledCommand.ok) {
      return { ok: false, engine: this.name, command, result: 'blocked', governance: compiledCommand.compiled.governance, typeCheck: compiledCommand.compiled.typeCheck };
    }
    const neuralRuntime = this.executeNeuralRootRuntime({
      ast: compiledCommand.compiled.ast,
      bytecode: compiledCommand.compiled.bytecode,
      governance: compiledCommand.compiled.governance,
      typeCheck: compiledCommand.compiled.typeCheck
    });
    if (!neuralRuntime.ok) return { ok: false, engine: this.name, command, result: 'blocked', neuralRuntime };
    return {
      ok: true,
      engine: this.name,
      command,
      operationsCount: (compiledCommand.compiled.operations || []).length,
      executionPlan: neuralRuntime.runtime.state.plannedOperations,
      result: neuralRuntime.runtime.state.plannedOperations.length ? 'ready_for_execution' : 'no_operation_inferred',
      neuralRuntime
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
      examples: this.examples.length,
      packageStorePath: this.packageStorePath,
      daemon: this.daemonHealth(),
      features: {
        ast: true,
        typeSystem: true,
        governanceOnAst: true,
        bytecode: true,
        sandbox: true,
        packageManager: true,
        lsp: true,
        daemon: true,
        neuralRootRuntime: true
      }
    };
  }

  getGrammar() {
    return { ok: true, grammar: this.grammar, examples: this.examples };
  }
}

module.exports = SheikhaCodingLanguageEngine;
