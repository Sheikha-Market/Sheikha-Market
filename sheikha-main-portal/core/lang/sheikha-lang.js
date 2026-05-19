// بسم الله الرحمن الرحيم
/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SHL — SHEIKHA LANGUAGE — لغة شيخة البرمجية                                ║
 * ║  لغة برمجية ثنائية (عربية + إنجليزية) لحسابات منظومة سوق شيخة             ║
 * ║  Tokenizer → Parser → Evaluator                                              ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 *
 * "اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ" — العلق:1
 *   أول أمر إلهي = اقرأ — القراءة هي جوهر كل لغة برمجية
 *
 * "عَلَّمَهُ الْبَيَانَ" — الرحمن:4
 *   التعليم والبيان — وظيفة اللغة في التعبير والحساب
 *
 * ─── الميزات الأساسية / Core Features ───────────────────────────────────────
 *
 * • ثنائية اللغة: كلمات مفتاحية عربية وإنجليزية متبادلة
 * • حساب رياضي كامل: +، -، *، /، ^، sqrt، abs، …
 * • متغيرات ومتغيرات ثابتة: let / دع / const / ثابت
 * • شرطيات: if/then/else ↔ إذا/فإن/وإلا
 * • دوال مدمجة: ψ، Ω، توافق، تكامل، نبضة، أفضل
 * • كائنات ومصفوفات: {} و []
 * • تعليقات: # نص
 *
 * ─── المفردات / Keywords ─────────────────────────────────────────────────────
 *
 * English   ↔  Arabic
 * let       ↔  دع
 * const     ↔  ثابت
 * if        ↔  إذا
 * then      ↔  فإن
 * else      ↔  وإلا
 * true      ↔  نعم
 * false     ↔  لا
 * and       ↔  و
 * or        ↔  أو
 * not       ↔  ليس
 * print     ↔  اطبع
 * return    ↔  أرجع
 * null      ↔  فارغ
 *
 * ─── الدوال المدمجة / Built-in Functions ─────────────────────────────────────
 *
 * Math:       abs, sqrt, max, min, sum, avg, round, floor, ceil, pow, log
 * Dual:       psi(n,a), omega(list), coherence(nList,aList)
 * Market:     neural(dim), plant(dim), balance(x,y), best(x,y,...)
 * Format:     str(v), num(v), bool(v), type(v), len(v)
 * Sharia:     halal(v), haram(v)
 * Util:       print(v), aطبع(v), range(n), keys(obj), vals(obj)
 *
 * ─── واجهة الوحدة / Module Interface ─────────────────────────────────────────
 *
 * tokenize(source)          → Token[]
 * parse(tokens)             → AST Node
 * evaluate(node, env)       → value
 * run(source, env?)         → { value, env, output, error? }
 * createEnv(bindings?)      → Environment
 *
 * المالك: منظومة سوق شيخة™
 */

'use strict';

// ─── توكنات اللغة / Token Types ──────────────────────────────────────────────

const T = Object.freeze({
    NUM:    'NUM',
    STR:    'STR',
    BOOL:   'BOOL',
    NULL:   'NULL',
    IDENT:  'IDENT',
    // Operators
    PLUS:   '+',  MINUS:  '-',  STAR:   '*',  SLASH:  '/',  CARET: '^',
    EQ:     '==', NEQ:    '!=', LT:     '<',  GT:     '>',  LTE:   '<=', GTE: '>=',
    ASSIGN: '=',
    // Delimiters
    LPAREN: '(',  RPAREN: ')',  LBRACK: '[',  RBRACK: ']',  LBRACE: '{', RBRACE: '}',
    COMMA:  ',',  COLON:  ':',  SEMI:   ';',  DOT:    '.',
    // Keywords (normalised to English internally)
    LET:    'LET',  CONST: 'CONST',
    IF:     'IF',   THEN:  'THEN',  ELSE:  'ELSE',
    AND:    'AND',  OR:    'OR',    NOT:   'NOT',
    PRINT:  'PRINT',
    RETURN: 'RETURN',
    EOF:    'EOF',
});

// ─── جدول الكلمات المفتاحية ───────────────────────────────────────────────────

const KEYWORDS = {
    // English
    'let': T.LET, 'const': T.CONST,
    'if': T.IF, 'then': T.THEN, 'else': T.ELSE,
    'true': T.BOOL, 'false': T.BOOL,
    'and': T.AND, 'or': T.OR, 'not': T.NOT,
    'print': T.PRINT,
    'return': T.RETURN,
    'null': T.NULL,
    // Arabic
    'دع': T.LET, 'ثابت': T.CONST,
    'إذا': T.IF, 'فإن': T.THEN, 'وإلا': T.ELSE,
    'نعم': T.BOOL, 'لا': T.BOOL,
    'و': T.AND, 'أو': T.OR, 'ليس': T.NOT,
    'اطبع': T.PRINT,
    'أرجع': T.RETURN,
    'فارغ': T.NULL,
};

const BOOL_VALUES = { 'true': true, 'false': false, 'نعم': true, 'لا': false };

// ═══════════════════════════════════════════════════════════════════════════════
// ① المحلل المعجمي / Tokenizer
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تحليل النص المصدر إلى قائمة توكنات
 * @param {string} source — الكود المصدري
 * @returns {Array<{type, value, line, col}>}
 */
function tokenize(source) {
    const tokens = [];
    let i = 0;
    let line = 1;
    let lineStart = 0;

    function col() { return i - lineStart + 1; }
    function peek(offset = 0) { return source[i + offset] || ''; }
    function next() { return source[i++] || ''; }
    function tok(type, value) { tokens.push({ type, value, line, col: col() }); }
    function err(msg) { throw new ShlError(`خطأ معجمي في السطر ${line}:${col()} — ${msg}`); }

    while (i < source.length) {
        const ch = peek();

        // تجاهل المسافات وأسطر جديدة
        if (ch === '\n') { line++; lineStart = ++i; continue; }
        if (/[ \t\r]/.test(ch)) { i++; continue; }

        // تعليقات: # …
        if (ch === '#') {
            while (i < source.length && peek() !== '\n') i++;
            continue;
        }

        // أرقام (دعم عربية وإنجليزية)
        if (/[0-9٠-٩]/.test(ch) || (ch === '.' && /[0-9٠-٩]/.test(peek(1)))) {
            let num = '';
            while (i < source.length && /[0-9٠-٩._]/.test(peek())) {
                const c = next();
                // تحويل الأرقام العربية
                num += c.replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660));
            }
            tok(T.NUM, parseFloat(num.replace(/_/g, '')));
            continue;
        }

        // سلاسل نصية: "…" أو '…'
        if (ch === '"' || ch === "'") {
            const q = next();
            let s = '';
            while (i < source.length && peek() !== q) {
                if (peek() === '\\') { next(); s += _escapeChar(next()); }
                else s += next();
            }
            if (!peek()) err('سلسلة نصية غير مغلقة');
            next(); // إغلاق الاقتباس
            tok(T.STR, s);
            continue;
        }

        // عوامل مزدوجة
        if (ch === '=' && peek(1) === '=') { i += 2; tok(T.EQ,  '=='); continue; }
        if (ch === '!' && peek(1) === '=') { i += 2; tok(T.NEQ, '!='); continue; }
        if (ch === '<' && peek(1) === '=') { i += 2; tok(T.LTE, '<='); continue; }
        if (ch === '>' && peek(1) === '=') { i += 2; tok(T.GTE, '>='); continue; }
        if (ch === '*' && peek(1) === '*') { i += 2; tok(T.CARET, '**'); continue; }

        // عوامل فردية
        const single = { '+':T.PLUS,'-':T.MINUS,'*':T.STAR,'/':T.SLASH,'^':T.CARET,
            '<':T.LT,'>':T.GT,'=':T.ASSIGN,
            '(':T.LPAREN,')':T.RPAREN,'[':T.LBRACK,']':T.RBRACK,
            '{':T.LBRACE,'}':T.RBRACE,',':T.COMMA,':':T.COLON,
            ';':T.SEMI,'.':T.DOT };
        if (single[ch]) { tok(single[ch], ch); i++; continue; }

        // معرّفات وكلمات مفتاحية (عربي + إنجليزي + _)
        if (/[a-zA-Z_\u0600-\u06FF\u0750-\u077F]/.test(ch)) {
            let word = '';
            while (i < source.length && /[a-zA-Z0-9_\u0600-\u06FF\u0750-\u077F]/.test(peek())) {
                word += next();
            }
            const kwType = KEYWORDS[word];
            if (kwType === T.BOOL)  { tok(T.BOOL, BOOL_VALUES[word]); }
            else if (kwType === T.NULL) { tok(T.NULL, null); }
            else if (kwType) { tok(kwType, word); }
            else { tok(T.IDENT, word); }
            continue;
        }

        err(`حرف غير معروف: '${ch}' (U+${ch.codePointAt(0).toString(16)})`);
    }

    tok(T.EOF, null);
    return tokens;
}

function _escapeChar(c) {
    return { n:'\n', t:'\t', r:'\r', '\\':'\\', '"':'"', "'":"'" }[c] || c;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ② المحلل النحوي / Parser  (Recursive Descent)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * بناء شجرة التركيب التجريدي (AST) من التوكنات
 * @param {Array} tokens
 * @returns {object} AST node
 */
function parse(tokens) {
    let pos = 0;

    function peek()    { return tokens[pos] || { type: T.EOF }; }
    function next()    { return tokens[pos++] || { type: T.EOF }; }
    function check(t)  { return peek().type === t; }
    function eat(t)    {
        if (!check(t)) err(`توقعت ${t} وجدت ${peek().type} ('${peek().value}')`);
        return next();
    }
    function match(t)  { if (check(t)) { next(); return true; } return false; }
    function err(msg)  {
        const tk = peek();
        throw new ShlError(`خطأ نحوي في السطر ${tk.line} — ${msg}`);
    }

    // ─── برنامج ─────────────────────────────────────────────────────────────

    function parseProgram() {
        const stmts = [];
        while (!check(T.EOF)) {
            if (match(T.SEMI)) continue; // سطر فارغ
            stmts.push(parseStatement());
        }
        return { kind: 'Program', body: stmts };
    }

    // ─── جملة ────────────────────────────────────────────────────────────────

    function parseStatement() {
        // let / دع / const / ثابت
        if (check(T.LET) || check(T.CONST)) {
            const isConst = check(T.CONST);
            next();
            const name = eat(T.IDENT).value;
            eat(T.ASSIGN);
            const value = parseExpr();
            match(T.SEMI);
            return { kind: 'VarDecl', name, value, isConst };
        }
        // print / اطبع
        if (check(T.PRINT)) {
            next();
            eat(T.LPAREN);
            const args = parseArgList(T.RPAREN);
            eat(T.RPAREN);
            match(T.SEMI);
            return { kind: 'Print', args };
        }
        // return / أرجع
        if (check(T.RETURN)) {
            next();
            const value = check(T.SEMI) || check(T.EOF) ? { kind: 'Literal', value: null } : parseExpr();
            match(T.SEMI);
            return { kind: 'Return', value };
        }
        // تعيين أو تعبير عادي
        const expr = parseExpr();
        match(T.SEMI);
        // تعيين: ident = expr
        if (expr.kind === 'Identifier' && check(T.ASSIGN)) {
            next();
            const right = parseExpr();
            match(T.SEMI);
            return { kind: 'Assign', name: expr.name, value: right };
        }
        return { kind: 'ExprStmt', expr };
    }

    // ─── تعبيرات ─────────────────────────────────────────────────────────────

    function parseExpr()      { return parseIf(); }

    // if / إذا … then/فإن … else/وإلا …
    function parseIf() {
        if (!check(T.IF)) return parseOr();
        next();
        const test       = parseOr();
        eat(T.THEN);
        const consequent = parseOr();
        eat(T.ELSE);
        const alternate  = parseOr();
        return { kind: 'If', test, consequent, alternate };
    }

    function parseOr() {
        let left = parseAnd();
        while (check(T.OR)) { next(); left = { kind: 'BinOp', op: 'or', left, right: parseAnd() }; }
        return left;
    }

    function parseAnd() {
        let left = parseNot();
        while (check(T.AND)) { next(); left = { kind: 'BinOp', op: 'and', left, right: parseNot() }; }
        return left;
    }

    function parseNot() {
        if (check(T.NOT)) { next(); return { kind: 'UnaryOp', op: 'not', operand: parseNot() }; }
        return parseCmp();
    }

    function parseCmp() {
        let left = parseAdd();
        const cmpOps = [T.EQ, T.NEQ, T.LT, T.GT, T.LTE, T.GTE];
        while (cmpOps.includes(peek().type)) {
            const op = next().value;
            left = { kind: 'BinOp', op, left, right: parseAdd() };
        }
        return left;
    }

    function parseAdd() {
        let left = parseMul();
        while (check(T.PLUS) || check(T.MINUS)) {
            const op = next().value;
            left = { kind: 'BinOp', op, left, right: parseMul() };
        }
        return left;
    }

    function parseMul() {
        let left = parsePow();
        while (check(T.STAR) || check(T.SLASH)) {
            const op = next().value;
            left = { kind: 'BinOp', op, left, right: parsePow() };
        }
        return left;
    }

    function parsePow() {
        let base = parseUnary();
        if (check(T.CARET)) { next(); return { kind: 'BinOp', op: '^', left: base, right: parsePow() }; }
        return base;
    }

    function parseUnary() {
        if (check(T.MINUS)) { next(); return { kind: 'UnaryOp', op: '-', operand: parseUnary() }; }
        return parseCall();
    }

    function parseCall() {
        let expr = parsePrimary();
        // استدعاء دالة: expr(args)
        while (check(T.LPAREN) || check(T.LBRACK) || check(T.DOT)) {
            if (check(T.LPAREN)) {
                next();
                const args = parseArgList(T.RPAREN);
                eat(T.RPAREN);
                expr = { kind: 'Call', callee: expr, args };
            } else if (check(T.LBRACK)) {
                next();
                const index = parseExpr();
                eat(T.RBRACK);
                expr = { kind: 'Index', object: expr, index };
            } else if (check(T.DOT)) {
                next();
                const prop = eat(T.IDENT).value;
                expr = { kind: 'Prop', object: expr, prop };
            }
        }
        return expr;
    }

    function parsePrimary() {
        const tk = peek();

        if (check(T.NUM))    { next(); return { kind: 'Literal', value: tk.value }; }
        if (check(T.STR))    { next(); return { kind: 'Literal', value: tk.value }; }
        if (check(T.BOOL))   { next(); return { kind: 'Literal', value: tk.value }; }
        if (check(T.NULL))   { next(); return { kind: 'Literal', value: null }; }
        if (check(T.IDENT))  { next(); return { kind: 'Identifier', name: tk.value }; }

        // مصفوفة [ … ]
        if (check(T.LBRACK)) {
            next();
            const items = parseArgList(T.RBRACK);
            eat(T.RBRACK);
            return { kind: 'Array', items };
        }

        // كائن { key: val, … }
        if (check(T.LBRACE)) {
            next();
            const props = {};
            while (!check(T.RBRACE) && !check(T.EOF)) {
                const key = next().value;
                eat(T.COLON);
                props[key] = parseExpr();
                if (!check(T.RBRACE)) eat(T.COMMA);
            }
            eat(T.RBRACE);
            return { kind: 'Object', props };
        }

        // قوسان ( … )
        if (check(T.LPAREN)) {
            next();
            const e = parseExpr();
            eat(T.RPAREN);
            return e;
        }

        err(`تعبير غير متوقع: ${tk.type} ('${tk.value}')`);
    }

    function parseArgList(closeType) {
        const args = [];
        while (!check(closeType) && !check(T.EOF)) {
            args.push(parseExpr());
            if (!check(closeType)) eat(T.COMMA);
        }
        return args;
    }

    return parseProgram();
}

// ═══════════════════════════════════════════════════════════════════════════════
// ③ البيئة (نطاق المتغيرات) / Environment
// ═══════════════════════════════════════════════════════════════════════════════

class Environment {
    constructor(parent = null) {
        this._vars  = new Map();
        this._consts = new Set();
        this.parent = parent;
    }

    get(name) {
        if (this._vars.has(name)) return this._vars.get(name);
        if (this.parent) return this.parent.get(name);
        throw new ShlError(`متغير غير معرّف: '${name}'`);
    }

    set(name, value) {
        if (this._consts.has(name)) throw new ShlError(`لا يمكن تعديل الثابت '${name}'`);
        this._vars.set(name, value);
    }

    def(name, value, isConst = false) {
        this._vars.set(name, value);
        if (isConst) this._consts.add(name);
    }

    assign(name, value) {
        if (this._vars.has(name)) {
            if (this._consts.has(name)) throw new ShlError(`لا يمكن تعديل الثابت '${name}'`);
            this._vars.set(name, value);
            return;
        }
        if (this.parent) { this.parent.assign(name, value); return; }
        throw new ShlError(`متغير غير معرّف: '${name}'`);
    }

    snapshot() {
        const out = {};
        for (const [k, v] of this._vars) {
            if (typeof v !== 'function') out[k] = v;
        }
        return out;
    }

    child() { return new Environment(this); }
}

/**
 * إنشاء بيئة جديدة مع دوال مدمجة
 * @param {object} bindings — متغيرات إضافية للحقن
 * @param {object} engines  — محركات شيخة للاستخدام
 */
function createEnv(bindings = {}, engines = {}) {
    const env = new Environment();
    const output = [];

    // ─── ثوابت رياضية وهندسية
    env.def('pi',    Math.PI,                      true);
    env.def('e',     Math.E,                       true);
    env.def('ب',     Math.PI,                      true); // بي = π
    env.def('sqrt2', Math.SQRT2,                   true);
    env.def('GOLDEN',(Math.sqrt(5) - 1) / 2,      true); // النسبة الذهبية φ ≈ 0.6180
    env.def('PHI',   (Math.sqrt(5) - 1) / 2,      true); // مرادف GOLDEN
    env.def('DIMS',  12,                           true); // عدد أبعاد المنظومة
    env.def('AXES',  24,                           true); // عدد المحاور (24 = 12×2)
    env.def('IDEAL_THETA', 45,                     true); // زاوية التوازن المثلى (°)
    env.def('VERSION','1.0.0',                     true); // إصدار SHL
    env.def('بسم', 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', true);

    // ─── الدوال الرياضية الأساسية
    const _math = (fn) => (...a) => fn(...a.map(v => Number(v)));
    env.def('abs',   (x)    => Math.abs(x));
    env.def('sqrt',  (x)    => Math.sqrt(x));
    env.def('pow',   (x, y) => Math.pow(x, y));
    env.def('max',   (...a) => { const flat = _flattenNums(a); return flat.length ? Math.max(...flat) : null; });
    env.def('min',   (...a) => { const flat = _flattenNums(a); return flat.length ? Math.min(...flat) : null; });
    env.def('sum',   (...a) => _flattenNums(a).reduce((s, x) => s + x, 0));
    env.def('avg',   (...a) => { const f = _flattenNums(a); return f.length ? f.reduce((s,x)=>s+x,0)/f.length : 0; });
    env.def('round', (x, d=0) => +Number(x).toFixed(d));
    env.def('floor', (x)    => Math.floor(x));
    env.def('ceil',  (x)    => Math.ceil(x));
    env.def('log',   (x)    => Math.log(x));
    env.def('log10', (x)    => Math.log10(x));
    env.def('sin',   (x)    => Math.sin(x));
    env.def('cos',   (x)    => Math.cos(x));
    env.def('tan',   (x)    => Math.tan(x));
    env.def('atan2', (y, x) => Math.atan2(y, x));
    env.def('sign',  (x)    => Math.sign(x));
    env.def('clamp', (x, lo, hi) => Math.max(lo, Math.min(hi, x)));
    env.def('between', (x, lo, hi) => x >= lo && x <= hi);

    // ─── دوال التوحيد الثنائي (من محرك DAIE)
    env.def('psi', (n, a) => {
        const nn = Math.max(0, Math.min(1, +n));
        const aa = Math.max(0, Math.min(1, +a));
        return Math.round(Math.sqrt(nn*nn + aa*aa) / Math.SQRT2 * 1e6) / 1e6;
    });
    env.def('gap', (n, a) => Math.abs(+n - +a));
    env.def('phi', (n, a) => {
        return Math.round(Math.atan2(+a, +n) * (180 / Math.PI) * 1e4) / 1e4;
    });
    env.def('omega', (...args) => {
        const list = _flattenNums(args);
        return list.length ? Math.round(list.reduce((s,x)=>s+x,0)/list.length * 1e6)/1e6 : 0;
    });
    env.def('coherence', (nList, aList) => {
        if (!Array.isArray(nList) || !Array.isArray(aList)) return 0;
        const len = Math.min(nList.length, aList.length);
        if (!len) return 1;
        const totalGap = nList.slice(0,len).reduce((s,n,i) => s + Math.abs(n - aList[i]), 0);
        return Math.round((1 - totalGap / len) * 1e6) / 1e6;
    });
    env.def('vectorMag', (...args) => {
        const list = _flattenNums(args);
        return Math.round(Math.sqrt(list.reduce((s,x)=>s+x*x,0)) * 1e6)/1e6;
    });
    env.def('balance', (x, y) => Math.round((1 - Math.abs(+x - +y)) * 1e6)/1e6);

    // ─── دوال حساب الأفضل
    env.def('best', (...args) => {
        const flat = _flattenNums(args);
        return flat.length ? Math.max(...flat) : null;
    });
    env.def('أفضل', (...args) => {
        const flat = _flattenNums(args);
        return flat.length ? Math.max(...flat) : null;
    });
    env.def('worst', (...args) => {
        const flat = _flattenNums(args);
        return flat.length ? Math.min(...flat) : null;
    });
    env.def('rank', (val, list) => {
        if (!Array.isArray(list)) return null;
        const sorted = [...list].sort((a,b) => b-a);
        return sorted.indexOf(val) + 1;
    });

    // ─── دوال المحرك العصبي (إذا كان متاحاً)
    const neuralCells = engines.neural;
    const agncn       = engines.plant;
    const daie        = engines.daie;

    env.def('neural', (dim) => {
        if (!neuralCells) return 0;
        try {
            const st = neuralCells.status();
            const cell = (st.cells || []).find(c => c.number === +dim);
            return cell ? parseFloat(cell.activation || 0) : 0;
        } catch (_) { return 0; }
    });

    env.def('plant', (dim) => {
        if (!agncn) return 0;
        try {
            const st = agncn.status();
            const cells = st.cells || [];
            const cell = cells[+dim - 1];
            return cell ? parseFloat(cell.activation || 0) : 0;
        } catch (_) { return 0; }
    });

    env.def('pulse', () => {
        if (!daie) return { omega: 0, coherence: 0, theta: 0, state: 'غير متاح' };
        try {
            const p = daie.pulse();
            return p.calculus || p;
        } catch (_) { return { omega: 0, coherence: 0 }; }
    });

    env.def('integrate', (nInput, aInput) => {
        if (!daie) return { omega: 0, coherence: 0 };
        try {
            const r = daie.integrate({ neural: nInput || {}, plant: aInput || {} });
            return r.calculus || r;
        } catch (_) { return {}; }
    });

    // ─── دوال التحويل والتنسيق
    env.def('str',   (v) => String(v));
    env.def('num',   (v) => +v);
    env.def('bool',  (v) => Boolean(v));
    env.def('type',  (v) => Array.isArray(v) ? 'array' : typeof v);
    env.def('len',   (v) => Array.isArray(v) ? v.length : String(v).length);
    env.def('keys',  (v) => typeof v === 'object' && v ? Object.keys(v) : []);
    env.def('vals',  (v) => typeof v === 'object' && v ? Object.values(v) : []);
    env.def('range', (n)  => Array.from({ length: Math.max(0, Math.floor(+n)) }, (_, i) => i));
    env.def('filter',(list, fn) => Array.isArray(list) ? list.filter(x => fn(x)) : []);
    env.def('map',   (list, fn) => Array.isArray(list) ? list.map(x => fn(x)) : []);
    env.def('sort',  (list) => Array.isArray(list) ? [...list].sort((a,b) => +a - +b) : []);

    // ─── التحقق الشرعي (بسيط — قابل للتوسع)
    const HARAM_KEYWORDS = ['ربا', 'خمر', 'مخدرات', 'قمار', 'غرر', 'riba', 'alcohol', 'gambling', 'drug'];
    env.def('halal',  (v) => {
        const s = String(v).toLowerCase();
        return !HARAM_KEYWORDS.some(k => s.includes(k));
    });
    env.def('haram', (v) => {
        const s = String(v).toLowerCase();
        return HARAM_KEYWORDS.some(k => s.includes(k));
    });

    // ─── الطباعة / Output capture
    env.def('print',  (...args) => {
        const line = args.map(_display).join(' ');
        output.push(line);
        return line;
    });
    env.def('اطبع',  (...args) => {
        const line = args.map(_display).join(' ');
        output.push(line);
        return line;
    });
    env.def('println', (...args) => {
        const line = args.map(_display).join(' ');
        output.push(line);
        return line;
    });

    // ─── حقن متغيرات إضافية
    for (const [k, v] of Object.entries(bindings)) env.def(k, v);

    // إرفاق مصفوفة المخرجات بالبيئة
    env._output = output;
    return env;
}

function _flattenNums(args) {
    const out = [];
    for (const a of args) {
        if (Array.isArray(a)) for (const x of a) out.push(+x);
        else if (a !== null && a !== undefined) out.push(+a);
    }
    return out;
}

function _display(v) {
    if (v === null || v === undefined) return 'فارغ';
    if (typeof v === 'object') return JSON.stringify(v, null, 2);
    return String(v);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ④ المُقيّم / Evaluator  (Tree-Walker)
// ═══════════════════════════════════════════════════════════════════════════════

const _RETURN_SIGNAL = Symbol('return');

/**
 * تقييم عقدة AST
 * @param {object} node  — عقدة الشجرة
 * @param {Environment} env — البيئة الحالية
 * @returns {*} القيمة المحسوبة
 */
function evaluate(node, env) {
    if (!node) return null;

    switch (node.kind) {

    // ─── البرنامج الكامل
    case 'Program': {
        let last = null;
        for (const stmt of node.body) {
            last = evaluate(stmt, env);
            if (last && last[_RETURN_SIGNAL]) return last;
        }
        return last;
    }

    // ─── إعلان متغير
    case 'VarDecl': {
        const val = evaluate(node.value, env);
        env.def(node.name, val, node.isConst);
        return val;
    }

    // ─── تعيين
    case 'Assign': {
        const val = evaluate(node.value, env);
        env.assign(node.name, val);
        return val;
    }

    // ─── طباعة
    case 'Print': {
        const args = node.args.map(a => evaluate(a, env));
        const fn = env.get('print');
        return fn(...args);
    }

    // ─── إرجاع
    case 'Return': {
        const val = evaluate(node.value, env);
        const sig = { [_RETURN_SIGNAL]: true, value: val };
        return sig;
    }

    // ─── جملة تعبيرية
    case 'ExprStmt':
        return evaluate(node.expr, env);

    // ─── ثابت
    case 'Literal':
        return node.value;

    // ─── معرّف
    case 'Identifier':
        return env.get(node.name);

    // ─── مصفوفة
    case 'Array':
        return node.items.map(i => evaluate(i, env));

    // ─── كائن
    case 'Object': {
        const obj = {};
        for (const [k, v] of Object.entries(node.props)) obj[k] = evaluate(v, env);
        return obj;
    }

    // ─── استدعاء دالة
    case 'Call': {
        const callee = evaluate(node.callee, env);
        if (typeof callee !== 'function') {
            throw new ShlError(`'${_nodeLabel(node.callee)}' ليست دالة`);
        }
        const args = node.args.map(a => evaluate(a, env));
        return callee(...args);
    }

    // ─── فهرسة
    case 'Index': {
        const obj = evaluate(node.object, env);
        const idx = evaluate(node.index, env);
        if (Array.isArray(obj)) return obj[+idx] ?? null;
        if (typeof obj === 'object' && obj) return obj[idx] ?? null;
        return null;
    }

    // ─── خاصية
    case 'Prop': {
        const obj = evaluate(node.object, env);
        if (obj === null || obj === undefined) return null;
        return obj[node.prop] ?? null;
    }

    // ─── شرط if/then/else
    case 'If': {
        const cond = evaluate(node.test, env);
        return evaluate(cond ? node.consequent : node.alternate, env);
    }

    // ─── عملية ثنائية
    case 'BinOp': {
        // التقييم الكسول للمنطقيات
        if (node.op === 'and') return evaluate(node.left, env) && evaluate(node.right, env);
        if (node.op === 'or')  return evaluate(node.left, env) || evaluate(node.right, env);
        const l = evaluate(node.left,  env);
        const r = evaluate(node.right, env);
        switch (node.op) {
        case '+':  return typeof l === 'string' || typeof r === 'string' ? String(l) + String(r) : +l + +r;
        case '-':  return +l - +r;
        case '*':  return +l * +r;
        case '/':  if (+r === 0) throw new ShlError('خطأ: قسمة على صفر'); return +l / +r;
        case '^': case '**': return Math.pow(+l, +r);
        case '==': return l == r; // eslint-disable-line eqeqeq
        case '!=': return l != r; // eslint-disable-line eqeqeq
        case '<':  return +l < +r;
        case '>':  return +l > +r;
        case '<=': return +l <= +r;
        case '>=': return +l >= +r;
        default: throw new ShlError(`عامل غير معروف: ${node.op}`);
        }
    }

    // ─── عملية أحادية
    case 'UnaryOp': {
        const val = evaluate(node.operand, env);
        switch (node.op) {
        case '-':   return -(+val);
        case 'not': return !val;
        default: throw new ShlError(`عامل أحادي غير معروف: ${node.op}`);
        }
    }

    default:
        throw new ShlError(`عقدة AST غير معروفة: ${node.kind}`);
    }
}

function _nodeLabel(node) {
    if (!node) return '؟';
    if (node.kind === 'Identifier') return node.name;
    if (node.kind === 'Prop') return `${_nodeLabel(node.object)}.${node.prop}`;
    return node.kind;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ⑤ نقطة الدخول الموحدة / Main Entry Point
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * تشغيل برنامج SHL كامل
 * @param {string} source   — الكود المصدري
 * @param {Environment} env — بيئة التنفيذ (اختياري)
 * @returns {{ value, env, output, ast?, error? }}
 */
function run(source, env = null) {
    if (!env) env = createEnv();

    const result = { value: null, env, output: env._output || [], error: null };

    try {
        const tokens  = tokenize(source);
        const ast     = parse(tokens);
        const val     = evaluate(ast, env);
        result.value  = val && val[_RETURN_SIGNAL] ? val.value : val;
        result.output = env._output || [];
    } catch (e) {
        result.error  = e instanceof ShlError ? e.message : `خطأ داخلي: ${e.message}`;
    }

    return result;
}

// ─── خطأ SHL المخصص ──────────────────────────────────────────────────────────

class ShlError extends Error {
    constructor(msg) { super(msg); this.name = 'ShlError'; }
}

// ─── تصدير الوحدة ────────────────────────────────────────────────────────────

module.exports = {
    tokenize,
    parse,
    evaluate,
    run,
    createEnv,
    Environment,
    ShlError,
    T,
    KEYWORDS,
};
